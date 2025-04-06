const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
  Hbar,
} = require("@hashgraph/sdk");

require("dotenv").config();

const fs = require("fs");
const csvWriter = require("csv-writer").createObjectCsvWriter;
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
      renew_abi,
      formatTransactionId(transactionId)
    );

    await writer.writeRecords([
      {
        transactionId: formatTransactionId(transactionId),
        domain: result.domain,
        ipv4: result.ipv4,
        expiration: result.expiration,
      },
    ]);
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
