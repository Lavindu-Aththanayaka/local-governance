// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Reporting is Ownable, ReentrancyGuard {

    // ─── Enums ───────────────────────────────────────────────────────────────

    enum ReportStatus {
        PendingValidation,
        CommunityRejected,
        Open,
        InProgress,
        PendingRejectionReview,
        PendingVerification,
        Closed,
        Reopened
    }

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Report {
        uint256 id;
        string ipfsCid;
        bytes32 reportHash;
        bytes32 submissionNullifier;
        address submittedByRelayer;
        ReportStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 phaseDeadline;
        uint256 validationUpvotes;
        uint256 validationDownvotes;
        uint256 verificationAcceptVotes;
        uint256 verificationRejectVotes;
        uint256 rejectionUpholdVotes;
        uint256 rejectionAppealVotes;
        address assignedAuthority;
    }

    // ─── State Variables ─────────────────────────────────────────────────────

    uint256 public reportCount;
    uint256 public votingWindowDuration = 12 hours;

    mapping(uint256 => Report) public reports;
    mapping(bytes32 => bool) public usedSubmissionNullifiers;
    mapping(uint256 => mapping(bytes32 => bool)) public usedValidationVoteNullifiers;
    mapping(uint256 => mapping(bytes32 => bool)) public usedVerificationVoteNullifiers;
    mapping(uint256 => mapping(bytes32 => bool)) public usedRejectionReviewVoteNullifiers;
    mapping(address => bool) public authorizedRelayers;
    mapping(address => bool) public authorizedAuthorities;

    // ─── Custom Errors ────────────────────────────────────────────────────────

    error Unauthorized();
    error InvalidReportId();
    error InvalidState();
    error EmptyCID();
    error InvalidHash();
    error NullifierAlreadyUsed();
    error InvalidNullifier();
    error VotingWindowStillOpen();
    error VotingWindowClosed();

    // ─── Events ───────────────────────────────────────────────────────────────

    event ReportSubmitted(uint256 indexed reportId, string ipfsCid, bytes32 indexed reportHash, bytes32 indexed submissionNullifier, uint256 timestamp);
    event ValidationVoteCast(uint256 indexed reportId, bytes32 indexed voteNullifier, bool support, uint256 upvotes, uint256 downvotes);
    event ReportStatusChanged(uint256 indexed reportId, ReportStatus previousStatus, ReportStatus newStatus, uint256 timestamp);
    event VotingWindowFinalized(uint256 indexed reportId, ReportStatus previousStatus, ReportStatus newStatus, uint256 timestamp);
    event WorkStarted(uint256 indexed reportId, address indexed authority, uint256 timestamp);
    event ReportMarkedSolved(uint256 indexed reportId, address indexed authority, uint256 timestamp);
    event ReportRejectedByAuthority(uint256 indexed reportId, address indexed authority, uint256 timestamp);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyRelayer() {
        if (!authorizedRelayers[msg.sender]) revert Unauthorized();
        _;
    }

    modifier onlyAuthority() {
        if (!authorizedAuthorities[msg.sender]) revert Unauthorized();
        _;
    }

    constructor() Ownable(msg.sender) {}

    // ─── Admin Functions ──────────────────────────────────────────────────────

    function setRelayer(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
    }

    function setAuthority(address authority, bool authorized) external onlyOwner {
        authorizedAuthorities[authority] = authorized;
    }

    function setVotingWindowDuration(uint256 duration) external onlyOwner {
        votingWindowDuration = duration;
    }

    // ─── Core Functions (implement these one by one) ──────────────────────────

    // TODO: submitReport()
    // TODO: castValidationVote()
    // TODO: castVerificationVote()
    // TODO: castRejectionReviewVote()
    // TODO: finalizeVotingWindow()
    // TODO: startWork()
    // TODO: markAsSolved()
    // TODO: rejectIssue()
    // TODO: _changeStatus()
}