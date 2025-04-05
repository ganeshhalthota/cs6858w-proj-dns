const fs = require("fs");
const csvParser = require("csv-parser");
require("dotenv").config();

const { fetchContractExecutionResults } = require("./fetchResult");

// Path to the CSV file
const csvFilePath = "domain_registry.csv";

// Function to resolve a domain
async function resolveDomain(domain) {
  try {
    // Step 1: Look up the domain in the CSV file
    const domainData = await findDomainInCSV(domain);
    if (!domainData) {
      console.log(`❌ Domain not found in registry: ${domain}`);
      return false;
    }

    // Step 2: Fetch transaction details from Hedera Mirror Node
    const isValid = await validateTransactionOnChain(domainData);
    if (!isValid) {
      console.log(`❌ Domain resolution failed: Blockchain data mismatch`);
      return false;
    }

    // Step 3: Return the resolved IP if everything matches
    console.log(
      `✅ Domain Resolved: ${domainData.Domain} → ${domainData.IPv4}`
    );
    return domainData.IPv4;
  } catch (error) {
    console.error("❌ Error resolving domain:", error);
    return false;
  }
}

// Function to find the domain in the CSV file
const findDomainInCSV = async (domain) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (data) => {
        if (data["Domain"] === domain) {
          resolve(data); // Return immediately on match
        }
      })
      .on("end", () => resolve(null)) // No match found
      .on("error", reject);
  });
};

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

const [, , domainArg] = process.argv;
if (domainArg) {
  return resolveDomain(domainArg);
}

module.exports = { resolveDomain };
