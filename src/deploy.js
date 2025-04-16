const {
    Client,
    PrivateKey,
    AccountId,
    ContractCreateFlow,
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");
const solc = require("solc");
require("dotenv").config();

async function deployContract() {
    try {
        // Load credentials
        const operatorId = process.env.OPERATOR_ACCOUNT_ID;
        const operatorKey = process.env.OPERATOR_PRIVATE_KEY;

        if (!operatorId || !operatorKey) {
            throw new Error("❌ Missing OPERATOR_ACCOUNT_ID or OPERATOR_PRIVATE_KEY in .env");
        }

        const client = Client.forTestnet().setOperator(
            AccountId.fromString(operatorId),
            PrivateKey.fromString(operatorKey)
        );

        // Compile Solidity contract
        const contractPath = path.resolve(__dirname, "../contracts/DomainRegistry.sol");
        const source = fs.readFileSync(contractPath, "utf8");

        const input = {
            language: "Solidity",
            sources: {
                "DomainRegistry.sol": {
                    content: source,
                },
            },
            settings: {
                outputSelection: {
                    "*": {
                        "*": ["abi", "evm.bytecode.object", "metadata"],
                    },
                },
            },
        };

        console.log(`Solc version: ${solc.version()}`);

        const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
        const contractName = Object.keys(compiled.contracts["DomainRegistry.sol"])[0];
        const contractData = compiled.contracts["DomainRegistry.sol"][contractName];

        const bytecode = contractData.evm.bytecode.object;
        const abi = contractData.abi;

        if (!bytecode || bytecode.length < 10) {
            throw new Error("❌ Compiled bytecode is empty or invalid.");
        }

        // Save ABI and Bytecode to artifacts/
        const artifactsDir = path.resolve(__dirname, "../artifacts");
        if (!fs.existsSync(artifactsDir)) {
            fs.mkdirSync(artifactsDir);
        }

        fs.writeFileSync(
            path.join(artifactsDir, `${contractName}_abi.json`),
            JSON.stringify(abi, null, 2)
        );

        fs.writeFileSync(
            path.join(artifactsDir, `${contractName}_bytecode.txt`),
            bytecode
        );

        const metadata = contractData.metadata;
        fs.writeFileSync(
            path.join(artifactsDir, `${contractName}_metadata.json`),
            metadata
        );

        console.log("📦 ABI and Bytecode saved to artifacts/");

        // Upload bytecode in chunks
        console.log("📤 Uploading bytecode to Hedera...");

        // ref: https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts/create-a-smart-contract
        //Create the transaction
        const contractCreate = new ContractCreateFlow()
            .setGas(1000000)
            .setBytecode(bytecode);

        //Sign the transaction with the client operator key and submit to a Hedera network
        const txResponse = contractCreate.execute(client);

        //Get the receipt of the transaction
        const receipt = (await txResponse).getReceipt(client);

        // console.log(receipt)

        //Get the new contract ID
        const newContractId = (await receipt).contractId;

        console.log("The new contract ID is " + newContractId);

        if (!newContractId) {
            throw new Error("❌ Failed to retrieve contract ID from deployment receipt.");
        }

        console.log(`✅ Smart Contract deployed at: ${newContractId}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Deployment failed:");
        console.error(error.stack || error.message || error);
        process.exit(1);
    }
}

deployContract();
