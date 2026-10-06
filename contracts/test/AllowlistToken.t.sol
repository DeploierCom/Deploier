// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {AllowlistToken} from "../src/AllowlistToken.sol";
import {AllowlistTokenFactory} from "../src/AllowlistTokenFactory.sol";
import {SettlementEscrow} from "../src/SettlementEscrow.sol";
import {MockERC20} from "./Mocks.sol";

contract AllowlistTokenTest is Test {
    AllowlistTokenFactory factory;
    address issuer = makeAddr("issuer");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address eve = makeAddr("eve");
    bytes32 constant C = keccak256("issuance terms|salt");

    function setUp() public {
        factory = new AllowlistTokenFactory();
        vm.warp(1_800_000_000);
    }

    function holders2() internal view returns (address[] memory h) {
        h = new address[](2);
        h[0] = alice;
        h[1] = bob;
    }

    function issue(uint64 maturity) internal returns (AllowlistToken t) {
        vm.prank(issuer);
        t = AllowlistToken(factory.issue("13-week bill Dec 2026", "TB13W", 10_000, holders2(), maturity, C));
    }

    // ------------------------------------------------------------ factory

    function test_issue_setsEverything() public {
        vm.expectEmit(false, true, true, true);
        emit AllowlistTokenFactory.Issued(address(0), issuer, C, "13-week bill Dec 2026", "TB13W", 10_000, 1_900_000_000, 2);
        AllowlistToken t = issue(1_900_000_000);
        assertEq(t.issuer(), issuer);
        assertEq(t.maturity(), 1_900_000_000);
        assertEq(t.commitment(), C);
        assertEq(t.decimals(), 0);
        assertEq(t.totalSupply(), 10_000);
        assertEq(t.balanceOf(issuer), 10_000);
        assertTrue(t.isAllowed(issuer));
        assertTrue(t.isAllowed(alice));
        assertTrue(t.isAllowed(bob));
        assertFalse(t.isAllowed(eve));
        assertEq(t.name(), "13-week bill Dec 2026");
        assertEq(t.symbol(), "TB13W");
        assertEq(factory.tokenCount(), 1);
        assertEq(factory.tokens(0), address(t));
        assertTrue(factory.isToken(address(t)));
        assertEq(factory.tokenOf(issuer, C), address(t));
        assertEq(factory.tokenOf(alice, C), address(0));
        assertEq(factory.issuedBlock(address(t)), block.number);
        AllowlistTokenFactory.Issuance[] memory l = factory.latest(5);
        assertEq(l.length, 1);
        assertEq(l[0].token, address(t));
        assertEq(l[0].issuer, issuer);
        assertEq(l[0].commitment, C);
    }

    function test_issue_reverts() public {
        address[] memory h = holders2();
        vm.startPrank(issuer);
        vm.expectRevert(AllowlistTokenFactory.BadName.selector);
        factory.issue("", "X", 1, h, 0, C);
        vm.expectRevert(AllowlistTokenFactory.BadName.selector);
        factory.issue(string(new bytes(65)), "X", 1, h, 0, C);
        vm.expectRevert(AllowlistTokenFactory.BadSymbol.selector);
        factory.issue("Name", "", 1, h, 0, C);
        vm.expectRevert(AllowlistTokenFactory.BadSymbol.selector);
        factory.issue("Name", "ABCDEFGHIJKLMNOPQ", 1, h, 0, C);
        vm.expectRevert(AllowlistTokenFactory.ZeroSupply.selector);
        factory.issue("Name", "X", 0, h, 0, C);
        vm.expectRevert(AllowlistTokenFactory.TooManyHolders.selector);
        factory.issue("Name", "X", 1, new address[](101), 0, C);
        vm.expectRevert(AllowlistTokenFactory.BadMaturity.selector);
        factory.issue("Name", "X", 1, h, uint64(block.timestamp), C);
        vm.expectRevert(AllowlistTokenFactory.EmptyCommitment.selector);
        factory.issue("Name", "X", 1, h, 0, bytes32(0));
        address[] memory zero = new address[](1);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, address(0)));
        factory.issue("Name", "X", 1, zero, 0, C);
        factory.issue("Name", "X", 1, h, 0, C);
        vm.expectRevert(AllowlistTokenFactory.CommitmentUsed.selector);
        factory.issue("Name", "X", 1, h, 0, C);
        vm.stopPrank();
    }

    function test_issue_holdersMayRepeatAndIncludeIssuer() public {
        address[] memory h = new address[](3);
        h[0] = alice;
        h[1] = alice;
        h[2] = issuer;
        vm.prank(issuer);
        AllowlistToken t = AllowlistToken(factory.issue("Name", "X", 5, h, 0, C));
        assertTrue(t.isAllowed(alice));
    }

    /// A copycat reusing an issuer's public commitment makes its own token; the issuer's lookup is unaffected.
    function test_reusedCommitment_byAnotherIssuer_isSeparate() public {
        vm.prank(eve);
        address fake = factory.issue("13-week bill Dec 2026", "TB13W", 10_000, holders2(), 0, C);
        AllowlistToken real = issue(0);
        assertTrue(fake != address(real));
        assertEq(factory.tokenOf(issuer, C), address(real));
        assertEq(factory.tokenOf(eve, C), fake);
        assertEq(AllowlistToken(fake).issuer(), eve);
    }

    // ------------------------------------------------------------ transfers

    function test_transfer_onlyBetweenAllowed() public {
        AllowlistToken t = issue(0);
        vm.prank(issuer);
        t.transfer(alice, 100);
        vm.prank(alice);
        t.transfer(bob, 40);
        assertEq(t.balanceOf(bob), 40);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, eve));
        t.transfer(eve, 1);

        vm.prank(issuer);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, eve));
        t.transfer(eve, 1);
    }

    function test_transferFrom_respectsAllowlist() public {
        AllowlistToken t = issue(0);
        vm.prank(issuer);
        t.approve(eve, 100);
        // An outsider can move units between allowed wallets as an approved spender, never to itself.
        vm.prank(eve);
        t.transferFrom(issuer, alice, 50);
        vm.prank(eve);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, eve));
        t.transferFrom(issuer, eve, 50);
    }

    function test_delisted_canOnlyReturnToIssuer() public {
        AllowlistToken t = issue(0);
        vm.prank(issuer);
        t.transfer(alice, 100);
        address[] memory a = new address[](1);
        a[0] = alice;
        vm.expectEmit(true, false, false, true);
        emit AllowlistToken.AllowlistUpdated(alice, false);
        vm.prank(issuer);
        t.setAllowed(a, false);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, alice));
        t.transfer(bob, 1);
        vm.prank(issuer);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, alice));
        t.transfer(alice, 1);
        vm.prank(alice);
        t.transfer(issuer, 100);
        assertEq(t.balanceOf(alice), 0);
    }

    function test_setAllowed_issuerOnly_issuerStays() public {
        AllowlistToken t = issue(0);
        address[] memory a = new address[](1);
        a[0] = eve;
        vm.prank(eve);
        vm.expectRevert(AllowlistToken.NotIssuer.selector);
        t.setAllowed(a, true);
        vm.prank(issuer);
        t.setAllowed(a, true);
        assertTrue(t.isAllowed(eve));

        a[0] = issuer;
        vm.prank(issuer);
        vm.expectRevert(AllowlistToken.IssuerStaysAllowed.selector);
        t.setAllowed(a, false);
        a[0] = address(0);
        vm.prank(issuer);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, address(0)));
        t.setAllowed(a, true);
    }

    function test_issuerCannotSeize() public {
        AllowlistToken t = issue(0);
        vm.prank(issuer);
        t.transfer(alice, 100);
        vm.prank(issuer);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, issuer, 0, 100));
        t.transferFrom(alice, issuer, 100);
    }

    // ------------------------------------------------------------ maturity

    function test_maturity_stopsTransfers_opensRedeem() public {
        AllowlistToken t = issue(uint64(block.timestamp + 90 days));
        vm.prank(issuer);
        t.transfer(alice, 100);
        vm.prank(alice);
        vm.expectRevert(AllowlistToken.NotMatured.selector);
        t.redeem(10);
        assertFalse(t.matured());

        vm.warp(block.timestamp + 90 days);
        assertTrue(t.matured());
        vm.prank(alice);
        vm.expectRevert(AllowlistToken.Matured.selector);
        t.transfer(bob, 1);

        vm.expectEmit(true, false, false, true);
        emit AllowlistToken.Redeemed(alice, 60);
        vm.prank(alice);
        t.redeem(60);
        assertEq(t.balanceOf(alice), 40);
        assertEq(t.totalSupply(), 10_000 - 60);
    }

    function test_noMaturity_neverRedeems() public {
        AllowlistToken t = issue(0);
        vm.warp(block.timestamp + 3650 days);
        assertFalse(t.matured());
        vm.prank(issuer);
        vm.expectRevert(AllowlistToken.NotMatured.selector);
        t.redeem(1);
        vm.prank(issuer);
        t.transfer(alice, 1);
    }

    // ------------------------------------------------------------ with the escrow

    function test_settlesThroughEscrow_onlyWhenEscrowAllowed() public {
        SettlementEscrow escrow = new SettlementEscrow();
        MockERC20 usd = new MockERC20("USD", "USD", 6);
        AllowlistToken t = issue(0);
        usd.mint(alice, 1_000e6);

        vm.startPrank(issuer);
        t.approve(address(escrow), 100);
        vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, address(escrow)));
        escrow.propose(alice, SettlementEscrow.Leg(address(t), 100), SettlementEscrow.Leg(address(usd), 1_000e6), C, uint64(block.timestamp + 1 days));
        address[] memory a = new address[](1);
        a[0] = address(escrow);
        t.setAllowed(a, true);
        uint256 id = escrow.propose(alice, SettlementEscrow.Leg(address(t), 100), SettlementEscrow.Leg(address(usd), 1_000e6), C, uint64(block.timestamp + 1 days));
        vm.stopPrank();

        vm.startPrank(alice);
        usd.approve(address(escrow), 1_000e6);
        escrow.accept(id);
        vm.stopPrank();
        assertEq(t.balanceOf(alice), 100);
        assertEq(usd.balanceOf(issuer), 1_000e6);
    }

    // ------------------------------------------------------------ fuzz

    function testFuzz_onlyAllowedEverHold(address to, uint16 amount, bool listed) public {
        vm.assume(to != address(0) && to != issuer);
        AllowlistToken t = issue(0);
        if (listed) {
            address[] memory a = new address[](1);
            a[0] = to;
            vm.prank(issuer);
            t.setAllowed(a, true);
        }
        uint256 amt = bound(amount, 1, 10_000);
        bool allowed = t.isAllowed(to);
        vm.prank(issuer);
        if (!allowed) vm.expectRevert(abi.encodeWithSelector(AllowlistToken.NotAllowed.selector, to));
        t.transfer(to, amt);
        assertEq(t.balanceOf(to), allowed ? amt : 0);
        assertEq(t.totalSupply(), 10_000);
    }

    function testFuzz_issueAnySupply(uint256 supply, uint64 matIn) public {
        supply = bound(supply, 1, type(uint128).max);
        uint64 mat = matIn == 0 ? 0 : uint64(block.timestamp + bound(matIn, 1, 3650 days));
        vm.prank(issuer);
        AllowlistToken t = AllowlistToken(factory.issue("N", "S", supply, holders2(), mat, keccak256(abi.encode(supply, mat))));
        assertEq(t.balanceOf(issuer), supply);
        assertEq(t.maturity(), mat);
    }
}
