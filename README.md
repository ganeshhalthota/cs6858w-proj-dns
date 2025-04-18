# DNS using Hedera Infrastructure

## Introduction

The project looks to implement DNS using Hedera Distributed Ledger Technology.

## Project Info

### Organization

The project organization is as follows -

| File/Folder | Purpose |
| --- | --- |
| contracts/ | Solidity smart contracts for DNS logic |
| scripts/ | Node.js scripts to deploy & interact with contracts (TODO) |
| src/ | Backend API (Express.js or direct contract interaction) |
| frontend/ | UI (React, Next.js, or plain HTML/JS) |
| test/ | Unit tests for smart contracts (TODO) |
| .env | Stores Hedera account credentials securely |
| server.js | JS file for setting up server and API endpoints |

### Setup

#### Retrieving Source code

```bash
git clone git@github.com:ganeshhalthota/cs6858w-proj-dns.git
cd cs6858w-proj-dns/
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

#### Testing Setup

```bash
node test/check_acc_balance.js
```

### Usage
- Start the server using `node server.js`
- Load webpage `http://localhost:3000/`
- Enter the Hedera Accound ID and Private Key
- Perform Register, Resolve, Renew or Transfer of Domain Operation
