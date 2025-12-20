---
sidebar_position: 3
---

# Technical Architecture

Deep dive into the LUKAS Protocol technical implementation.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │Chainlink│ │Chainlink│ │Chainlink│ │Chainlink│ │Chainlink│       │
│  │BRL/USD  │ │MXN/USD  │ │COP/USD  │ │CLP/USD  │ │ARS/USD  │       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
└───────┼──────────┼──────────┼──────────┼──────────┼────────────────┘
        │          │          │          │          │
        └──────────┴──────────┼──────────┴──────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ORACLE LAYER                                  │
│                 ┌─────────────────────┐                             │
│                 │  LatAmBasketIndex   │                             │
│                 │  (Price Aggregator) │                             │
│                 └──────────┬──────────┘                             │
│                            │ Fair Price                             │
└────────────────────────────┼────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CORE PROTOCOL                                  │
│  ┌─────────────────┐              ┌─────────────────┐               │
│  │   LukasToken    │◀────────────▶│ StabilizerVault │               │
│  │    (ERC-20)     │  mint/burn   │  (Peg Manager)  │               │
│  └─────────────────┘              └────────┬────────┘               │
│                                            │                        │
│                                   ┌────────▼────────┐               │
│                                   │   LukasHook     │               │
│                                   │   (V4 Hook)     │               │
│                                   └────────┬────────┘               │
└────────────────────────────────────────────┼────────────────────────┘
                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DEX INTEGRATION                                │
│  ┌─────────────────┐              ┌─────────────────┐               │
│  │   PoolManager   │◀────────────▶│  LUKAS/USDC     │               │
│  │  (Uniswap V4)   │              │     Pool        │               │
│  └─────────────────┘              └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                             │
┌────────────────────────────────────────────▼────────────────────────┐
│                      CLIENT LAYER                                   │
│  ┌─────────────────┐              ┌─────────────────┐               │
│  │    Lukas SDK    │◀─────────────│    Web App      │               │
│  │   (TypeScript)  │              │   (Next.js)     │               │
│  └─────────────────┘              └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

## Smart Contract Architecture

### LukasToken (ERC-20)

The core token contract with extended capabilities:

```solidity
interface ILukasToken {
    // Standard ERC-20
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    
    // Extended functionality
    function mint(address to, uint256 amount) external; // Only StabilizerVault
    function burn(uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
}
```

**Key Features:**
- Standard ERC-20 compliance
- Controlled minting (only authorized contracts)
- Public burning capability
- 18 decimal precision

### LatAmBasketIndex (Oracle)

Aggregates currency prices and calculates fair value:

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRICE QUERY FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User                  LatAmBasketIndex         Chainlink        │
│   │                          │                      │            │
│   │ getLukasFairPriceInUSDC()│                      │            │
│   │─────────────────────────▶│                      │            │
│   │                          │  getLatestPrice(BRL) │            │
│   │                          │─────────────────────▶│            │
│   │                          │  getLatestPrice(MXN) │            │
│   │                          │─────────────────────▶│            │
│   │                          │  getLatestPrice(COP) │            │
│   │                          │─────────────────────▶│            │
│   │                          │  getLatestPrice(CLP) │            │
│   │                          │─────────────────────▶│            │
│   │                          │  getLatestPrice(ARS) │            │
│   │                          │─────────────────────▶│            │
│   │                          │◀─────────────────────│            │
│   │                          │  prices[]            │            │
│   │                          │                      │            │
│   │                          │ calculateWeighted()  │            │
│   │                          │──────────┐           │            │
│   │                          │          │           │            │
│   │                          │◀─────────┘           │            │
│   │◀─────────────────────────│                      │            │
│   │  fairPriceUSDC (1e18)    │                      │            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Key Functions:**
```solidity
interface ILatAmBasketIndex {
    function getIndexUSD() external view returns (uint256);           // 1e8 format
    function getLukasFairPriceInUSDC() external view returns (uint256); // 1e18 format
    function getCurrencyPrice(string memory symbol) external view returns (uint256);
    function getBasketComposition() external view returns (BasketData memory);
    function hasStaleFeeds() external view returns (bool);
}
```

### StabilizerVault

Manages peg stabilization through mint/burn operations:

