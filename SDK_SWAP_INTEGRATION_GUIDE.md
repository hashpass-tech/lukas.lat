# SDK Swap Integration Guide
**December 18, 2025**

## 🎯 Overview

This guide explains how to integrate the deployed Lukas Protocol contracts with the SDK and connect swap functionality to the UI.

---

## 📊 Current Architecture

### Layer 1: UI Components
```
SwapWidget (React Component)
├─ Token Input
├─ Token Output
├─ Slippage Settings
├─ Quote Display
└─ Swap Button
```

### Layer 2: React Hooks
```
useSwap Hook
├─ Quote State
├─ Swap State
├─ Error Handling
└─ Transaction Tracking
```

### Layer 3: SDK Services
```
SwapService
├─ Quote Calculation
├─ Swap Execution
├─ Slippage Protection
└─ Transaction Building
```

### Layer 4: Smart Contracts
```
PoolManager (V4)
├─ LUKAS/USDC Pool
├─ LukasHook
├─ LatAmBasketIndex
└─ StabilizerVault
```

---

## 🔧 Integration Steps

### Step 1: Update SDK Deployments

**File**: `packages/lukas-sdk/src/deployments/index.ts`

```typescript
export const POLYGON_AMOY_DEPLOYMENTS = {
  chainId: 80002,
  network: 'polygon-amoy',
  contracts: {
    // Core Protocol
    lukasToken: '0xAeE0F26589a21BA4547765F630075262f330F1CB',
    latAmBasketIndex: '0x1Dccf1fB82946a293E03036e85edc2139cba1541',
    stabilizerVault: '0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3',
    lukasHook: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519',
    
    // Uniswap V4 (To be updated after deployment)
    poolManager: '0x0000000000000000000000000000000000000000', // TBD
    lukasUsdcPool: '0x0000000000000000000000000000000000000000', // TBD
    
    // External
    usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  },
  rpcUrl: 'https://rpc-amoy.polygon.technology',
  blockExplorer: 'https://amoy.polygonscan.com',
};
```

### Step 2: Implement SwapService

**File**: `packages/lukas-sdk/src/services/SwapServiceImpl.ts`

