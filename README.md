# 🇱🇦 **$LUKAS – The First LatAm Basket-Stable Meme Coin**

### **Open-Source Monorepo: Index Oracle • Uniswap v4 Hook • Adapters • Stabilizer Vault**

---

## 🌎 Overview

**$LUKAS** is an open, community-driven protocol that introduces the **world’s first regional Latin American basket-stable meme coin**, pegged to a weighted index of **BRL, MXN, COP, CLP, and ARS** currencies:

| Currency | Weight |
| -------- | ------ |
| BRL      | 40%    |
| MXN      | 30%    |
| COP      | 15%    |
| CLP      | 10%    |
| ARS      | 5%     |

📌 **1 LUKAS ≈ 1 LatAm Peso Index (LPI)**

This repository provides the **on-chain infrastructure** that maintains the peg, using:

* **Uniswap v4 Hooks** (Polygon)
* **TWAP-based price adapters** from existing LatAm stablecoin pools
* **Cross-chain FX feeds** for MXN & ARS
* **CLP oracle integration**
* **Stabilizer vault module** for mint/burn and liquidity management

The architecture is intentionally modular, censorship-resistant, and audit-friendly.

---

# 🏗 Repository Structure

```
/contracts
  /feeds
    BRZAdapter.sol
    COPMAdapter.sol
    MXNRemoteFeed.sol
    ARSRemoteFeed.sol
    CLPOracle.sol
  LatAmBasketIndex.sol
  LukasHook.sol
  StabilizerVault.sol
  LukasToken.sol

/scripts
  deploy/
  update-price-feeds/

/test
  unit/
  integration/

/docs
  architecture.md
  audits/
  economic-model.pdf
  peg-design.md

README.md
LICENSE
CONTRIBUTING.md
```

---

# 🚀 What Problem Does $LUKAS Solve?

Latin America suffers from:

* 💱 **Fragmented FX markets**
* 🇦🇷 🇨🇱 🇨🇴 🇲🇽 🇧🇷 **Volatile currencies**
* 💳 **No region-wide unit of account**
* 🧱 **Barriers to cross-border commerce**

There are local stablecoins (BRZ, MXNB, COPM, wARS), but:

❌ They only represent **single countries**
❌ They lack **interoperability**
❌ They don’t share **liquidity**
❌ They don’t integrate with **AMM-based stabilization**
❌ They don’t create a **regional monetary layer**

**$LUKAS is the first attempt to unify Latin America economically on-chain.**

---

# ⚙️ Core Architecture

$LUKAS stabilization system is built from three components.

---

## 1️⃣ LatAmBasketIndex (Polygon)

A canonical on-chain oracle that calculates:

```
LatAm Index = Σ (Fiat/USD_i * weight_i)
```

All price inputs normalized to **1e8** decimals.

### Inputs:

* **BRZAdapter** → BRL/USD (Polygon)
* **COPMAdapter** → COP/USD (Polygon)
* **MXNRemoteFeed** → MXN/USD (cross-chain)
* **ARSRemoteFeed** → ARS/USD (cross-chain)
* **CLPOracle** → CLP/USD (Chainlink/Pyth/custom)

### Outputs:

* `getIndexUSD()` → returns index in 1e8
* `getLukasFairPriceInUSDC()` → returns price scaled to 1e18

### Guarantees:

* On-chain composition
* Configurable feed weights
* Staleness checks (optional)
* Upgradeable feed sources, not weights (weights immutable after audit)

---

## 2️⃣ Uniswap v4 Hook – **LukasHook**

A custom v4 hook attached to the **LUKAS/USDC Pool**.

### Responsibilities:

* Read LUKAS pool mid-price
* Read fair value from `LatAmBasketIndex`
* Compare deviation
* Emit peg deviation events
* Optionally trigger **StabilizerVault actions**:

  * Mint LUKAS (over-peg)
  * Buyback & burn LUKAS (under-peg)
  * Provide/remove liquidity

