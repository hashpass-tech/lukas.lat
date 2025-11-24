---
sidebar_position: 1
---

# Smart Contracts Overview

The $LUKAS smart contract system is built using Solidity and deployed on Ethereum-compatible chains.

## Core Contracts

### LukasToken.sol
The main ERC-20 token contract implementing the $LUKAS token.

**Key Functions:**
- `transfer()`: Transfer tokens between addresses
- `approve()`: Approve spending allowance
- `transferFrom()`: Transfer on behalf of another address

### Security Features
- Audited by leading security firms
- Time-locked upgrades
- Multi-signature governance

## Development

Contracts are developed using [Foundry](https://book.getfoundry.sh/), a blazing fast Ethereum development toolkit.

```bash
# Build contracts
forge build

# Run tests
forge test

# Deploy
forge script script/Deploy.s.sol
```
