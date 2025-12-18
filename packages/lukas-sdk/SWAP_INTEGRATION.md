# Swap Integration Guide

## Overview

The Lukas SDK v0.2.10+ includes swap functionality for trading LUKAS/USDC tokens through Uniswap V4 pools. This guide covers the implementation status and next steps.

## Current Status

### ✅ Completed

1. **SwapService Interface** (`src/services/SwapService.ts`)
   - `getSwapQuote()` - Get quote for token swaps with slippage
   - `executeSwap()` - Execute token swaps
   - `getLukasPrice()` - Get current LUKAS price in USDC
   - `poolExists()` - Check if pool exists for token pair

2. **SwapServiceImpl** (`src/services/SwapServiceImpl.ts`)
   - Full implementation of SwapService interface
   - Integrates with Uniswap V4 PoolManager and SwapRouter
   - Price impact calculation
   - Slippage protection
   - Pool existence validation

3. **React Hooks**
   - `useSwap` - Hook for swap operations with quote and execution
   - `useLukasPrice` - Hook for real-time LUKAS price monitoring
   - `useTokenBalance` - Hook for token balance queries
   - `useTokenInfo` - Hook for token metadata

4. **Type Definitions**
   - `SwapQuote` interface with all swap parameters
   - Proper TypeScript types for all swap operations

### 🚧 Pending Implementation

1. **Uniswap V4 Pool Deployment**
   - Deploy LUKAS/USDC pool on Polygon Amoy testnet
   - Configure pool parameters (fee tier, tick spacing)
   - Add initial liquidity
   - Update `deployments.json` with pool addresses

2. **Contract Integration**
   - Add Uniswap V4 PoolManager contract to ContractManager
   - Add Uniswap V4 SwapRouter contract to ContractManager
   - Add contract ABIs for Uniswap V4
   - Update ContractAddresses type to include pool contracts

3. **SDK Integration**
   - Add `getSwapService()` method to LukasSDK
   - Initialize SwapService with pool contracts
   - Connect SwapService to React hooks

4. **UI Components**
   - Create SwapWidget component
   - Add price display and charts
   - Implement transaction feedback
   - Add slippage settings

## Next Steps

### Step 1: Deploy Uniswap V4 Pool

```bash
# Deploy pool on Polygon Amoy testnet
# Network: 80002
# Token0: LUKAS (0xaee0f26589a21ba4547765f630075262f330f1cb)
# Token1: USDC (0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582)
# Fee: 3000 (0.3%)
# Tick Spacing: 60
```

Update `packages/contracts/deployments.json`:

```json
{
  "networks": {
    "80002": {
      "contracts": {
        "stable": {
          "UniswapV4PoolManager": {
            "address": "0x...",
            "status": "stable"
          },
          "UniswapV4SwapRouter": {
            "address": "0x...",
            "status": "stable"
          }
        }
      }
    }
  }
}
```

### Step 2: Update ContractManager

Add Uniswap V4 contracts to `packages/lukas-sdk/src/core/ContractManager.ts`:

```typescript
// Add to ContractAddresses type
export interface ContractAddresses {
  lukasToken: string;
  usdc: string;
  stabilizerVault: string;
  latAmBasketIndex: string;
  lukasHook: string;
  uniswapV4PoolManager?: string;
  uniswapV4SwapRouter?: string;
}

// Add ABIs
const UNISWAP_V4_POOL_MANAGER_ABI = [...];
const UNISWAP_V4_SWAP_ROUTER_ABI = [...];

// Add getter methods
getUniswapV4PoolManager(): Contract { ... }
getUniswapV4SwapRouter(): Contract { ... }
```

### Step 3: Add getSwapService() to LukasSDK

Update `packages/lukas-sdk/src/core/LukasSDK.ts`:

```typescript
import { SwapServiceImpl } from '../services/SwapServiceImpl';

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

### Step 4: Update React Hooks

Remove placeholder errors from `useSwap` and `useLukasPrice`:

```typescript
// In useSwap.ts
const swapService = sdk.getSwapService();
const swapQuote = await swapService.getSwapQuote(tokenIn, tokenOut, amountIn, slippage);
setQuote(swapQuote);

