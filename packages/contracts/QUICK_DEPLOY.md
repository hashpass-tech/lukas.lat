# Quick Deployment Guide

## Prerequisites

You need:
1. **Private Key** - Your deployer wallet private key
2. **MATIC** - At least 1 MATIC in your wallet for gas (~$0.50-1.00 USD)
3. **RPC Access** - Polygon Amoy testnet RPC (default provided)
4. **PolygonScan API Key** (optional, for contract verification)

## Setup

### 1. Set Environment Variables

```bash
cd /home/ed/Documents/HASH/lukas.lat/packages/contracts

# Required: Your deployer private key (without 0x prefix)
export PRIVATE_KEY="your_private_key_here"

# Optional: Custom RPC (default: https://rpc-amoy.polygon.technology)
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"

# Optional: For contract verification
export ETHERSCAN_API_KEY="your_polygonscan_api_key"
```

### 2. Run Deployment

```bash
./deploy.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Deploy all 7 contracts in sequence
- ✅ Automatically update script addresses
- ✅ Set proper permissions
- ✅ Initialize pool
- ✅ Add liquidity
- ✅ Print all deployed addresses

## Manual Deployment (Alternative)

If you prefer manual control, follow these steps:

### Phase 1: Deploy LukasToken
```bash
forge script script/DeployLukasToken.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```
Save the LukasToken address.

### Phase 2: Deploy LatAmBasketIndex
```bash
forge script script/DeployLatAmBasketIndex.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```
Save the LatAmBasketIndex address.

### Phase 3: Deploy StabilizerVault
1. Edit `script/DeployStabilizerVault.s.sol`
2. Update `LUKAS_TOKEN` and `BASKET_INDEX` addresses
3. Deploy:
```bash
forge script script/DeployStabilizerVault.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```
4. Set minter:
```bash
cast send $LUKAS_TOKEN \
  "setMinter(address)" $STABILIZER_VAULT \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Phase 4: Deploy Uniswap V4
```bash
forge script script/DeployUniswapV4.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```
Save the PoolManager address.

### Phase 5: Deploy LukasHook
1. Edit `script/DeployLukasHook.s.sol`
2. Update all addresses
3. Deploy:
```bash
forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Phase 6: Initialize Pool
1. Edit `script/InitializePool.s.sol`
2. Update PoolManager and Hook addresses
3. Initialize:
```bash
forge script script/InitializePool.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

### Phase 7: Add Liquidity
1. Approve tokens:
```bash
cast send $LUKAS_TOKEN "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL --private-key $PRIVATE_KEY

cast send 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582 "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL --private-key $PRIVATE_KEY
```

2. Edit `script/AddLiquidity.s.sol` with PoolManager address

3. Add liquidity:
```bash
forge script script/AddLiquidity.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

## Post-Deployment

1. **Update deployments.json** with all addresses
2. **Run sync**: `npm run sync-deployments`
3. **Test**: Execute a test swap
4. **Release SDK**: Publish v0.2.11

## Troubleshooting

### "PRIVATE_KEY not set"
```bash
export PRIVATE_KEY="your_key_without_0x"
```

### "Insufficient funds"
Your wallet needs MATIC. Get some from:
- Polygon Amoy Faucet: https://faucet.polygon.technology/

### "Contract verification failed"
Set PolygonScan API key:
```bash
export ETHERSCAN_API_KEY="your_api_key"
```

### RPC errors
Try alternative RPC:
```bash
export AMOY_RPC_URL="https://polygon-amoy.g.alchemy.com/v2/YOUR-API-KEY"
```

## Verification

Check deployed contracts:
```bash
# LukasToken
cast call $LUKAS_TOKEN "name()(string)" --rpc-url $AMOY_RPC_URL

# Oracle
cast call $BASKET_INDEX "getIndexUSD()(uint256)" --rpc-url $AMOY_RPC_URL

# Vault
cast call $STABILIZER_VAULT "lukas()(address)" --rpc-url $AMOY_RPC_URL
```

---

**Ready to deploy?** Run `./deploy.sh`
