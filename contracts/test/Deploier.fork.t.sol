// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SettlementEscrow} from "../src/SettlementEscrow.sol";
import {CommitmentRegistry} from "../src/CommitmentRegistry.sol";
import {AllowlistToken} from "../src/AllowlistToken.sol";
import {AllowlistTokenFactory} from "../src/AllowlistTokenFactory.sol";

/**
 * Runs the contracts against the real Robinhood Chain tokens:
 *   FORK_URL=https://rpc.mainnet.chain.robinhood.com \
 *   forge test --match-path test/Deploier.fork.t.sol --evm-version cancun
 * Without FORK_URL every test here is skipped.
 */
contract DeploierForkTest is Test {
    address constant USDG = 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168;
    address constant WETH = 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73;
    address constant NVDA = 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC;
    address constant TSLA = 0x322F0929c4625eD5bAd873c95208D54E1c003b2d;
    address constant AAPL = 0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9;

    SettlementEscrow escrow;
    CommitmentRegistry registry;
    AllowlistTokenFactory factory;
    address maker = makeAddr("maker");
    address taker = makeAddr("taker");
    bool forked;

    function setUp() public {
        string memory url = vm.envOr("FORK_URL", string(""));
        if (bytes(url).length == 0) return;
        vm.createSelectFork(url);
        forked = true;
        escrow = new SettlementEscrow();
        registry = new CommitmentRegistry();
        factory = new AllowlistTokenFactory();
    }

    modifier onlyFork() {
        if (!forked) {
            vm.skip(true);
        }
        _;
    }

    function fund(address token, address to, uint256 amount) internal {
        deal(token, to, amount);
        assertEq(IERC20(token).balanceOf(to), amount, "deal");
    }

    function approveAll(address who, address token) internal {
        vm.prank(who);
        IERC20(token).approve(address(escrow), type(uint256).max);
    }

    function test_fork_realTokensMetadata() public onlyFork {
        assertEq(IERC20Metadata(USDG).decimals(), 6);
        assertEq(IERC20Metadata(USDG).symbol(), "USDG");
        assertEq(IERC20Metadata(WETH).decimals(), 18);
        assertEq(IERC20Metadata(NVDA).symbol(), "NVDA");
        assertGt(NVDA.code.length, 0);
    }

    function test_fork_usdgForNvda_settles() public onlyFork {
        uint256 a = 1_850e6;
        uint256 b = 10 * 10 ** IERC20Metadata(NVDA).decimals();
        fund(USDG, maker, a);
        fund(NVDA, taker, b);
        approveAll(maker, USDG);
        approveAll(taker, NVDA);

        vm.prank(maker);
        uint256 id = escrow.propose(taker, SettlementEscrow.Leg(USDG, a), SettlementEscrow.Leg(NVDA, b), keccak256("fork-1"), uint64(block.timestamp + 1 days));
        assertEq(IERC20(USDG).balanceOf(address(escrow)), a);

        vm.prank(taker);
        escrow.accept(id);
        assertEq(IERC20(USDG).balanceOf(taker), a);
        assertEq(IERC20(NVDA).balanceOf(maker), b);
        assertEq(IERC20(USDG).balanceOf(address(escrow)), 0);
        assertEq(IERC20(NVDA).balanceOf(address(escrow)), 0);
    }

    function test_fork_wethAndEth_legs() public onlyFork {
        fund(WETH, maker, 2 ether);
        approveAll(maker, WETH);
        vm.deal(taker, 5 ether);
        vm.prank(maker);
        uint256 id = escrow.propose(taker, SettlementEscrow.Leg(WETH, 2 ether), SettlementEscrow.Leg(address(0), 2 ether), keccak256("fork-2"), uint64(block.timestamp + 1 hours));
        uint256 makerEth = maker.balance;
        vm.prank(taker);
        escrow.accept{value: 2 ether}(id);
        assertEq(IERC20(WETH).balanceOf(taker), 2 ether);
        assertEq(maker.balance, makerEth + 2 ether);
    }

    /// A stock token whose issuer blocks the transfer to the taker: the whole accept reverts, nothing moves.
    function test_fork_stockLegBlocked_revertsWhole_thenRefund() public onlyFork {
        uint256 a = 500e6;
        uint256 b = 2 * 10 ** IERC20Metadata(TSLA).decimals();
        fund(TSLA, maker, b);
        fund(USDG, taker, a);
        approveAll(maker, TSLA);
        approveAll(taker, USDG);
        vm.prank(maker);
        uint256 id = escrow.propose(taker, SettlementEscrow.Leg(TSLA, b), SettlementEscrow.Leg(USDG, a), keccak256("fork-3"), uint64(block.timestamp + 1 days));

        // Simulate the issuer's block on deliveries of the stock token to the taker.
        vm.mockCallRevert(TSLA, abi.encodeWithSelector(IERC20.transfer.selector, taker, b), bytes("issuer: blocked"));
        vm.prank(taker);
        vm.expectRevert(bytes("issuer: blocked"));
        escrow.accept(id);
        vm.clearMockedCalls();

        assertEq(IERC20(USDG).balanceOf(taker), a, "taker keeps its USDG");
        assertEq(IERC20(TSLA).balanceOf(address(escrow)), b, "stock leg still escrowed");

        vm.warp(block.timestamp + 1 days);
        escrow.refund(id);
        assertEq(IERC20(TSLA).balanceOf(maker), b, "maker refunded");
    }

    /// A paused stock token (every transfer reverts) can be cancelled once it trades again.
    function test_fork_stockPaused_cancelAfterUnpause() public onlyFork {
        uint256 b = 1 * 10 ** IERC20Metadata(AAPL).decimals();
        fund(AAPL, maker, b);
        approveAll(maker, AAPL);
        vm.prank(maker);
        uint256 id = escrow.propose(taker, SettlementEscrow.Leg(AAPL, b), SettlementEscrow.Leg(USDG, 250e6), keccak256("fork-4"), uint64(block.timestamp + 1 days));

        vm.mockCallRevert(AAPL, abi.encodeWithSelector(IERC20.transfer.selector), bytes("paused"));
        vm.prank(maker);
        vm.expectRevert(bytes("paused"));
        escrow.cancel(id);
        vm.clearMockedCalls();

        vm.prank(maker);
        escrow.cancel(id);
        assertEq(IERC20(AAPL).balanceOf(maker), b);
    }

    function test_fork_registryAndIssuance() public onlyFork {
        assertEq(registry.recordWith(keccak256("tape"), 1, 2), 1);

        address[] memory holders = new address[](1);
        holders[0] = taker;
        vm.prank(maker);
        AllowlistToken t = AllowlistToken(factory.issue("Bill Dec 2026", "TBDEC", 1_000, holders, uint64(block.timestamp + 60 days), keccak256("issue")));
        assertEq(t.balanceOf(maker), 1_000);

        // The issuer sells 100 units to the allowlisted taker for USDG through the escrow.
        address[] memory e = new address[](1);
        e[0] = address(escrow);
        vm.startPrank(maker);
        t.setAllowed(e, true);
        t.approve(address(escrow), 100);
        uint256 id = escrow.propose(taker, SettlementEscrow.Leg(address(t), 100), SettlementEscrow.Leg(USDG, 9_900e6), keccak256("fork-5"), uint64(block.timestamp + 1 days));
        vm.stopPrank();
        fund(USDG, taker, 9_900e6);
        approveAll(taker, USDG);
        vm.prank(taker);
        escrow.accept(id);
        assertEq(t.balanceOf(taker), 100);
        assertEq(IERC20(USDG).balanceOf(maker), 9_900e6);
    }
}