```typescript
import { ethers } from 'ethers';
import type { SwapService, SwapQuote } from './SwapService';
import type { LukasSDK } from '../core/LukasSDK';

export class SwapServiceImpl implements SwapService {
  constructor(
    private sdk: LukasSDK,
    private provider: ethers.Provider,
    private signer: ethers.Signer
  ) {}

  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: number
  ): Promise<SwapQuote> {
    try {
      // Get pool from PoolManager
      const poolManager = this.sdk.getContractManager().getContract('poolManager');
      
      // Get current pool price
      const poolPrice = await this.getPoolPrice(tokenIn, tokenOut);
      
      // Get fair price from oracle
      const oracle = this.sdk.getContractManager().getContract('latAmBasketIndex');
      const fairPrice = await oracle.getLukasFairPriceInUSDC();
      
      // Calculate output amount
      const amountOut = this.calculateAmountOut(
        amountIn,
        poolPrice,
        slippage
      );
      
      // Calculate minimum amount with slippage
      const minimumAmountOut = this.applySlippage(amountOut, slippage);
      
      return {
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        minimumAmountOut,
        priceImpact: this.calculatePriceImpact(poolPrice, fairPrice),
        slippage,
        poolPrice,
        fairPrice,
      };
    } catch (error) {
      throw new Error(`Failed to get swap quote: ${error}`);
    }
  }

  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minimumAmountOut: string,
    recipient?: string
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const signerAddress = await this.signer.getAddress();
      const to = recipient || signerAddress;

      // Get pool from PoolManager
      const poolManager = this.sdk.getContractManager().getContract('poolManager');
      
      // Approve token if needed
      await this.approveToken(tokenIn, poolManager.address, amountIn);
      
      // Execute swap
      const tx = await poolManager.swap(
        tokenIn,
        tokenOut,
        amountIn,
        minimumAmountOut,
        to
      );
      
      return tx;
    } catch (error) {
      throw new Error(`Failed to execute swap: ${error}`);
    }
  }

  private async getPoolPrice(
    tokenIn: string,
    tokenOut: string
  ): Promise<string> {
    // Get price from pool
    const poolManager = this.sdk.getContractManager().getContract('poolManager');
    const price = await poolManager.getPrice(tokenIn, tokenOut);
    return price.toString();
  }

  private calculateAmountOut(
    amountIn: string,
    poolPrice: string,
    slippage: number
  ): string {
    // Simple calculation: amountIn * poolPrice
    const amountInBN = ethers.parseEther(amountIn);
    const priceBN = ethers.parseEther(poolPrice);
    const amountOut = (amountInBN * priceBN) / ethers.parseEther('1');
    return amountOut.toString();
  }

  private applySlippage(
    amountOut: string,
    slippage: number
  ): string {
    // Apply slippage: amountOut * (1 - slippage/100)
    const amountOutBN = ethers.parseEther(amountOut);
    const slippageFactor = ethers.parseEther((1 - slippage / 100).toString());
    const minimumAmountOut = (amountOutBN * slippageFactor) / ethers.parseEther('1');
    return minimumAmountOut.toString();
  }

  private calculatePriceImpact(
    poolPrice: string,
    fairPrice: string
  ): number {
    // Price impact = (poolPrice - fairPrice) / fairPrice * 100
    const poolPriceBN = ethers.parseEther(poolPrice);
    const fairPriceBN = ethers.parseEther(fairPrice);
    const impact = ((poolPriceBN - fairPriceBN) * 10000n) / fairPriceBN;
    return Number(impact) / 100;
  }

  private async approveToken(
    token: string,
    spender: string,
    amount: string
  ): Promise<void> {
    const tokenContract = this.sdk.getContractManager().getContract('lukasToken');
    const allowance = await tokenContract.allowance(
      await this.signer.getAddress(),
      spender
    );
    
    if (allowance < ethers.parseEther(amount)) {
      const tx = await tokenContract.approve(spender, ethers.MaxUint256);
      await tx.wait();
    }
  }
}
```

### Step 3: Update useSwap Hook

**File**: `packages/lukas-sdk/src/react/hooks/useSwap.ts`

```typescript
import { useState, useCallback } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { SwapQuote } from '../../types';
import type { TransactionResponse } from 'ethers';

export interface UseSwapOptions {
  defaultSlippage?: number;
  refreshInterval?: number;
}

export interface UseSwapResult {
  quote: SwapQuote | null;
  quoteLoading: boolean;
  quoteError: Error | null;
  swapLoading: boolean;
  swapError: Error | null;
  transaction: TransactionResponse | null;
  getQuote: (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage?: number
  ) => Promise<void>;
  executeSwap: (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minimumAmountOut: string,
    recipient?: string
  ) => Promise<void>;
  reset: () => void;
}

export function useSwap(
  sdk: LukasSDK | null,
  options: UseSwapOptions = {}
): UseSwapResult {
  const { defaultSlippage = 0.5 } = options;

  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<Error | null>(null);

  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState<Error | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);

  const getQuote = useCallback(
    async (
      tokenIn: string,
      tokenOut: string,
      amountIn: string,
      slippage: number = defaultSlippage
    ) => {
      if (!sdk) {
        setQuoteError(new Error('SDK not initialized'));
        return;
      }

      try {
        setQuoteLoading(true);
        setQuoteError(null);

        const swapService = sdk.getSwapService();
        const swapQuote = await swapService.getSwapQuote(
          tokenIn,
          tokenOut,
          amountIn,
          slippage
        );

        setQuote(swapQuote);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get swap quote');
        setQuoteError(error);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    },
    [sdk, defaultSlippage]
  );

  const executeSwap = useCallback(
    async (
      tokenIn: string,
      tokenOut: string,
      amountIn: string,
      minimumAmountOut: string,
      recipient?: string
    ) => {
      if (!sdk) {
        setSwapError(new Error('SDK not initialized'));
        return;
      }

      try {
        setSwapLoading(true);
        setSwapError(null);
        setTransaction(null);

        const swapService = sdk.getSwapService();
        const tx = await swapService.executeSwap(
          tokenIn,
          tokenOut,
          amountIn,
          minimumAmountOut,
          recipient
        );

        setTransaction(tx);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to execute swap');
        setSwapError(error);
      } finally {
        setSwapLoading(false);
      }
    },
    [sdk]
  );

  const reset = useCallback(() => {
    setQuote(null);
    setQuoteError(null);
    setSwapError(null);
    setTransaction(null);
  }, []);

  return {
    quote,
    quoteLoading,
    quoteError,
    swapLoading,
    swapError,
    transaction,
    getQuote,
    executeSwap,
    reset,
  };
}
```

