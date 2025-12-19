# Design Document - Swap UI Pool Integration & Monitoring Dashboard

## Overview

This design document outlines the architecture for integrating the SwapWidget UI with the deployed LUKAS/USDC Uniswap V4 pool and creating a comprehensive monitoring dashboard. The system consists of three main components:

1. **Enhanced SwapWidget** - Updated UI component with real-time pool integration
2. **Monitoring Dashboard** - Real-time pool metrics and transaction history
3. **SDK Services** - Backend services for pool interaction and data fetching

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  SwapWidget      │  │  Monitoring Dashboard            │ │
│  │  - Token Input   │  │  - Pool Metrics                  │ │
│  │  - Price Display │  │  - Transaction History           │ │
│  │  - Swap Button   │  │  - Price Chart                   │ │
│  │  - Balance Info  │  │  - Liquidity Depth               │ │
│  └────────┬─────────┘  │  - Activity Feed                 │ │
│           │            │  - Contract Status               │ │
│           │            └──────────────┬───────────────────┘ │
│           │                           │                      │
└───────────┼───────────────────────────┼──────────────────────┘
            │                           │
            └───────────────┬───────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    SDK Layer                                 │
├───────────────────────────┼──────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useSwap Hook                                        │   │
│  │  - getQuote()                                        │   │
│  │  - executeSwap()                                     │   │
│  │  - State management (loading, error, quote)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  usePoolMetrics Hook                                 │   │
│  │  - getPoolPrice()                                    │   │
│  │  - getPoolLiquidity()                                │   │
│  │  - getPoolVolume()                                   │   │
│  │  - Real-time updates                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useTransactionHistory Hook                          │   │
│  │  - fetchTransactions()                               │   │
│  │  - subscribeToNewTransactions()                       │   │
│  │  - Filtering & pagination                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SwapService                                         │   │
│  │  - getSwapQuote()                                    │   │
│  │  - executeSwap()                                     │   │
│  │  - Slippage calculation                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PoolService                                         │   │
│  │  - getPoolState()                                    │   │
│  │  - getPoolPrice()                                    │   │
│  │  - getLiquidity()                                    │   │
│  │  - getTransactionHistory()                           │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────┐
│                 Blockchain Layer                           │
├───────────────────────────┼────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Polygon Amoy Testnet (Chain ID: 80002)             │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  PoolManager: 0x48411eFDE2D053B2Fa9456d91...  │ │  │
│  │  │  - Pool state                                  │ │  │
│  │  │  - Swap execution                              │ │  │
│  │  │  - Liquidity management                        │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  LukasToken: 0x63524b53983960231b7b86...      │ │  │
│  │  │  - Token transfers                             │ │  │
│  │  │  - Approvals                                   │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  USDC: 0x41E94Eb019C0762f9Bfcf9Fb1E58...      │ │  │
│  │  │  - Token transfers                             │ │  │
│  │  │  - Approvals                                   │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  LatAmBasketIndex: 0x1Dccf1fB82946a293...     │ │  │
│  │  │  - Fair price oracle                           │ │  │
│  │  │  - Basket composition                          │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Enhanced SwapWidget Component

**Location**: `apps/web/src/components/SwapWidget.tsx`

**Responsibilities**:
- Display token input/output fields
- Show real-time pool price
- Display user token balances
- Handle swap execution
- Display transaction status

**Key Props**:
```typescript
interface SwapWidgetProps {
  onSwapComplete?: (txHash: string) => void;
  onError?: (error: Error) => void;
  defaultSlippage?: number;
}
```

**State Management**:
- `amountIn`: User input amount
- `tokenIn`: Selected input token (LUKAS or USDC)
- `tokenOut`: Selected output token
- `slippage`: Slippage tolerance
- `quote`: Current swap quote
- `loading`: Loading states for quote and swap

### 2. Monitoring Dashboard Component

**Location**: `apps/web/src/components/MonitoringDashboard.tsx` (NEW)

**Responsibilities**:
- Display pool metrics (liquidity, volume, price)
- Show transaction history with filtering
- Display price chart
- Show liquidity depth
- Display protocol activity feed
- Show contract status

**Key Sections**:
1. **Pool Metrics Panel** - Key statistics
2. **Transaction History Table** - Swap history with pagination
3. **Price Chart** - 24h price history
4. **Liquidity Depth Chart** - Available liquidity at price levels
5. **Activity Feed** - Real-time contract interactions
6. **Contract Status** - Deployment and verification status

### 3. SDK Services

#### SwapService

**Location**: `packages/lukas-sdk/src/services/SwapService.ts` (NEW)

```typescript
class SwapService {
  // Get swap quote
  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    slippage: number
  ): Promise<SwapQuote>

  // Execute swap
  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    minimumAmountOut: bigint,
    recipient?: string
  ): Promise<TransactionResponse>

  // Calculate minimum amount out
  calculateMinimumAmountOut(
    amountOut: bigint,
    slippage: number
  ): bigint
}
```

#### PoolService

**Location**: `packages/lukas-sdk/src/services/PoolService.ts` (NEW)

```typescript
class PoolService {
  // Get current pool price
  async getPoolPrice(): Promise<number>

  // Get pool liquidity
  async getPoolLiquidity(): Promise<PoolLiquidity>

  // Get pool state
  async getPoolState(): Promise<PoolState>

  // Get transaction history
  async getTransactionHistory(
    limit?: number,
    offset?: number
  ): Promise<Transaction[]>

  // Subscribe to pool updates
  subscribeToPoolUpdates(callback: (state: PoolState) => void): () => void
}
```

