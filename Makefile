all: test_connection build_contracts

build_contracts:
	@echo "Compiling contracts..."
	npx hardhat compile

deploy_contracts: build_contracts
	@echo "Deploying contracts..."
	npx hardhat run scripts/deploy.js --network hedera

register_domain:
	@echo "Interacting with contract..."
	npx hardhat run scripts/register_domain.js --network hedera

resolve_domain:
	@echo "Interacting with contract..."
	npx hardhat run scripts/resolve_domain.js --network hedera

test_connection:
	@echo "Testing network connection..."
	node test/check_acc_balance.js

.PHONY: all build_contracts deploy_contracts test_connection register_domain resolve_domain
