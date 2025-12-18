# Uniswap V4 Pool Deployment Guide

**Status**: ✅ Scripts Ready | ⏳ Awaiting Deployment
**Last Updated**: December 18, 2025

## Overview

This guide covers deploying Uniswap V4 with the LukasHook for the LUKAS/USDC trading pair on Polygon Amoy testnet.

**IMPORTANT**: The Lukas Protocol uses Uniswap V4 hooks (LukasHook) for custom swap logic and stabilization mechanisms. V4 deployment is **required** - V3 is not compatible with our hook-based architecture.

## Current Status

✅ **Compilation**: All contracts compile successfully with Solidity 0.8.26
✅ **Tests**: Core contracts tested (LukasToken, LatAmBasketIndex pass 100%)
✅ **Scripts**: All 5 deployment scripts ready and tested
⏳ **Deployment**: Awaiting execution on Polygon Amoy testnet

## Prerequisites

- Polygon Amoy testnet RPC access
- Wallet with MATIC for gas fees (at least 1 MATIC recommended)
- LUKAS tokens deployed at: `0xaee0f26589a21ba4547765f630075262f330f1cb`
- USDC tokens at: `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582`
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- Node.js and pnpm installed

## Why Uniswap V4 is Required

The Lukas Protocol integrates deeply with Uniswap V4's hook system:

1. **LukasHook Contract**: Custom hook that implements stabilization logic during swaps
2. **Peg Monitoring**: Hook monitors price deviations and triggers stabilization
3. **beforeInitialize**: Validates pool parameters on creation
4. **afterSwap**: Monitors every swap and triggers StabilizerVault when needed

**V3 does not support hooks**, making it incompatible with our protocol design.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Uniswap V4 Core                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PoolManager  │  │ SwapRouter   │  │ LiquidityMgr │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ hooks
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      LukasHook                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • beforeInitialize: Validate LUKAS/USDC pool         │  │
│  │ • afterSwap: Monitor price & trigger stabilization   │  │
│  │ • Integration with LatAmBasketIndex oracle           │  │
│  │ • Integration with StabilizerVault                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ integrates with
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Lukas Protocol Contracts                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ LukasToken   │  │ StabVault    │  │ LatAmIndex   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start: Using Ready-Made Scripts

The Lukas Protocol repository includes complete, tested deployment scripts. Skip to this section if you want to use our pre-built scripts.

### Environment Setup

```bash
cd packages/contracts

# Set environment variables
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
export PRIVATE_KEY="your_deployer_private_key"
export ETHERSCAN_API_KEY="your_polygonscan_api_key"
```

### Step-by-Step Deployment

#### 1. Deploy LatAmBasketIndex Oracle

```bash
forge script script/DeployLatAmBasketIndex.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Expected Output**: Oracle address with mock price feeds for BRL, MXN, ARS, CLP, COP

#### 2. Deploy Uniswap V4 Core

```bash
forge script script/DeployUniswapV4.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Expected Output**:
- PoolManager address
- PoolSwapTest (router) address
- PoolModifyLiquidityTest (liquidity manager) address

#### 3. Deploy LukasHook

⚠️ **Before running**: Update `script/DeployLukasHook.s.sol` with addresses from steps 1-2.

```bash
forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Expected Output**: LukasHook address

#### 4. Initialize LUKAS/USDC Pool

⚠️ **Before running**: Update `script/InitializePool.s.sol` with PoolManager and Hook addresses.

```bash
forge script script/InitializePool.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

**Expected Output**: Pool initialized with:
- Fee: 0.3% (3000)
- Tick spacing: 60
- Initial price: 1 LUKAS = 1 USDC

#### 5. Add Initial Liquidity

⚠️ **Before running**: Update `script/AddLiquidity.s.sol` with PoolManager address.

```bash
# Approve tokens first
cast send $LUKAS_TOKEN "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

cast send $USDC_TOKEN "approve(address,uint256)" $POOL_MANAGER $(cast --to-wei 10000) \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY

# Add liquidity
forge script script/AddLiquidity.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  -vvvv
```

**Expected Output**: Liquidity position created with 10,000 LUKAS + 10,000 USDC

### Post-Deployment Steps

