# Implementation Plan - Swap UI Pool Integration & Monitoring Dashboard

## Overview

This implementation plan breaks down the feature into discrete, manageable coding tasks that build incrementally on each other. Each task includes specific requirements and references to the design document.

---

## Phase 1: Core Swap Service Implementation

- [x] 1. Set up SDK service structure and interfaces
  - Create `packages/lukas-sdk/src/services/` directory structure
  - Define SwapService interface with getSwapQuote and executeSwap methods
  - Define PoolService interface with pool state methods
  - Create service factory in LukasSDK core
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement SwapService
  - [x] 2.1 Create SwapService class with quote calculation
    - Implement getSwapQuote() method
    - Calculate amountOut using constant product formula
    - Calculate price impact
    - Calculate minimum amount out with slippage
    - _Requirements: 1.2, 1.6_
  
  - [x]* 2.2 Write property test for quote accuracy
    - **Property 1: Swap Quote Accuracy**
    - **Validates: Requirements 1.2, 1.6**
  
  - [x] 2.3 Implement executeSwap() method
    - Build swap transaction parameters
    - Handle token approvals
    - Execute swap through PoolManager
    - Return transaction response
    - _Requirements: 1.3, 1.4_
  
  - [x]* 2.4 Write property test for slippage protection
    - **Property 7: Slippage Protection**
    - **Validates: Requirements 1.5, 6.4**

- [x] 3. Implement PoolService
  - [x] 3.1 Create PoolService class with pool state methods
    - Implement getPoolPrice() method
    - Implement getPoolState() method
    - Implement getPoolLiquidity() method
    - Calculate price from sqrtPriceX96
    - _Requirements: 2.1, 4.1_
  
  - [ ]* 3.2 Write property test for price consistency
    - **Property 2: Price Consistency**
    - **Validates: Requirements 2.1, 2.2**
  
  - [x] 3.3 Implement getTransactionHistory() method
    - Query pool events from blockchain
    - Parse swap events
    - Return formatted transaction list
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 3.4 Write property test for transaction history completeness
    - **Property 4: Transaction History Completeness**
    - **Validates: Requirements 4.2, 4.3**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 2: React Hooks Implementation

- [x] 5. Update useSwap hook with SwapService
  - [x] 5.1 Integrate SwapService into useSwap hook
    - Update getQuote() to use SwapService
    - Update executeSwap() to use SwapService
    - Add proper error handling
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 5.2 Write unit tests for useSwap hook
    - Test quote fetching
    - Test swap execution
    - Test error handling
    - Test state management
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 6. Create usePoolMetrics hook
  - [x] 6.1 Implement usePoolMetrics hook
    - Fetch pool price on mount
    - Set up auto-refresh interval
    - Return price, liquidity, volume, 24h change
    - _Requirements: 2.1, 2.2, 4.1_
  
  - [ ]* 6.2 Write unit tests for usePoolMetrics hook
    - Test price fetching
    - Test auto-refresh
    - Test error handling
    - _Requirements: 2.1, 2.2_

- [x] 7. Create useTokenBalance hook
  - [x] 7.1 Implement useTokenBalance hook
    - Fetch user token balance
    - Set up auto-refresh on transaction
    - Return balance and loading state
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 7.2 Write property test for balance accuracy
    - **Property 3: Balance Accuracy**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 8. Create useTransactionHistory hook
  - [x] 8.1 Implement useTransactionHistory hook
    - Fetch transaction history from pool
    - Support filtering by date range
    - Support filtering by transaction type
    - Support pagination
    - _Requirements: 4.2, 4.3, 4.7, 4.8_
  
  - [ ]* 8.2 Write unit tests for useTransactionHistory hook
    - Test transaction fetching
    - Test filtering
    - Test pagination
    - _Requirements: 4.2, 4.3_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 3: SwapWidget UI Integration

- [x] 10. Update SwapWidget component with pool integration
  - [x] 10.1 Integrate useSwap hook
    - Replace mock data with real hook
    - Connect getQuote button to hook
    - Connect swap button to hook
    - Display loading states
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 10.2 Integrate usePoolMetrics hook
    - Display real-time pool price
    - Update price every 10 seconds
    - Show price change indicator
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 10.3 Integrate useTokenBalance hook
    - Display user LUKAS balance
    - Display user USDC balance
    - Update balances after swap
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 10.4 Implement error handling
    - Display insufficient balance error
    - Display slippage exceeded error
    - Display network error
    - Display pool not deployed message
    - _Requirements: 1.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 11. Implement transaction confirmation modal
  - [ ] 11.1 Create TransactionConfirmation component
    - Display transaction hash
    - Display transaction status (pending/confirmed/failed)
    - Poll blockchain for confirmation
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 11.2 Add Polygonscan link
    - Open transaction on Polygonscan
    - _Requirements: 6.5_

- [ ] 12. Implement quote display
  - [ ] 12.1 Update quote display section
    - Show price impact
    - Show minimum received amount
    - Update on slippage change
    - _Requirements: 1.2, 1.6_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 4: Monitoring Dashboard Implementation

- [x] 14. Create MonitoringDashboard component structure
  - [x] 14.1 Create MonitoringDashboard component
    - Set up component structure
    - Create layout with sections
    - Integrate usePoolMetrics hook
    - _Requirements: 4.1, 5.1_
  
  - [x] 14.2 Create PoolMetricsPanel component
    - Display total liquidity
    - Display current price
    - Display 24h volume
    - Display fee tier
    - _Requirements: 4.1, 5.1_

