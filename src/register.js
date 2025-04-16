const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractId,
  Hbar,
  ContractFunctionParameters,
} = require("@hashgraph/sdk");

require("dotenv").config();

const { format_tx_id } = require("./utils");
const { TransactionType } = require("./enums");
const { fetchContractExecutionResults } = require("./fetchResult");
const { store_in_csv } = require("./csv_operation.js");
const config = require('./config');

// Contract ID from environment variables
const contractId = ContractId.fromString(config.contract_id);

async function registerDomain(accId, priKey, domain, ipv4) {
  try {
    console.log(`Registering domain: ${domain} → ${ipv4}`);

    const client = Client.forTestnet();
    client.setOperator(accId, PrivateKey.fromString(priKey));

    const txContractExecute = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(config.default_gas)
      .setPayableAmount(Hbar.fromTinybars(config.registration_free))
      .setFunction(
        "registerDomain",
        new ContractFunctionParameters().addString(domain).addString(ipv4)
      );

    const txResponse = await txContractExecute.execute(client);
    const transactionId = txResponse.transactionId.toString();
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      console.error("Transaction failed:", receipt.status.toString());
      return false;
    }

    console.log(`Domain registered with Transaction ID: ${transactionId}`);

    // Fetch contract execution details
    const result = await fetchContractExecutionResults(
      TransactionType.TX_TYPE_REGISTERED,
      format_tx_id(transactionId)
    );

    store_in_csv(
      TransactionType.TX_TYPE_REGISTERED,
      format_tx_id(transactionId),
      result.domain,
      result.ipv4,
      result.expiration
    );

    console.log(`Stored in registry`);

    return true;
  } catch (error) {
    console.error("Error registering domain:", error);
    return false;
  }
}

module.exports = { registerDomain };
