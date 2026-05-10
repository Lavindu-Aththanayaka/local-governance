# Reporting.sol Smart Contract Specification and Requirements

## 1. Purpose

`Reporting.sol` is the core Solidity smart contract for the civic issue reporting module of the private permissioned Geth blockchain. Its responsibility is to maintain an immutable, transparent, and auditable state machine for civic issue reports.

The contract must **not** store heavy report content such as images, videos, or long descriptions directly on-chain. Those assets are processed and stored off-chain by the backend relayer, AI moderation service, and IPFS. The contract stores only lightweight, verifiable metadata such as report identifiers, IPFS CIDs, ticket/nullifier identifiers, vote counters, status values, timestamps, and event logs.

---

## 2. Blockchain Environment

| Item | Requirement |
| --- | --- |
| Blockchain type | Private permissioned Geth blockchain |
| Consensus | Proof-of-Authority (PoA) |
| Smart contract language | Solidity |
| Users submitting transactions | Mainly backend relayer and authorized authority wallets |
| Citizen gas payment | Citizens should not pay gas directly; backend relayer submits transactions |
| Storage approach | Lightweight metadata on-chain, full report/media content off-chain in IPFS |
| Identity model | Real citizen identity remains off-chain; smart contract only sees anonymous ticket/nullifier values |

---

## 3. Main Actors

### 3.1 Citizen

A verified citizen can:

- Submit a civic issue report through the DApp.
- Vote during the community validation phase.
- Vote during the post-resolution verification phase.
- Vote during the authority rejection appeal phase.

Citizens do not directly expose their real identity to the smart contract. They interact using anonymous, single-use cryptographic tickets verified by the backend relayer before blockchain submission.

### 3.2 Backend Relayer

The backend relayer is the main transaction submitter for citizen actions.

Responsibilities before calling the smart contract:

- Verify the government-signed ticket.
- Verify the citizen signature.
- Verify the payload hash.
- Send the content to the AI moderation oracle.
- Upload approved media/content to IPFS.
- Submit only approved lightweight metadata to the smart contract.
- Pay the gas fee on behalf of citizens.
- Trigger `finalizeVotingWindow()` once the voting deadline for any phase has passed.

The smart contract restricts report submission and vote submission to the trusted relayer unless the design later supports direct citizen transaction submission.

### 3.3 Government / Authority User

An authorized authority wallet can:

- Acknowledge an open or reopened report to begin physical repairs (`startWork`).
- Mark an in-progress report as completed (`markAsSolved`).
- Dismiss an issue from open or in-progress states if it is deemed invalid or out of jurisdiction (`rejectIssue`).

Authority actions must be controlled using role-based access control.

### 3.4 Contract Admin

The admin/deployer can:

- Add or remove authorized relayers.
- Add or remove authority wallets.
- Update phase duration parameters for voting windows.
- Pause/unpause the contract if emergency control is needed.

---

## 4. Report Lifecycle States (8-Stage FSM)

To enforce accountability and prevent unilateral dismissals of civic issues by authorities, the contract implements a strict Finite State Machine (FSM). Every submitted report strictly adheres to an 8-stage lifecycle managed via an on-chain enum:

```solidity
enum ReportStatus {
    PendingValidation,      // 0: Initial state awaiting community validation voting window
    CommunityRejected,      // 1: Terminal state — community voted against legitimacy
    Open,                   // 2: Validated by citizens, awaiting government action
    InProgress,             // 3: Authority acknowledged and is actively executing repairs
    PendingRejectionReview, // 4: Authority dismissed the issue, triggering a community appeal window
    PendingVerification,    // 5: Authority marked work completed, triggering a verification voting window
    Closed,                 // 6: Terminal state — successfully resolved or accepted dismissal
    Reopened                // 7: Community rejected the authority's fix, forcing rework
}
```

---

## 5. State Transition Rules

All voting-based transitions are driven exclusively by **lazy evaluation**: votes are accumulated during a fixed voting window, and state is finalized only when `finalizeVotingWindow()` is called after the window closes. There are no mid-window threshold triggers.

