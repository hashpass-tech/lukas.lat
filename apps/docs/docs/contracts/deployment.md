---
sidebar_position: 2
---

# Contract Deployment

Guide to deploying $LUKAS smart contracts.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/) installed
- RPC endpoint for target network
- Private key with sufficient gas

## Deployment Steps

### 1. Configure Environment

Create a `.env` file in the contracts package:

```bash
PRIVATE_KEY=your_private_key
RPC_URL=https://your-rpc-endpoint
ETHERSCAN_API_KEY=your_etherscan_key
```

### 2. Deploy Contracts

```bash
cd packages/contracts
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast --verify
```

### 3. Verify Deployment

Check the deployed contract on the block explorer using the provided address.

## Testnet Deployments

### Sepolia
- Token: `0x...` (coming soon)

### Mumbai
- Token: `0x...` (coming soon)

## Mainnet Deployment

Mainnet deployment will be announced after thorough testing and audits.
