// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AllowlistToken} from "./AllowlistToken.sol";

/**
 * @title AllowlistTokenFactory
 * @notice Anyone can issue an AllowlistToken. The caller becomes its issuer,
 * receives the whole supply and manages its allowlist; the factory keeps no
 * role in the tokens it creates. There is no owner and no admin.
 */
contract AllowlistTokenFactory {
    /// @notice Most holders that can be listed at issue time (more can be added later by the issuer).
    uint256 public constant MAX_INITIAL_HOLDERS = 100;

    struct Issuance {
        address token;
        address issuer;
        uint64 blockNumber;
        bytes32 commitment;
    }

    /// @notice Every token made here, in order.
    address[] public tokens;
    /// @notice Block in which a token was issued.
    mapping(address => uint64) public issuedBlock;
    /// @notice True for tokens made by this factory.
    mapping(address => bool) public isToken;
    /// @notice Token an issuer created with a commitment (zero when unused). Keyed by issuer, so nobody
    /// else can claim, squat or impersonate another issuer's commitment; each issuer uses a commitment once.
    mapping(address => mapping(bytes32 => address)) public tokenOf;

    event Issued(
        address indexed token,
        address indexed issuer,
        bytes32 indexed commitment,
        string name,
        string symbol,
        uint256 supply,
        uint64 maturity,
        uint256 holders
    );

    error BadName();
    error BadSymbol();
    error ZeroSupply();
    error TooManyHolders();
    error BadMaturity();
    error EmptyCommitment();
    error CommitmentUsed();

    /**
     * @notice Creates a token with the caller as issuer.
     * @param name Instrument name, 1 to 64 bytes.
     * @param symbol Ticker, 1 to 16 bytes.
     * @param supply Whole units, all minted to the caller.
     * @param holders Wallets allowed to hold it from the start (the caller is always allowed).
     * @param maturity Unix time when transfers stop and redemption opens, or 0 for none.
     * @param commitment keccak256 of the private issuance terms and a salt.
     */
    function issue(
        string calldata name,
        string calldata symbol,
        uint256 supply,
        address[] calldata holders,
        uint64 maturity,
        bytes32 commitment
    ) external returns (address token) {
        if (bytes(name).length == 0 || bytes(name).length > 64) revert BadName();
        if (bytes(symbol).length == 0 || bytes(symbol).length > 16) revert BadSymbol();
        if (supply == 0) revert ZeroSupply();
        if (holders.length > MAX_INITIAL_HOLDERS) revert TooManyHolders();
        if (maturity != 0 && maturity <= block.timestamp) revert BadMaturity();
        if (commitment == bytes32(0)) revert EmptyCommitment();
        if (tokenOf[msg.sender][commitment] != address(0)) revert CommitmentUsed();

        token = address(new AllowlistToken(name, symbol, msg.sender, supply, holders, maturity, commitment));
        tokens.push(token);
        isToken[token] = true;
        issuedBlock[token] = uint64(block.number);
        tokenOf[msg.sender][commitment] = token;

        emit Issued(token, msg.sender, commitment, name, symbol, supply, maturity, holders.length);
    }

    /// @notice Number of tokens made here.
    function tokenCount() external view returns (uint256) {
        return tokens.length;
    }

    /// @notice The newest `limit` issuances, newest first.
    function latest(uint256 limit) external view returns (Issuance[] memory out) {
        uint256 total = tokens.length;
        uint256 n = limit < total ? limit : total;
        out = new Issuance[](n);
        for (uint256 i; i < n; ++i) {
            AllowlistToken t = AllowlistToken(tokens[total - 1 - i]);
            out[i] = Issuance(address(t), t.issuer(), issuedBlock[address(t)], t.commitment());
        }
    }
}