| Current State | Action / Trigger | Actor | Next State | Condition |
| --- | --- | --- | --- | --- |
| None | Submit report | Relayer | `PendingValidation` | Nullifier unused, metadata valid; voting window starts |
| `PendingValidation` | `finalizeVotingWindow()` | Relayer / anyone | `Open` | Voting window closed; upvotes > downvotes |
| `PendingValidation` | `finalizeVotingWindow()` | Relayer / anyone | `CommunityRejected` | Voting window closed; downvotes >= upvotes |
| `Open` / `Reopened` | `startWork()` | Authority | `InProgress` | Report in `Open` or `Reopened` state |
| `InProgress` | `markAsSolved()` | Authority | `PendingVerification` | Report in `InProgress`; verification voting window starts |
| `Open` / `InProgress` | `rejectIssue()` | Authority | `PendingRejectionReview` | Report in `Open` or `InProgress`; review voting window starts |
| `PendingVerification` | `finalizeVotingWindow()` | Relayer / anyone | `Closed` | Voting window closed; accept votes > reject votes |
| `PendingVerification` | `finalizeVotingWindow()` | Relayer / anyone | `Reopened` | Voting window closed; reject votes >= accept votes |
| `PendingRejectionReview` | `finalizeVotingWindow()` | Relayer / anyone | `Closed` | Voting window closed; uphold votes > appeal votes |
| `PendingRejectionReview` | `finalizeVotingWindow()` | Relayer / anyone | `Open` | Voting window closed; appeal votes >= uphold votes |

> **Key principle:** No voting function ever changes the report state mid-window. State transitions happen only through `finalizeVotingWindow()` after the deadline has passed. The final vote tally at window close determines the outcome.

---

## 6. Core Data Structures

### 6.1 Report Struct

```solidity
struct Report {
    uint256 id;
    string ipfsCid;
    bytes32 reportHash;
    bytes32 submissionNullifier;
    address submittedByRelayer;
    ReportStatus status;
    uint256 createdAt;
    uint256 updatedAt;

    // Voting window deadline (shared field, reused per phase)
    uint256 phaseDeadline;

    // Phase 1: Community Validation Counters
    uint256 validationUpvotes;
    uint256 validationDownvotes;

    // Phase 2: Post-Resolution Verification Counters
    uint256 verificationAcceptVotes;
    uint256 verificationRejectVotes;

    // Phase 3: Authority Rejection Review Counters
    uint256 rejectionUpholdVotes;
    uint256 rejectionAppealVotes;

    address assignedAuthority;
}
```

### 6.2 Mappings

```solidity
mapping(uint256 => Report) public reports;
mapping(bytes32 => bool) public usedSubmissionNullifiers;

// reportId => voteNullifier => used (one mapping per phase)
mapping(uint256 => mapping(bytes32 => bool)) public usedValidationVoteNullifiers;
mapping(uint256 => mapping(bytes32 => bool)) public usedVerificationVoteNullifiers;
mapping(uint256 => mapping(bytes32 => bool)) public usedRejectionReviewVoteNullifiers;

// Role-based access
mapping(address => bool) public authorizedRelayers;
mapping(address => bool) public authorizedAuthorities;
```

---

## 7. Nullifier and Ticket Requirements

The contract must prevent replay attacks and duplicate actions.

### 7.1 Submission Nullifier

Each report submission uses a unique ticket/nullifier.

Requirements:

- A submission nullifier can be used only once globally.
- If the same submission nullifier is submitted again, the transaction must revert.
- Once accepted, the nullifier must be marked as consumed before or during report creation.

### 7.2 Voting Nullifier

Voting nullifiers are scoped per report and per phase.

Requirements:

- A citizen can vote only once in the validation phase for a given report.
- A citizen can vote only once in the verification phase for a given report.
- A citizen can vote only once in the rejection review phase for a given report.
- The same voting nullifier must not be reused within the same report phase.
- Nullifiers across all 3 phases are stored separately to allow full lifecycle participation.

