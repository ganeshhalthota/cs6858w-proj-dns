// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DomainRegistry {
    struct Domain {
        address owner;
        string ipv4;
        uint256 registrationTime;
        uint256 expiration;
    }

    event DomainRegistered(
        address indexed owner,
        string domain,
        string ipv4,
        uint256 registrationTime,
        uint256 expiration
    );

    mapping(bytes32 => Domain) public domains;
    uint256 public registrationFee = 100 wei; // Set the registration fee
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function registerDomain(string memory domain, string memory ipv4) public payable {
        bytes32 domainHash = keccak256(abi.encodePacked(domain));

        require(domains[domainHash].owner == address(0), "Domain already registered");
        require(msg.value >= registrationFee, "Insufficient registration fee");

        domains[domainHash] = Domain({
            owner: msg.sender,
            ipv4: ipv4,
            registrationTime: block.timestamp,
            expiration: block.timestamp + 365 days
        });

        emit DomainRegistered(msg.sender, domain, ipv4, block.timestamp, block.timestamp + 365 days);
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function renewDomain(string memory domain) public {
        bytes32 domainHash = namehash(domain);
        require(domains[domainHash].owner == msg.sender, "Not the owner");

        domains[domainHash].expiration += 365 days;
    }

    function transferDomain(string memory domain, address newOwner) public {
        bytes32 domainHash = namehash(domain);
        require(domains[domainHash].owner == msg.sender, "Not the owner");

        domains[domainHash].owner = newOwner;
    }

    function namehash(string memory domain) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(domain));
    }
}

