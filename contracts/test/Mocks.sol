// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// Plain ERC-20 with open minting for tests.
contract MockERC20 is ERC20 {
    uint8 private immutable _dec;

    constructor(string memory n, string memory s, uint8 d) ERC20(n, s) {
        _dec = d;
    }

    function decimals() public view override returns (uint8) {
        return _dec;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// Charges 1% on every transfer while the fee is on.
contract FeeToken is MockERC20 {
    bool public feeOn = true;

    constructor() MockERC20("Fee", "FEE", 18) {}

    function setFee(bool on) external {
        feeOn = on;
    }

    function _update(address from, address to, uint256 value) internal override {
        if (feeOn && from != address(0) && to != address(0)) {
            uint256 fee = value / 100;
            super._update(from, address(0xdead), fee);
            value -= fee;
        }
        super._update(from, to, value);
    }
}

/// Behaves like an issuer-controlled stock token: can be paused and can block wallets.
contract BlockingToken is MockERC20 {
    bool public paused;
    mapping(address => bool) public blocked;

    error TokenPaused();
    error Blocked(address who);

    constructor() MockERC20("Stock", "STK", 18) {}

    function setPaused(bool p) external {
        paused = p;
    }

    function setBlocked(address who, bool b) external {
        blocked[who] = b;
    }

    function _update(address from, address to, uint256 value) internal override {
        if (paused) revert TokenPaused();
        if (blocked[from]) revert Blocked(from);
        if (blocked[to]) revert Blocked(to);
        super._update(from, to, value);
    }
}

/// Returns nothing from transfer/transferFrom, like some older tokens.
contract NoReturnToken {
    string public name = "NoReturn";
    string public symbol = "NRT";
    uint8 public decimals = 6;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 a) external {
        balanceOf[to] += a;
    }

    function approve(address s, uint256 a) external {
        allowance[msg.sender][s] = a;
    }

    function transfer(address to, uint256 a) external {
        balanceOf[msg.sender] -= a;
        balanceOf[to] += a;
    }

    function transferFrom(address f, address to, uint256 a) external {
        allowance[f][msg.sender] -= a;
        balanceOf[f] -= a;
        balanceOf[to] += a;
    }
}

interface IEscrowLike {
    function accept(uint256 id) external payable;
    function cancel(uint256 id) external;
    function refund(uint256 id) external;
}

/// Calls back into the escrow during a transfer, to prove reentrancy is refused.
contract ReentrantToken is MockERC20 {
    IEscrowLike public target;
    uint256 public targetId;
    uint8 public mode; // 0 off, 1 cancel, 2 refund, 3 accept

    constructor() MockERC20("Reenter", "RE", 18) {}

    function arm(IEscrowLike t, uint256 id, uint8 m) external {
        target = t;
        targetId = id;
        mode = m;
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (mode == 1) target.cancel(targetId);
        if (mode == 2) target.refund(targetId);
        if (mode == 3) target.accept(targetId);
    }
}

/// A wallet contract that can stop accepting ETH.
contract EthWallet {
    bool public refuse;

    function setRefuse(bool r) external {
        refuse = r;
    }

    function exec(address to, uint256 value, bytes calldata data) external returns (bytes memory) {
        (bool ok, bytes memory out) = to.call{value: value}(data);
        if (!ok) {
            assembly {
                revert(add(out, 32), mload(out))
            }
        }
        return out;
    }

    receive() external payable {
        require(!refuse, "no ETH");
    }
}
