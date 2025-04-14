require("dotenv").config();

const { fetchContractExecutionResults } = require("./fetchResult");
const { find_domain_in_csv } = require("./csv_operation");
const { is_future_time } = require("./utils");

// Function to resolve a domain
async function resolveDomain(domain) {
  try {
    // Step 1: Look up the domain in the CSV file
    const domainData = await find_domain_in_csv(domain);
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

async function validateTransactionOnChain(domainData) {
  try {
    const transactionId = domainData["Transaction ID"];
    const transactionType = domainData["Transaction Type"]
    const result = await fetchContractExecutionResults(transactionType, transactionId);
    /* Check if domain Name matches and domain is not expired */
    return ((result.domain == domainData.Domain) && is_future_time(result.expiration));
  } catch (error) {
    console.error("❌ Error fetching transaction from Hedera:", error);
    return false;
  }
}

module.exports = { resolveDomain };
