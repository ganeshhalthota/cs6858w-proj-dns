const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    // Read contract address from file
    const { contractAddress } = JSON.parse(fs.readFileSync("deployedAddress.json", "utf-8"));

    const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
    const contract = await DomainRegistry.attach(contractAddress);

    console.time("Domain Resolution Time");
    const resolvedIP = await contract.resolveDomain("example.com");
    console.timeEnd("Domain Resolution Time");

    console.log(`Domain resolved as: ${resolvedIP}`);
}

main().catch(console.error);
