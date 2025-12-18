# Gas Estimation for Polygon Amoy Deployment

## Contract Deployment Gas Costs

### Estimated Gas per Contract

| Contract | Estimated Gas | MATIC (at 50 Gwei) | USD (MATIC @ $0.70) |
|----------|---------------|---------------------|---------------------|
| **LukasToken** | ~1,500,000 | 0.075 MATIC | $0.05 |
| **LatAmBasketIndex** (with 5 oracles) | ~3,000,000 | 0.150 MATIC | $0.11 |
| **StabilizerVault** | ~2,500,000 | 0.125 MATIC | $0.09 |
| **PoolManager** (Uniswap V4) | ~4,000,000 | 0.200 MATIC | $0.14 |
| **PoolSwapTest** | ~1,500,000 | 0.075 MATIC | $0.05 |
| **PoolModifyLiquidityTest** | ~1,500,000 | 0.075 MATIC | $0.05 |
| **LukasHook** | ~2,500,000 | 0.125 MATIC | $0.09 |
| **Set Minter** (transaction) | ~50,000 | 0.003 MATIC | $0.00 |
| **Initialize Pool** | ~500,000 | 0.025 MATIC | $0.02 |
| **Approve LUKAS** | ~50,000 | 0.003 MATIC | $0.00 |
| **Approve USDC** | ~50,000 | 0.003 MATIC | $0.00 |
| **Add Liquidity** | ~300,000 | 0.015 MATIC | $0.01 |
| **Subtotal** | ~17,450,000 | **0.87 MATIC** | **$0.61** |
| **Buffer (30% safety)** | ~5,235,000 | **0.26 MATIC** | **$0.18** |
| **TOTAL** | ~22,685,000 | **1.13 MATIC** | **$0.79** |

### Verification Costs (Optional)

| Action | Cost |
|--------|------|
| Contract verification (automatic with `--verify` flag) | FREE |
| PolygonScan API usage | FREE |

## Recommended Wallet Balance

### Minimum Required
- **1.5 MATIC** - Safe amount with buffer for gas price fluctuations

### Recommended Amount
- **2.0 MATIC** - Comfortable buffer for retries and gas spikes

### Conservative Amount
- **3.0 MATIC** - Maximum safety, allows for multiple retries

## Gas Price Assumptions

### Polygon Amoy Testnet (Current)
- **Base gas price**: 30-100 Gwei (typically 50 Gwei)
- **Priority fee**: 30 Gwei
- **Network congestion**: Low (testnet)

### Cost Breakdown by Phase

| Phase | Contracts | Total Gas | MATIC | USD |
|-------|-----------|-----------|-------|-----|
| **Phase 1** | LukasToken | 1,500,000 | 0.075 | $0.05 |
| **Phase 2** | LatAmBasketIndex | 3,000,000 | 0.150 | $0.11 |
| **Phase 3** | StabilizerVault + SetMinter | 2,550,000 | 0.128 | $0.09 |
| **Phase 4** | Uniswap V4 (3 contracts) | 7,000,000 | 0.350 | $0.25 |
| **Phase 5** | LukasHook | 2,500,000 | 0.125 | $0.09 |
| **Phase 6** | Initialize Pool | 500,000 | 0.025 | $0.02 |
| **Phase 7** | Approvals + Add Liquidity | 400,000 | 0.020 | $0.01 |
| **Buffer (30%)** | Safety margin | 5,235,000 | 0.262 | $0.18 |
| **TOTAL** | All phases | **22,685,000** | **1.13 MATIC** | **$0.79** |

## Real-World Scenarios

### Best Case (Low Gas, Smooth Deployment)
- Gas price: 30 Gwei
- No retries needed
- **Cost: ~0.70 MATIC ($0.49)**

### Expected Case (Normal Conditions)
- Gas price: 50 Gwei
- 1-2 retry transactions
- **Cost: ~1.20 MATIC ($0.84)**

### Worst Case (High Gas, Multiple Retries)
- Gas price: 100 Gwei
- 3-4 retry transactions
- Network congestion
- **Cost: ~2.50 MATIC ($1.75)**

## How to Get MATIC for Amoy Testnet

### Official Faucets
1. **Polygon Faucet**: https://faucet.polygon.technology/
   - Requires wallet connection
   - Dispenses 0.5-1.0 MATIC per request
   - 24-hour cooldown

2. **Alchemy Faucet**: https://www.alchemy.com/faucets/polygon-amoy
   - No wallet connection required
   - Dispenses 0.5 MATIC
   - Daily limit

3. **QuickNode Faucet**: https://faucet.quicknode.com/polygon/amoy
   - Email verification
   - Dispenses 0.2 MATIC
   - Multiple requests allowed

### Strategy
Request from 2-3 faucets to get **1.5-2.0 MATIC** total.

## Cost Comparison

### vs Other Testnets
- **Ethereum Sepolia**: ~$5-10 (much more expensive)
- **Arbitrum Goerli**: ~$1-2
- **Polygon Amoy**: ~$0.79 ✅ (cheapest)

### vs Mainnet
- **Polygon Mainnet**: ~$0.80-1.50
- **Ethereum Mainnet**: ~$200-500
- Amoy testnet is virtually identical cost to Polygon mainnet!

## Optimization Tips

### Reduce Costs
1. **Deploy during low traffic** - Early morning UTC
2. **Set lower gas price** - 30 Gwei instead of 50
3. **Use local testing first** - Catch errors before mainnet
4. **Batch verify** - Use `--verify` flag during deployment

### Monitor Gas
```bash
# Check current gas price
cast gas-price --rpc-url https://rpc-amoy.polygon.technology

# Check wallet balance
cast balance YOUR_ADDRESS --rpc-url https://rpc-amoy.polygon.technology
```

## Summary

### 💰 What You Need
- **Minimum**: 1.5 MATIC ($1.05)
- **Recommended**: 2.0 MATIC ($1.40)
- **Safe**: 3.0 MATIC ($2.10)

### 📊 Expected Total Cost
- **Gas**: ~1.13 MATIC
- **USD equivalent**: ~$0.79
- **Time to deploy**: 15-25 minutes

### ✅ Action Items
1. Get 2.0 MATIC from faucets
2. Set PRIVATE_KEY environment variable
3. Run `./deploy.sh`
4. Monitor wallet balance during deployment

---

**Bottom Line**: You need approximately **2 MATIC** ($1.40) to safely deploy all contracts with a comfortable buffer. This is essentially **FREE** compared to Ethereum mainnet costs!
