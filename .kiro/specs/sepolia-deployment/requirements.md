# Requirements Document

## Introduction

This document specifies the requirements for deploying the Lukas Protocol contracts to Sepolia testnet, validating contracts on Etherscan, and ensuring compatibility with Uniswap V4 hooks and core ERC20 liquidity pools. The goal is to properly list a testnet Uniswap pool and validate all contracts before mainnet deployment.

## Glossary

- **Lukas Protocol**: A basket-stable token system pegged to the LatAm Peso Index (LPI)
- **LukasToken**: The ERC20 token ($LUKAS) representing the basket-stable currency
- **StabilizerVault**: Contract responsible for minting/burning LUKAS to maintain peg stability
- **LatAmBasketIndex**: Oracle contract providing fair price based on LatAm currency basket
- **LukasHook**: Uniswap V4 hook for monitoring and stabilizing the LUKAS/USDC pool price
- **Sepolia**: Ethereum testnet for contract testing and validation
- **Etherscan**: Block explorer for Ethereum networks with contract verification
- **Uniswap V4**: Latest version of Uniswap with hook support for custom pool logic
- **Pool Manager**: Uniswap V4 core contract managing all pools

## Requirements

### Requirement 1

**User Story:** As a developer, I want to fix failing StabilizerVault tests, so that contracts are validated before deployment.

#### Acceptance Criteria

1. WHEN the StabilizerVault is deployed THEN the system SHALL initialize with lastStabilization set to 0 to allow immediate first stabilization
2. WHEN a test calls stabilizeMint without prior stabilization THEN the system SHALL succeed if cooldown has elapsed since deployment
3. WHEN running all contract tests THEN the system SHALL pass all 35 tests without failures
4. WHEN the cooldown test runs THEN the system SHALL properly test the cooldown enforcement after an initial successful stabilization

### Requirement 2

**User Story:** As a developer, I want to configure Sepolia network in the contracts, so that I can deploy to Ethereum testnet.

#### Acceptance Criteria

1. WHEN Sepolia configuration is added THEN the foundry.toml SHALL include Sepolia RPC endpoint and Etherscan API key
2. WHEN the .env file is updated THEN the system SHALL include SEPOLIA_RPC_URL variable
3. WHEN deployments.json is updated THEN the system SHALL include Sepolia network (chainId 11155111) configuration
4. WHEN Sepolia USDC address is configured THEN the system SHALL use the official Sepolia USDC test token address

### Requirement 3

**User Story:** As a developer, I want to deploy all Lukas Protocol contracts to Sepolia, so that I can test on Ethereum testnet.

#### Acceptance Criteria

1. WHEN deploying LukasToken to Sepolia THEN the system SHALL deploy with 1,000,000 initial supply and record the address
2. WHEN deploying LatAmBasketIndex to Sepolia THEN the system SHALL deploy with mock price feeds for testing
3. WHEN deploying StabilizerVault to Sepolia THEN the system SHALL configure it with LukasToken and LatAmBasketIndex addresses
4. WHEN deploying LukasHook to Sepolia THEN the system SHALL deploy the simplified version compatible with Uniswap V4 PoolManager
5. WHEN all contracts are deployed THEN the system SHALL update deployments.json with all Sepolia addresses

### Requirement 4

**User Story:** As a developer, I want to verify all contracts on Etherscan, so that users can inspect the source code.

#### Acceptance Criteria

1. WHEN LukasToken is deployed THEN the system SHALL verify the contract on Sepolia Etherscan
2. WHEN LatAmBasketIndex is deployed THEN the system SHALL verify the contract on Sepolia Etherscan
3. WHEN StabilizerVault is deployed THEN the system SHALL verify the contract on Sepolia Etherscan
4. WHEN LukasHook is deployed THEN the system SHALL verify the contract on Sepolia Etherscan
5. WHEN verification completes THEN the deployments.json SHALL update verified status to true for each contract

### Requirement 5

**User Story:** As a developer, I want to create a LUKAS/USDC pool on Uniswap V4 Sepolia, so that I can test swap functionality.

#### Acceptance Criteria

1. WHEN creating the pool THEN the system SHALL use the official Uniswap V4 PoolManager on Sepolia
2. WHEN initializing the pool THEN the system SHALL set appropriate fee tier (3000 = 0.3%) and tick spacing
3. WHEN providing initial liquidity THEN the system SHALL add at least 1000 LUKAS and equivalent USDC
4. WHEN the pool is created THEN the system SHALL record the pool configuration in deployments.json
5. WHEN the LukasHook is attached THEN the system SHALL validate hook permissions match pool requirements

### Requirement 6

**User Story:** As a developer, I want to ensure contract compatibility with Uniswap V4 hooks, so that peg stabilization works correctly.

#### Acceptance Criteria

1. WHEN LukasHook is deployed THEN the system SHALL implement correct hook permissions (beforeInitialize, afterSwap)
2. WHEN the hook validates a pool THEN the system SHALL verify the pool contains LUKAS and USDC tokens
3. WHEN afterSwap is called THEN the system SHALL calculate pool price and compare to fair price from oracle
4. WHEN deviation exceeds threshold THEN the system SHALL emit PegDeviation event with correct parameters
5. WHEN autoStabilize is enabled THEN the system SHALL trigger StabilizerVault actions appropriately

### Requirement 7

**User Story:** As a developer, I want to estimate gas costs for Sepolia deployment, so that I can ensure 0.5 ETH is sufficient.

#### Acceptance Criteria

1. WHEN estimating deployment costs THEN the system SHALL calculate gas for all contract deployments
2. WHEN estimating pool creation costs THEN the system SHALL include pool initialization and liquidity provision
3. WHEN estimating verification costs THEN the system SHALL account for any verification-related transactions
4. WHEN total estimate is calculated THEN the system SHALL provide a clear breakdown with safety margin
5. IF 0.5 Sepolia ETH is insufficient THEN the system SHALL recommend the minimum required amount