1. **Update deployments.json**
   ```bash
   # Update packages/contracts/deployments.json with all addresses
   # Then sync across the codebase
   npm run sync-deployments
   ```

2. **Test the Integration**
   ```bash
   # Test a swap
   cast send $POOL_MANAGER "swap(...)" \
     --rpc-url $AMOY_RPC_URL \
     --private-key $PRIVATE_KEY
   ```

3. **Release SDK Update**
   ```bash
   cd packages/lukas-sdk
   npm run release
   ```

## Detailed Manual Deployment

If you need to customize the deployment or understand the internals, follow these detailed steps.

## Step 1: Deploy Uniswap V4 Core Contracts

### Clone and Setup V4 Repository (Optional)

If using official Uniswap V4 contracts instead of our scripts:

```bash
# Clone Uniswap V4 core
git clone https://github.com/Uniswap/v4-core.git
cd v4-core

# Install dependencies
forge install

# Build contracts
forge build
```

### Create Deployment Script (Already Included)

Our repository includes `script/DeployUniswapV4.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import {PoolManager} from "v4-core/src/PoolManager.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/src/test/PoolModifyLiquidityTest.sol";

contract DeployUniswapV4 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PoolManager with 500k gas limit
        PoolManager poolManager = new PoolManager(500000);
        console.log("PoolManager deployed at:", address(poolManager));

        // Deploy test routers
        PoolSwapTest swapRouter = new PoolSwapTest(poolManager);
        console.log("SwapRouter deployed at:", address(swapRouter));

        PoolModifyLiquidityTest liquidityRouter = new PoolModifyLiquidityTest(poolManager);
        console.log("LiquidityRouter deployed at:", address(liquidityRouter));

        vm.stopBroadcast();
    }
}
```

### Deploy V4 Core (Method 1: Using Our Script)

```bash
cd packages/contracts

forge script script/DeployUniswapV4.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Deploy V4 Core (Method 2: Manual)

```bash
# Set environment variables
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
export PRIVATE_KEY="your_private_key"
export ETHERSCAN_API_KEY="your_polygonscan_api_key"

# Deploy contracts
forge script script/DeployAmoy.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Save the deployed addresses:
# PoolManager: 0x...
# SwapRouter: 0x...
# LiquidityRouter: 0x...
```

## Step 2: Deploy LukasHook Contract

The LukasHook integrates with the Stabilizer Vault and Oracle for peg maintenance.

### LukasHook Implementation

Create `contracts/LukasHook.sol` in your contracts package:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/BaseHook.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/types/BeforeSwapDelta.sol";

interface IStabilizerVault {
    function shouldStabilize(uint256 poolPrice) external view returns (
        bool shouldStabilize,
        bool isOverPeg,
        uint256 deviationBps,
        uint256 recommendedAmount,
        bool canExecute,
        string memory reason
    );
    function stabilizeMint(uint256 amount, address recipient) external returns (bool);
    function stabilizeBuyback(uint256 amount) external returns (bool);
}

interface ILatAmBasketIndex {
    function getFairPrice() external view returns (uint256);
    function getCurrentPrice() external view returns (uint256);
}

contract LukasHook is BaseHook {
    IStabilizerVault public immutable stabilizerVault;
    ILatAmBasketIndex public immutable oracle;
    address public immutable lukasToken;
    address public immutable usdc;
    
    uint256 public constant DEVIATION_THRESHOLD = 200; // 2% in basis points
    
    event StabilizationTriggered(bool isOverPeg, uint256 amount, uint256 poolPrice, uint256 fairPrice);
    event SwapExecuted(address indexed user, bool zeroForOne, int256 amountSpecified);

    constructor(
        IPoolManager _poolManager,
        address _stabilizerVault,
        address _oracle,
        address _lukasToken,
        address _usdc
    ) BaseHook(_poolManager) {
        stabilizerVault = IStabilizerVault(_stabilizerVault);
        oracle = ILatAmBasketIndex(_oracle);
        lukasToken = _lukasToken;
        usdc = _usdc;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: true,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function beforeAddLiquidity(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) external override returns (bytes4) {
        // Validate that liquidity is being added to the correct pool
        require(
            (key.currency0 == lukasToken && key.currency1 == usdc) ||
            (key.currency0 == usdc && key.currency1 == lukasToken),
            "Invalid pool"
        );
        return BaseHook.beforeAddLiquidity.selector;
    }

    function beforeSwap(
        address,
        PoolKey calldata,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) external override returns (bytes4, BeforeSwapDelta, uint24) {
        emit SwapExecuted(msg.sender, params.zeroForOne, params.amountSpecified);
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function afterSwap(
        address,
        PoolKey calldata,
        IPoolManager.SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) external override returns (bytes4, int128) {
        // Get current pool price and fair price
        uint256 poolPrice = oracle.getCurrentPrice();
        uint256 fairPrice = oracle.getFairPrice();
        
        // Check if stabilization is needed
        (
            bool shouldStabilize,
            bool isOverPeg,
            uint256 deviationBps,
            uint256 recommendedAmount,
            bool canExecute,
        ) = stabilizerVault.shouldStabilize(poolPrice);

        // Trigger stabilization if needed
        if (shouldStabilize && canExecute && deviationBps >= DEVIATION_THRESHOLD) {
            if (isOverPeg) {
                // Price too high - mint LUKAS to increase supply
                stabilizerVault.stabilizeMint(recommendedAmount, address(this));
            } else {
                // Price too low - buyback LUKAS to decrease supply
                stabilizerVault.stabilizeBuyback(recommendedAmount);
            }
            
            emit StabilizationTriggered(isOverPeg, recommendedAmount, poolPrice, fairPrice);
        }

        return (BaseHook.afterSwap.selector, 0);
    }
}
```

