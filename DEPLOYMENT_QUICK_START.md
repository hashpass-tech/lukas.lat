# Quick Start: Deploy Lukas Protocol on Amoy Testnet

## 🚀 5-Minute Deployment

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Set environment
export PRIVATE_KEY="your_wallet_private_key"
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
export ETHERSCAN_API_KEY="your_polygonscan_key"
```

### Deploy Minimal Contracts (Oracle + Vault)

```bash
cd packages/contracts

# Deploy
forge script script/DeployMinimalAmoy.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Output:**
```
✅ Oracle deployed at: 0x...
✅ Vault deployed at: 0x...
```

### Update deployments.json

Copy the addresses from deployment output to `packages/contracts/deployments.json`:

```json
{
  "networks": {
    "80002": {
      "contracts": {
        "stable": {
          "LatAmBasketIndex": {
            "address": "0x...",  // From deployment
            "status": "stable"
          },
          "StabilizerVault": {
            "address": "0x...",  // From deployment
            "status": "stable"
          }
        }
      }
    }
  }
}
```

### Deploy Uniswap V4 Pool

```bash
# Clone V4 core
git clone https://github.com/Uniswap/v4-core.git
cd v4-core
forge install

# Deploy PoolManager
forge script script/DeployAmoy.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

### Deploy LukasHook

```bash
cd packages/contracts

# Update addresses in script/DeployLukasHook.s.sol with:
# - POOL_MANAGER from V4 deployment
# - STABILIZER_VAULT from Step 1
# - ORACLE from Step 1

forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Initialize Pool

```bash
# Update script/InitializePool.s.sol with hook address
forge script script/InitializePool.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

### Add Liquidity

```bash
# Update script/AddLiquidity.s.sol with pool address
forge script script/AddLiquidity.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

## ✅ Verification

### Check Oracle
```bash
cast call 0x[ORACLE_ADDRESS] "getCurrentPrice()" --rpc-url $AMOY_RPC_URL
```

### Check Vault
```bash
cast call 0x[VAULT_ADDRESS] "getVaultInfo()" --rpc-url $AMOY_RPC_URL
```

### Check Pool
```bash
cast call 0x[POOL_MANAGER] "getSlot0(bytes32)" --rpc-url $AMOY_RPC_URL
```

## 📋 Deployment Addresses

After deployment, save these addresses:

```
LUKAS_TOKEN: 0xaee0f26589a21ba4547765f630075262f330f1cb
USDC_TOKEN: 0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582
ORACLE: 0x...
VAULT: 0x...
POOL_MANAGER: 0x...
SWAP_ROUTER: 0x...
LUKAS_HOOK: 0x...
POOL: 0x...
```

## 🧪 Test Functionality

### Test 1: Get Price
```bash
cast call 0x[ORACLE] "getCurrentPrice()" --rpc-url $AMOY_RPC_URL
```

### Test 2: Check Peg
```bash
cast call 0x[ORACLE] "getPegStatus()" --rpc-url $AMOY_RPC_URL
```

### Test 3: Execute Swap
```bash
# Approve USDC
cast send 0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582 \
  "approve(address,uint256)" \
  0x[SWAP_ROUTER] \
  "10000000" \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

# Execute swap
cast send 0x[SWAP_ROUTER] \
  "swap(tuple,tuple,bytes)" \
  "(address,address,uint24,int24,address)" \
  "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582" \
  "0xaee0f26589a21ba4547765f630075262f330f1cb" \
  "3000" \
  "60" \
  "0x[LUKAS_HOOK]" \
  "(bool,int256,uint160)" \
  "true" \
  "10000000" \
  "0" \
  "0x" \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY
```

## 🎯 Next Steps

1. ✅ Deploy minimal contracts
2. ✅ Deploy Uniswap V4 pool
3. ✅ Initialize pool with hook
4. ✅ Add liquidity
5. Test swap functionality
6. Update web app with addresses
7. Deploy web app
8. End-to-end testing

## 📚 Full Documentation

- [MINIMAL_DEPLOYMENT_GUIDE.md](./MINIMAL_DEPLOYMENT_GUIDE.md) - Detailed guide
- [UNISWAP_V4_DEPLOYMENT.md](./UNISWAP_V4_DEPLOYMENT.md) - V4 specifics
- [SDK_IMPLEMENTATION_STATUS.md](./SDK_IMPLEMENTATION_STATUS.md) - SDK status

## 🆘 Troubleshooting

**"PRIVATE_KEY not set"**
```bash
export PRIVATE_KEY="your_private_key_without_0x"
```

**"RPC connection failed"**
```bash
# Use alternative RPC
export AMOY_RPC_URL="https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY"
```

**"Insufficient gas"**
```bash
# Get MATIC from faucet
# https://faucet.polygon.technology/
```

**"Contract verification failed"**
```bash
# Verify manually on PolygonScan
# https://amoy.polygonscan.com/
```

## 📞 Support

For issues, check:
1. [MINIMAL_DEPLOYMENT_GUIDE.md](./MINIMAL_DEPLOYMENT_GUIDE.md#troubleshooting)
2. [Uniswap V4 Docs](https://docs.uniswap.org/contracts/v4/overview)
3. [Foundry Docs](https://book.getfoundry.sh/)
