const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
  Hbar,
} = require("@hashgraph/sdk");

require("dotenv").config();

const { format_tx_id } = require("./utils");
const { TransactionType } = require("./enums");
const { fetchContractExecutionResults } = require("./fetchResult");

const csvFilePath = "domain_registry.csv";

const renew_abi = [
  "event DomainRenewed(address indexed owner, string domain, string ipv4, uint256 expiration)"
];

const writer = csvWriter({
  path: csvFilePath,
  header: [
    { id: "transactionId", title: "Transaction ID" },
    { id: "domain", title: "Domain" },
    { id: "ipv4", title: "IPv4" },
    { id: "expiration", title: "Expiration" },
  ],
  append: true, // always append
});

const client = Client.forTestnet();
client.setOperator(
  process.env.OPERATOR_ACCOUNT_ID,
  PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY)
);

const contractId = ContractId.fromString(process.env.HEDERA_CONTRACT_ID);

async function renewDomain(accId, priKey, domain) {
  try {
    console.log(`🔄 Renewing domain: ${domain}`);

    const client = Client.forTestnet();
    client.setOperator(accId, PrivateKey.fromString(priKey));

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
