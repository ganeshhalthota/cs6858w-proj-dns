const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
} = require("@hashgraph/sdk");

require("dotenv").config();

const { format_tx_id } = require("./utils");
const { TransactionType } = require("./enums");
const { fetchContractExecutionResults } = require("./fetchResult");
const { store_in_csv } = require("./csv_operation.js");
const config = require('./config');

const contractId = ContractId.fromString(config.contract_id);

async function renewDomain(accId, priKey, domain) {
  try {
    console.log(`🔄 Renewing domain: ${domain}`);

    const client = Client.forTestnet();
    client.setOperator(accId, PrivateKey.fromString(priKey));

    const txContractExecute = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(config.default_gas)
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
      format_tx_id(transactionId)
    );

    store_in_csv(
      TransactionType.TX_TYPE_RENEWED,
      format_tx_id(transactionId),
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

module.exports = { renewDomain };