### Step 4: Update SwapWidget

**File**: `apps/web/src/components/SwapWidget.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useLukasProtocol } from '../hooks/useLukasProtocol';
import { useSwap } from '@lukas-protocol/sdk/react';
import { useAccount } from 'wagmi';

export function SwapWidget() {
  const { sdk } = useLukasProtocol();
  const { address } = useAccount();
  
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [tokenIn, setTokenIn] = useState<'lukas' | 'usdc'>('usdc');
  const [tokenOut, setTokenOut] = useState<'lukas' | 'usdc'>('lukas');

  const {
    quote,
    quoteLoading,
    quoteError,
    swapLoading,
    swapError,
    getQuote,
    executeSwap,
    reset,
  } = useSwap(sdk, {
    defaultSlippage: slippage,
  });

  const handleGetQuote = async () => {
    if (!amountIn || !sdk) return;

    const networkInfo = sdk.getNetworkInfo();
    const tokenInAddress = tokenIn === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;
    const tokenOutAddress = tokenOut === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;

    await getQuote(tokenInAddress, tokenOutAddress, amountIn, slippage);
  };

  const handleSwap = async () => {
    if (!quote || !sdk) return;

    const networkInfo = sdk.getNetworkInfo();
    const tokenInAddress = tokenIn === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;
    const tokenOutAddress = tokenOut === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;

    await executeSwap(
      tokenInAddress,
      tokenOutAddress,
      amountIn,
      quote.minimumAmountOut,
      address
    );
  };

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn('');
    reset();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Swap Tokens</h2>

      {/* Price Display */}
      {quoteLoading ? (
        <div className="mb-4 text-sm text-gray-500">Loading price...</div>
      ) : quoteError ? (
        <div className="mb-4 text-sm text-yellow-600">
          ⚠️ {quoteError.message}
        </div>
      ) : quote ? (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          1 {tokenIn.toUpperCase()} = {(Number(quote.poolPrice) / 1e18).toFixed(6)} {tokenOut.toUpperCase()}
        </div>
      ) : null}

      {/* Token Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">From</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={swapLoading || !sdk}
          />
          <select
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value as 'lukas' | 'usdc')}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={swapLoading}
          >
            <option value="lukas">LUKAS</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleFlipTokens}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={swapLoading}
        >
          ↕️
        </button>
      </div>

      {/* Token Output */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">To</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={quote ? (Number(quote.amountOut) / 1e18).toFixed(6) : '0.0'}
            placeholder="0.0"
            className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            disabled
            readOnly
          />
          <select
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value as 'lukas' | 'usdc')}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={swapLoading}
          >
            <option value="lukas">LUKAS</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
      </div>

      {/* Slippage Settings */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Slippage Tolerance: {slippage}%
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          className="w-full"
          disabled={swapLoading}
        />
      </div>

      {/* Quote Info */}
      {quote && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
          <div className="flex justify-between mb-1">
            <span>Price Impact:</span>
            <span className={quote.priceImpact > 0 ? 'text-red-500' : 'text-green-500'}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Minimum Received:</span>
            <span>
              {(Number(quote.minimumAmountOut) / 1e18).toFixed(6)} {tokenOut.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {quoteError && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
          {quoteError.message}
        </div>
      )}
      {swapError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
          {swapError.message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleGetQuote}
          disabled={!amountIn || quoteLoading || swapLoading || !sdk || tokenIn === tokenOut}
          className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {quoteLoading ? 'Getting Quote...' : 'Get Quote'}
        </button>
        <button
          onClick={handleSwap}
          disabled={!quote || swapLoading || !address}
          className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {swapLoading ? 'Swapping...' : 'Swap'}
        </button>
      </div>

      {!address && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Connect your wallet to swap tokens
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Data Flow

### Quote Flow
```
User Input (amountIn, tokenIn, tokenOut, slippage)
    ↓
