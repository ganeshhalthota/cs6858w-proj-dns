const { ethers } = require("ethers");
const axios = require("axios");

const abi = [
  "event DomainRegistered(address indexed owner, string domain, string ipv4, uint256 expiration)",
];

const iface = new ethers.utils.Interface(abi);

async function fetchContractExecutionResults(
  transactionId,
  retries = 5,
  delay = 2000
) {
  try {
    const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/results/${transactionId}`;

    console.log(url);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.logs.length === 1) {
          try {
            const log = data.logs[0];
            const parsedLog = iface.parseLog({
              topics: log.topics,
              data: log.data,
            });

            const result = {
              transactionId: transactionId,
              domain: parsedLog.args.domain,
              ipv4: parsedLog.args.ipv4,
              expiration: parsedLog.args.expiration,
            };

            return result; // Return the extracted data
          } catch (err) {
            console.error("❌ Error decoding event log:", err);
            return null;
          }
        } else {
          console.error("⚠️ Invalid Response.");
          return null;
        }
      } catch (error) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error("❌ Failed to obtain result.");
          return null;
        }
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return null;
  }
}

// Export the function so other files can use it
module.exports = { fetchContractExecutionResults };