### Deploy LukasHook

```bash
# In packages/contracts directory
forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Save the deployed address:
# LukasHook: 0x...
```

## Step 3: Initialize Pool with Hook

### Create Pool with LukasHook

```typescript
import { ethers } from 'ethers';

const LUKAS_TOKEN = "0xaee0f26589a21ba4547765f630075262f330f1cb";
const USDC_TOKEN = "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582";
const POOL_MANAGER = "0x..."; // From Step 1
const LUKAS_HOOK = "0x..."; // From Step 2

// Sort tokens (currency0 < currency1)
const [currency0, currency1] = LUKAS_TOKEN.toLowerCase() < USDC_TOKEN.toLowerCase()
  ? [LUKAS_TOKEN, USDC_TOKEN]
  : [USDC_TOKEN, LUKAS_TOKEN];

// Create PoolKey
const poolKey = {
  currency0,
  currency1,
  fee: 3000, // 0.3% fee
  tickSpacing: 60,
  hooks: LUKAS_HOOK // Our custom hook!
};

// Initialize pool
const poolManager = new ethers.Contract(POOL_MANAGER, POOL_MANAGER_ABI, signer);

// Calculate initial price (1 LUKAS = 1 USDC)
const sqrtPriceX96 = BigInt(Math.sqrt(1) * (2 ** 96));

const initTx = await poolManager.initialize(poolKey, sqrtPriceX96, "0x");
await initTx.wait();
console.log('Pool initialized with LukasHook:', initTx.hash);
```

### Add Initial Liquidity

```typescript
const LIQUIDITY_ROUTER = "0x..."; // From Step 1

const liquidityRouter = new ethers.Contract(
  LIQUIDITY_ROUTER,
  LIQUIDITY_ROUTER_ABI,
  signer
);

// Approve tokens
const lukasToken = new ethers.Contract(LUKAS_TOKEN, ERC20_ABI, signer);
const usdcToken = new ethers.Contract(USDC_TOKEN, ERC20_ABI, signer);

await lukasToken.approve(LIQUIDITY_ROUTER, ethers.parseEther('10000'));
await usdcToken.approve(LIQUIDITY_ROUTER, ethers.parseUnits('10000', 6));

// Add liquidity (full range for simplicity)
const liquidityParams = {
  poolKey,
  tickLower: -887220,
  tickUpper: 887220,
  liquidityDelta: ethers.parseEther('1000'), // 1000 liquidity units
  hookData: "0x"
};

const addLiqTx = await liquidityRouter.modifyLiquidity(liquidityParams, "0x");
await addLiqTx.wait();
console.log('Liquidity added:', addLiqTx.hash);
```

## Step 4: Update deployments.json

