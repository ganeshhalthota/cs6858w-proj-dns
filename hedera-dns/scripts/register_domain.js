const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    // Read contract address from file
    const { contractAddress } = JSON.parse(fs.readFileSync("deployedAddress.json", "utf-8"));

    const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
    const contract = await DomainRegistry.attach(contractAddress);

    // Register a domain
    const tx = await contract.registerDomain("example.com", "192.168.1.1");
    await tx.wait();
    console.log("Domain registered!");
}

main().catch(console.error);
