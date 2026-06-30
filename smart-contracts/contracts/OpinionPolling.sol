// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface for existing authority management
interface IReporting {
    function authorizedAuthorities(address account) external view returns (bool);
}

contract OpinionPolling is ReentrancyGuard {
    
    enum PollType { TrueFalse, MultiChoice }

    struct Poll {
        uint256 id;
        address creator;
        string ipfsMetadataCid; // Contains title, desc, options, image CIDs
        uint256 deadline;
        PollType pollType;
        bool isActive;
    }

    IReporting public immutable reportingContract;
    uint256 public pollCount;

    mapping(uint256 => Poll) public polls;
    // pollId => optionIndex => voteCount
    mapping(uint256 => mapping(uint256 => uint256)) public pollResults;
    // pollId => voterAddress => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event PollCreated(uint256 indexed pollId, address indexed creator, string ipfsMetadataCid, uint256 deadline);
    event VoteCast(uint256 indexed pollId, address indexed voter, uint256 optionIndex);

    error UnauthorizedAuthority();
    error PollInactiveOrClosed();
    error AlreadyVoted();
    error InvalidDeadline();

    constructor(address _reportingContract) {
        reportingContract = IReporting(_reportingContract);
    }

    /**
     * @notice Create a poll directly without AI moderation.
     * @param _ipfsMetadataCid CID of the JSON file containing poll details and images.
     */
    function createOfficialPoll(
        string calldata _ipfsMetadataCid,
        uint256 _deadline,
        PollType _pollType
    ) external returns (uint256) {
        if (!reportingContract.authorizedAuthorities(msg.sender)) revert UnauthorizedAuthority();
        if (_deadline <= block.timestamp) revert InvalidDeadline();

        pollCount++;
        polls[pollCount] = Poll({
            id: pollCount,
            creator: msg.sender,
            ipfsMetadataCid: _ipfsMetadataCid,
            deadline: _deadline,
            pollType: _pollType,
            isActive: true
        });

        emit PollCreated(pollCount, msg.sender, _ipfsMetadataCid, _deadline);
        return pollCount;
    }

    function castVote(uint256 _pollId, uint256 _optionIndex) external nonReentrant {
        Poll storage poll = polls[_pollId];
        if (!poll.isActive || block.timestamp >= poll.deadline) revert PollInactiveOrClosed();
        if (hasVoted[_pollId][msg.sender]) revert AlreadyVoted();

        hasVoted[_pollId][msg.sender] = true;
        pollResults[_pollId][_optionIndex]++;

        emit VoteCast(_pollId, msg.sender, _optionIndex);
    }
}