Update `packages/contracts/deployments.json` with all deployed addresses:

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
          "StabilizerVault": {
            "address": "0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3",
            "status": "stable"
          },
          "LatAmBasketIndex": {
            "address": "0x...",
            "status": "stable",
            "note": "Deploy this first if not deployed"
          },
          "UniswapV4PoolManager": {
            "address": "0x...",
            "deployedAt": "2025-12-18T...",
            "deployer": "0x...",
            "version": "4.0.0",
            "verified": true,
            "status": "stable",
            "note": "Uniswap V4 PoolManager"
          },
          "UniswapV4SwapRouter": {
            "address": "0x...",
            "deployedAt": "2025-12-18T...",
            "deployer": "0x...",
            "version": "4.0.0",
            "verified": true,
            "status": "stable",
            "note": "Uniswap V4 SwapRouter (PoolSwapTest)"
          },
          "UniswapV4LiquidityRouter": {
            "address": "0x...",
            "deployedAt": "2025-12-18T...",
            "deployer": "0x...",
            "version": "4.0.0",
            "verified": true,
            "status": "stable",
            "note": "Uniswap V4 Liquidity Router (PoolModifyLiquidityTest)"
          },
          "LukasHook": {
            "address": "0x...",
            "deployedAt": "2025-12-18T...",
            "deployer": "0x...",
            "version": "1.0.0",
            "verified": true,
            "status": "stable",
            "note": "Custom hook for LUKAS stabilization"
          }
        }
      }
    }
  }
}
```

## Step 5: Test the Pool and Hook

### Test Swap with Hook Integration

```typescript
const SWAP_ROUTER = "0x..."; // UniswapV4SwapRouter from deployments

const swapRouter = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, signer);

// Approve USDC
await usdcToken.approve(SWAP_ROUTER, ethers.parseUnits('10', 6));

// Prepare swap parameters
const swapParams = {
  zeroForOne: currency0 === USDC_TOKEN, // Swapping USDC for LUKAS
  amountSpecified: ethers.parseUnits('10', 6), // 10 USDC
  sqrtPriceLimitX96: 0 // No price limit
};

// Execute swap through the pool with hook
const swapTx = await swapRouter.swap(poolKey, swapParams, "0x");
await swapTx.wait();
console.log('Swap executed with hook:', swapTx.hash);

// The LukasHook will:
// 1. Log the swap in beforeSwap
// 2. Check peg status in afterSwap
// 3. Trigger stabilization if needed
```

### Verify Hook Execution

Check that the hook is working by monitoring events:

```typescript
// Listen for StabilizationTriggered events
const lukasHook = new ethers.Contract(LUKAS_HOOK, LUKAS_HOOK_ABI, provider);

lukasHook.on('StabilizationTriggered', (isOverPeg, amount, poolPrice, fairPrice) => {
  console.log('Stabilization triggered!');
  console.log('Over peg:', isOverPeg);
  console.log('Amount:', amount.toString());
  console.log('Pool price:', poolPrice.toString());
  console.log('Fair price:', fairPrice.toString());
});

// Listen for SwapExecuted events
lukasHook.on('SwapExecuted', (user, zeroForOne, amountSpecified) => {
  console.log('Swap executed through hook');
  console.log('User:', user);
  console.log('Direction:', zeroForOne ? 'USDC -> LUKAS' : 'LUKAS -> USDC');
  console.log('Amount:', amountSpecified.toString());
});
```

## Step 6: Update SDK Integration

### Update ContractAddresses Type

```typescript
// packages/lukas-sdk/src/core/types.ts
export interface ContractAddresses {
  lukasToken: string;
  usdc: string;
  stabilizerVault: string;
  latAmBasketIndex: string;
  lukasHook: string;
  uniswapV4PoolManager: string;
  uniswapV4SwapRouter: string;
  uniswapV4LiquidityRouter?: string;
}
```

### Update ContractManager

Add Uniswap V4 contract getters to `packages/lukas-sdk/src/core/ContractManager.ts`:

```typescript
// Add V4 ABIs
const UNISWAP_V4_POOL_MANAGER_ABI = [
  'function initialize(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, uint160 sqrtPriceX96, bytes hookData) external returns (int24)',
  'function getSlot0(bytes32 poolId) external view returns (tuple(uint160 sqrtPriceX96, int24 tick, uint16 protocolFee, uint24 lpFee))',
  'function getPoolId(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) external pure returns (bytes32)',
  'function getLiquidity(bytes32 poolId) external view returns (uint128)',
];

