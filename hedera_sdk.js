const {
    Client,
    AccountId,
    PrivateKey,
    ContractCallQuery,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    Hbar
  } = require("@hashgraph/sdk");
  
  // Load environment variables
  const operatorId = AccountId.fromString("");
  const operatorKey = PrivateKey.fromStringECDSA("");
  const contractId = "0.0.5775906";
  
  // Initialize Hedera Client
  const client = Client.forTestnet(); // Use Client.forMainnet() for production
  client.setMaxQueryPayment(new Hbar(5));
  client.setOperator(operatorId, operatorKey);
  
  /**
   * Register a domain
   */
  async function registerDomain(domain, ipv4) {
    try {
      const txContractExecute = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        //.setPayableAmount(Hbar.from(0.01)) // Send 0.01 HBAR as the registration fee
        .setFunction("registerDomain",
          new ContractFunctionParameters()
            .addString(domain)
            .addString(ipv4)
        );
  
      //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
      const txContractExecuteResponse = await txContractExecute.execute(client);
  
      //Request the receipt of the transaction
      const receiptContractExecuteTx = await txContractExecuteResponse.getReceipt(client);
  
      //Get the transaction consensus status
      const statusContractExecuteTx = receiptContractExecuteTx.status;
  
      //Get the Transaction ID
      const txContractExecuteId = txContractExecuteResponse.transactionId.toString();
      console.log("--------------------------------- Execute Contract Flow ---------------------------------");
      console.log("Consensus status           :", statusContractExecuteTx.toString());
      console.log("Transaction ID             :", txContractExecuteId);
      console.log("Hashscan URL               :", "https://hashscan.io/testnet/tx/" + txContractExecuteId);
    } catch (error) {
      console.error("❌ Error registering domain:", error);
    }
  }
  
  /**
   * Resolve a domain (get associated IPv4 address)
   */
  async function resolveDomain(domain) {
    try {
      const txContractExecute = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(10000000)
        .setFunction("resolveDomain", new ContractFunctionParameters().addString(domain));
  
      //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
      const txContractExecuteResponse = await txContractExecute.execute(client);
  
      //Request the receipt of the transaction
      const receiptContractExecuteTx = await txContractExecuteResponse.getReceipt(client);
  
      //Get the transaction consensus status
      const statusContractExecuteTx = receiptContractExecuteTx.status;
  
      //Get the Transaction ID
      const txContractExecuteId = txContractExecuteResponse.transactionId.toString();
      console.log("--------------------------------- Execute Contract Flow ---------------------------------");
      console.log("Consensus status           :", statusContractExecuteTx.toString());
      console.log("Transaction ID             :", txContractExecuteId);
      console.log("Hashscan URL               :", "https://hashscan.io/testnet/tx/" + txContractExecuteId);
    } catch (error) {
      console.error("❌ Error registering domain:", error);
    }
  }
  
  /**
   * Renew a domain registration
   */
  async function renewDomain(domain) {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("renewDomain", new ContractFunctionParameters().addString(domain));
  
      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      console.log(`🔄 Domain Renewed! Status: ${receipt.status}`);
    } catch (error) {
      console.error("❌ Error renewing domain:", error);
    }
  }
  
  /**
   * Transfer domain ownership
   */
  async function transferDomain(domain, newOwnerAddress) {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("transferDomain",
          new ContractFunctionParameters()
            .addString(domain)
            .addAddress(newOwnerAddress)
        );
  
      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      console.log(`🔁 Domain Transferred! Status: ${receipt.status}`);
    } catch (error) {
      console.error("❌ Error transferring domain:", error);
    }
  }
  
  // Example Execution
  (async () => {
    // await registerDomain("example.com", "192.168.1.1");
    await resolveDomain("example.com");
    // await renewDomain("example.com");
    // await transferDomain("example.com", "0.0.NEWOWNER");
  })();
  