#!/bin/bash

# LUKAS Pool Deployment Script
# This script initializes the pool and adds liquidity

set -e

echo "🚀 LUKAS/USDC Pool Deployment"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}✗ PRIVATE_KEY environment variable not set${NC}"
    echo ""
    echo "Please set your private key:"
    echo "  export PRIVATE_KEY=your_private_key_here"
    echo ""
    echo "Or create a .env file in packages/contracts with:"
    echo "  PRIVATE_KEY=your_private_key_here"
    exit 1
fi

echo -e "${GREEN}✓ PRIVATE_KEY is set${NC}"

# Set RPC URL
AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
echo -e "${GREEN}✓ Using Amoy RPC: $AMOY_RPC_URL${NC}"
echo ""

# Navigate to contracts directory
cd packages/contracts

echo "Step 1: Checking current pool status..."
echo "----------------------------------------"
forge script script/CheckPoolStatus.s.sol:CheckPoolStatus \
  --rpc-url $AMOY_RPC_URL

echo ""
echo "Step 2: Initializing pool..."
echo "----------------------------------------"
forge script script/InitializeLukasPoolCorrect.s.sol:InitializeLukasPoolCorrect \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pool initialized successfully${NC}"
else
    echo -e "${YELLOW}⚠ Pool may already be initialized (this is OK)${NC}"
fi

echo ""
echo "Step 3: Adding liquidity..."
echo "----------------------------------------"
forge script script/ProvideLiquidityCorrect.s.sol:ProvideLiquidityCorrect \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Liquidity added successfully${NC}"
else
    echo -e "${RED}✗ Failed to add liquidity${NC}"
    exit 1
fi

echo ""
echo "Step 4: Verifying deployment..."
echo "----------------------------------------"
forge script script/CheckPoolStatus.s.sol:CheckPoolStatus \
  --rpc-url $AMOY_RPC_URL

echo ""
echo -e "${GREEN}=============================="
echo "✓ Deployment Complete!"
echo -e "==============================${NC}"
echo ""
echo "Next steps:"
echo "1. View pool on Polygonscan:"
echo "   https://amoy.polygonscan.com/address/0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E"
echo ""
echo "2. Test a swap:"
echo "   cd packages/contracts"
echo "   forge script script/TestSwap.s.sol:TestSwap --rpc-url $AMOY_RPC_URL --broadcast"
echo ""
echo "3. Start the web UI:"
echo "   cd apps/web"
echo "   npm run dev"
echo ""
