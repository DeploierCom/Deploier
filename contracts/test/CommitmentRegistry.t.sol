// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CommitmentRegistry} from "../src/CommitmentRegistry.sol";

contract CommitmentRegistryTest is Test {
    CommitmentRegistry reg;

    function setUp() public {
        reg = new CommitmentRegistry();
    }

    function test_record_emitsAndCounts() public {
        bytes32 c = keccak256("terms|salt");
        vm.expectEmit(true, true, true, true);
        emit CommitmentRegistry.Recorded(address(this), c, 0, 0, 1);
        assertEq(reg.record(c), 1);
        vm.expectEmit(true, true, true, true);
        emit CommitmentRegistry.Recorded(address(this), c, 2, 5, 2);
        assertEq(reg.recordWith(c, 2, 5), 2);
        assertEq(reg.count(), 2);
    }

    function test_record_rejectsEmpty() public {
        vm.expectRevert(CommitmentRegistry.EmptyCommitment.selector);
        reg.record(bytes32(0));
        vm.expectRevert(CommitmentRegistry.EmptyCommitment.selector);
        reg.recordWith(bytes32(0), 1, 1);
    }

    function testFuzz_record(address who, bytes32 c, uint8 kind, uint8 status) public {
        vm.assume(c != bytes32(0));
        uint256 before = reg.count();
        vm.expectEmit(true, true, true, true);
        emit CommitmentRegistry.Recorded(who, c, kind, status, before + 1);
        vm.prank(who);
        reg.recordWith(c, kind, status);
        assertEq(reg.count(), before + 1);
    }

    function test_latest_newestFirst() public {
        for (uint256 i = 1; i <= 5; ++i) {
            vm.roll(100 + i);
            reg.recordWith(bytes32(i), 1, uint8(i));
        }
        (CommitmentRegistry.Record[] memory r, uint256[] memory seqs) = reg.latest(0, 3);
        assertEq(r.length, 3);
        assertEq(seqs[0], 5);
        assertEq(r[0].commitment, bytes32(uint256(5)));
        assertEq(r[0].blockNumber, 105);
        assertEq(r[0].author, address(this));
        assertEq(r[2].status, 3);
        (r, seqs) = reg.latest(2, 10);
        assertEq(r.length, 2);
        assertEq(seqs[1], 1);
        (r,) = reg.latest(99, 1);
        assertEq(r[0].commitment, bytes32(uint256(5)));
        CommitmentRegistry.Record memory one = reg.getRecord(4);
        assertEq(one.kind, 1);
        assertEq(reg.getRecord(6).author, address(0));
    }
}
