// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title AllowlistToken
 * @notice A whole-unit token that only allowlisted wallets can hold, managed by
 * the wallet that issued it. Made by AllowlistTokenFactory.
 *
 * - The issuer is fixed at creation. It alone edits the allowlist; there is no
 *   site-wide admin and no way to hand the role to anyone else.
 * - The full supply is minted once, to the issuer. No further minting.
 * - Transfers need both sides on the allowlist. A wallet removed from the list
 *   can still send its units back to the issuer, nowhere else.
 * - With a maturity set, transfers stop at maturity and holders can redeem
 *   (burn) their units, which signals the issuer to pay out off chain.
 * - The issuer cannot move, burn or seize anyone's units.
 *
 * The contract only enforces the allowlist and the maturity. Tokenizing a real
 * asset still needs the issuer's own legal structure, custody and checks on
 * who may hold it; none of that is on chain.
 */
contract AllowlistToken is ERC20 {
    /// @notice The wallet that issued the token and manages its allowlist.
    address public immutable issuer;
    /// @notice Unix time at which transfers stop and redemption opens; 0 when there is no maturity.
    uint64 public immutable maturity;
    /// @notice keccak256 of the private issuance terms and a salt, held by the issuer.
    bytes32 public immutable commitment;

    /// @notice Whether a wallet may hold and receive units.
    mapping(address => bool) public isAllowed;

    event AllowlistUpdated(address indexed account, bool allowed);
    event Redeemed(address indexed holder, uint256 amount);

    error NotIssuer();
    error NotAllowed(address account);
    error IssuerStaysAllowed();
    error Matured();
    error NotMatured();

    constructor(
        string memory name_,
        string memory symbol_,
        address issuer_,
        uint256 supply,
        address[] memory holders,
        uint64 maturity_,
        bytes32 commitment_
    ) ERC20(name_, symbol_) {
        issuer = issuer_;
        maturity = maturity_;
        commitment = commitment_;
        _setAllowed(issuer_, true);
        for (uint256 i; i < holders.length; ++i) {
            _setAllowed(holders[i], true);
        }
        _mint(issuer_, supply);
    }

    /// @notice Units are whole: one unit is one token.
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /// @notice Adds wallets to, or removes them from, the allowlist. Issuer only.
    function setAllowed(address[] calldata accounts, bool allowed) external {
        if (msg.sender != issuer) revert NotIssuer();
        for (uint256 i; i < accounts.length; ++i) {
            if (accounts[i] == issuer && !allowed) revert IssuerStaysAllowed();
            _setAllowed(accounts[i], allowed);
        }
    }

    /// @notice After maturity, burns the caller's units so the issuer can pay them out.
    function redeem(uint256 amount) external {
        if (maturity == 0 || block.timestamp < maturity) revert NotMatured();
        _burn(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }

    /// @notice True once the maturity has passed (always false without a maturity).
    function matured() public view returns (bool) {
        return maturity != 0 && block.timestamp >= maturity;
    }

    function _setAllowed(address account, bool allowed) private {
        if (account == address(0)) revert NotAllowed(account);
        if (isAllowed[account] == allowed) return;
        isAllowed[account] = allowed;
        emit AllowlistUpdated(account, allowed);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0)) {
            // Minting happens once, in the constructor, to the issuer.
            if (!isAllowed[to]) revert NotAllowed(to);
        } else if (to != address(0)) {
            if (matured()) revert Matured();
            if (!isAllowed[to]) revert NotAllowed(to);
            if (!isAllowed[from] && to != issuer) revert NotAllowed(from);
        }
        super._update(from, to, value);
    }
}
