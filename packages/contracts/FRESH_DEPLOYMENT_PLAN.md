# Fresh Deployment Plan - December 18, 2025

## ✅ Analysis Complete

**Finding**: Previous deployment addresses are not functional. All contracts need fresh deployment.

## 📋 Deployment Summary

### Contracts to Deploy (7 total)
1. ✅ **DeployLukasToken.s.sol** - LUKAS ERC20 token
2. ✅ **DeployLatAmBasketIndex.s.sol** - Price oracle (mock feeds)
3. ✅ **DeployStabilizerVault.s.sol** - Peg stabilization
4. ✅ **DeployUniswapV4.s.sol** - V4 core (PoolManager, routers)
5. ✅ **DeployLukasHook.s.sol** - Swap monitoring hook
6. ✅ **InitializePool.s.sol** - LUKAS/USDC pool initialization
7. ✅ **AddLiquidity.s.sol** - Initial liquidity (10k+10k)

### External Contracts (Use Existing)
- ✅ **USDC**: `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582` (Official Polygon Amoy)

## 🚀 Deployment Sequence

### Phase 1: Core Token
```bash
cd packages/contracts

# Deploy LukasToken
forge script script/DeployLukasToken.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Save address: LUKAS_TOKEN=0x...
```

### Phase 2: Oracle
```bash
# Deploy LatAmBasketIndex
forge script script/DeployLatAmBasketIndex.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Save address: BASKET_INDEX=0x...
```

### Phase 3: Stabilizer Vault
⚠️ **Before deploying**: Update `DeployStabilizerVault.s.sol` with addresses from Phase 1 & 2

```bash
# Edit script/DeployStabilizerVault.s.sol:
# - LUKAS_TOKEN = <address from Phase 1>
# - BASKET_INDEX = <address from Phase 2>

# Deploy StabilizerVault
forge script script/DeployStabilizerVault.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Save address: STABILIZER_VAULT=0x...

# Set vault as LukasToken minter
cast send $LUKAS_TOKEN \
  "setMinter(address)" $STABILIZER_VAULT \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Phase 4: Uniswap V4 Core
```bash
# Deploy PoolManager and routers
forge script script/DeployUniswapV4.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Save addresses:
# - POOL_MANAGER=0x...
# - SWAP_ROUTER=0x...
# - LIQUIDITY_ROUTER=0x...
```

### Phase 5: Hook & Pool
⚠️ **Before deploying**: Update `DeployLukasHook.s.sol` with all addresses

```bash
# Edit script/DeployLukasHook.s.sol:
# - BASKET_INDEX = <Phase 2>
# - STABILIZER_VAULT = <Phase 3>
# - LUKAS_TOKEN = <Phase 1>
# - USDC_TOKEN = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

# Deploy LukasHook
forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Save address: LUKAS_HOOK=0x...
```

⚠️ **Before initializing**: Update `InitializePool.s.sol` with PoolManager and Hook addresses

```bash
# Edit script/InitializePool.s.sol:
# - poolManager = <Phase 4>
# - hookAddr = <Phase 5>

# Initialize LUKAS/USDC pool
forge script script/InitializePool.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

### Phase 6: Add Liquidity
⚠️ **Before adding liquidity**: Approve tokens and update `AddLiquidity.s.sol`

```bash
# Approve LUKAS for PoolManager
cast send $LUKAS_TOKEN \
  "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

# Approve USDC for PoolManager
cast send $USDC_TOKEN \
  "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

# Edit script/AddLiquidity.s.sol:
# - poolManager = <Phase 4>

# Add liquidity
forge script script/AddLiquidity.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

## 📝 Post-Deployment Checklist

### 1. Update deployments.json
```json
{
  "networks": {
    "80002": {
      "name": "Polygon Amoy Testnet",
      "chainId": 80002,
      "contracts": {
        "stable": {
          "LukasToken": {
            "address": "<DEPLOYED>",
            "deployedAt": "<TIMESTAMP>",
            "deployer": "<ADDRESS>",
            "version": "1.0.0",
            "verified": true,
            "status": "stable"
          },
          "LatAmBasketIndex": {
            "address": "<DEPLOYED>",
            "deployedAt": "<TIMESTAMP>",
            "version": "1.0.0",
            "status": "stable"
          },
          "StabilizerVault": {
            "address": "<DEPLOYED>",
            "deployedAt": "<TIMESTAMP>",
            "version": "1.0.0",
            "status": "stable"
          },
          "PoolManager": {
            "address": "<DEPLOYED>",
            "deployedAt": "<TIMESTAMP>",
            "version": "1.0.0",
            "status": "stable"
          },
          "LukasHook": {
            "address": "<DEPLOYED>",
            "deployedAt": "<TIMESTAMP>",
            "version": "1.0.0",
            "status": "stable"
          },
          "USDC": {
            "address": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
            "version": "external",
            "verified": true,
            "status": "stable"
          }
        }
      }
    }
  }
}
```

### 2. Sync Deployments
```bash
cd /home/ed/Documents/HASH/lukas.lat
npm run sync-deployments
```

### 3. Test the System
```bash
# Test swap
cast send $POOL_MANAGER "swap(...)" \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

# Verify hook triggered
# Check StabilizerVault events
```

### 4. Release SDK v0.2.11
```bash
cd packages/lukas-sdk
npm run release
```

## 🔍 Verification Commands

```bash
# Verify LukasToken
cast call $LUKAS_TOKEN "name()(string)" --rpc-url $AMOY_RPC_URL
cast call $LUKAS_TOKEN "minter()(address)" --rpc-url $AMOY_RPC_URL

# Verify LatAmBasketIndex
cast call $BASKET_INDEX "getIndexUSD()(uint256)" --rpc-url $AMOY_RPC_URL

# Verify StabilizerVault
cast call $STABILIZER_VAULT "lukas()(address)" --rpc-url $AMOY_RPC_URL
cast call $STABILIZER_VAULT "basketIndex()(address)" --rpc-url $AMOY_RPC_URL

# Verify LukasHook
cast call $LUKAS_HOOK "getHookPermissions()(bytes32)" --rpc-url $AMOY_RPC_URL
```

## 💰 Cost Estimate

- LukasToken: ~$10-15 MATIC
- LatAmBasketIndex: ~$5-10 MATIC
- StabilizerVault: ~$10-15 MATIC
- Uniswap V4 (3 contracts): ~$25-35 MATIC
- LukasHook: ~$10-15 MATIC
- Initialization + Liquidity: ~$5-10 MATIC

**Total: ~$65-100 MATIC** (≈$50-80 USD at current prices)

## ⚠️ Important Notes

1. **No existing contracts to preserve** - Fresh deployment of everything
2. **Update scripts before each phase** - Addresses must be correct
3. **Verify on PolygonScan** - Use `--verify` flag for all deployments
4. **Save all addresses** - Keep a record for deployments.json
5. **Test after each phase** - Verify integration before proceeding

## 📚 Documentation

- Full details: [DEPLOYMENT_ANALYSIS.md](./DEPLOYMENT_ANALYSIS.md)
- Checklist: [../../DEPLOYMENT_CHECKLIST.md](../../DEPLOYMENT_CHECKLIST.md)
- V4 Guide: [../../UNISWAP_V4_DEPLOYMENT.md](../../UNISWAP_V4_DEPLOYMENT.md)

---

**Status**: ✅ Ready to deploy
**Date**: December 18, 2025
**Action**: Execute Phase 1 (Deploy LukasToken)
