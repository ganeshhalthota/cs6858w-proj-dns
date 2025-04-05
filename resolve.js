const fs = require("fs");
const csvParser = require("csv-parser");
require("dotenv").config();

const { fetchContractExecutionResults } = require("./fetchResult")

// Path to the CSV file
const csvFilePath = "domain_registry.csv";

// Function to resolve a domain
async function resolveDomain(domain) {
    try {
        // Step 1: Look up the domain in the CSV file
        const domainData = await findDomainInCSV(domain);
        if (!domainData) {
            console.log(`❌ Domain not found in registry: ${domain}`);
            return;
        }

        // Step 2: Fetch transaction details from Hedera Mirror Node
        const isValid = await validateTransactionOnChain(domainData);
        if (!isValid) {
            console.log(`❌ Domain resolution failed: Blockchain data mismatch`);
            return;
        }

        // Step 3: Return the resolved IP if everything matches
        console.log(`✅ Domain Resolved: ${domainData.Domain} → ${domainData.IPv4}`);
        return domainData.ipv4;

    } catch (error) {
        console.error("❌ Error resolving domain:", error);
    }
}

// Function to find the domain in the CSV file
async function findDomainInCSV(domain) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on("data", (data) => {
                if (data["Domain"] === domain) {
                    results.push(data);
                }
            })
            .on("end", () => {
                resolve(results.length > 0 ? results[0] : null);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}

async function validateTransactionOnChain(domainData) {
    try {
        const transactionId = domainData["Transaction ID"];

        console.log(`🔍 Validating transaction: ${transactionId}`);
        const result = await fetchContractExecutionResults(transactionId);
        return result.domain == domainData.Domain;
    } catch (error) {
        console.error("❌ Error fetching transaction from Hedera:", error);
        return false;
    }
}


// Example call
resolveDomain("yahoo");