### Stabilization Logic (Conceptual):

```text
if LUKAS too expensive:
    mint small amount → weaken price
if LUKAS too cheap:
    burn or buyback → strengthen price
```

This creates a **self-correcting peg** entirely inside Uniswap.

---

## 3️⃣ StabilizerVault

A controlled module that executes the monetary actions:

* Mint LUKAS (authorized)
* Hold USDC/BTC/ETH collateral
* Buyback LUKAS
* Remove/add liquidity

Eventually this evolves into a **DAO-governed module**.

---

# 🔌 Supported Price Feeds

| Currency | Source                       | Implementation    |
| -------- | ---------------------------- | ----------------- |
| BRL      | BRZ/USDT pool (Polygon)      | BRZAdapter.sol    |
| MXN      | MXNB/USDT pool (Ethereum)    | MXNRemoteFeed.sol |
| COP      | COPM/USDT pool (Polygon)     | COPMAdapter.sol   |
| ARS      | wARS/USDC pool (World Chain) | ARSRemoteFeed.sol |
| CLP      | Chainlink/Pyth/off-chain     | CLPOracle.sol     |

All feeds implement:

```solidity
function getPriceUSD() external view returns (uint256 price1e8, uint256 lastUpdated);
```

---

# 🧪 Testing

Unit tests are included for:

* TWAP oracle correctness
* Basket aggregation
* Hook deviation logic
* Cross-chain feed publishing
* Stabilizer signals

Integration tests simulate:

* BRL crash
* ARS hyperinflation
* MXN devaluation
* Multi-feed delays
* Off-peg liquidity drains

Run:

```
forge test
```

---

# 🔒 Security Philosophy

* **Immutable basket weights** after audit
* **Modular upgradeability** of feeds (but not logic)
* **Cross-chain price publishers use 2-of-N multisig**
* **Optional timelock** for parameter changes
* **All state changes are event-logged for transparency**
* **Hooks follow Uniswap v4 security constraints**

Recommended audits:

1. Smart contract safety
2. Oracle manipulation + MEV analysis
3. Basket weight correctness
4. Edge-case peg response modeling

---

# 📜 Roadmap

### **Phase 1 (MVP – read-only peg awareness)**

* All feeds connected
* BasketIndex live
* v4 Hook emits deviation events
* Basic monitoring interface

### **Phase 2 (Peg Response)**

* StabilizerVault enabled
* Mint/burn thresholds activated
* LP incentives for peg restoration

### **Phase 3 (DAO & Multi-chain)**

* Governance migration
* Bridge LUKAS to other ecosystems
* Merchant reward integration (HashPass)

### **Phase 4 (Full Regional Currency Layer)**

* LUKAS accepted widely via merchant plugins
* POS gateways
* Remittance rails
* Savings products

---

# 🌐 Vision

> **$LUKAS is the first attempt to create a unified regional unit of account for Latin America.**
>
> Built openly, transparently, collaboratively — by developers across LATAM who believe in monetary independence, open finance, and meme-powered adoption.

---

# 🤝 Contributing

We welcome contributions from developers, researchers, economists, and FX specialists.

### How to contribute:

1. Read `/docs/architecture.md`
2. Fork + create a feature branch
3. Follow Foundry + Solidity style guides
4. Submit PR with:

   * Clear motivation
   * Tests
   * Gas report
5. Join discussions via GitHub Issues

### Areas looking for contributors:

* Hook optimization
* Cross-chain FX publisher tooling
* MEV-resistant price sampling
* Multi-variable peg model research
* Agent-based simulations
* Formal verification

---

# 📄 License

MIT License — free for everyone to build and extend.

---

# 💬 Community & Support

Join the LUKAS dev community:

* Telegram (for engineers & researchers only)
* Discord (public)
* Twitter/X @LUKAS_LATAM
* HashPass Developer Portal: *coming soon*

---


Just tell me.