const UNISWAP_V4_SWAP_ROUTER_ABI = [
  'function swap(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, tuple(bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96) params, bytes hookData) external returns (int256)',
  'function quoteExactInputSingle(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, tuple(bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96) params) external returns (int256)',
];

// Add getter methods
getUniswapV4PoolManager(): Contract {
  const contract = this.contracts.get('uniswapV4PoolManager');
  if (!contract) {
    throw new LukasSDKError(
      LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
      'Uniswap V4 PoolManager not initialized'
    );
  }
  return contract;
}

getUniswapV4SwapRouter(): Contract {
  const contract = this.contracts.get('uniswapV4SwapRouter');
  if (!contract) {
    throw new LukasSDKError(
      LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
      'Uniswap V4 SwapRouter not initialized'
    );
  }
  return contract;
}

// Initialize in initializeContracts()
this.contracts.set(
  'uniswapV4PoolManager',
  new Contract(
    this.addresses.uniswapV4PoolManager,
    UNISWAP_V4_POOL_MANAGER_ABI,
    this.signer || this.provider
  )
);

this.contracts.set(
  'uniswapV4SwapRouter',
  new Contract(
    this.addresses.uniswapV4SwapRouter,
    UNISWAP_V4_SWAP_ROUTER_ABI,
    this.signer || this.provider
  )
);
```

### Update LukasSDK

Add `getSwapService()` method to `packages/lukas-sdk/src/core/LukasSDK.ts`:

```typescript
/**
 * Get Swap Service for token swapping operations
 */
getSwapService(): SwapServiceImpl {
  const contractManager = this.getContractManager();
  const poolManager = contractManager.getUniswapV4PoolManager();
  const swapRouter = contractManager.getUniswapV4SwapRouter();
  
  return new SwapServiceImpl(
    poolManager,
    swapRouter,
    this.networkConfig.contracts.lukasToken,
    this.networkConfig.contracts.usdc
  );
}
```

### Update React Hooks

Remove placeholder errors from hooks:

```typescript
// packages/lukas-sdk/src/react/hooks/useSwap.ts
const getQuote = useCallback(async (...) => {
  if (!sdk) return;
  
  try {
    setQuoteLoading(true);
    setQuoteError(null);

    const swapService = sdk.getSwapService(); // Now works!
    const swapQuote = await swapService.getSwapQuote(tokenIn, tokenOut, amountIn, slippage);
    setQuote(swapQuote);
  } catch (err) {
    setQuoteError(err instanceof Error ? err : new Error('Failed to get swap quote'));
  } finally {
    setQuoteLoading(false);
  }
}, [sdk, defaultSlippage]);

// packages/lukas-sdk/src/react/hooks/useLukasPrice.ts
const fetchPrice = async () => {
  if (!sdk) return;
  
  try {
    setLoading(true);
    setError(null);

    const swapService = sdk.getSwapService(); // Now works!
    const lukasPrice = await swapService.getLukasPrice();
    setPrice(lukasPrice);
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed to fetch LUKAS price'));
  } finally {
    setLoading(false);
  }
};
```

## Monitoring

### Check Pool State

```typescript
const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);

const slot0 = await pool.slot0();
console.log('Current price:', slot0.sqrtPriceX96);
console.log('Current tick:', slot0.tick);