```solidity
usedValidationVoteNullifiers[reportId][voteNullifier] = true;
usedVerificationVoteNullifiers[reportId][voteNullifier] = true;
usedRejectionReviewVoteNullifiers[reportId][voteNullifier] = true;
```

---

## 8. Community Voting Requirements

All three voting phases share the same core model: votes are accumulated during a fixed window, and the state is resolved by calling `finalizeVotingWindow()` after the deadline. No phase transitions to a new state during the open window.

### 8.1 Community Validation Voting (Phase 1)

**Purpose:** Community decides whether the submitted report is a genuine civic issue.

**Trigger:** Window opens automatically when `submitReport()` is called.

**Function:**

```solidity
function castValidationVote(
    uint256 reportId,
    bytes32 voteNullifier,
    bool support
) external onlyRelayer;
```

**Rules:**

- Report must exist and status must be `PendingValidation`.
- `block.timestamp` must be within `report.phaseDeadline`.
- Vote nullifier must not have been used for this report's validation phase.
- If `support == true`, increment `validationUpvotes`.
- If `support == false`, increment `validationDownvotes`.
- No state transition occurs inside this function regardless of vote totals.

**Finalization:**

After the voting window closes (`block.timestamp > report.phaseDeadline`), `finalizeVotingWindow()` evaluates the tally:

- `validationUpvotes > validationDownvotes` → transition to `Open`.
- `validationDownvotes >= validationUpvotes` → transition to `CommunityRejected`.

---

### 8.2 Resolution Verification Voting (Phase 2)

**Purpose:** Community verifies whether the authority's claimed repair is satisfactory.

**Trigger:** Window opens automatically when `markAsSolved()` is called.

**Function:**

```solidity
function castVerificationVote(
    uint256 reportId,
    bytes32 voteNullifier,
    bool accepted
) external onlyRelayer;
```

**Rules:**

- Report must exist and status must be `PendingVerification`.
- `block.timestamp` must be within `report.phaseDeadline`.
- Vote nullifier must not have been used for this report's verification phase.
- If `accepted == true`, increment `verificationAcceptVotes`.
- If `accepted == false`, increment `verificationRejectVotes`.
- No state transition occurs inside this function regardless of vote totals.

**Finalization:**

After the voting window closes, `finalizeVotingWindow()` evaluates the tally:

- `verificationAcceptVotes > verificationRejectVotes` → transition to `Closed`.
- `verificationRejectVotes >= verificationAcceptVotes` → transition to `Reopened`, forcing the authority to address the issue again.

---

### 8.3 Rejection Review Voting (Phase 3)

**Purpose:** Community evaluates an authority's attempt to dismiss an issue.

**Trigger:** Window opens automatically when `rejectIssue()` is called.

**Function:**

```solidity
function castRejectionReviewVote(
    uint256 reportId,
    bytes32 voteNullifier,
    bool upholdRejection
) external onlyRelayer;
```

**Rules:**

- Report must exist and status must be `PendingRejectionReview`.
- `block.timestamp` must be within `report.phaseDeadline`.
- Vote nullifier must not have been used for this report's rejection review phase.
- If `upholdRejection == true`, increment `rejectionUpholdVotes`.
- If `upholdRejection == false`, increment `rejectionAppealVotes`.
- No state transition occurs inside this function regardless of vote totals.

**Finalization:**

After the voting window closes, `finalizeVotingWindow()` evaluates the tally:

- `rejectionUpholdVotes > rejectionAppealVotes` → transition to `Closed`.
- `rejectionAppealVotes >= rejectionUpholdVotes` → transition to `Open`, forcing the issue back to the authority.

---

## 9. Voting Window Finalization (Lazy Evaluation)

Because the EVM cannot self-execute or run background timers, all time-based phase endings are enforced using **Lazy Evaluation (Passive Time Locks)**. The contract never transitions state automatically at a deadline; instead, the state is resolved only when an external actor explicitly calls the finalization function after the window has closed.

### 9.1 Window Initialization

Whenever a voting-sensitive phase begins (report submission, `markAsSolved()`, or `rejectIssue()`), the contract records an explicit deadline:

```solidity
report.phaseDeadline = block.timestamp + VOTING_WINDOW_DURATION;
```

`VOTING_WINDOW_DURATION` is a configurable admin parameter (e.g., 24 hours).

### 9.2 Blocking Votes After Deadline

All three vote-casting functions enforce the open window. Any vote submitted after the deadline is reverted:

```solidity
require(block.timestamp <= report.phaseDeadline, "Voting window has closed");
```

### 9.3 Finalization Function

```solidity
function finalizeVotingWindow(uint256 reportId) external;
```

**Rules:**

- Can be called by any address (typically the backend relayer).
- Requires `block.timestamp > report.phaseDeadline`.
- Requires the report to be in one of the three active voting states: `PendingValidation`, `PendingVerification`, or `PendingRejectionReview`.
- Evaluates the accumulated vote tally for the current phase and determines the winning side by simple majority (higher count wins; ties default to the more conservative outcome — see Section 5).
- Calls `_changeStatus()` with the resolved next state.
- Emits `ReportStatusChanged` and any relevant phase-completion event.
- Reverts if the window has not yet closed or if the report is not in an active voting state.

### 9.4 Design Rationale

This model ensures:

- **No premature finalization** — the full window always plays out; no early exit regardless of vote counts.
- **Gas efficiency** — vote-casting functions are lightweight (increment counters only).
- **Determinism** — finalization is a pure read of counters at window close; the result is fully predictable and auditable.
- **Decentralized triggering** — any actor can call `finalizeVotingWindow()`; the backend relayer is the expected caller but is not the exclusive one.

---

## 10. Authority Workflow Requirements

### 10.1 Start Work

```solidity
function startWork(uint256 reportId) external onlyAuthority;
```

**Rules:**

- Report must be in `Open` or `Reopened` state.
- Caller must be an authorized authority.
- Transitions report to `InProgress`.
- Sets `assignedAuthority` to `msg.sender`.
- Emits `WorkStarted`.

### 10.2 Mark Solved

```solidity
function markAsSolved(uint256 reportId) external onlyAuthority;
```

**Rules:**

- Report must be in `InProgress` state.
- Caller must be an authorized authority.
- Transitions report to `PendingVerification`.
- Sets `report.phaseDeadline = block.timestamp + VOTING_WINDOW_DURATION` to open the verification voting window.
- Emits `ReportMarkedSolved`.

### 10.3 Reject Issue

```solidity
function rejectIssue(uint256 reportId) external onlyAuthority;
```

**Rules:**

- Report must be in `Open` or `InProgress` state.
- Caller must be an authorized authority.
- Transitions report to `PendingRejectionReview`.
- Sets `report.phaseDeadline = block.timestamp + VOTING_WINDOW_DURATION` to open the rejection review voting window.
- Emits `ReportRejectedByAuthority`.

---

## 11. Report Submission Requirements

```solidity
function submitReport(
    string calldata ipfsCid,
    bytes32 reportHash,
    bytes32 submissionNullifier
) external onlyRelayer returns (uint256 reportId);
```

**Rules:**

- Caller must be an authorized relayer.
- `ipfsCid` must not be empty.
- `reportHash` and `submissionNullifier` must not be zero bytes.
- `submissionNullifier` must not already be consumed.
- New report starts in `PendingValidation`.
- Sets `report.phaseDeadline = block.timestamp + VOTING_WINDOW_DURATION` to open the validation voting window.
- Stores `createdAt` and `updatedAt`.
- Emits `ReportSubmitted`.

> **Important:** The contract does not perform AI moderation, file upload, or citizen identity verification. Those are handled off-chain before this function is called.

---

## 12. Internal State Transition Helper

```solidity
function _changeStatus(
    uint256 reportId,
    ReportStatus newStatus
) internal;
```

**Responsibilities:**

- Validates the transition is legal within the FSM.
- Updates `report.status`.
- Updates `report.updatedAt`.
- Resets `report.phaseDeadline` to `0` after a terminal or non-voting state is reached.
- Emits `ReportStatusChanged`.

