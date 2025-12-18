# Minimal Lukas Protocol Deployment Guide - Amoy Testnet

## Overview

Deploy minimal essential contracts to test core Lukas Protocol functionality:
- **LatAmBasketIndex** - Oracle for price feeds and peg monitoring
- **StabilizerVault** - Stabilization mechanism
- **Uniswap V4 Pool** - Token swapping with LukasHook

## Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
cd packages/contracts
forge install

# Set environment variables
export PRIVATE_KEY="your_private_key"
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
export ETHERSCAN_API_KEY="your_polygonscan_api_key"
```

## Step 1: Deploy Oracle and Vault

### Using Foundry (Recommended)

```bash
cd packages/contracts

# Deploy minimal contracts
forge script script/DeployMinimalAmoy.s.sol \
  --rpc-url $AMOY_RPC_URL \
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
```

## Step 2: Update deployments.json

Update `packages/contracts/deployments.json`:

```json
{
  "networks": {
    "80002": {
      "contracts": {
        "stable": {
          "LatAmBasketIndex": {
            "address": "0x...",
            "deployedAt": "2025-12-18T...",
            "deployer": "0x...",
            "version": "1.0.0",
            "verified": true,
            "status": "stable"
          },
          "StabilizerVault": {
            "address": "0x...",
            "deployedAt": "2025-12-18T...",
            "deployer": "0x...",
            "version": "1.0.0",
            "verified": true,
            "status": "stable"
          }
        }
      }
    }
  }
}
```

## Step 3: Deploy Uniswap V4 Pool

### Deploy V4 Core Contracts

```bash
# Clone Uniswap V4
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

Create `packages/contracts/script/DeployLukasHook.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
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
}

interface ILatAmBasketIndex {
    function getCurrentPrice() external view returns (uint256);
    function getFairPrice() external view returns (uint256);
}

contract LukasHook is BaseHook {
    IStabilizerVault public immutable stabilizerVault;
    ILatAmBasketIndex public immutable oracle;
    address public immutable lukasToken;
    address public immutable usdc;
    
    uint256 public constant DEVIATION_THRESHOLD = 200; // 2%
    
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
        uint256 poolPrice = oracle.getCurrentPrice();
        uint256 fairPrice = oracle.getFairPrice();
        
        (
            bool shouldStabilize,
            bool isOverPeg,
            uint256 deviationBps,
            uint256 recommendedAmount,
            bool canExecute,
        ) = stabilizerVault.shouldStabilize(poolPrice);

        if (shouldStabilize && canExecute && deviationBps >= DEVIATION_THRESHOLD) {
            emit StabilizationTriggered(isOverPeg, recommendedAmount, poolPrice, fairPrice);
        }

        return (BaseHook.afterSwap.selector, 0);
    }
}

contract DeployLukasHook is Script {
    address constant POOL_MANAGER = 0x...; // From V4 deployment
    address constant STABILIZER_VAULT = 0x...; // From Step 1
    address constant ORACLE = 0x...; // From Step 1
    address constant LUKAS_TOKEN = 0xaee0f26589a21ba4547765f630075262f330f1cb;
    address constant USDC_TOKEN = 0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("📦 Deploying LukasHook...");
        LukasHook hook = new LukasHook(
            IPoolManager(POOL_MANAGER),
            STABILIZER_VAULT,
            ORACLE,
            LUKAS_TOKEN,
            USDC_TOKEN
        );
        console.log("✅ LukasHook deployed at:", address(hook));
        
        vm.stopBroadcast();
    }
}
```

Deploy the hook:

```bash
forge script script/DeployLukasHook.s.sol \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

## Step 4: Initialize Pool with Hook

```typescript
import { ethers } from 'ethers';

const POOL_MANAGER = '0x...'; // From V4 deployment
const LUKAS_HOOK = '0x...'; // From hook deployment
const LUKAS_TOKEN = '0xaee0f26589a21ba4547765f630075262f330f1cb';
const USDC_TOKEN = '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582';

// Sort tokens
const [currency0, currency1] = LUKAS_TOKEN.toLowerCase() < USDC_TOKEN.toLowerCase()
  ? [LUKAS_TOKEN, USDC_TOKEN]
  : [USDC_TOKEN, LUKAS_TOKEN];

// Create pool key with hook
const poolKey = {
  currency0,
  currency1,
  fee: 3000, // 0.3%
  tickSpacing: 60,
  hooks: LUKAS_HOOK // Our custom hook!
};

// Initialize pool
const poolManager = new ethers.Contract(POOL_MANAGER, POOL_MANAGER_ABI, signer);
const sqrtPriceX96 = BigInt(Math.sqrt(1) * (2 ** 96));

const initTx = await poolManager.initialize(poolKey, sqrtPriceX96, '0x');
await initTx.wait();
console.log('Pool initialized with LukasHook');
```

## Step 5: Test Core Functionality

### Test 1: Oracle Price Feed

```typescript
const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

const currentPrice = await oracle.getCurrentPrice();
const fairPrice = await oracle.getFairPrice();
const pegStatus = await oracle.getPegStatus();

console.log('Current Price:', currentPrice.toString());
console.log('Fair Price:', fairPrice.toString());
console.log('Peg Status:', pegStatus);
```

### Test 2: Stabilization Check

```typescript
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

const vaultInfo = await vault.getVaultInfo();
const collateral = await vault.getCollateralBalance();
const shouldStabilize = await vault.shouldStabilize(currentPrice);

console.log('Vault Info:', vaultInfo);
console.log('Collateral:', collateral);
console.log('Should Stabilize:', shouldStabilize);
```

### Test 3: Swap with Hook

```typescript
const swapRouter = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, signer);

// Approve USDC
await usdcToken.approve(SWAP_ROUTER, ethers.parseUnits('10', 6));

// Execute swap
const swapParams = {
  zeroForOne: currency0 === USDC_TOKEN,
  amountSpecified: ethers.parseUnits('10', 6),
  sqrtPriceLimitX96: 0
};

const swapTx = await swapRouter.swap(poolKey, swapParams, '0x');
await swapTx.wait();

console.log('Swap executed - hook should have checked peg status');
```

## Verification Checklist

- [ ] Oracle deployed and returning prices
- [ ] Vault deployed and tracking collateral
- [ ] Uniswap V4 PoolManager deployed
- [ ] LukasHook deployed with correct addresses
- [ ] Pool initialized with hook
- [ ] Swap executes successfully
- [ ] Hook events emitted during swaps
- [ ] Stabilization logic triggers on peg deviation

## Troubleshooting

### "Invalid pool" error in beforeAddLiquidity

**Solution**: Ensure token addresses match exactly (case-sensitive)

### Hook not triggering

**Solution**: Verify hook address is set correctly in poolKey

### Swap fails with "Insufficient liquidity"

**Solution**: Add initial liquidity to the pool first

### Price feed stale

**Solution**: Call `oracle.updatePrice()` to update the price

## Next Steps

1. ✅ Deploy minimal contracts
2. ✅ Test core functionality
3. Deploy full Uniswap V4 infrastructure
4. Integrate with web app
5. End-to-end testing
6. Mainnet deployment

## Resources

- [Uniswap V4 Docs](https://docs.uniswap.org/contracts/v4/overview)
- [Foundry Book](https://book.getfoundry.sh/)
- [Polygon Amoy Testnet](https://amoy.polygonscan.com/)