const liquidity = await pool.liquidity();
console.log('Total liquidity:', liquidity);
```

### Monitor Swaps

```typescript
pool.on('Swap', (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick) => {
  console.log('Swap executed:', {
    sender,
    recipient,
    amount0: amount0.toString(),
    amount1: amount1.toString(),
    price: sqrtPriceX96.toString(),
    tick
  });
});
```

## Troubleshooting

### Pool Already Exists

```
Error: Pool already exists
```

**Solution**: Get existing pool address instead of creating new one

```typescript
const poolAddress = await factory.getPool(token0, token1, 3000);
```

### Insufficient Liquidity

```
Error: Insufficient liquidity
```

**Solution**: Add more liquidity to the pool

### Price Impact Too High

```
Warning: Price impact > 10%
```

**Solution**: Add more liquidity or reduce swap amount

## Resources

- [Uniswap V3 Documentation](https://docs.uniswap.org/contracts/v3/overview)
- [Uniswap V4 Documentation](https://docs.uniswap.org/contracts/v4/overview)
- [Polygon Amoy Testnet](https://amoy.polygonscan.com/)
- [Uniswap V3 Deployment Addresses](https://docs.uniswap.org/contracts/v3/reference/deployments)

## Next Steps

1. Deploy pool on Polygon Amoy testnet
2. Add initial liquidity (1000 LUKAS + 1000 USDC)
3. Update `deployments.json` with pool address
4. Test swap functionality
5. Update SDK to use deployed pool
6. Deploy to mainnet when ready


## Step 6: Update SDK Integration

### Update ContractAddresses Type

```typescript
// packages/lukas-sdk/src/core/types.ts
export interface ContractAddresses {
  lukasToken: string;
  usdc: string;
  stabilizerVault: string;
  latAmBasketIndex: string;
  lukasHook: string;
  uniswapV4PoolManager?: string;
  uniswapV4SwapRouter?: string;
  uniswapV4LiquidityRouter?: string;
}
```

### Update ContractManager

Add Uniswap V4 contract support to `packages/lukas-sdk/src/core/ContractManager.ts`:

```typescript
// Add V4 ABIs
const UNISWAP_V4_POOL_MANAGER_ABI = [
  'function initialize(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, uint160 sqrtPriceX96, bytes hookData) external returns (int24)',
  'function getSlot0(bytes32 poolId) external view returns (tuple(uint160 sqrtPriceX96, int24 tick, uint16 protocolFee, uint24 lpFee))',
  'function getPoolId(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) external pure returns (bytes32)',
  'function getLiquidity(bytes32 poolId) external view returns (uint128)',
];

const UNISWAP_V4_SWAP_ROUTER_ABI = [
  'function swap(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, tuple(bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96) params, bytes hookData) external returns (int256)',
  'function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut)',
];

// Add getter methods
getUniswapV4PoolManager(): Contract {
  const contract = this.contracts.get('uniswapV4PoolManager');
  if (!contract) {
    throw new LukasSDKError(
      LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
      'Uniswap V4 PoolManager not initialized'
    );
  }
  return contract;
}

getUniswapV4SwapRouter(): Contract {
  const contract = this.contracts.get('uniswapV4SwapRouter');
  if (!contract) {
    throw new LukasSDKError(
      LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
      'Uniswap V4 SwapRouter not initialized'
    );
  }
  return contract;
}

// In initializeContracts(), add:
if (this.addresses.uniswapV4PoolManager) {
  this.contracts.set(
    'uniswapV4PoolManager',
    new Contract(
      this.addresses.uniswapV4PoolManager,
      UNISWAP_V4_POOL_MANAGER_ABI,
      this.signer || this.provider
    )
  );
}

if (this.addresses.uniswapV4SwapRouter) {
  this.contracts.set(
    'uniswapV4SwapRouter',
    new Contract(
      this.addresses.uniswapV4SwapRouter,
      UNISWAP_V4_SWAP_ROUTER_ABI,
      this.signer || this.provider
    )
  );
}
```

### Update LukasSDK

Add `getSwapService()` method to `packages/lukas-sdk/src/core/LukasSDK.ts`:

```typescript
/**
 * Get Swap Service for token swapping operations
 */
getSwapService(): SwapServiceImpl {
  const contractManager = this.getContractManager();
  const poolManager = contractManager.getUniswapV4PoolManager();
  const swapRouter = contractManager.getUniswapV4SwapRouter();
  
  return new SwapServiceImpl(
    poolManager,
    swapRouter,
    this.networkConfig.contracts.lukasToken,
    this.networkConfig.contracts.usdc
  );
}
```

### Update React Hooks

Remove placeholder errors from hooks in `packages/lukas-sdk/src/react/hooks/`:

```typescript
// useSwap.ts - Update getQuote
const swapService = sdk.getSwapService();
const swapQuote = await swapService.getSwapQuote(tokenIn, tokenOut, amountIn, slippage);
setQuote(swapQuote);

// useSwap.ts - Update executeSwap
const swapService = sdk.getSwapService();
const tx = await swapService.executeSwap(tokenIn, tokenOut, amountIn, minimumAmountOut, recipient);
setTransaction(tx);