```
┌─────────────────────────────────────────────────────────────────┐
│                 STABILIZATION STATE MACHINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌──────────────┐                                             │
│    │  MONITORING  │◀───────────────────────────────────┐        │
│    └──────┬───────┘                                    │        │
│           │ Price Update                               │        │
│           ▼                                            │        │
│    ┌──────────────┐     Within Threshold    ┌─────────┴──────┐ │
│    │   CHECK      │────────────────────────▶│  NO ACTION     │ │
│    │  DEVIATION   │                         └────────────────┘ │
│    └──────┬───────┘                                             │
│           │ Exceeds Threshold                                   │
│           ▼                                                     │
│    ┌──────────────┐     In Cooldown         ┌────────────────┐ │
│    │   CHECK      │────────────────────────▶│  WAIT          │ │
│    │  COOLDOWN    │                         └────────────────┘ │
│    └──────┬───────┘                                             │
│           │ Cooldown Passed                                     │
│           ▼                                                     │
│    ┌──────────────┐                                             │
│    │  STABILIZE   │                                             │
│    └──────┬───────┘                                             │
│           │                                                     │
│     ┌─────┴─────┐                                               │
│     ▼           ▼                                               │
│  Price > Fair  Price < Fair                                     │
│     │           │                                               │
│     ▼           ▼                                               │
│  MINT &      BUY &                                              │
│  SELL        BURN                                               │
│     │           │                                               │
│     └─────┬─────┘                                               │
│           │                                                     │
│           ▼                                                     │
│    ┌──────────────┐                                             │
│    │   UPDATE     │─────────────────────────────────────────────┘
│    │  COOLDOWN    │                                             │
│    └──────────────┘                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Parameters:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| `deviationThreshold` | 200 (2%) | Minimum deviation to trigger |
| `cooldownPeriod` | 3600 (1 hour) | Time between operations |
| `maxStabilizationAmount` | 10,000 LUKAS | Max per operation |

### LukasHook (Uniswap V4)

Monitors swaps and triggers stabilization:

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOOK SWAP FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User      Pool       LukasHook    Oracle      Vault            │
│   │         │            │           │           │              │
│   │ swap()  │            │           │           │              │
│   │────────▶│            │           │           │              │
│   │         │ afterSwap()│           │           │              │
│   │         │───────────▶│           │           │              │
│   │         │            │ getFairPrice()        │              │
│   │         │            │──────────▶│           │              │
│   │         │            │◀──────────│           │              │
│   │         │            │           │           │              │
│   │         │            │ getMarketPrice()      │              │
│   │         │            │◀──────────│           │              │
│   │         │            │           │           │              │
│   │         │            │ calculateDeviation()  │              │
│   │         │            │──────┐    │           │              │
│   │         │            │◀─────┘    │           │              │
│   │         │            │           │           │              │
│   │         │            │ [if deviation > 2%]   │              │
│   │         │            │ triggerStabilization()│              │
│   │         │            │───────────────────────▶              │
│   │         │            │           │           │              │
│   │         │◀───────────│           │           │              │
│   │◀────────│            │           │           │              │
│   │ complete│            │           │           │              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Price Update Flow

```
Chainlink Updates ──▶ LatAmBasketIndex ──▶ Price Changed?
                                               │
                              ┌────────────────┴────────────────┐
                              ▼                                 ▼
                           [YES]                              [NO]
                              │                                 │
                              ▼                                 ▼
                     Emit PriceUpdated                     No Action
                              │
                              ▼
                     LukasHook Monitors
                              │
                              ▼
                     Deviation > 2%?
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
           [YES]                            [NO]
              │                               │
              ▼                               ▼
    Trigger Stabilization            Continue Monitoring
