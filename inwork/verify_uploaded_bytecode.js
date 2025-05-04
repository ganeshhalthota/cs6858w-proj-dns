const {
    Client,
    PrivateKey,
    AccountId,
    FileContentsQuery,
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function verifyUploadedBytecode(fileIdToCheck, localBytecodePath) {
    try {
        // Load credentials
        const operatorId = process.env.OPERATOR_ACCOUNT_ID;
        const operatorKey = process.env.OPERATOR_PRIVATE_KEY;

        if (!operatorId || !operatorKey) {
            throw new Error("Missing OPERATOR_ACCOUNT_ID or OPERATOR_PRIVATE_KEY in .env");
        }

        const client = Client.forTestnet().setOperator(
            AccountId.fromString(operatorId),
            PrivateKey.fromStringECDSA(operatorKey)
        );

        // Read local bytecode from file
        const localBytecodeHex = fs.readFileSync(path.resolve(localBytecodePath), "utf8").trim();
        const localBytecode = Buffer.from(localBytecodeHex, "hex");

        // Fetch bytecode from Hedera
        console.log(`Fetching uploaded bytecode from Hedera file: ${fileIdToCheck}`);

        const remoteBytecode = await new FileContentsQuery()
            .setFileId(fileIdToCheck)
            .execute(client);

        // Compare buffers
        const match = Buffer.compare(localBytecode, remoteBytecode) === 0;

        if (match) {
            console.log("Uploaded bytecode matches local bytecode.");
            process.exit(0);
        } else {
            console.error("Bytecode mismatch!");
            console.log("Local bytecode size:", localBytecode.length);
            console.log("Remote bytecode size:", remoteBytecode.length);

            // Optional: Write to disk for manual diff
            fs.writeFileSync("remote_bytecode_downloaded.bin", remoteBytecode);
            console.log("Downloaded bytecode saved to remote_bytecode_downloaded.bin for inspection.");
            process.exit(1);
        }
    } catch (error) {
        console.error("Verification failed:");
        console.error(error.stack || error.message || error);
        process.exit(1);
    }
}

// Example usage:
// node verifyBytecode.js 0.0.5862280 ../artifacts/DNS_bytecode.txt
const [fileIdToCheck, localBytecodePath] = process.argv.slice(2);
if (!fileIdToCheck || !localBytecodePath) {
    console.error("Usage: node verifyBytecode.js <fileId> <path_to_local_bytecode>");
    process.exit(1);
}

verifyUploadedBytecode(fileIdToCheck, localBytecodePath);
