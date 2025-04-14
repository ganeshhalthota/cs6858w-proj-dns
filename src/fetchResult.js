const { event_abi } = require("./hedera_events");
const { ethers } = require("ethers");
const config = require('./config');
const axios = require("axios");

async function fetchContractExecutionResults(
  tx_type,
  transactionId,
  retries = config.event_fetch_retry_count,
  delay = config.delay_between_retry
) {
  try {
    const iface = new ethers.utils.Interface(event_abi[tx_type]);
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
            return parsedLog.args;
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

async function getEvmAddress(accountId) {
  const res = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
  const evmAddress = res.data.evm_address;
  console.log(`EVM Address: ${evmAddress}`);
  return evmAddress
}

// Export the function so other files can use it
module.exports = { fetchContractExecutionResults, getEvmAddress };
