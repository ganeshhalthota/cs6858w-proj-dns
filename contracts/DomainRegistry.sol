// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DomainRegistry {
    struct Domain {
        address owner;
        string ipv4;
        uint256 registrationTime;
        uint256 expiration;
    }

    struct PendingTransfer {
        address initiator;
        address newOwner;
        bool exists;
    }

    event DomainRegistered(
        address indexed owner,
        string domain,
        string ipv4,
        uint256 expiration
    );

    event DomainRenewed(
        address indexed owner,
        string domain,
        string ipv4,
        uint256 expiration
    );

    event DomainTransferInit(
        string domain,
        address indexed from,
        address indexed to
    );

    event DomainTransferred(
        address indexed owner,
        string domain,
        string ipv4,
        uint256 expiration
    );

    mapping(bytes32 => Domain) public domains;
    mapping(bytes32 => PendingTransfer) public pendingTransfers;

    uint256 public registrationFee = 100 wei;
    uint256 public renewalFee = 100 wei;
    uint256 public transferApprovalFee = 50 wei;

    // The one who deployed the contract
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function registerDomain(string memory domain, string memory ipv4) public payable {
        bytes32 domainHash = namehash(domain);

        require(domains[domainHash].owner == address(0), "Domain already registered");
        require(msg.value >= registrationFee, "Insufficient registration fee");

        domains[domainHash] = Domain({
            owner: msg.sender,
            ipv4: ipv4,
            registrationTime: block.timestamp,
            expiration: block.timestamp + 365 days
        });

        payable(owner).transfer(msg.value);

        emit DomainRegistered(msg.sender, domain, ipv4, block.timestamp + 365 days);
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function renewDomain(string memory domain) public payable {
        bytes32 domainHash = namehash(domain);
        require(domains[domainHash].owner == msg.sender, "Not the owner");
        require(msg.value >= renewalFee, "Insufficient renewal fee");

        if (block.timestamp > domains[domainHash].expiration) {
            domains[domainHash].expiration = block.timestamp + 365 days;
        } else {
            domains[domainHash].expiration += 365 days;
        }

        payable(owner).transfer(msg.value);

        emit DomainRenewed(msg.sender, domain, domains[domainHash].ipv4, domains[domainHash].expiration);
    }

    function initiateTransfer(string memory domain, address newOwner) public {
        bytes32 domainHash = namehash(domain);
        require(domains[domainHash].owner == msg.sender, "Not the domain owner");

        pendingTransfers[domainHash] = PendingTransfer({
            initiator: msg.sender,
            newOwner: newOwner,
            exists: true
        });

        emit DomainTransferInit(domain, msg.sender, newOwner);
    }

    function approveTransfer(string memory domain) public payable {
        bytes32 domainHash = namehash(domain);
        PendingTransfer memory pending = pendingTransfers[domainHash];

        require(pending.exists, "No transfer pending for this domain");
        require(pending.newOwner == msg.sender, "You are not the designated new owner");
        require(msg.value >= transferApprovalFee, "Insufficient transfer approval fee");

        // Transfer fee to contract owner
        payable(owner).transfer(msg.value);

        // Complete transfer
        domains[domainHash].owner = msg.sender;

        // Remove pending transfer
        delete pendingTransfers[domainHash];

        emit DomainTransferred(msg.sender, domain, domains[domainHash].ipv4, domains[domainHash].expiration);
    }

    function namehash(string memory domain) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(domain));
    }
}
