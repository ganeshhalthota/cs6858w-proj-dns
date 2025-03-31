require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.28",
    networks: {
        hedera: {
            url: "https://testnet.hashio.io/api",
            accounts: [process.env.OPERATOR_PRIVATE_KEY]
        }
    }
};
