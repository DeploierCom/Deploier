// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SettlementEscrow
 * @notice Delivery versus payment between two named wallets on Robinhood Chain.
 *
 * The maker proposes a settlement and escrows leg A. Only the named taker can
 * accept it, by delivering leg B; in that same transaction leg B goes to the
 * maker and leg A goes to the taker. Either both legs move or neither does: if
 * any transfer fails (a paused or blacklisting token, a contract that refuses
 * ETH, a token that suddenly charges a fee) the whole accept reverts and leg A
 * stays in escrow for the maker.
 *
 * Before acceptance the maker can cancel at any time. After the expiry anyone
 * can trigger the refund of leg A to the maker.
 *
 * Privacy: the contract stores a commitment, keccak256 of the canonical terms
 * and a salt that only the two parties hold. The legs themselves (tokens,
 * amounts, addresses) are public, like every ERC-20 transfer on the chain.
 *
 * There is no owner, no admin, no pause, no fee and no upgrade path. Legs are
 * any ERC-20 or native ETH (token = address(0)); incoming transfers are
 * measured by balance difference and must arrive in full.
 */
contract SettlementEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Token value that stands for native ETH in a leg.
    address public constant NATIVE = address(0);
    /// @notice Longest time a proposal can stay open.
    uint64 public constant MAX_TERM = 30 days;

    enum Status {
        None,
        Proposed,
        Settled,
        Cancelled,
        Refunded
    }

    struct Leg {
        address token;
        uint256 amount;
    }

    struct Settlement {
        address maker;
        uint64 expiry;
        Status status;
        address taker;
        uint64 openedBlock;
        address tokenA;
        uint64 closedBlock;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        bytes32 commitment;
    }

    /// @notice Number of settlements ever proposed; ids run from 1 to this value.
    uint256 public settlementCount;
    mapping(uint256 => Settlement) private _settlements;
    /// @notice Settlement id a maker opened with a commitment (0 when unused). Keyed by maker, so nobody
    /// else can claim, squat or impersonate another maker's commitment; each maker uses a commitment once.
    mapping(address => mapping(bytes32 => uint256)) public idOf;

    event Proposed(
        uint256 indexed id,
        address indexed maker,
        address indexed taker,
        bytes32 commitment,
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB,
        uint64 expiry
    );
    event Settled(uint256 indexed id, bytes32 commitment);
    event Cancelled(uint256 indexed id, bytes32 commitment);
    event Refunded(uint256 indexed id, bytes32 commitment, address caller);

    error InvalidTaker();
    error ZeroAmount();
    error SameAsset();
    error NotAContract(address token);
    error BadExpiry();
    error EmptyCommitment();
    error CommitmentUsed();
    error WrongValue();
    error AmountMismatch(address token, uint256 expected, uint256 actual);
    error NotOpen();
    error NotTaker();
    error NotMaker();
    error Expired();
    error NotExpired();
    error EthTransferFailed();

    /**
     * @notice Opens a settlement and escrows leg A from the caller.
     * @param taker The only wallet that can accept.
     * @param legA What the maker delivers (escrowed now). Send ETH as msg.value when legA.token is NATIVE.
     * @param legB What the maker receives from the taker on acceptance.
     * @param commitment keccak256 of the canonical terms and a salt, kept off-chain by the parties.
     * @param expiry Unix time after which the proposal can no longer be accepted.
     */
    function propose(address taker, Leg calldata legA, Leg calldata legB, bytes32 commitment, uint64 expiry)
        external
        payable
        nonReentrant
        returns (uint256 id)
    {
        if (taker == address(0) || taker == msg.sender) revert InvalidTaker();
        if (legA.amount == 0 || legB.amount == 0) revert ZeroAmount();
        if (legA.token == legB.token) revert SameAsset();
        if (legB.token != NATIVE && legB.token.code.length == 0) revert NotAContract(legB.token);
        if (expiry <= block.timestamp || expiry > block.timestamp + MAX_TERM) revert BadExpiry();
        if (commitment == bytes32(0)) revert EmptyCommitment();
        if (idOf[msg.sender][commitment] != 0) revert CommitmentUsed();

        id = ++settlementCount;
        idOf[msg.sender][commitment] = id;
        _settlements[id] = Settlement({
            maker: msg.sender,
            expiry: expiry,
            status: Status.Proposed,
            taker: taker,
            openedBlock: uint64(block.number),
            tokenA: legA.token,
            closedBlock: 0,
            tokenB: legB.token,
            amountA: legA.amount,
            amountB: legB.amount,
            commitment: commitment
        });

        _pull(legA.token, msg.sender, legA.amount);

        emit Proposed(id, msg.sender, taker, commitment, legA.token, legA.amount, legB.token, legB.amount, expiry);
    }

    /**
     * @notice The named taker delivers leg B; both legs are released in this transaction.
     * Send ETH as msg.value when leg B is NATIVE. Reverts as a whole if any leg cannot move.
     */
    function accept(uint256 id) external payable nonReentrant {
        Settlement storage s = _settlements[id];
        if (s.status != Status.Proposed) revert NotOpen();
        if (msg.sender != s.taker) revert NotTaker();
        if (block.timestamp >= s.expiry) revert Expired();

        s.status = Status.Settled;
        s.closedBlock = uint64(block.number);

        address maker = s.maker;
        address taker = s.taker;
        _pull(s.tokenB, taker, s.amountB);
        _pushExact(s.tokenB, maker, s.amountB);
        _pushExact(s.tokenA, taker, s.amountA);

        emit Settled(id, s.commitment);
    }

    /// @notice The maker withdraws an open proposal and takes leg A back. Allowed until it is accepted.
    function cancel(uint256 id) external nonReentrant {
        Settlement storage s = _settlements[id];
        if (s.status != Status.Proposed) revert NotOpen();
        if (msg.sender != s.maker) revert NotMaker();

        s.status = Status.Cancelled;
        s.closedBlock = uint64(block.number);
        _push(s.tokenA, s.maker, s.amountA);

        emit Cancelled(id, s.commitment);
    }

    /// @notice After the expiry anyone can return leg A to the maker.
    function refund(uint256 id) external nonReentrant {
        Settlement storage s = _settlements[id];
        if (s.status != Status.Proposed) revert NotOpen();
        if (block.timestamp < s.expiry) revert NotExpired();

        s.status = Status.Refunded;
        s.closedBlock = uint64(block.number);
        _push(s.tokenA, s.maker, s.amountA);

        emit Refunded(id, s.commitment, msg.sender);
    }

    /// @notice Full record of one settlement (status None for an unknown id).
    function getSettlement(uint256 id) external view returns (Settlement memory) {
        return _settlements[id];
    }

    /// @notice Several records at once, for the site's tape and a wallet's history.
    function getSettlements(uint256[] calldata ids) external view returns (Settlement[] memory out) {
        out = new Settlement[](ids.length);
        for (uint256 i; i < ids.length; ++i) {
            out[i] = _settlements[ids[i]];
        }
    }

    /// @notice True when an open proposal has passed its expiry and is waiting for a refund.
    function isExpired(uint256 id) external view returns (bool) {
        Settlement storage s = _settlements[id];
        return s.status == Status.Proposed && block.timestamp >= s.expiry;
    }

    // ---------------------------------------------------------------- internals

    /// Brings `amount` of `token` from `from` into this contract and checks that all of it arrived.
    function _pull(address token, address from, uint256 amount) private {
        if (token == NATIVE) {
            if (msg.value != amount) revert WrongValue();
            return;
        }
        if (msg.value != 0) revert WrongValue();
        if (token.code.length == 0) revert NotAContract(token);
        uint256 before = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(from, address(this), amount);
        uint256 received = IERC20(token).balanceOf(address(this)) - before;
        if (received != amount) revert AmountMismatch(token, amount, received);
    }

    /// Sends `amount` and checks the receiver got all of it (used on settlement, where both sides must be whole).
    function _pushExact(address token, address to, uint256 amount) private {
        if (token == NATIVE) {
            _sendEth(to, amount);
            return;
        }
        uint256 before = IERC20(token).balanceOf(to);
        IERC20(token).safeTransfer(to, amount);
        uint256 received = IERC20(token).balanceOf(to) - before;
        if (received != amount) revert AmountMismatch(token, amount, received);
    }

    /// Returns escrowed funds to the maker (cancel and refund).
    function _push(address token, address to, uint256 amount) private {
        if (token == NATIVE) {
            _sendEth(to, amount);
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    function _sendEth(address to, uint256 amount) private {
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert EthTransferFailed();
    }
}