// In useLukasPrice.ts
const swapService = sdk.getSwapService();
const lukasPrice = await swapService.getLukasPrice();
setPrice(lukasPrice);
```

### Step 5: Create Swap UI Component

Create `apps/web/src/components/SwapWidget.tsx`:

```typescript
import { useSwap, useLukasPrice } from '@lukas-protocol/sdk/react';
import { useLukasSDK } from '../hooks/useLukasProtocol';

export function SwapWidget() {
  const { sdk } = useLukasSDK();
  const { quote, getQuote, executeSwap, swapLoading } = useSwap(sdk);
  const { price } = useLukasPrice(sdk, { refreshInterval: 10000 });
  
  // Implementation...
}
```

## Testing

### Unit Tests

```typescript
import { SwapServiceImpl } from '@lukas-protocol/sdk';

describe('SwapService', () => {
  it('should get swap quote', async () => {
    const quote = await swapService.getSwapQuote(
      lukasAddress,
      usdcAddress,
      '1000000000000000000', // 1 LUKAS
      0.5 // 0.5% slippage
    );
    
    expect(quote.amountIn).toBe('1000000000000000000');
    expect(quote.priceImpact).toBeLessThan(1);
  });
});
```

### Integration Tests

```typescript
describe('Swap Integration', () => {
  it('should execute swap on testnet', async () => {
    const sdk = new LukasSDK(config);
    const swapService = sdk.getSwapService();
    
    const tx = await swapService.executeSwap(
      lukasAddress,
      usdcAddress,
      '1000000000000000000',
      '990000' // minimum USDC out
    );
    
    await tx.wait();
    expect(tx.hash).toBeDefined();
  });
});
```

## API Reference

### SwapService

#### getSwapQuote()

Get a quote for swapping tokens.

```typescript
async getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  slippageTolerance?: number
): Promise<SwapQuote>
```

**Parameters:**
- `tokenIn` - Input token address
- `tokenOut` - Output token address
- `amountIn` - Amount of input token
- `slippageTolerance` - Slippage tolerance percentage (default: 0.5)

**Returns:** SwapQuote with expected output and price impact

#### executeSwap()

Execute a token swap.

```typescript
async executeSwap(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  minimumAmountOut: BigNumber,
  recipient?: string
): Promise<TransactionResponse>
```

**Parameters:**
- `tokenIn` - Input token address
- `tokenOut` - Output token address
- `amountIn` - Amount of input token
- `minimumAmountOut` - Minimum acceptable output amount
- `recipient` - Optional recipient address (defaults to sender)

**Returns:** Transaction response

#### getLukasPrice()

Get the current LUKAS price in USDC.

```typescript
async getLukasPrice(): Promise<BigNumber>
```

**Returns:** Current LUKAS price

### React Hooks

#### useSwap()

Hook for swap operations.

```typescript
const {
  quote,
  quoteLoading,
  quoteError,
  swapLoading,
  swapError,
  transaction,
  getQuote,
  executeSwap,
  reset
} = useSwap(sdk, { defaultSlippage: 0.5 });
```

#### useLukasPrice()

Hook for LUKAS price monitoring.

```typescript
const {
  price,
  loading,
  error,
  refetch
} = useLukasPrice(sdk, { refreshInterval: 10000 });
```

## Security Considerations

1. **Slippage Protection**: Always set appropriate slippage tolerance
2. **Price Impact**: Warn users about high price impact (>5%)
3. **Approval**: Ensure token approval before swap
4. **Balance Check**: Verify sufficient balance before swap
5. **Deadline**: Set reasonable transaction deadline (20 minutes)

## Performance Optimization

1. **Quote Caching**: Cache quotes for 10-30 seconds
2. **Batch Requests**: Use multicall for multiple quotes
3. **Real-time Updates**: Use WebSocket for price updates
4. **Lazy Loading**: Load swap UI only when needed

## Troubleshooting

### Pool Not Found

```
Error: Pool does not exist for this token pair
```

**Solution**: Deploy Uniswap V4 pool or check contract addresses

### Insufficient Liquidity

```
Error: Insufficient liquidity for swap
```

**Solution**: Add liquidity to the pool or reduce swap amount

### High Price Impact

```
Warning: Price impact > 5%
```

**Solution**: Reduce swap amount or increase slippage tolerance

## Resources

- [Uniswap V4 Documentation](https://docs.uniswap.org/contracts/v4/overview)
- [Lukas Protocol Documentation](https://lukas.money/documentation)
- [SDK API Reference](./README.md)