This function is called exclusively by `finalizeVotingWindow()` and the authority workflow functions (`startWork`, `markAsSolved`, `rejectIssue`). It is never called directly by vote-casting functions.

---

## 13. Events

```solidity
event ReportSubmitted(
    uint256 indexed reportId,
    string ipfsCid,
    bytes32 indexed reportHash,
    bytes32 indexed submissionNullifier,
    uint256 timestamp
);

event ValidationVoteCast(
    uint256 indexed reportId,
    bytes32 indexed voteNullifier,
    bool support,
    uint256 upvotes,
    uint256 downvotes
);

event VerificationVoteCast(
    uint256 indexed reportId,
    bytes32 indexed voteNullifier,
    bool accepted,
    uint256 acceptVotes,
    uint256 rejectVotes
);

event RejectionReviewVoteCast(
    uint256 indexed reportId,
    bytes32 indexed voteNullifier,
    bool upholdRejection,
    uint256 upholdVotes,
    uint256 appealVotes
);

event VotingWindowFinalized(
    uint256 indexed reportId,
    ReportStatus previousStatus,
    ReportStatus newStatus,
    uint256 finalUpVotes,
    uint256 finalDownVotes,
    uint256 timestamp
);

event ReportStatusChanged(
    uint256 indexed reportId,
    ReportStatus previousStatus,
    ReportStatus newStatus,
    uint256 timestamp
);

event WorkStarted(uint256 indexed reportId, address indexed authority, uint256 timestamp);
event ReportMarkedSolved(uint256 indexed reportId, address indexed authority, uint256 timestamp);
event ReportRejectedByAuthority(uint256 indexed reportId, address indexed authority, uint256 timestamp);

event RelayerUpdated(address indexed relayer, bool authorized);
event AuthorityUpdated(address indexed authority, bool authorized);
event VotingWindowDurationUpdated(uint256 newDuration);
```

---

## 14. Access Control Requirements

```solidity
modifier onlyAdmin();
modifier onlyRelayer();
modifier onlyAuthority();
```

| Function | Allowed Caller |
| --- | --- |
| `submitReport()` | Authorized relayer |
| `castValidationVote()` | Authorized relayer |
| `castVerificationVote()` | Authorized relayer |
| `castRejectionReviewVote()` | Authorized relayer |
| `finalizeVotingWindow()` | Any address (permissionless) |
| `startWork()` | Authorized authority |
| `markAsSolved()` | Authorized authority |
| `rejectIssue()` | Authorized authority |
| Add/remove roles | Admin only |
| Update voting window duration | Admin only |

OpenZeppelin `Ownable`, `AccessControl`, `Pausable`, and `ReentrancyGuard` can be used if the project allows dependencies.

---

## 15. Error Handling Requirements

Use custom errors to reduce gas costs and improve debugging clarity.

```solidity
error Unauthorized();
error InvalidReportId();
error InvalidState();
error EmptyCID();
error InvalidHash();
error NullifierAlreadyUsed();
error InvalidNullifier();
error VotingWindowStillOpen();
error VotingWindowClosed();
error AlreadyFinalized();
```

---

## 16. Data Stored On-Chain vs Off-Chain

### 16.1 Store On-Chain

- Report ID, IPFS CID, report hash, status values
- Submission and vote nullifiers
- Phase deadline timestamps
- All three phase vote counters
- State transition timestamps
- Assigned authority address
- Audit event logs

### 16.2 Store Off-Chain

- Full report description, images/videos
- Exact location details if privacy-sensitive
- AI moderation full response
- Citizen real-world identity
- Government ID details

---

## 17. Security Requirements

- Prevent duplicate submissions using submission nullifiers.
- Prevent duplicate votes across all 3 phases using distinct scoped nullifiers.
- Restrict vote-casting functions to the authorized relayer.
- Restrict authority workflow functions to authorized authority wallets.
- Enforce that votes cannot be cast outside the active voting window (`block.timestamp <= phaseDeadline`).
- Enforce that `finalizeVotingWindow()` cannot be called before the voting window closes (`block.timestamp > phaseDeadline`).
- Validate every state transition within the 8-stage FSM boundaries via `_changeStatus()`.
- Emit events for all state changes for full on-chain auditability.
- Avoid storing personally identifiable information on-chain.
- Protect all non-view state-changing functions with `ReentrancyGuard`.

