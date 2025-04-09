const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractId,
  Hbar,
  ContractFunctionParameters,
} = require("@hashgraph/sdk");

require("dotenv").config();

const { fetchContractExecutionResults } = require("./fetchResult");
const { store_in_csv } = require("./csv_operation");

const register_abi = [
  "event DomainRegistered(address indexed owner, string domain, string ipv4, uint256 expiration)",
];

// Hedera client setup
const client = Client.forTestnet();
client.setOperator(
  process.env.MY_ACCOUNT_ID,
  PrivateKey.fromString(process.env.MY_PRIVATE_KEY)
);

// Contract ID from environment variables
const contractId = ContractId.fromString(process.env.HEDERA_CONTRACT_ID);

function formatTransactionId(input) {
  // Replace '@' with '-'
  let formatted = input.replace("@", "-");

  // Replace the last '.' with '-'
  formatted = formatted.replace(/\.(?=[^\.]*$)/, "-");

  return formatted;
}

async function registerDomain(domain, ipv4) {
  try {
    console.log(`🚀 Registering domain: ${domain} → ${ipv4}`);

    const txContractExecute = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setPayableAmount(Hbar.fromTinybars(100))
      .setFunction(
        "registerDomain",
        new ContractFunctionParameters().addString(domain).addString(ipv4)
      );

    const txResponse = await txContractExecute.execute(client);
    const transactionId = txResponse.transactionId.toString();
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      console.error("❌ Transaction failed:", receipt.status.toString());
      return false;
    }

    console.log(`✅ Domain registered with Transaction ID: ${transactionId}`);

    // Fetch contract execution details
    const result = await fetchContractExecutionResults(
      register_abi,
      formatTransactionId(transactionId)
    );

    store_in_csv(
      formatTransactionId(transactionId),
      result.domain,
      result.ipv4,
      result.expiration
    );

    console.log(`✅ Stored in registry`);

    return true;
  } catch (error) {
    console.error("❌ Error registering domain:", error);
    return false;
  }
}

const [, , domainArg, ipv4Arg] = process.argv;

if (domainArg && ipv4Arg) {
  return registerDomain(domainArg, ipv4Arg);
}

module.exports = { registerDomain };