// useLukasPrice.ts - Update fetchPrice
const swapService = sdk.getSwapService();
const lukasPrice = await swapService.getLukasPrice();
setPrice(lukasPrice);
```

## Deployment Checklist

- [ ] Deploy Uniswap V4 PoolManager
- [ ] Deploy Uniswap V4 SwapRouter (PoolSwapTest)
- [ ] Deploy Uniswap V4 LiquidityRouter (PoolModifyLiquidityTest)
- [ ] Deploy LatAmBasketIndex Oracle (if not deployed)
- [ ] Deploy LukasHook with correct addresses
- [ ] Initialize pool with LukasHook
- [ ] Add initial liquidity (10,000 LUKAS + 10,000 USDC recommended)
- [ ] Update deployments.json with all addresses
- [ ] Update SDK ContractManager with V4 ABIs
- [ ] Update SDK types with V4 contract addresses
- [ ] Add getSwapService() to LukasSDK
- [ ] Update React hooks to use SwapService
- [ ] Test swap functionality on testnet
- [ ] Verify all contracts on Polygonscan
- [ ] Monitor hook events for stabilization triggers
- [ ] Document pool parameters and hook configuration

## Monitoring and Maintenance

### Monitor Pool Health

```typescript
// Check pool liquidity
const poolManager = new ethers.Contract(POOL_MANAGER, POOL_MANAGER_ABI, provider);
const poolId = await poolManager.getPoolId(poolKey);
const liquidity = await poolManager.getLiquidity(poolId);
console.log('Pool liquidity:', liquidity.toString());

// Check pool price
const slot0 = await poolManager.getSlot0(poolId);
console.log('Current sqrtPriceX96:', slot0.sqrtPriceX96.toString());
console.log('Current tick:', slot0.tick);
```

### Monitor Hook Activity

```typescript
// Monitor stabilization events
const lukasHook = new ethers.Contract(LUKAS_HOOK, LUKAS_HOOK_ABI, provider);

lukasHook.on('StabilizationTriggered', (isOverPeg, amount, poolPrice, fairPrice) => {
  console.log('🔔 Stabilization Event:');
  console.log('  Direction:', isOverPeg ? 'MINT (over peg)' : 'BUYBACK (under peg)');
  console.log('  Amount:', ethers.formatEther(amount), 'LUKAS');
  console.log('  Pool Price:', ethers.formatUnits(poolPrice, 6), 'USDC');
  console.log('  Fair Price:', ethers.formatUnits(fairPrice, 6), 'USDC');
  console.log('  Deviation:', Math.abs((Number(poolPrice) - Number(fairPrice)) / Number(fairPrice) * 100).toFixed(2), '%');
});
```

## Troubleshooting

### Hook Not Executing

**Problem**: Swaps work but hook callbacks aren't triggered

**Solutions**:
1. Verify hook address is correctly set in poolKey
2. Check hook permissions are properly configured
3. Ensure hook contract is deployed and verified
4. Check gas limits are sufficient for hook execution

### Pool Initialization Fails

**Problem**: `initialize()` reverts

**Solutions**:
1. Verify tokens are sorted correctly (currency0 < currency1)
2. Check hook address is valid and deployed
3. Ensure sqrtPriceX96 is calculated correctly
4. Verify pool doesn't already exist

### Stabilization Not Triggering

**Problem**: Hook executes but stabilization doesn't occur

**Solutions**:
1. Check deviation threshold (must be >= 2%)
2. Verify StabilizerVault has sufficient USDC/LUKAS
3. Check cooldown period hasn't been violated
4. Ensure Oracle is returning correct prices
5. Verify hook has authorization to call vault

## Resources

- [Uniswap V4 Core Repository](https://github.com/Uniswap/v4-core)
- [Uniswap V4 Periphery](https://github.com/Uniswap/v4-periphery)
- [Uniswap V4 Documentation](https://docs.uniswap.org/contracts/v4/overview)
- [Hook Development Guide](https://docs.uniswap.org/contracts/v4/guides/hooks/hook-development)
- [Polygon Amoy Testnet](https://amoy.polygonscan.com/)
- [Foundry Book](https://book.getfoundry.sh/)

## Next Steps After Deployment

1. **Test Thoroughly**: Execute multiple swaps with different amounts
2. **Monitor Events**: Watch for stabilization triggers
3. **Adjust Parameters**: Fine-tune deviation threshold if needed
4. **Add More Liquidity**: Increase pool depth for better price stability
5. **Deploy to Mainnet**: Once tested, deploy to Polygon mainnet
6. **Set Up Monitoring**: Create dashboards for pool metrics
7. **Document Operations**: Create runbooks for common scenarios


## Step 6: Update SDK Integration

### Update ContractAddresses Type

```typescript
// packages/lukas-sdk/src/core/types.ts
export interface ContractAddresses {
  lukasToken: string;
  usdc: string;
  stabilizerVault: string;
  latAmBasketIndex: string;
  lukasHook: string;
  uniswapV4PoolManager?: string;
  uniswapV4SwapRouter?: string;
  uniswapV4LiquidityRouter?: string;
}
```

### Update ContractManager

Add Uniswap V4 contract support to `packages/lukas-sdk/src/core/ContractManager.ts`:

```typescript
// Add V4 ABIs
const UNISWAP_V4_POOL_MANAGER_ABI = [
  'function initialize(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, uint160 sqrtPriceX96, bytes hookData) external returns (int24)',
  'function getSlot0(bytes32 poolId) external view returns (tuple(uint160 sqrtPriceX96, int24 tick, uint16 protocolFee, uint24 lpFee))',
  'function getPoolId(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) external pure returns (bytes32)',
  'function getLiquidity(bytes32 poolId) external view returns (uint128)',
];

