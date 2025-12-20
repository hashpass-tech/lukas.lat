---
sidebar_position: 1
---

# Protocol Overview

$LUKAS is the first regional Latin American basket-stable meme coin, designed to unify currency volatility across the region into a single, gravity-centered asset.

## Vision

Create a stable, accessible digital currency that represents the economic strength of Latin America while providing protection against individual currency volatility.

## Core Principles

### 🌎 Regional Unity
Combining five major Latin American currencies into a single basket creates natural diversification and reduces exposure to any single economy's fluctuations.

### ⚖️ Algorithmic Stability
The protocol uses automated stabilization mechanisms to maintain the peg to the underlying basket value.

### 🔒 Transparency
All operations, reserves, and price feeds are verifiable on-chain.

### 🤝 Community-Driven
Governance decisions are made by token holders, ensuring the protocol evolves with community needs.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRICE LAYER                              │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐   │
│  │ Chainlink    │───▶│ LatAmBasketIndex│───▶│ Fair Price   │   │
│  │ Feeds        │    │ Oracle          │    │ Oracle       │   │
│  └──────────────┘    └─────────────────┘    └──────┬───────┘   │
└────────────────────────────────────────────────────┼───────────┘
                                                     │
┌────────────────────────────────────────────────────▼───────────┐
│                       CORE PROTOCOL                             │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐   │
│  │ LukasToken   │◀──▶│ StabilizerVault │◀──▶│ LukasHook    │   │
│  │ (ERC-20)     │    │ (Peg Manager)   │    │ (V4 Hook)    │   │
│  └──────────────┘    └─────────────────┘    └──────┬───────┘   │
└────────────────────────────────────────────────────┼───────────┘
                                                     │
┌────────────────────────────────────────────────────▼───────────┐
│                       TRADING LAYER                             │
│  ┌──────────────┐    ┌─────────────────┐                       │
│  │ Uniswap V4   │◀──▶│ LUKAS/USDC      │                       │
│  │ PoolManager  │    │ Pool            │                       │
│  └──────────────┘    └─────────────────┘                       │
└────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────┐
│                      USER INTERFACE                             │
│  ┌──────────────┐    ┌─────────────────┐                       │
│  │ Lukas SDK    │◀───│ Web App         │                       │
│  └──────────────┘    └─────────────────┘                       │
└────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component | Purpose |
|-----------|---------|
| **LukasToken** | ERC-20 token with mint/burn capabilities |
| **LatAmBasketIndex** | Oracle aggregating 5 LatAm currency prices |
| **StabilizerVault** | Manages peg stabilization operations |
| **LukasHook** | Uniswap V4 hook for automated stabilization |
| **Lukas SDK** | TypeScript library for protocol interaction |

## How It Works

1. **Price Discovery**: The LatAmBasketIndex oracle aggregates real-time prices from Chainlink feeds for BRL, MXN, COP, CLP, and ARS
2. **Fair Value Calculation**: Weighted average determines the fair LUKAS price in USD
3. **Market Trading**: Users trade LUKAS/USDC on Uniswap V4 pools
4. **Peg Monitoring**: The LukasHook monitors price deviations from fair value
5. **Stabilization**: When deviation exceeds threshold, the StabilizerVault mints or burns tokens to restore peg

## Network Support

| Network | Status | Contracts | Use Case |
|---------|--------|-----------|----------|
| Polygon Amoy | ✅ Live | 5 deployed | Primary testnet |
| Sepolia | ✅ Live | 5 deployed | Ethereum testnet |
| Ethereum Mainnet | 🔴 Not Live | — | Future production |
| Polygon Mainnet | 🚧 Coming | — | Production deployment |

## Current Version

- **Protocol**: v0.2.35
- **SDK**: @lukas-protocol/sdk v0.2.35
- **Last Updated**: December 19, 2025

## Quick Links

- [Tokenomics](./tokenomics) - Token distribution and economics
- [Architecture](./architecture) - Technical deep-dive
- [Roadmap](./roadmap) - Development timeline
- [Integrations](./integrations) - Partner technologies
