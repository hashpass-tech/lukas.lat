# Requirements Document - Swap UI Pool Integration & Monitoring Dashboard

## Introduction

This feature integrates the existing SwapWidget UI with the newly deployed LUKAS/USDC Uniswap V4 pool on Polygon Amoy Testnet. Additionally, it creates a comprehensive monitoring dashboard to track pool transactions, liquidity, prices, and protocol activity in real-time.

The system will enable users to swap LUKAS for USDC and vice versa through the UI, while providing administrators and users with detailed visibility into pool operations and protocol health.

## Glossary

- **LUKAS Token**: The basket-stable token pegged to the LatAm Peso Index (LPI), deployed at `0x63524b53983960231b7b86CDEdDf050Ceb9263Cb`
- **USDC**: USD Coin stablecoin, deployed at `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`
- **PoolManager**: Uniswap V4 PoolManager contract at `0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E`
- **Pool**: LUKAS/USDC trading pair with 0.3% fee and 60 tick spacing
- **Liquidity**: Total value of tokens locked in the pool (10 LUKAS + 0.976 USDC initially)
- **Swap**: Exchange of one token for another through the pool
- **Price Impact**: The difference between the current pool price and the execution price
- **Slippage**: Maximum acceptable price difference (user-configurable, default 0.5%)
- **Transaction History**: Record of all swaps, liquidity additions/removals, and price changes
- **Monitoring Dashboard**: Real-time view of pool metrics, transactions, and protocol activity

## Requirements

### Requirement 1: Swap UI Integration with Pool

**User Story**: As a user, I want to swap LUKAS for USDC and vice versa through the SwapWidget, so that I can exchange tokens at fair market prices.

#### Acceptance Criteria

1. WHEN a user enters an amount in the "From" field and selects LUKAS as the input token, THEN the system SHALL query the pool for the current exchange rate and display the estimated output amount in the "To" field
2. WHEN a user clicks "Get Quote", THEN the system SHALL fetch the current swap quote from the pool, including price impact and minimum received amount based on slippage tolerance
3. WHEN a user clicks "Swap" with a valid quote, THEN the system SHALL execute the swap transaction through the PoolManager and display the transaction hash
4. WHEN a swap transaction is pending, THEN the system SHALL display a loading state and prevent additional swaps until the transaction completes
5. WHEN a swap transaction fails, THEN the system SHALL display a clear error message indicating the reason (insufficient balance, slippage exceeded, etc.)
6. WHEN a user adjusts the slippage tolerance slider, THEN the system SHALL update the minimum received amount in the quote display
7. WHEN a user flips tokens using the ↕️ button, THEN the system SHALL swap the input and output tokens and clear the amount field

### Requirement 2: Real-Time Pool Price Display

**User Story**: As a user, I want to see the current LUKAS/USDC exchange rate in real-time, so that I can make informed trading decisions.

#### Acceptance Criteria

1. WHEN the SwapWidget loads, THEN the system SHALL display the current pool price (1 LUKAS = X USDC) with automatic refresh every 10 seconds
2. WHEN the pool price changes due to a swap, THEN the system SHALL update the displayed price within 2 seconds
3. WHEN the price cannot be fetched (pool not deployed or network error), THEN the system SHALL display a warning message instead of a price
4. WHEN a user hovers over the price display, THEN the system SHALL show additional information (sqrtPriceX96, tick, liquidity)

### Requirement 3: Token Balance Display

**User Story**: As a user, I want to see my current LUKAS and USDC balances, so that I know how much I can swap.

#### Acceptance Criteria

1. WHEN a user connects their wallet, THEN the system SHALL fetch and display their LUKAS balance in the "From" field balance display
2. WHEN a user connects their wallet, THEN the system SHALL fetch and display their USDC balance in the "To" field balance display
3. WHEN a user's balance changes (due to a swap or external transfer), THEN the system SHALL update the displayed balance within 5 seconds
4. WHEN a user enters an amount greater than their balance, THEN the system SHALL disable the "Get Quote" button and display a warning

### Requirement 4: Pool Monitoring Dashboard

