// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SettlementEscrow} from "../src/SettlementEscrow.sol";
import {MockERC20} from "./Mocks.sol";

/// Drives random proposals, accepts, cancels and refunds between a few wallets.
contract EscrowHandler is Test {
    SettlementEscrow public escrow;
    MockERC20 public usd;
    MockERC20 public stock;
    address[] public actors;
    uint256 public nonce;
    uint256 public settled;
    uint256 public closed;

    constructor(SettlementEscrow e, MockERC20 u, MockERC20 s) {
        escrow = e;
        usd = u;
        stock = s;
        for (uint256 i; i < 4; ++i) {
            address a = makeAddr(string(abi.encodePacked("actor", i)));
            actors.push(a);
            vm.deal(a, 1_000_000 ether);
            u.mint(a, 1e30);
            s.mint(a, 1e30);
            vm.startPrank(a);
            u.approve(address(e), type(uint256).max);
            s.approve(address(e), type(uint256).max);
            vm.stopPrank();
        }
    }

    function _token(uint256 seed) internal view returns (address) {
        uint256 k = seed % 3;
        return k == 0 ? address(0) : k == 1 ? address(usd) : address(stock);
    }

    function propose(uint256 makerSeed, uint256 takerSeed, uint256 tokSeed, uint256 amountA, uint256 amountB, uint256 term) external {
        uint256 m = makerSeed % actors.length;
        address maker = actors[m];
        address taker = actors[(m + 1 + (takerSeed % (actors.length - 1))) % actors.length];
        address tA = _token(tokSeed);
        address tB = _token((tokSeed % 3) + 1 + (tokSeed / 3) % 2);
        amountA = bound(amountA, 1, 1e21);
        amountB = bound(amountB, 1, 1e21);
        uint64 exp = uint64(block.timestamp + bound(term, 1, 30 days));
        bytes32 c = keccak256(abi.encode(++nonce));
        vm.prank(maker);
        escrow.propose{value: tA == address(0) ? amountA : 0}(
            taker, SettlementEscrow.Leg(tA, amountA), SettlementEscrow.Leg(tB, amountB), c, exp
        );
    }

    function _pick(uint256 seed) internal view returns (uint256 id, SettlementEscrow.Settlement memory s) {
        uint256 n = escrow.settlementCount();
        if (n == 0) return (0, s);
        id = 1 + (seed % n);
        s = escrow.getSettlement(id);
    }

    function accept(uint256 seed) external {
        (uint256 id, SettlementEscrow.Settlement memory s) = _pick(seed);
        if (id == 0 || s.status != SettlementEscrow.Status.Proposed || block.timestamp >= s.expiry) return;
        vm.prank(s.taker);
        escrow.accept{value: s.tokenB == address(0) ? s.amountB : 0}(id);
        settled++;
        closed++;
    }

    function cancel(uint256 seed) external {
        (uint256 id, SettlementEscrow.Settlement memory s) = _pick(seed);
        if (id == 0 || s.status != SettlementEscrow.Status.Proposed) return;
        vm.prank(s.maker);
        escrow.cancel(id);
        closed++;
    }

    function refund(uint256 seed) external {
        (uint256 id, SettlementEscrow.Settlement memory s) = _pick(seed);
        if (id == 0 || s.status != SettlementEscrow.Status.Proposed) return;
        if (block.timestamp < s.expiry) vm.warp(s.expiry);
        escrow.refund(id);
        closed++;
    }

    function wait(uint256 secs) external {
        vm.warp(block.timestamp + bound(secs, 1, 3 days));
    }
}

contract SettlementEscrowInvariantTest is Test {
    SettlementEscrow escrow;
    MockERC20 usd;
    MockERC20 stock;
    EscrowHandler handler;

    function setUp() public {
        escrow = new SettlementEscrow();
        usd = new MockERC20("USD", "USD", 6);
        stock = new MockERC20("Stock", "STK", 18);
        handler = new EscrowHandler(escrow, usd, stock);
        targetContract(address(handler));
    }

    /// The escrow holds exactly the A legs of open proposals, per asset, and nothing else.
    function invariant_balancesEqualOpenLegs() public view {
        uint256 eth;
        uint256 u;
        uint256 s;
        uint256 open;
        uint256 n = escrow.settlementCount();
        for (uint256 id = 1; id <= n; ++id) {
            SettlementEscrow.Settlement memory r = escrow.getSettlement(id);
            if (r.status != SettlementEscrow.Status.Proposed) continue;
            open++;
            if (r.tokenA == address(0)) eth += r.amountA;
            else if (r.tokenA == address(usd)) u += r.amountA;
            else s += r.amountA;
        }
        assertEq(address(escrow).balance, eth, "ETH");
        assertEq(usd.balanceOf(address(escrow)), u, "USD");
        assertEq(stock.balanceOf(address(escrow)), s, "STOCK");
        assertEq(open + handler.closed(), n, "every settlement is open or closed once");
    }

    /// Commitments map back to their own settlement.
    function invariant_commitmentIndex() public view {
        uint256 n = escrow.settlementCount();
        for (uint256 id = 1; id <= n; ++id) {
            SettlementEscrow.Settlement memory r = escrow.getSettlement(id);
            assertEq(escrow.idOf(r.maker, r.commitment), id);
        }
    }
}