handleGetQuote()
    ↓
useSwap.getQuote()
    ↓
SwapService.getSwapQuote()
    ↓
PoolManager.getPrice()
    ↓
LatAmBasketIndex.getLukasFairPriceInUSDC()
    ↓
Calculate amountOut, minimumAmountOut, priceImpact
    ↓
Update UI with quote
```

### Swap Flow
```
User clicks Swap
    ↓
handleSwap()
    ↓
useSwap.executeSwap()
    ↓
SwapService.executeSwap()
    ↓
Approve token (if needed)
    ↓
PoolManager.swap()
    ↓
LukasHook monitors peg
    ↓
StabilizerVault (if needed)
    ↓
Transaction confirmed
    ↓
Update UI with result
```

---

## 🧪 Testing

### Unit Tests
```typescript
// Test SwapService
describe('SwapService', () => {
  it('should get swap quote', async () => {
    const quote = await swapService.getSwapQuote(
      lukasToken,
      usdc,
      '1000000000000000000', // 1 LUKAS
      0.5
    );
    expect(quote).toBeDefined();
    expect(quote.amountOut).toBeGreaterThan(0);
  });

  it('should execute swap', async () => {
    const tx = await swapService.executeSwap(
      usdc,
      lukasToken,
      '1000000', // 1 USDC
      '0',
      userAddress
    );
    expect(tx).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Test SwapWidget
describe('SwapWidget', () => {
  it('should display quote after getting quote', async () => {
    const { getByText, getByPlaceholderText } = render(<SwapWidget />);
    
    const input = getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '1' } });
    
    const quoteButton = getByText('Get Quote');
    fireEvent.click(quoteButton);
    
    await waitFor(() => {
      expect(getByText(/Price Impact:/)).toBeInTheDocument();
    });
  });
});
```

---

## 📋 Checklist

### SDK Integration
- [ ] Update deployments with contract addresses
- [ ] Implement SwapService
- [ ] Update useSwap hook
- [ ] Add error handling
- [ ] Add transaction tracking

### UI Integration
- [ ] Update SwapWidget
- [ ] Connect to useSwap hook
- [ ] Add real price updates
- [ ] Add balance tracking
- [ ] Add transaction status

### Testing
- [ ] Unit tests for SwapService
- [ ] Integration tests for SwapWidget
- [ ] End-to-end tests
- [ ] Gas optimization tests
- [ ] Security audit

### Deployment
- [ ] Deploy PoolManager
- [ ] Initialize LUKAS/USDC pool
- [ ] Provide initial liquidity
- [ ] Verify on Polygonscan
- [ ] Update SDK addresses

---

## 🚀 Next Steps

1. **Deploy PoolManager** - Get Uniswap V4 PoolManager deployed
2. **Initialize Pool** - Create LUKAS/USDC pool with hook
3. **Implement SwapService** - Add swap logic to SDK
4. **Update UI** - Connect SwapWidget to SDK
5. **Test & Optimize** - Run comprehensive tests

---

**Status**: 🟡 READY FOR IMPLEMENTATION  
**Last Updated**: December 18, 2025
