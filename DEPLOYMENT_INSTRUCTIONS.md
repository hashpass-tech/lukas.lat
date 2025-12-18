# 🚀 Lukas Protocol Deployment - Step by Step

## ⚠️ IMPORTANT: Set Your Private Key

Before deployment, you MUST set your private key. This is required to sign transactions.

### Option 1: Export Environment Variable (Recommended)

```bash
# Set your private key (without 0x prefix)
export PRIVATE_KEY="your_private_key_here"

# Verify it's set
echo $PRIVATE_KEY
```

### Option 2: Create .env File

Create `packages/contracts/.env`:
```
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_polygonscan_api_key
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

Then load it:
```bash
source .env
```

## 📋 Pre-Deployment Checklist

Before running deployment, ensure:

- [ ] Private key is set: `echo $PRIVATE_KEY`
- [ ] Wallet has MATIC: Check on [Amoy PolygonScan](https://amoy.polygonscan.com/)
- [ ] Need MATIC? Get from [Polygon Faucet](https://faucet.polygon.technology/)
- [ ] Foundry installed: `forge --version`
- [ ] RPC URL accessible: `curl https://rpc-amoy.polygon.technology`

## 🎯 Phase 1: Deploy Core Contracts

### Step 1: Set Environment Variables

```bash
# Navigate to contracts directory
cd packages/contracts

# Set private key
export PRIVATE_KEY="your_private_key_without_0x"

# Set API key for verification (optional but recommended)
export ETHERSCAN_API_KEY="your_polygonscan_api_key"

# Verify
echo "Private Key: $PRIVATE_KEY"
echo "API Key: $ETHERSCAN_API_KEY"
```

### Step 2: Deploy Minimal Contracts

```bash
# From packages/contracts directory
forge script script/DeployMinimalAmoy.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  --verify \
  -vvvv
```

### Expected Output

```
🚀 Deploying minimal Lukas Protocol contracts on Amoy...

📦 Deploying LatAmBasketIndex Oracle...
✅ Oracle deployed at: 0x...

📦 Deploying StabilizerVault...
✅ Vault deployed at: 0x...

✅ Deployment Complete!

📝 Update deployments.json:
  LatAmBasketIndex: 0x...
  StabilizerVault: 0x...
```

### Step 3: Save Deployment Addresses

Copy the addresses from the output and update `packages/contracts/deployments.json`:

```json
{
  "networks": {
    "80002": {
      "name": "Polygon Amoy Testnet",
      "chainId": 80002,
      "rpcUrl": "https://rpc-amoy.polygon.technology",
      "blockExplorer": "https://amoy.polygonscan.com",
      "contracts": {
        "stable": {
          "LukasToken": {
            "address": "0xaee0f26589a21ba4547765f630075262f330f1cb",
            "status": "stable"
          },
          "USDC": {
            "address": "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
            "status": "stable"
          },
          "LatAmBasketIndex": {
            "address": "0x[PASTE_ORACLE_ADDRESS_HERE]",
            "deployedAt": "2025-12-18T...",
            "status": "stable"
          },
          "StabilizerVault": {
            "address": "0x[PASTE_VAULT_ADDRESS_HERE]",
            "deployedAt": "2025-12-18T...",
            "status": "stable"
          }
        }
      }
    }
  }
}
```

## ✅ Phase 1 Testing

### Test 1: Verify Oracle Deployment

```bash
# Check if oracle is deployed
cast call 0x[ORACLE_ADDRESS] "getCurrentPrice()" \
  --rpc-url https://rpc-amoy.polygon.technology
```

Expected output: `1000000000000000000` (1 USD in wei)

### Test 2: Verify Vault Deployment

```bash
# Check if vault is deployed
cast call 0x[VAULT_ADDRESS] "getVaultInfo()" \
  --rpc-url https://rpc-amoy.polygon.technology
```

Expected output: Tuple with vault parameters

### Test 3: Check Peg Status

```bash
# Get peg status from oracle
cast call 0x[ORACLE_ADDRESS] "getPegStatus()" \
  --rpc-url https://rpc-amoy.polygon.technology
```

Expected output: Pool price, fair price, deviation, peg status

## 🔄 Phase 2: Deploy Uniswap V4 Pool

After Phase 1 is complete and tested, proceed to Phase 2:

```bash
# Deploy V4 core contracts
forge script script/DeployUniswapV4.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  -vvvv

# Deploy LukasHook
forge script script/DeployLukasHook.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  --verify \
  -vvvv

# Initialize pool
forge script script/InitializePool.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  -vvvv

# Add liquidity
forge script script/AddLiquidity.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  -vvvv
```

## 🧪 Phase 2 Testing

### Test Swap Execution

```bash
# Approve USDC for swap
cast send 0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582 \
  "approve(address,uint256)" \
  0x[SWAP_ROUTER] \
  "10000000" \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key $PRIVATE_KEY

# Execute swap
cast send 0x[SWAP_ROUTER] \
  "swap(...)" \
  ... \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key $PRIVATE_KEY
```

### Test Hook Triggers

Monitor events:
```bash
# Watch for StabilizationTriggered events
cast logs \
  --address 0x[LUKAS_HOOK] \
  --rpc-url https://rpc-amoy.polygon.technology
```

## 📊 Deployment Status Tracking

After each phase, update this checklist:

### Phase 1: Core Contracts
- [ ] Oracle deployed
- [ ] Vault deployed
- [ ] Addresses saved in deployments.json
- [ ] Oracle price feed verified
- [ ] Vault info retrieved
- [ ] Peg status checked

### Phase 2: Uniswap V4
- [ ] PoolManager deployed
- [ ] SwapRouter deployed
- [ ] LukasHook deployed
- [ ] Pool initialized
- [ ] Liquidity added
- [ ] Swap tested
- [ ] Hook events verified

### Phase 3: Web App
- [ ] deployments.json updated
- [ ] SDK configured
- [ ] SwapWidget tested
- [ ] Web app deployed

## 🆘 Troubleshooting

### "PRIVATE_KEY not set"
```bash
export PRIVATE_KEY="your_key"
echo $PRIVATE_KEY  # Verify it's set
```

### "Insufficient funds"
Get MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

### "RPC connection failed"
Try alternative RPC:
```bash
export AMOY_RPC_URL="https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY"
```

### "Contract verification failed"
Verify manually on [PolygonScan](https://amoy.polygonscan.com/)

### "Transaction reverted"
Check:
1. Sufficient gas
2. Correct contract addresses
3. Proper permissions

## 📞 Next Steps

1. **Set PRIVATE_KEY** - Required for deployment
2. **Run Phase 1** - Deploy core contracts
3. **Test Phase 1** - Verify oracle and vault
4. **Run Phase 2** - Deploy Uniswap V4
5. **Test Phase 2** - Verify swaps and hooks
6. **Update Web App** - Use deployed addresses
7. **Deploy Web App** - Go live

## 📚 Documentation

- [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) - Quick reference
- [MINIMAL_DEPLOYMENT_GUIDE.md](./MINIMAL_DEPLOYMENT_GUIDE.md) - Detailed guide
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Overview

---

**Ready to deploy? Set your PRIVATE_KEY and run Phase 1!** 🚀