```

### Stabilization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Deviation Detected                           │
│                           │                                     │
│                           ▼                                     │
│                   ┌───────────────┐                             │
│                   │ Price vs Fair │                             │
│                   └───────┬───────┘                             │
│                           │                                     │
│           ┌───────────────┴───────────────┐                     │
│           ▼                               ▼                     │
│     Price ABOVE                     Price BELOW                 │
│           │                               │                     │
│           ▼                               ▼                     │
│     Mint LUKAS                    Use USDC Reserve              │
│           │                               │                     │
│           ▼                               ▼                     │
│     Sell to Pool                   Buy from Pool                │
│           │                               │                     │
│           ▼                               ▼                     │
│    Price Decreases                  Burn LUKAS                  │
│           │                               │                     │
│           │                               ▼                     │
│           │                        Price Increases              │
│           │                               │                     │
│           └───────────────┬───────────────┘                     │
│                           ▼                                     │
│                    ┌─────────────┐                              │
│                    │ PEG RESTORED│                              │
│                    └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Security Model

### Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                      ACCESS CONTROL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ROLES                          CONTRACTS                       │
│  ─────                          ─────────                       │
│                                                                 │
│  ┌─────────┐                    ┌─────────────┐                 │
│  │  OWNER  │───── manages ─────▶│ LukasToken  │                 │
│  └─────────┘                    └─────────────┘                 │
│       │                                                         │
│       └──────── manages ───────▶┌─────────────────┐             │
│                                 │ StabilizerVault │             │
│                                 └─────────────────┘             │
│                                                                 │
│  ┌─────────┐                    ┌─────────────┐                 │
│  │ MINTER  │────── mint ───────▶│ LukasToken  │                 │
│  └─────────┘                    └─────────────┘                 │
│       ▲                                                         │
│       │                                                         │
│       └─────── has role ────────┌─────────────────┐             │
│                                 │ StabilizerVault │             │
│                                 └─────────────────┘             │
│                                                                 │
│  ┌────────────┐                 ┌─────────────────┐             │
│  │ STABILIZER │── stabilize ───▶│ StabilizerVault │             │
│  └────────────┘                 └─────────────────┘             │
│       ▲                                                         │
│       │                                                         │
│       └─────── has role ────────┌─────────────┐                 │
│                                 │  LukasHook  │                 │
│                                 └─────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Security Features

1. **Reentrancy Protection**: All state-changing functions use reentrancy guards
2. **Access Control**: Role-based permissions for sensitive operations
3. **Cooldown Periods**: Prevent rapid successive operations
4. **Oracle Validation**: Staleness checks on price feeds
5. **Amount Limits**: Maximum stabilization amounts per operation

## Gas Optimization

| Operation | Estimated Gas | Notes |
|-----------|---------------|-------|
| Transfer | ~65,000 | Standard ERC-20 |
| Approve | ~46,000 | Standard ERC-20 |
| Mint | ~75,000 | Restricted access |
| Burn | ~55,000 | Public |
| Get Fair Price | ~45,000 | 5 oracle reads |
| Stabilization | ~250,000 | Full cycle |

## Upgrade Path

The protocol is designed for future upgradability:

1. **Proxy Pattern**: Core contracts can be upgraded via proxy
2. **Parameter Updates**: Governance can adjust thresholds
3. **Oracle Migration**: New price feeds can be added
4. **Hook Updates**: V4 hooks can be replaced

## Current Deployments

### Polygon Amoy Testnet (Chain ID: 80002)

| Contract | Address | Version |
|----------|---------|---------|
| LukasToken | `0x63524b53983960231b7b86CDEdDf050Ceb9263Cb` | 1.0.0 |
| LatAmBasketIndex | `0x1Dccf1fB82946a293E03036e85edc2139cba1541` | 1.1.0 |
| StabilizerVault | `0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3` | 1.0.0 |
| LukasHook | `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519` | 1.0.0-simplified |
| USDC | `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582` | external |
| LUKAS/USDC Pool | `0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E` | 1.0.0 |

### Sepolia Testnet (Chain ID: 11155111)

| Contract | Address | Version |
|----------|---------|---------|
| LukasToken | `0x63524b53983960231b7b86CDEdDf050Ceb9263Cb` | 1.0.0 |
| LatAmBasketIndex | `0x46D240633d70AB16654e0053D05B24Dfb3284A71` | 1.1.0 |
| StabilizerVault | `0x64540D50CD37BC94C2ED77766Cc86C4D6C3ec9cE` | 1.0.0 |
| LukasHook | `0xB6EAA80E5446895a6d7136e90c97821550e51805` | 1.0.0-simplified |
| USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | external |
| UniswapV4 PoolManager | `0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A` | external |

## Block Explorers

- **Polygon Amoy**: [amoy.polygonscan.com](https://amoy.polygonscan.com)
- **Sepolia**: [sepolia.etherscan.io](https://sepolia.etherscan.io)