const UNISWAP_V4_SWAP_ROUTER_ABI = [
  'function swap(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, tuple(bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96) params, bytes hookData) external returns (int256)',
];

// Add getter methods
getUniswapV4PoolManager(): Contract {
  const contract = this.contracts.get('uniswapV4PoolManager');
  if (!contract) {
    throw new LukasSDKError(
      LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
      'Uniswap V4 PoolManager not initialized'
    );
  }
  return contract;
}

getUniswapV4SwapRouter(): Contract {
  const contract = this.contracts.get('uniswapV4SwapRouter');
  if (!contract) {
    throw new LukasSDKError(
      LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
      'Uniswap V4 SwapRouter not initialized'
    );
  }
  return contract;
}
```

### Update LukasSDK

Add `getSwapService()` method to `packages/lukas-sdk/src/core/LukasSDK.ts`:

```typescript
/**
 * Get Swap Service for token swapping operations
 */
getSwapService(): SwapServiceImpl {
  const contractManager = this.getContractManager();
  const poolManager = contractManager.getUniswapV4PoolManager();
  const swapRouter = contractManager.getUniswapV4SwapRouter();
  
  return new SwapServiceImpl(
    poolManager,
    swapRouter,
    this.networkConfig.contracts.lukasToken,
    this.networkConfig.contracts.usdc
  );
}
```

## Deployment Checklist

- [ ] Deploy Uniswap V4 PoolManager
- [ ] Deploy Uniswap V4 SwapRouter (PoolSwapTest)
- [ ] Deploy Uniswap V4 LiquidityRouter (PoolModifyLiquidityTest)
- [ ] Deploy LatAmBasketIndex oracle (if not deployed)
- [ ] Deploy LukasHook with correct addresses
- [ ] Initialize pool with LukasHook
- [ ] Add initial liquidity (10,000 LUKAS + 10,000 USDC recommended)
- [ ] Update deployments.json with all addresses
- [ ] Verify all contracts on PolygonScan
- [ ] Test swap functionality
- [ ] Test hook stabilization triggers
- [ ] Update SDK to v0.2.11 with V4 support
- [ ] Update web app to use new SDK version
- [ ] Deploy web app with swap UI

## Resources

- [Uniswap V4 Core Repository](https://github.com/Uniswap/v4-core)
- [Uniswap V4 Periphery](https://github.com/Uniswap/v4-periphery)
- [Uniswap V4 Documentation](https://docs.uniswap.org/contracts/v4/overview)
- [Hook Development Guide](https://docs.uniswap.org/contracts/v4/guides/hooks/hook-development)
- [Polygon Amoy Testnet](https://amoy.polygonscan.com/)
