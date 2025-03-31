const {
    Client,
    PrivateKey,
    ContractExecuteTransaction,
    ContractId,
    ContractFunctionParameters
} = require("@hashgraph/sdk");

const { fetchContractExecutionResults } = require("./fetchResult")

const fs = require("fs");
const csvWriter = require("csv-writer").createObjectCsvWriter;

const csvFilePath = "domain_registry.csv";
const writer = csvWriter({
    path: csvFilePath,
    header: [
        { id: "transactionId", title: "Transaction ID" },
        { id: "domain", title: "Domain" },
        { id: "ipv4", title: "IPv4" },
        { id: "expiration", title: "Expiration" }
    ],
    append: fs.existsSync(csvFilePath)
});

require("dotenv").config();

// Hedera client setup
const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, PrivateKey.fromString(process.env.MY_PRIVATE_KEY));

// Contract ID from environment variables
const contractId = ContractId.fromString(process.env.HEDERA_CONTRACT_ID);

const readline = require("readline");

// Setup readline for interactive input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function formatTransactionId(input) {
    // Replace '@' with '-'
    let formatted = input.replace('@', '-');
    
    // Replace the last '.' with '-'
    formatted = formatted.replace(/\.(?=[^\.]*$)/, '-');

    return formatted;
}

// Function to register a domain
async function registerDomain(domain, ipv4) 
{
    try 
    {
        console.log(`🚀 Registering domain: ${domain} → ${ipv4}`);

        const txContractExecute = new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(1000000)
            .setFunction("registerDomain",
                new ContractFunctionParameters()
                    .addString(domain)
                    .addString(ipv4)
            );

        // Execute transaction
        const txResponse = await txContractExecute.execute(client);
        const transactionId = txResponse.transactionId.toString();

        // Wait for transaction to reach consensus
        const receipt = await txResponse.getReceipt(client);
        if (receipt.status.toString() !== "SUCCESS") 
        {
            console.error("❌ Transaction failed:", receipt.status.toString());
            return;
        }

        console.log(`✅ Domain registered with Transaction ID: ${transactionId}`);

        // Fetch contract execution details
        const result = await fetchContractExecutionResults(formatTransactionId(transactionId));

        storeInCsv(result.transactionId, result.domain, result.ipv4, result.expiration);

        console.log(`✅ Stored in registry`);

    }
    catch (error) 
    {
        console.error("❌ Error registering domain");
    }

    rl.close(); // Close input stream
}

function storeInCsv(transactionId, domain, ipv4, expiration)
{
    writer.writeRecords([{
        transactionId: transactionId,
        domain: domain,
        ipv4: ipv4,
        expiration: expiration
    }]);
}


// Ask user for input
 rl.question("Enter domain name: ", (domain) => {
    rl.question("Enter IPv4 address: ", (ipv4) => {
        registerDomain(domain, ipv4);
    });
});
