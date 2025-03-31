const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
    const contract = await DomainRegistry.deploy();  // No .deployed() needed in ether.js v6

    console.log(`DomainRegistry deployed at: ${contract.target}`); // Use contract.target instead of contract.address

    // Save contract address
    fs.writeFileSync("deployedAddress.json", JSON.stringify({ contractAddress: contract.target }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
