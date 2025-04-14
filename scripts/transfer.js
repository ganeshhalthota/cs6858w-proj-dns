const {
  Client,
  AccountId,
  PrivateKey,
  ContractExecuteTransaction,
  ContractId,
  Hbar,
  ContractFunctionParameters,
} = require("@hashgraph/sdk");

require("dotenv").config();

const { format_tx_id } = require("./utils");
const { TransactionType } = require("./enums");
const { fetchContractExecutionResults, getEvmAddress } = require("./fetchResult");
const { store_in_csv } = require("./csv_operation.js");

// Contract ID from environment variables
const contractId = ContractId.fromString(process.env.HEDERA_CONTRACT_ID);

async function initTransfer(accId, priKey, domain, newAccId) {
  try {
    console.log(`Transferring domain: ${domain} → ${newAccId}`);

    const client = Client.forTestnet();
    client.setOperator(accId, PrivateKey.fromString(priKey));

    const solidityAddress = await getEvmAddress(newAccId);

    const txContractExecute = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction(
        "initiateTransfer",
        new ContractFunctionParameters().addString(domain).addAddress(solidityAddress)
      );

    const txResponse = await txContractExecute.execute(client);
    const transactionId = txResponse.transactionId.toString();
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      console.error("❌ Transaction failed:", receipt.status.toString());
      return false;
    }

    console.log(`✅ Domain transfer initiated with Transaction ID: ${transactionId}`);
    return true;
  } catch (error) {
    console.error("❌ Error initiating transfer:", error);
    return false;
  }
}

async function approveTransfer(accId, priKey, domain) {
  try {
    console.log(`🚀 Completing transfer of domain: ${domain} → ${accId}`);

    const client = Client.forTestnet();
    client.setOperator(accId, PrivateKey.fromString(priKey));

    const txContractExecute = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setPayableAmount(Hbar.fromTinybars(50))
      .setFunction(
        "approveTransfer",
        new ContractFunctionParameters().addString(domain)
      );

    const txResponse = await txContractExecute.execute(client);
    const transactionId = txResponse.transactionId.toString();
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      console.error("❌ Transaction failed:", receipt.status.toString());
      return false;
    }

    console.log(`✅ Domain transferred with Transaction ID: ${transactionId}`);

    // Fetch contract execution details
    const result = await fetchContractExecutionResults(
      TransactionType.TX_TYPE_TRANSFERRED,
      format_tx_id(transactionId)
    );

    store_in_csv(
      TransactionType.TX_TYPE_TRANSFERRED,
      format_tx_id(transactionId),
      result.domain,
      result.ipv4,
      result.expiration
    );

    console.log(`✅ Stored in registry`);

    return true;
  } catch (error) {
    console.error("❌ Error transferring domain:", error);
    return false;
  }
}

module.exports = { initTransfer,  approveTransfer};
