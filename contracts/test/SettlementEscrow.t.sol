// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SettlementEscrow} from "../src/SettlementEscrow.sol";
import {MockERC20, FeeToken, BlockingToken, NoReturnToken, ReentrantToken, EthWallet, IEscrowLike} from "./Mocks.sol";

contract SettlementEscrowTest is Test {
    SettlementEscrow escrow;
    MockERC20 usd;
    MockERC20 stock;
    address maker = makeAddr("maker");
    address taker = makeAddr("taker");
    address stranger = makeAddr("stranger");
    address constant ETH = address(0);

    uint256 constant A = 1_000e6;
    uint256 constant B = 5e18;

    function setUp() public {
        escrow = new SettlementEscrow();
        usd = new MockERC20("USD", "USD", 6);
        stock = new MockERC20("Stock", "STK", 18);
        usd.mint(maker, 1_000_000e6);
        stock.mint(taker, 1_000e18);
        vm.deal(maker, 100 ether);
        vm.deal(taker, 100 ether);
        vm.prank(maker);
        usd.approve(address(escrow), type(uint256).max);
        vm.prank(taker);
        stock.approve(address(escrow), type(uint256).max);
    }

    function leg(address t, uint256 a) internal pure returns (SettlementEscrow.Leg memory) {
        return SettlementEscrow.Leg(t, a);
    }

    function c(uint256 n) internal pure returns (bytes32) {
        return keccak256(abi.encode("terms", n));
    }

    function proposeUsdForStock() internal returns (uint256 id) {
        vm.prank(maker);
        id = escrow.propose(taker, leg(address(usd), A), leg(address(stock), B), c(1), uint64(block.timestamp + 1 days));
    }

    // ------------------------------------------------------------ propose

    function test_propose_escrowsLegA_andStoresRecord() public {
        vm.expectEmit(true, true, true, true);
        emit SettlementEscrow.Proposed(1, maker, taker, c(1), address(usd), A, address(stock), B, uint64(block.timestamp + 1 days));
        uint256 id = proposeUsdForStock();
        assertEq(id, 1);
        assertEq(escrow.settlementCount(), 1);
        assertEq(usd.balanceOf(address(escrow)), A);
        assertEq(escrow.idOf(maker, c(1)), 1);
        assertEq(escrow.idOf(taker, c(1)), 0);
        SettlementEscrow.Settlement memory s = escrow.getSettlement(id);
        assertEq(s.maker, maker);
        assertEq(s.taker, taker);
        assertEq(s.tokenA, address(usd));
        assertEq(s.amountA, A);
        assertEq(s.tokenB, address(stock));
        assertEq(s.amountB, B);
        assertEq(s.commitment, c(1));
        assertEq(uint8(s.status), uint8(SettlementEscrow.Status.Proposed));
        assertEq(s.openedBlock, block.number);
        assertEq(s.closedBlock, 0);
    }

    function test_propose_eth() public {
        vm.prank(maker);
        uint256 id = escrow.propose{value: 1 ether}(taker, leg(ETH, 1 ether), leg(address(stock), B), c(2), uint64(block.timestamp + 1 hours));
        assertEq(address(escrow).balance, 1 ether);
        assertEq(escrow.getSettlement(id).tokenA, ETH);
    }

    function test_propose_reverts() public {
        uint64 exp = uint64(block.timestamp + 1 days);
        vm.startPrank(maker);
        vm.expectRevert(SettlementEscrow.InvalidTaker.selector);
        escrow.propose(address(0), leg(address(usd), A), leg(address(stock), B), c(1), exp);
        vm.expectRevert(SettlementEscrow.InvalidTaker.selector);
        escrow.propose(maker, leg(address(usd), A), leg(address(stock), B), c(1), exp);
        vm.expectRevert(SettlementEscrow.ZeroAmount.selector);
        escrow.propose(taker, leg(address(usd), 0), leg(address(stock), B), c(1), exp);
        vm.expectRevert(SettlementEscrow.ZeroAmount.selector);
        escrow.propose(taker, leg(address(usd), A), leg(address(stock), 0), c(1), exp);
        vm.expectRevert(SettlementEscrow.SameAsset.selector);
        escrow.propose(taker, leg(address(usd), A), leg(address(usd), B), c(1), exp);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.NotAContract.selector, stranger));
        escrow.propose(taker, leg(address(usd), A), leg(stranger, B), c(1), exp);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.NotAContract.selector, stranger));
        escrow.propose(taker, leg(stranger, A), leg(address(usd), B), c(1), exp);
        vm.expectRevert(SettlementEscrow.BadExpiry.selector);
        escrow.propose(taker, leg(address(usd), A), leg(address(stock), B), c(1), uint64(block.timestamp));
        vm.expectRevert(SettlementEscrow.BadExpiry.selector);
        escrow.propose(taker, leg(address(usd), A), leg(address(stock), B), c(1), uint64(block.timestamp + 30 days + 1));
        vm.expectRevert(SettlementEscrow.EmptyCommitment.selector);
        escrow.propose(taker, leg(address(usd), A), leg(address(stock), B), bytes32(0), exp);
        vm.expectRevert(SettlementEscrow.WrongValue.selector);
        escrow.propose{value: 1}(taker, leg(address(usd), A), leg(address(stock), B), c(1), exp);
        vm.expectRevert(SettlementEscrow.WrongValue.selector);
        escrow.propose{value: 1 ether - 1}(taker, leg(ETH, 1 ether), leg(address(stock), B), c(1), exp);
        vm.stopPrank();
    }

    function test_propose_commitmentUsedOnce() public {
        proposeUsdForStock();
        vm.prank(maker);
        vm.expectRevert(SettlementEscrow.CommitmentUsed.selector);
        escrow.propose(taker, leg(address(usd), A), leg(address(stock), B), c(1), uint64(block.timestamp + 1 days));
    }

    /// Someone copying a maker's public commitment gets their own record; the maker's lookup is unaffected.
    function test_reusedCommitment_byAnotherWallet_isSeparate() public {
        address copycat = makeAddr("copycat");
        usd.mint(copycat, A);
        vm.startPrank(copycat);
        usd.approve(address(escrow), A);
        uint256 fake = escrow.propose(taker, leg(address(usd), A), leg(address(stock), 1), c(1), uint64(block.timestamp + 1 days));
        vm.stopPrank();
        uint256 real = proposeUsdForStock();
        assertTrue(fake != real);
        assertEq(escrow.idOf(maker, c(1)), real);
        assertEq(escrow.idOf(copycat, c(1)), fake);
        assertEq(escrow.getSettlement(real).maker, maker);
        assertEq(escrow.getSettlement(fake).amountB, 1);
    }

    function test_propose_maxTermAccepted() public {
        vm.prank(maker);
        escrow.propose(taker, leg(address(usd), A), leg(address(stock), B), c(1), uint64(block.timestamp + 30 days));
    }

    function test_propose_rejectsFeeOnTransfer() public {
        FeeToken fee = new FeeToken();
        fee.mint(maker, 1_000e18);
        vm.startPrank(maker);
        fee.approve(address(escrow), type(uint256).max);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.AmountMismatch.selector, address(fee), 100e18, 99e18));
        escrow.propose(taker, leg(address(fee), 100e18), leg(address(stock), B), c(1), uint64(block.timestamp + 1 days));
        vm.stopPrank();
    }

    function test_propose_noReturnToken() public {
        NoReturnToken nr = new NoReturnToken();
        nr.mint(maker, 500e6);
        vm.startPrank(maker);
        nr.approve(address(escrow), type(uint256).max);
        uint256 id = escrow.propose(taker, leg(address(nr), 500e6), leg(address(stock), B), c(1), uint64(block.timestamp + 1 days));
        vm.stopPrank();
        vm.prank(taker);
        escrow.accept(id);
        assertEq(nr.balanceOf(taker), 500e6);
    }

    // ------------------------------------------------------------ accept

    function test_accept_swapsBothLegs() public {
        uint256 id = proposeUsdForStock();
        vm.roll(block.number + 5);
        vm.expectEmit(true, false, false, true);
        emit SettlementEscrow.Settled(id, c(1));
        vm.prank(taker);
        escrow.accept(id);
        assertEq(usd.balanceOf(taker), A);
        assertEq(stock.balanceOf(maker), B);
        assertEq(usd.balanceOf(address(escrow)), 0);
        assertEq(stock.balanceOf(address(escrow)), 0);
        SettlementEscrow.Settlement memory s = escrow.getSettlement(id);
        assertEq(uint8(s.status), uint8(SettlementEscrow.Status.Settled));
        assertEq(s.closedBlock, block.number);
    }

    function test_accept_ethForToken_and_tokenForEth() public {
        // Maker gives ETH, receives stock.
        vm.prank(maker);
        uint256 id1 = escrow.propose{value: 2 ether}(taker, leg(ETH, 2 ether), leg(address(stock), B), c(1), uint64(block.timestamp + 1 days));
        uint256 takerEth = taker.balance;
        vm.prank(taker);
        escrow.accept(id1);
        assertEq(taker.balance, takerEth + 2 ether);
        assertEq(stock.balanceOf(maker), B);

        // Maker gives USD, receives ETH.
        vm.prank(maker);
        uint256 id2 = escrow.propose(taker, leg(address(usd), A), leg(ETH, 3 ether), c(2), uint64(block.timestamp + 1 days));
        uint256 makerEth = maker.balance;
        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.WrongValue.selector);
        escrow.accept{value: 1 ether}(id2);
        vm.prank(taker);
        escrow.accept{value: 3 ether}(id2);
        assertEq(maker.balance, makerEth + 3 ether);
        assertEq(usd.balanceOf(taker), A);
        assertEq(address(escrow).balance, 0);
    }

    function test_accept_onlyTaker_onlyOnce_beforeExpiry() public {
        uint256 id = proposeUsdForStock();
        vm.prank(stranger);
        vm.expectRevert(SettlementEscrow.NotTaker.selector);
        escrow.accept(id);
        vm.prank(maker);
        vm.expectRevert(SettlementEscrow.NotTaker.selector);
        escrow.accept(id);
        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.WrongValue.selector);
        escrow.accept{value: 1}(id);

        vm.warp(block.timestamp + 1 days);
        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.Expired.selector);
        escrow.accept(id);

        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.NotOpen.selector);
        escrow.accept(999);
    }

    function test_accept_twiceReverts() public {
        uint256 id = proposeUsdForStock();
        vm.prank(taker);
        escrow.accept(id);
        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.NotOpen.selector);
        escrow.accept(id);
        vm.prank(maker);
        vm.expectRevert(SettlementEscrow.NotOpen.selector);
        escrow.cancel(id);
    }

    function test_accept_withoutApprovalReverts_andLegAStays() public {
        uint256 id = proposeUsdForStock();
        vm.prank(taker);
        stock.approve(address(escrow), 0);
        vm.prank(taker);
        vm.expectRevert();
        escrow.accept(id);
        assertEq(usd.balanceOf(address(escrow)), A);
        assertEq(uint8(escrow.getSettlement(id).status), uint8(SettlementEscrow.Status.Proposed));
    }

    // ---- issuer-controlled tokens: a failing leg reverts the whole accept

    function test_accept_pausedLegB_revertsWhole_thenRefund() public {
        BlockingToken stk = new BlockingToken();
        stk.mint(taker, 100e18);
        vm.prank(taker);
        stk.approve(address(escrow), type(uint256).max);
        vm.prank(maker);
        uint256 id = escrow.propose(taker, leg(address(usd), A), leg(address(stk), 10e18), c(7), uint64(block.timestamp + 1 days));

        stk.setPaused(true);
        vm.prank(taker);
        vm.expectRevert(BlockingToken.TokenPaused.selector);
        escrow.accept(id);
        assertEq(usd.balanceOf(address(escrow)), A, "leg A stays escrowed");
        assertEq(usd.balanceOf(taker), 0);
        assertEq(stk.balanceOf(taker), 100e18);

        vm.warp(block.timestamp + 1 days);
        vm.prank(stranger);
        escrow.refund(id);
        assertEq(usd.balanceOf(maker), 1_000_000e6, "maker made whole");
    }

    function test_accept_makerBlockedOnLegB_revertsWhole() public {
        BlockingToken stk = new BlockingToken();
        stk.mint(taker, 100e18);
        vm.prank(taker);
        stk.approve(address(escrow), type(uint256).max);
        vm.prank(maker);
        uint256 id = escrow.propose(taker, leg(address(usd), A), leg(address(stk), 10e18), c(7), uint64(block.timestamp + 1 days));

        stk.setBlocked(maker, true);
        vm.prank(taker);
        vm.expectRevert(abi.encodeWithSelector(BlockingToken.Blocked.selector, maker));
        escrow.accept(id);
        assertEq(stk.balanceOf(taker), 100e18, "taker keeps leg B");
        assertEq(usd.balanceOf(address(escrow)), A, "leg A stays escrowed");

        vm.prank(maker);
        escrow.cancel(id);
        assertEq(usd.balanceOf(maker), 1_000_000e6);
    }

    function test_accept_takerBlockedOnLegA_revertsWhole() public {
        BlockingToken stk = new BlockingToken();
        stk.mint(maker, 100e18);
        vm.startPrank(maker);
        stk.approve(address(escrow), type(uint256).max);
        uint256 id = escrow.propose(taker, leg(address(stk), 10e18), leg(address(stock), B), c(8), uint64(block.timestamp + 1 days));
        vm.stopPrank();

        stk.setBlocked(taker, true);
        uint256 takerStock = stock.balanceOf(taker);
        vm.prank(taker);
        vm.expectRevert(abi.encodeWithSelector(BlockingToken.Blocked.selector, taker));
        escrow.accept(id);
        assertEq(stock.balanceOf(taker), takerStock, "taker's leg B never left");
        assertEq(stock.balanceOf(maker), 0);
        assertEq(stk.balanceOf(address(escrow)), 10e18);
    }

    function test_accept_tokenTurnsFeeOn_revertsWhole_refundStillWorks() public {
        FeeToken fee = new FeeToken();
        fee.setFee(false);
        fee.mint(maker, 100e18);
        vm.startPrank(maker);
        fee.approve(address(escrow), type(uint256).max);
        uint256 id = escrow.propose(taker, leg(address(fee), 100e18), leg(address(stock), B), c(9), uint64(block.timestamp + 1 days));
        vm.stopPrank();

        fee.setFee(true);
        vm.prank(taker);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.AmountMismatch.selector, address(fee), 100e18, 99e18));
        escrow.accept(id);

        vm.prank(maker);
        escrow.cancel(id);
        assertEq(fee.balanceOf(address(escrow)), 0);
        assertEq(fee.balanceOf(maker), 99e18);
    }

    function test_accept_feeOnLegB_rejected() public {
        FeeToken fee = new FeeToken();
        fee.mint(taker, 100e18);
        vm.prank(taker);
        fee.approve(address(escrow), type(uint256).max);
        vm.prank(maker);
        uint256 id = escrow.propose(taker, leg(address(usd), A), leg(address(fee), 50e18), c(10), uint64(block.timestamp + 1 days));
        vm.prank(taker);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.AmountMismatch.selector, address(fee), 50e18, 49.5e18));
        escrow.accept(id);
    }

    function test_accept_makerRefusesEth_revertsWhole() public {
        EthWallet w = new EthWallet();
        usd.mint(address(w), A);
        w.exec(address(usd), 0, abi.encodeCall(usd.approve, (address(escrow), A)));
        bytes memory call_ = abi.encodeCall(escrow.propose, (taker, leg(address(usd), A), leg(ETH, 1 ether), c(11), uint64(block.timestamp + 1 days)));
        uint256 id = abi.decode(w.exec(address(escrow), 0, call_), (uint256));
        w.setRefuse(true);
        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.EthTransferFailed.selector);
        escrow.accept{value: 1 ether}(id);
        assertEq(usd.balanceOf(address(escrow)), A);
        // The wallet can take its leg back once it accepts ETH again or simply cancels (leg A is a token).
        w.exec(address(escrow), 0, abi.encodeCall(escrow.cancel, (id)));
        assertEq(usd.balanceOf(address(w)), A);
    }

    // ------------------------------------------------------------ cancel / refund

    function test_cancel_byMakerOnly_returnsLegA() public {
        uint256 id = proposeUsdForStock();
        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.NotMaker.selector);
        escrow.cancel(id);
        vm.expectEmit(true, false, false, true);
        emit SettlementEscrow.Cancelled(id, c(1));
        vm.prank(maker);
        escrow.cancel(id);
        assertEq(usd.balanceOf(maker), 1_000_000e6);
        assertEq(uint8(escrow.getSettlement(id).status), uint8(SettlementEscrow.Status.Cancelled));
        vm.prank(taker);
        vm.expectRevert(SettlementEscrow.NotOpen.selector);
        escrow.accept(id);
    }

    function test_cancel_afterExpiryAllowed() public {
        uint256 id = proposeUsdForStock();
        vm.warp(block.timestamp + 2 days);
        vm.prank(maker);
        escrow.cancel(id);
        assertEq(usd.balanceOf(maker), 1_000_000e6);
    }

    function test_refund_onlyAfterExpiry_byAnyone() public {
        vm.prank(maker);
        uint256 id = escrow.propose{value: 1 ether}(taker, leg(ETH, 1 ether), leg(address(stock), B), c(3), uint64(block.timestamp + 1 hours));
        assertFalse(escrow.isExpired(id));
        vm.prank(stranger);
        vm.expectRevert(SettlementEscrow.NotExpired.selector);
        escrow.refund(id);
        vm.warp(block.timestamp + 1 hours);
        assertTrue(escrow.isExpired(id));
        uint256 before = maker.balance;
        vm.expectEmit(true, false, false, true);
        emit SettlementEscrow.Refunded(id, c(3), stranger);
        vm.prank(stranger);
        escrow.refund(id);
        assertEq(maker.balance, before + 1 ether);
        assertEq(address(escrow).balance, 0);
        vm.prank(stranger);
        vm.expectRevert(SettlementEscrow.NotOpen.selector);
        escrow.refund(id);
        assertFalse(escrow.isExpired(id));
    }

    // ------------------------------------------------------------ reentrancy

    function test_reentrancy_refused() public {
        ReentrantToken re = new ReentrantToken();
        re.mint(taker, 100e18);
        vm.prank(taker);
        re.approve(address(escrow), type(uint256).max);
        vm.prank(maker);
        uint256 id = escrow.propose(taker, leg(address(usd), A), leg(address(re), 10e18), c(12), uint64(block.timestamp + 1 days));

        // During accept, leg B's transfer tries to cancel the same settlement.
        re.arm(IEscrowLike(address(escrow)), id, 1);
        vm.prank(taker);
        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        escrow.accept(id);

        re.arm(IEscrowLike(address(escrow)), id, 0);
        vm.prank(taker);
        escrow.accept(id);
        assertEq(usd.balanceOf(taker), A);
    }

    // ------------------------------------------------------------ views

    function test_getSettlements_batch() public {
        uint256 a = proposeUsdForStock();
        vm.prank(maker);
        uint256 b = escrow.propose{value: 1 ether}(taker, leg(ETH, 1 ether), leg(address(stock), B), c(2), uint64(block.timestamp + 1 days));
        uint256[] memory ids = new uint256[](3);
        ids[0] = a;
        ids[1] = b;
        ids[2] = 77;
        SettlementEscrow.Settlement[] memory out = escrow.getSettlements(ids);
        assertEq(out.length, 3);
        assertEq(out[0].commitment, c(1));
        assertEq(out[1].tokenA, ETH);
        assertEq(uint8(out[2].status), 0);
    }

    // ------------------------------------------------------------ fuzz

    function testFuzz_settleMovesExactAmounts(uint256 amountA, uint256 amountB, uint32 term) public {
        amountA = bound(amountA, 1, 1_000_000e6);
        amountB = bound(amountB, 1, 1_000e18);
        uint64 exp = uint64(block.timestamp + bound(term, 1, 30 days));
        vm.prank(maker);
        uint256 id = escrow.propose(taker, leg(address(usd), amountA), leg(address(stock), amountB), c(amountA), exp);
        vm.prank(taker);
        escrow.accept(id);
        assertEq(usd.balanceOf(taker), amountA);
        assertEq(stock.balanceOf(maker), amountB);
        assertEq(usd.balanceOf(address(escrow)) + stock.balanceOf(address(escrow)), 0);
    }

    function testFuzz_refundReturnsExactly(uint96 amountEth, uint32 term, uint32 extra) public {
        uint256 v = bound(amountEth, 1, 100 ether);
        uint256 t = bound(term, 1, 30 days);
        vm.prank(maker);
        uint256 id = escrow.propose{value: v}(taker, leg(ETH, v), leg(address(stock), 1), c(v), uint64(block.timestamp + t));
        vm.warp(block.timestamp + t + bound(extra, 0, 365 days));
        uint256 before = maker.balance;
        escrow.refund(id);
        assertEq(maker.balance, before + v);
        assertEq(address(escrow).balance, 0);
    }

    function testFuzz_onlyTakerCanAccept(address who) public {
        vm.assume(who != taker);
        uint256 id = proposeUsdForStock();
        vm.deal(who, 1 ether);
        vm.prank(who);
        vm.expectRevert(SettlementEscrow.NotTaker.selector);
        escrow.accept(id);
    }
}
