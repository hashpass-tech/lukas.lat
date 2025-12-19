---
sidebar_position: 2
---

# Tokenomics

Understanding the economic model behind $LUKAS.

## Currency Basket Composition

$LUKAS derives its value from a weighted basket of five major Latin American currencies:

```
╔═══════════════════════════════════════════════════════╗
║           LUKAS CURRENCY BASKET                       ║
╠═══════════════════════════════════════════════════════╣
║  🇧🇷 BRL (Brazilian Real)     ████████████████  40%   ║
║  🇲🇽 MXN (Mexican Peso)       ████████████      30%   ║
║  🇨🇴 COP (Colombian Peso)     ██████            15%   ║
║  🇨🇱 CLP (Chilean Peso)       ████              10%   ║
║  🇦🇷 ARS (Argentine Peso)     ██                 5%   ║
╚═══════════════════════════════════════════════════════╝
```

### Weight Rationale

| Currency | Weight | Rationale |
|----------|--------|-----------|
| 🇧🇷 BRL | 40% | Largest LatAm economy, most liquid currency |
| 🇲🇽 MXN | 30% | Second largest economy, strong trade volume |
| 🇨🇴 COP | 15% | Growing economy, Pacific Alliance member |
| 🇨🇱 CLP | 10% | Most stable LatAm economy |
| 🇦🇷 ARS | 5% | Regional diversity, Southern Cone representation |

## Token Supply Model

### Initial Supply
- **Total Initial Supply**: 1,000,000 LUKAS
- **Decimals**: 18

### Supply Mechanics

```
╔═══════════════════════════════════════════════════════════════════╗
║                        EXPANSION (Price > Fair Value)             ║
╠═══════════════════════════════════════════════════════════════════╣
║  Price Above    StabilizerVault    Mint LUKAS    Sell to Pool    ║
║  Fair Value ──▶ Detects      ──▶  New Tokens ──▶ Price      ──▶  ║
║                 Deviation                        Decreases        ║
╚═══════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════╗
║                       CONTRACTION (Price < Fair Value)            ║
╠═══════════════════════════════════════════════════════════════════╣
║  Price Below    StabilizerVault    Buy from      Burn LUKAS      ║
║  Fair Value ──▶ Uses USDC    ──▶  Pool      ──▶ Price      ──▶   ║
║                 Reserve                          Increases        ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Elastic Supply
LUKAS uses an elastic supply model:
- **Minting**: When market price exceeds fair value by >2%, new tokens are minted and sold
- **Burning**: When market price falls below fair value by >2%, tokens are bought and burned
- **Cooldown**: 1-hour minimum between stabilization operations

## Price Calculation

### Fair Value Formula

```
LUKAS_USD = (BRL_USD × 0.40) + (MXN_USD × 0.30) + (COP_USD × 0.30) + (CLP_USD × 0.10) + (ARS_USD × 0.05)
```

### Example Calculation

| Currency | USD Rate | Weight | Contribution |
|----------|----------|--------|--------------|
| BRL | $0.20 | 40% | $0.0800 |
| MXN | $0.058 | 30% | $0.0174 |
| COP | $0.00025 | 15% | $0.0000375 |
| CLP | $0.0011 | 10% | $0.00011 |
| ARS | $0.001 | 5% | $0.00005 |
| **Total** | | | **~$0.0976** |

## Fee Structure

### Trading Fees
- **Pool Fee**: 0.3% (standard Uniswap V4)
- **Protocol Fee**: 0% (no additional protocol fee)

### Stabilization Costs
- Gas costs for mint/burn operations
- Slippage on large stabilization trades

## Economic Security

### Peg Maintenance
The protocol maintains peg through:
1. **Arbitrage Incentives**: Natural market forces when price deviates
2. **Automated Stabilization**: Protocol-level intervention for larger deviations
3. **Reserve Management**: USDC reserves in StabilizerVault

### Risk Mitigation
- **Diversification**: 5 currencies reduce single-point-of-failure risk
- **Oracle Redundancy**: Multiple Chainlink feeds with staleness checks
- **Cooldown Periods**: Prevent rapid successive operations
- **Deviation Thresholds**: Only act on significant price movements

## Governance

### Future Governance Rights
LUKAS holders will be able to vote on:
- Basket weight adjustments
- Deviation threshold changes
- Protocol parameter updates
- Treasury allocation

### Governance Timeline
- **Phase 1** (Current): Core team management
- **Phase 2** (Q2 2025): Community proposals
- **Phase 3** (Q4 2025): Full DAO governance
