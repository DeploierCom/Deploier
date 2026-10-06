// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CommitmentRegistry
 * @notice A public tape of commitments. Anyone can record a bytes32 commitment
 * (keccak256 of private terms and a salt) with an optional kind and status.
 * Each record keeps the author, the commitment, the labels and the block, and
 * is readable by sequence number, so the tape can be read without scanning
 * logs. Nothing about the terms themselves is stored.
 *
 * Holders of the terms and the salt can later show that the commitment was on
 * chain at that block. Nobody else learns anything from it.
 *
 * Kinds and statuses are self-declared labels chosen by whoever records; they
 * prove nothing about a settlement or an issuance. The authoritative status of
 * a settlement lives in SettlementEscrow and of an issuance in the token made
 * by AllowlistTokenFactory. A record proves only that its author published
 * that commitment at that block. There is no owner and no admin.
 */
contract CommitmentRegistry {
    struct Record {
        address author;
        uint8 kind;
        uint8 status;
        uint64 blockNumber;
        bytes32 commitment;
    }

    /// @notice Number of records so far. Sequence numbers run from 1 to this value.
    uint256 public count;
    mapping(uint256 => Record) private _records;

    event Recorded(address indexed author, bytes32 indexed commitment, uint8 indexed kind, uint8 status, uint256 seq);

    error EmptyCommitment();

    /// @notice Records a commitment with no kind or status.
    function record(bytes32 commitment) external returns (uint256) {
        return _record(commitment, 0, 0);
    }

    /// @notice Records a commitment with a kind and a status label.
    function recordWith(bytes32 commitment, uint8 kind, uint8 status) external returns (uint256) {
        return _record(commitment, kind, status);
    }

    /// @notice One record by sequence number (empty when out of range).
    function getRecord(uint256 seq) external view returns (Record memory) {
        return _records[seq];
    }

    /// @notice The newest `limit` records at or below `seq` (0 = latest), newest first.
    function latest(uint256 seq, uint256 limit) external view returns (Record[] memory out, uint256[] memory seqs) {
        uint256 top = seq == 0 || seq > count ? count : seq;
        uint256 n = limit < top ? limit : top;
        out = new Record[](n);
        seqs = new uint256[](n);
        for (uint256 i; i < n; ++i) {
            seqs[i] = top - i;
            out[i] = _records[top - i];
        }
    }

    function _record(bytes32 commitment, uint8 kind, uint8 status) private returns (uint256 seq) {
        if (commitment == bytes32(0)) revert EmptyCommitment();
        seq = ++count;
        _records[seq] = Record(msg.sender, kind, status, uint64(block.number), commitment);
        emit Recorded(msg.sender, commitment, kind, status, seq);
    }
}
