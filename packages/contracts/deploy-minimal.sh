#!/bin/bash
# MINIMAL DEPLOYMENT - Skip LukasToken (already deployed)
# Saves ~0.075 MATIC

set -e

echo "=================================================="
echo "Lukas Protocol - MINIMAL Deployment"
echo "Using existing LukasToken: 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb"
echo "=================================================="

# Set existing addresses
LUKAS_TOKEN="0x63524b53983960231b7b86CDEdDf050Ceb9263Cb"
USDC_TOKEN="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"

if [ -z "$PRIVATE_KEY" ]; then
    echo "Loading from .env..."
    source .env
fi

export AMOY_RPC_URL="${POLYGON_AMOY_RPC_URL:-https://rpc-amoy.polygon.technology}"

echo "✅ Using LukasToken: $LUKAS_TOKEN"
echo "✅ Using USDC: $USDC_TOKEN"
echo ""

# Phase 1: Deploy LatAmBasketIndex
echo "=================================================="
echo "PHASE 1: Deploying LatAmBasketIndex (~0.150 MATIC)"
echo "=================================================="
forge script script/DeployLatAmBasketIndex.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  --sender $DEPLOYER_ADDRS \
  -vvv

read -p "Enter LatAmBasketIndex address: " BASKET_INDEX

# Update StabilizerVault script
sed -i "s|address constant LUKAS_TOKEN = address(0);|address constant LUKAS_TOKEN = $LUKAS_TOKEN;|" script/DeployStabilizerVault.s.sol
sed -i "s|address constant BASKET_INDEX = address(0);|address constant BASKET_INDEX = $BASKET_INDEX;|" script/DeployStabilizerVault.s.sol

# Phase 2: Deploy StabilizerVault
echo "=================================================="
echo "PHASE 2: Deploying StabilizerVault (~0.128 MATIC)"
echo "=================================================="
forge script script/DeployStabilizerVault.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  --sender $DEPLOYER_ADDRS \
  -vvv

read -p "Enter StabilizerVault address: " STABILIZER_VAULT

# Set minter
echo "Setting minter..."
cast send $LUKAS_TOKEN \
  "setMinter(address)" $STABILIZER_VAULT \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

# Phase 3: Deploy Uniswap V4
echo "=================================================="
echo "PHASE 3: Deploying Uniswap V4 (~0.350 MATIC)"
echo "=================================================="
forge script script/DeployUniswapV4.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --sender $DEPLOYER_ADDRS \
  --verify \
  -vvv

read -p "Enter PoolManager address: " POOL_MANAGER

# Update LukasHook script
sed -i "s|address constant BASKET_INDEX = address(0);|address constant BASKET_INDEX = $BASKET_INDEX;|" script/DeployLukasHook.s.sol
sed -i "s|address constant STABILIZER_VAULT = address(0);|address constant STABILIZER_VAULT = $STABILIZER_VAULT;|" script/DeployLukasHook.s.sol
sed -i "s|address constant LUKAS_TOKEN = address(0);|address constant LUKAS_TOKEN = $LUKAS_TOKEN;|" script/DeployLukasHook.s.sol

# Phase 4: Deploy LukasHook
echo "=================================================="
echo "PHASE 4: Deploying LukasHook (~0.125 MATIC)"
echo "=================================================="
forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --sender $DEPLOYER_ADDRS \
  --verify \
  -vvv

read -p "Enter LukasHook address: " LUKAS_HOOK

# Update InitializePool script
sed -i "s|address poolManager = address(0);|address poolManager = $POOL_MANAGER;|" script/InitializePool.s.sol
sed -i "s|address hookAddr = address(0);|address hookAddr = $LUKAS_HOOK;|" script/InitializePool.s.sol

# Phase 5: Initialize Pool
echo "=================================================="
echo "PHASE 5: Initializing Pool (~0.025 MATIC)"
echo "=================================================="
forge script script/InitializePool.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --sender $DEPLOYER_ADDRS \
  --broadcast \
  -vvv

# Approve tokens
echo "Approving tokens..."
cast send $LUKAS_TOKEN "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL --private-key $PRIVATE_KEY

cast send $USDC_TOKEN "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL --private-key $PRIVATE_KEY

# Update AddLiquidity script
sed -i "s|address poolManager = address(0);|address poolManager = $POOL_MANAGER;|" script/AddLiquidity.s.sol

# Phase 6: Add Liquidity
echo "=================================================="
echo "PHASE 6: Adding Liquidity (~0.020 MATIC)"
echo "=================================================="
forge script script/AddLiquidity.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --sender $DEPLOYER_ADDRS \
  --broadcast \
  -vvv

echo ""
echo "=================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================================="
echo "Deployed Addresses:"
echo "  LukasToken:       $LUKAS_TOKEN (EXISTING)"
echo "  LatAmBasketIndex: $BASKET_INDEX"
echo "  StabilizerVault:  $STABILIZER_VAULT"
echo "  PoolManager:      $POOL_MANAGER"
echo "  LukasHook:        $LUKAS_HOOK"
echo ""
echo "MATIC Saved: ~0.075 (by reusing LukasToken)"
echo "Total Cost: ~0.80 MATIC"
echo "=================================================="
