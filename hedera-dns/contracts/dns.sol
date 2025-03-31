// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DomainRegistry {
    struct Domain {
        address owner;
        string ipv4;
        uint256 expiration;
    }

    mapping(bytes32 => Domain) public domains;

    address public contractOwner;

    function registerDomain(string memory domain, string memory ipv4) public payable {
        bytes32 domainHash = namehash(domain);
        require(domains[domainHash].owner == address(0), "Domain already registered");

        domains[domainHash] = Domain({
            owner: msg.sender,
            expiration: block.timestamp + 365 days,
            ipv4: ipv4
        });
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

    function resolveDomain(string memory domain) public view returns (string memory) {
        bytes32 domainHash = namehash(domain);
        Domain memory domainData = domains[domainHash];
        return (domainData.ipv4);
    }

    function namehash(string memory domain) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(domain));
    }
}
