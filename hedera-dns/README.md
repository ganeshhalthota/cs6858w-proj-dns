# DNS using Hedera Infrastructure

## Introduction

The project looks to implement DNS using Hedera Distributed Ledger Technology.

## Project Info

### Organization

The project organization is as follows -

| File/Folder | Purpose |
| --- | --- |
| contracts/ | Solidity smart contracts for DNS logic |
| scripts/ | Node.js scripts to deploy & interact with contracts |
| src/ | Backend API (Express.js or direct contract interaction) |
| frontend/ | UI (React, Next.js, or plain HTML/JS) |
| test/ | Unit tests for smart contracts |
| .env | Stores Hedera account credentials securely |

### Setup

#### Retrieving Source code

```bash
git clone git@github.com:ganeshhalthota/cs6858w-proj-dns.git
cd cs6858w-proj-dns/hedera-dns
```

#### Setting up npm

Install npm version 20 or higher using the instructions provided for your platform from [Download Node.js®](https://nodejs.org/en/download)

Install the project dependent packages using the below command -

```bash
npm install
```

#### Setup the Accounts

The accounts are setup in `.env` file. The sample is provided in `env.sample`.
Please rename it to .env and fill in the details of the accounts.

Note: Accounts 1 and 2 are required for testing purposes only. They are not used in the actual contract

#### Testing Setup

The setup can be tested using

```bash
node test/check_acc_balance.js
```

### Execution

```bash
make deploy_contracts
make register_domain
make resolve_domain
```
