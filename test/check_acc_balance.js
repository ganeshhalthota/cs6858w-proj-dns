const { Client, AccountBalanceQuery, PrivateKey } = require("@hashgraph/sdk");
require("dotenv").config();

// Create Hedera client
const client = Client.forTestnet();

// List of accounts and keys from .env file
const accounts = [
    { id: process.env.OPERATOR_ACCOUNT_ID, key: process.env.OPERATOR_PRIVATE_KEY },
];

// Function to check balance for each account
async function checkBalances() {
    try {
        for (const account of accounts) {
            if (!account.id || !account.key) continue; // Skip if any value is missing

            client.setOperator(account.id, PrivateKey.fromStringECDSA(account.key)); // Set operator

            const balance = await new AccountBalanceQuery()
                .setAccountId(account.id)
                .execute(client);

            console.log(`Account ID: ${account.id} | Balance: ${balance.hbars.toString()}`);
        }
    } catch (error) {
        console.error("Error fetching balance:", error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

// Run balance check
checkBalances();