#### React Hooks

**useSwap Hook** - Updated

```typescript
function useSwap(sdk: LukasSDK, options?: UseSwapOptions): UseSwapResult {
  // Implemented with SwapService
}
```

**usePoolMetrics Hook** - NEW

```typescript
function usePoolMetrics(sdk: LukasSDK, refreshInterval?: number): UsePoolMetricsResult {
  // Real-time pool metrics
  // Returns: price, liquidity, volume, 24hChange
}
```

**useTransactionHistory Hook** - NEW

```typescript
function useTransactionHistory(
  sdk: LukasSDK,
  options?: UseTransactionHistoryOptions
): UseTransactionHistoryResult {
  // Transaction history with filtering
  // Returns: transactions, loading, error, filter, setFilter
}
```

## Data Models

### SwapQuote

```typescript
interface SwapQuote {
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number; // percentage
  minimumAmountOut: bigint;
  executionPrice: number;
  slippage: number;
}
```

### PoolState

```typescript
interface PoolState {
  price: number;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
  volume24h: number;
  feeGrowth: {
    token0: bigint;
    token1: bigint;
  };
}
```

### Transaction

```typescript
interface Transaction {
  hash: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity';
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number;
  timestamp: number;
  blockNumber: number;
  gasUsed: bigint;
  from: string;
  status: 'pending' | 'confirmed' | 'failed';
}
```

### PoolMetrics

```typescript
interface PoolMetrics {
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  totalLiquidity: number;
  liquidityToken0: bigint;
  liquidityToken1: bigint;
  feeTier: number;
  tickSpacing: number;
  priceDeviation: number; // from fair value
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Swap Quote Accuracy
*For any* valid swap parameters (tokenIn, tokenOut, amountIn, slippage), the returned quote's minimum amount out should be equal to the amountOut reduced by the slippage percentage.

**Validates: Requirements 1.2, 1.6**

### Property 2: Price Consistency
*For any* pool state, the displayed price should match the price calculated from sqrtPriceX96 using the formula: price = (sqrtPriceX96 / 2^96)^2

**Validates: Requirements 2.1, 2.2**

### Property 3: Balance Accuracy
*For any* user wallet, the displayed balance should match the actual token balance on-chain within 5 seconds of a transaction confirmation.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Transaction History Completeness
*For any* swap executed through the pool, it should appear in the transaction history within 2 seconds of confirmation.

**Validates: Requirements 4.2, 4.3**

### Property 5: Liquidity Invariant
*For any* pool state, the product of token0 and token1 liquidity should remain constant (or increase) after a swap, following the constant product formula.

**Validates: Requirements 4.1, 5.2**

### Property 6: Price Impact Calculation
*For any* swap, the price impact should be calculated as: (executionPrice - currentPrice) / currentPrice * 100, and should be non-negative for all swaps.

**Validates: Requirements 1.2, 4.1**

### Property 7: Slippage Protection
*For any* swap with slippage tolerance S, if the actual price impact exceeds S, the transaction should revert and not execute.

**Validates: Requirements 1.5, 6.4**

### Property 8: Fair Price Deviation Detection
*For any* pool price, if it deviates more than 2% from the fair price (from LatAmBasketIndex), the system should display a warning indicator.

**Validates: Requirements 5.5**

## Error Handling

### Swap Errors
- **Insufficient Balance**: Check token balance before swap
- **Slippage Exceeded**: Validate price impact against tolerance
- **Network Error**: Retry with exponential backoff
- **Transaction Reverted**: Display revert reason from blockchain

### Data Fetching Errors
- **Pool Not Found**: Display "Pool not deployed"
- **RPC Error**: Fallback to cached data or retry
- **Timeout**: Display "Network timeout - please try again"

### User Input Validation
- **Invalid Amount**: Validate numeric input
- **Same Token**: Prevent swapping same token
- **Zero Amount**: Disable swap button
- **Disconnected Wallet**: Display "Connect wallet"

## Testing Strategy

### Unit Tests
- SwapService quote calculation
- PoolService price calculation
- Slippage calculation
- Balance validation
- Error message generation

### Integration Tests
- End-to-end swap execution
- Pool state updates
- Transaction history fetching
- Real-time price updates
- Balance synchronization

### Property-Based Tests
- Quote accuracy across random inputs
- Price consistency with sqrtPriceX96
- Balance accuracy after transactions
- Transaction history completeness
- Liquidity invariant preservation
- Price impact calculation
- Slippage protection
- Fair price deviation detection

### Manual Tests
- Swap execution on testnet
- UI responsiveness
- Error message clarity
- Real-time updates
- Mobile responsiveness

## Implementation Phases

### Phase 1: Core Swap Integration (Days 1-2)
- Update SwapWidget with pool integration
- Implement SwapService
- Implement useSwap hook
- Basic error handling

### Phase 2: Real-Time Updates (Days 2-3)
- Implement PoolService
- Implement usePoolMetrics hook
- Real-time price updates
- Balance synchronization

### Phase 3: Monitoring Dashboard (Days 3-4)
- Create MonitoringDashboard component
- Implement transaction history
- Add price chart
- Add liquidity depth chart

### Phase 4: Advanced Features (Days 4-5)
- Activity feed
- Contract status monitoring
- Price deviation alerts
- Transaction filtering

### Phase 5: Testing & Optimization (Days 5-6)
- Property-based tests
- Performance optimization
- UI/UX refinement
- Documentation