---

## 18. Functional Requirements Checklist

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Submit approved report metadata to blockchain | Must |
| FR-02 | Store IPFS CID and report hash | Must |
| FR-03 | Initialize report in `PendingValidation` and open validation voting window | Must |
| FR-04 | Prevent duplicate report submission using nullifier | Must |
| FR-05 | Allow community validation votes through relayer within the window | Must |
| FR-06 | Block validation votes after the window deadline | Must |
| FR-07 | Resolve validation phase via `finalizeVotingWindow()` after deadline | Must |
| FR-08 | Transition to `Open` (majority upvote) or `CommunityRejected` (majority downvote) on finalization | Must |
| FR-09 | Allow authority to acknowledge issue via `startWork()` | Must |
| FR-10 | Transition report to `InProgress` when work starts | Must |
| FR-11 | Allow authority to mark work completed via `markAsSolved()` and open verification window | Must |
| FR-12 | Allow authority to dismiss issue via `rejectIssue()` and open rejection review window | Must |
| FR-13 | Allow community verification votes through relayer within the window | Must |
| FR-14 | Block verification votes after the window deadline | Must |
| FR-15 | Resolve verification phase via `finalizeVotingWindow()` — `Closed` or `Reopened` | Must |
| FR-16 | Allow community rejection review votes through relayer within the window | Must |
| FR-17 | Block rejection review votes after the window deadline | Must |
| FR-18 | Resolve rejection review phase via `finalizeVotingWindow()` — `Closed` or `Open` | Must |
| FR-19 | Prevent duplicate votes per report per phase using scoped nullifiers | Must |
| FR-20 | Allow reopened reports to return to the authority workflow | Must |
| FR-21 | Emit events for all major state changes and vote actions | Must |
| FR-22 | Allow admin to configure voting window duration | Should |
| FR-23 | Allow `finalizeVotingWindow()` to be called by any address (permissionless) | Should |

---

## 19. Suggested Solidity Contract Skeleton

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Reporting {

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

    address public admin;
    uint256 public reportCount;
    uint256 public votingWindowDuration; // e.g. 24 hours

    mapping(uint256 => Report) public reports;
    mapping(bytes32 => bool) public usedSubmissionNullifiers;

    mapping(uint256 => mapping(bytes32 => bool)) public usedValidationVoteNullifiers;
    mapping(uint256 => mapping(bytes32 => bool)) public usedVerificationVoteNullifiers;
    mapping(uint256 => mapping(bytes32 => bool)) public usedRejectionReviewVoteNullifiers;

    mapping(address => bool) public authorizedRelayers;
    mapping(address => bool) public authorizedAuthorities;

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyAdmin() { /* ... */ _; }
    modifier onlyRelayer() { /* ... */ _; }
    modifier onlyAuthority() { /* ... */ _; }

    // ─── Core Internal ────────────────────────────────────────────────────────

    // function _changeStatus(uint256 reportId, ReportStatus newStatus) internal;

    // ─── External Interface ───────────────────────────────────────────────────

    // function submitReport(string calldata ipfsCid, bytes32 reportHash, bytes32 submissionNullifier)
    //     external onlyRelayer returns (uint256 reportId);

    // function castValidationVote(uint256 reportId, bytes32 voteNullifier, bool support)
    //     external onlyRelayer;

    // function castVerificationVote(uint256 reportId, bytes32 voteNullifier, bool accepted)
    //     external onlyRelayer;

    // function castRejectionReviewVote(uint256 reportId, bytes32 voteNullifier, bool upholdRejection)
    //     external onlyRelayer;

    // function finalizeVotingWindow(uint256 reportId) external;

    // function startWork(uint256 reportId) external onlyAuthority;
    // function markAsSolved(uint256 reportId) external onlyAuthority;
    // function rejectIssue(uint256 reportId) external onlyAuthority;
}
```