**User Story**: As an administrator or user, I want to view comprehensive pool metrics and transaction history, so that I can monitor protocol health and activity.

#### Acceptance Criteria

1. WHEN the monitoring dashboard loads, THEN the system SHALL display current pool metrics including total liquidity, current price, 24h volume, and fee tier
2. WHEN the dashboard loads, THEN the system SHALL display a transaction history table showing the last 50 swaps with timestamp, trader, tokens, amounts, and price impact
3. WHEN a new swap occurs, THEN the system SHALL add it to the transaction history table in real-time (within 2 seconds)
4. WHEN a user clicks on a transaction in the history, THEN the system SHALL display detailed information including transaction hash, gas used, and block number
5. WHEN the dashboard loads, THEN the system SHALL display a price chart showing LUKAS/USDC price over the last 24 hours with 1-hour candles
6. WHEN the dashboard loads, THEN the system SHALL display liquidity depth chart showing available liquidity at different price levels
7. WHEN a user filters the transaction history by date range, THEN the system SHALL update the table to show only transactions within that range
8. WHEN a user filters the transaction history by transaction type (swaps, liquidity adds, liquidity removes), THEN the system SHALL update the table accordingly

### Requirement 5: Protocol Activity Monitoring

**User Story**: As an administrator, I want to monitor protocol-wide activity including contract interactions and state changes, so that I can ensure system health and detect anomalies.

#### Acceptance Criteria

1. WHEN the monitoring dashboard loads, THEN the system SHALL display a protocol activity feed showing recent contract interactions (swaps, approvals, transfers)
2. WHEN the dashboard loads, THEN the system SHALL display key protocol metrics including total swaps, total volume, average price, and price deviation from fair value
3. WHEN the dashboard loads, THEN the system SHALL display contract status indicators for LukasToken, PoolManager, and LatAmBasketIndex showing deployment status and verification status
4. WHEN a contract interaction occurs, THEN the system SHALL log it to the activity feed in real-time
5. WHEN the price deviates more than 2% from the fair value (from LatAmBasketIndex), THEN the system SHALL display a warning indicator on the dashboard

### Requirement 6: Transaction Confirmation & Status Tracking

**User Story**: As a user, I want to track the status of my swap transactions from submission to confirmation, so that I know when my swap is complete.

#### Acceptance Criteria

1. WHEN a user executes a swap, THEN the system SHALL display a transaction confirmation modal showing the transaction hash and status (pending/confirmed/failed)
2. WHEN a transaction is pending, THEN the system SHALL poll the blockchain every 2 seconds to check for confirmation
3. WHEN a transaction is confirmed, THEN the system SHALL display a success message and update the user's token balances
4. WHEN a transaction fails, THEN the system SHALL display the error reason and allow the user to retry
5. WHEN a user clicks on the transaction hash, THEN the system SHALL open the transaction on Polygonscan in a new tab

### Requirement 7: Error Handling & User Feedback

**User Story**: As a user, I want clear error messages and helpful feedback when something goes wrong, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN a swap fails due to insufficient balance, THEN the system SHALL display "Insufficient [TOKEN] balance" with the required amount
2. WHEN a swap fails due to slippage exceeded, THEN the system SHALL display "Price moved more than [X]% - please try again or increase slippage"
3. WHEN a swap fails due to network error, THEN the system SHALL display "Network error - please check your connection and try again"
4. WHEN the pool is not deployed, THEN the system SHALL display "Pool not yet deployed - swap functionality coming soon"
5. WHEN a user is not connected to the correct network, THEN the system SHALL display "Please connect to Polygon Amoy Testnet"

---

## Acceptance Criteria Summary

| Requirement | Total Criteria | Type |
|-------------|---|---|
| 1. Swap UI Integration | 7 | Functional |
| 2. Real-Time Price Display | 4 | Functional |
| 3. Token Balance Display | 4 | Functional |
| 4. Pool Monitoring Dashboard | 8 | Functional |
| 5. Protocol Activity Monitoring | 5 | Functional |
| 6. Transaction Confirmation | 5 | Functional |
| 7. Error Handling | 5 | Functional |
| **TOTAL** | **38** | **Functional** |

