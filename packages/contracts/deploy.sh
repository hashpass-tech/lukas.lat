#!/bin/bash
# Deployment Execution Script
# Run this script to deploy all Lukas Protocol contracts

set -e  # Exit on any error

echo "=================================================="
echo "Lukas Protocol - Fresh Deployment to Polygon Amoy"
echo "=================================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ ERROR: PRIVATE_KEY environment variable not set"
    echo ""
    echo "Please set your deployment private key:"
    echo "  export PRIVATE_KEY=your_private_key_here"
    echo ""
    exit 1
fi

if [ -z "$AMOY_RPC_URL" ]; then
    echo "⚠️  WARNING: AMOY_RPC_URL not set, using default"
    export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
fi

if [ -z "$ETHERSCAN_API_KEY" ]; then
    echo "⚠️  WARNING: ETHERSCAN_API_KEY not set"
    echo "Contracts will be deployed but not verified"
    VERIFY_FLAG=""
else
    VERIFY_FLAG="--verify"
fi

echo "✅ Prerequisites checked"
echo ""
echo "Configuration:"
echo "  RPC URL: $AMOY_RPC_URL"
echo "  Verify: ${VERIFY_FLAG:-No}"
echo ""
read -p "Press Enter to start deployment or Ctrl+C to cancel..."
echo ""

# Phase 1: Deploy LukasToken
echo "=================================================="
echo "PHASE 1: Deploying LukasToken"
echo "=================================================="
forge script script/DeployLukasToken.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  $VERIFY_FLAG \
  -vvvv

echo ""
echo "✅ Phase 1 complete!"
echo ""
echo "Please update the following addresses in deployment scripts:"
read -p "Enter LukasToken address: " LUKAS_TOKEN
echo "LUKAS_TOKEN=$LUKAS_TOKEN"
echo ""

# Phase 2: Deploy LatAmBasketIndex
echo "=================================================="
echo "PHASE 2: Deploying LatAmBasketIndex"
echo "=================================================="
forge script script/DeployLatAmBasketIndex.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  $VERIFY_FLAG \
  -vvvv

echo ""
echo "✅ Phase 2 complete!"
echo ""
read -p "Enter LatAmBasketIndex address: " BASKET_INDEX
echo "BASKET_INDEX=$BASKET_INDEX"
echo ""

# Update DeployStabilizerVault.s.sol
echo "=================================================="
echo "Updating DeployStabilizerVault.s.sol with addresses..."
echo "=================================================="
sed -i "s/address constant LUKAS_TOKEN = address(0);/address constant LUKAS_TOKEN = $LUKAS_TOKEN;/" script/DeployStabilizerVault.s.sol
sed -i "s/address constant BASKET_INDEX = address(0);/address constant BASKET_INDEX = $BASKET_INDEX;/" script/DeployStabilizerVault.s.sol
echo "✅ Updated!"
echo ""

# Phase 3: Deploy StabilizerVault
echo "=================================================="
echo "PHASE 3: Deploying StabilizerVault"
echo "=================================================="
forge script script/DeployStabilizerVault.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  $VERIFY_FLAG \
  -vvvv

echo ""
echo "✅ Phase 3 complete!"
echo ""
read -p "Enter StabilizerVault address: " STABILIZER_VAULT
echo "STABILIZER_VAULT=$STABILIZER_VAULT"
echo ""

# Set StabilizerVault as minter
echo "=================================================="
echo "Setting StabilizerVault as LukasToken minter..."
echo "=================================================="
cast send $LUKAS_TOKEN \
  "setMinter(address)" $STABILIZER_VAULT \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

echo "✅ Minter set!"
echo ""

# Phase 4: Deploy Uniswap V4
echo "=================================================="
echo "PHASE 4: Deploying Uniswap V4 Core"
echo "=================================================="
forge script script/DeployUniswapV4.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  $VERIFY_FLAG \
  -vvvv

echo ""
echo "✅ Phase 4 complete!"
echo ""
read -p "Enter PoolManager address: " POOL_MANAGER
echo "POOL_MANAGER=$POOL_MANAGER"
echo ""

# Update DeployLukasHook.s.sol
echo "=================================================="
echo "Updating DeployLukasHook.s.sol with addresses..."
echo "=================================================="
sed -i "s/address constant BASKET_INDEX = address(0);/address constant BASKET_INDEX = $BASKET_INDEX;/" script/DeployLukasHook.s.sol
sed -i "s/address constant STABILIZER_VAULT = address(0);/address constant STABILIZER_VAULT = $STABILIZER_VAULT;/" script/DeployLukasHook.s.sol
sed -i "s/address constant LUKAS_TOKEN = address(0);/address constant LUKAS_TOKEN = $LUKAS_TOKEN;/" script/DeployLukasHook.s.sol
echo "✅ Updated!"
echo ""

# Phase 5: Deploy LukasHook
echo "=================================================="
echo "PHASE 5: Deploying LukasHook"
echo "=================================================="
forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  $VERIFY_FLAG \
  -vvvv

echo ""
echo "✅ Phase 5 complete!"
echo ""
read -p "Enter LukasHook address: " LUKAS_HOOK
echo "LUKAS_HOOK=$LUKAS_HOOK"
echo ""

# Update InitializePool.s.sol
echo "=================================================="
echo "Updating InitializePool.s.sol with addresses..."
echo "=================================================="
sed -i "s/address poolManager = address(0);/address poolManager = $POOL_MANAGER;/" script/InitializePool.s.sol
sed -i "s/address hookAddr = address(0);/address hookAddr = $LUKAS_HOOK;/" script/InitializePool.s.sol
echo "✅ Updated!"
echo ""

# Phase 6: Initialize Pool
echo "=================================================="
echo "PHASE 6: Initializing LUKAS/USDC Pool"
echo "=================================================="
forge script script/InitializePool.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv

echo ""
echo "✅ Phase 6 complete!"
echo ""

# Approve tokens
echo "=================================================="
echo "Approving tokens for liquidity..."
echo "=================================================="
USDC_TOKEN="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"

echo "Approving LUKAS..."
cast send $LUKAS_TOKEN \
  "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

echo "Approving USDC..."
cast send $USDC_TOKEN \
  "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

echo "✅ Tokens approved!"
echo ""

# Update AddLiquidity.s.sol
echo "=================================================="
echo "Updating AddLiquidity.s.sol with addresses..."
echo "=================================================="
sed -i "s/address poolManager = address(0);/address poolManager = $POOL_MANAGER;/" script/AddLiquidity.s.sol
echo "✅ Updated!"
echo ""

# Phase 7: Add Liquidity
echo "=================================================="
echo "PHASE 7: Adding Initial Liquidity"
echo "=================================================="
forge script script/AddLiquidity.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv

echo ""
echo "✅ Phase 7 complete!"
echo ""

# Summary
echo "=================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================================="
echo ""
echo "Deployed Addresses:"
echo "  LukasToken:       $LUKAS_TOKEN"
echo "  LatAmBasketIndex: $BASKET_INDEX"
echo "  StabilizerVault:  $STABILIZER_VAULT"
echo "  PoolManager:      $POOL_MANAGER"
echo "  LukasHook:        $LUKAS_HOOK"
echo "  USDC:             $USDC_TOKEN"
echo ""
echo "Next Steps:"
echo "1. Update deployments.json with these addresses"
echo "2. Run: npm run sync-deployments"
echo "3. Test swap functionality"
echo "4. Release SDK v0.2.11"
echo ""
echo "=================================================="
