/**
   * Resolve a domain (get associated IPv4 address)
   */
async function resolveDomain(domain) {
    try {
      const txContractExecute = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("resolveDomain", new ContractFunctionParameters().addString(domain));

      //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
      const txContractExecuteResponse = await txContractExecute.execute(client);

    } catch (error) {
      console.error("❌ Error registering domain:", error);
    }
  }
