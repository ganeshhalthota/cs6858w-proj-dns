const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
  Hbar,
} = require("@hashgraph/sdk");

require("dotenv").config();

const { TransactionType } = require("./enums");
const { fetchContractExecutionResults } = require("./fetchResult");
const { store_in_csv } = require("./csv_operation");

const client = Client.forTestnet();
client.setOperator(
  process.env.MY_ACCOUNT_ID,
  PrivateKey.fromString(process.env.MY_PRIVATE_KEY)
);

const contractId = ContractId.fromString(process.env.HEDERA_CONTRACT_ID);

function formatTransactionId(input) {
  let formatted = input.replace("@", "-");
  formatted = formatted.replace(/\.(?=[^\.]*$)/, "-");
  return formatted;
}

async function renewDomain(domain) {
  try {
    console.log(`🔄 Renewing domain: ${domain}`);

    const txContractExecute = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(500000)
      .setFunction(
        "renewDomain",
        new ContractFunctionParameters().addString(domain)
      );

    const txResponse = await txContractExecute.execute(client);
    const transactionId = txResponse.transactionId.toString();
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      console.error("❌ Transaction failed:", receipt.status.toString());
      return false;
    }

    console.log(`✅ Domain renewed with Transaction ID: ${transactionId}`);

    const result = await fetchContractExecutionResults(
      TransactionType.TX_TYPE_RENEWED,
      formatTransactionId(transactionId)
    );

    store_in_csv(
      TransactionType.TX_TYPE_RENEWED,
      formatTransactionId(transactionId),
      result.domain,
      result.ipv4,
      result.expiration
    );

    return true;
  } catch (error) {
    console.error("❌ Error renewing domain:", error);
    return false;
  }
}

const [, , domainArg] = process.argv;

if (domainArg) {
  renewDomain(domainArg);
}

module.exports = { renewDomain };