- [x] 15. Implement transaction history table
  - [x] 15.1 Create TransactionHistoryTable component
    - Display last 50 swaps
    - Show timestamp, trader, tokens, amounts, price impact
    - Implement pagination
    - _Requirements: 4.2, 4.3_
  
  - [x] 15.2 Implement transaction detail modal
    - Display full transaction details
    - Show transaction hash, gas used, block number
    - _Requirements: 4.4_
  
  - [x] 15.3 Implement transaction filtering
    - Filter by date range
    - Filter by transaction type
    - _Requirements: 4.7, 4.8_

- [x] 16. Implement price chart
  - [x] 16.1 Create PriceChart component
    - Display 24h price history
    - Show 1-hour candles
    - Use charting library (e.g., recharts)
    - _Requirements: 4.5_

- [ ] 17. Implement liquidity depth chart
  - [ ] 17.1 Create LiquidityDepthChart component
    - Display available liquidity at price levels
    - Show bid/ask side
    - _Requirements: 4.6_

- [ ] 18. Implement activity feed
  - [ ] 18.1 Create ActivityFeed component
    - Display recent contract interactions
    - Show swaps, approvals, transfers
    - Real-time updates
    - _Requirements: 5.1, 5.4_

- [ ] 19. Implement contract status indicators
  - [ ] 19.1 Create ContractStatus component
    - Show deployment status for LukasToken
    - Show deployment status for PoolManager
    - Show deployment status for LatAmBasketIndex
    - Show verification status
    - _Requirements: 5.3_

- [ ] 20. Implement protocol metrics display
  - [ ] 20.1 Create ProtocolMetrics component
    - Display total swaps
    - Display total volume
    - Display average price
    - Display price deviation from fair value
    - _Requirements: 5.2, 5.5_
  
  - [ ]* 20.2 Write property test for fair price deviation detection
    - **Property 8: Fair Price Deviation Detection**
    - **Validates: Requirements 5.5**

- [ ] 21. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 5: Real-Time Updates & Optimization

- [ ] 22. Implement real-time pool updates
  - [ ] 22.1 Add WebSocket subscription for pool events
    - Subscribe to swap events
    - Subscribe to price updates
    - Update UI in real-time
    - _Requirements: 2.2, 4.3, 5.4_
  
  - [ ] 22.2 Implement event polling fallback
    - Poll blockchain if WebSocket unavailable
    - Update every 2 seconds
    - _Requirements: 2.2, 4.3_

- [ ] 23. Optimize performance
  - [ ] 23.1 Implement data caching
    - Cache pool state
    - Cache transaction history
    - Invalidate cache on updates
    - _Requirements: 2.2, 4.3_
  
  - [ ] 23.2 Implement lazy loading
    - Lazy load transaction history
    - Lazy load charts
    - _Requirements: 4.2, 4.5, 4.6_

- [ ] 24. Add responsive design
  - [ ] 24.1 Make SwapWidget responsive
    - Mobile-friendly layout
    - Touch-friendly buttons
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 24.2 Make MonitoringDashboard responsive
    - Mobile-friendly layout
    - Collapsible sections
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

- [ ] 25. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 6: Testing & Documentation

- [ ] 26. Write comprehensive unit tests
  - [ ]* 26.1 Write unit tests for SwapWidget
    - Test quote fetching
    - Test swap execution
    - Test error handling
    - Test balance display
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_
  
  - [ ]* 26.2 Write unit tests for MonitoringDashboard
    - Test metrics display
    - Test transaction history
    - Test filtering
    - _Requirements: 4.1, 4.2, 4.7, 4.8_

- [ ] 27. Write integration tests
  - [ ]* 27.1 Write end-to-end swap test
    - Connect wallet
    - Enter amount
    - Get quote
    - Execute swap
    - Verify transaction
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3_
  
  - [ ]* 27.2 Write dashboard integration test
    - Load dashboard
    - Verify metrics display
    - Verify transaction history
    - Verify real-time updates
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_

- [ ] 28. Write documentation
  - [ ] 28.1 Create SwapWidget usage guide
    - Component props
    - Usage examples
    - Error handling
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 28.2 Create MonitoringDashboard usage guide
    - Component props
    - Usage examples
    - Filtering guide
    - _Requirements: 4.1, 4.2, 4.5, 4.6_
  
  - [ ] 28.3 Create SDK service documentation
    - SwapService API
    - PoolService API
    - Hook usage
    - _Requirements: 1.1, 2.1, 4.1_

- [ ] 29. Final testing & QA
  - [ ] 29.1 Manual testing on testnet
    - Test swap execution
    - Test error scenarios
    - Test UI responsiveness
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 29.2 Performance testing
    - Measure load times
    - Measure update latency
    - Optimize if needed
    - _Requirements: 2.2, 4.3, 5.4_

- [ ] 30. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Summary

**Total Tasks**: 30
**Core Tasks**: 20 (non-optional)
**Testing Tasks**: 10 (optional, marked with *)
**Estimated Duration**: 5-6 days
**Team Size**: 1-2 developers

**Key Milestones**:
- Day 1-2: Core services (SwapService, PoolService)
- Day 2-3: React hooks and SwapWidget integration
- Day 3-4: Monitoring dashboard
- Day 4-5: Real-time updates and optimization
- Day 5-6: Testing and documentation

