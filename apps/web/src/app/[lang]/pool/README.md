# Pool View - LUKAS/USDC Pool Metrics & Trading

## Overview

The Pool View provides a comprehensive interface for viewing and interacting with the LUKAS/USDC Uniswap V4 pool on Polygon Amoy Testnet. It combines trading functionality with detailed pool metrics and monitoring capabilities.

## Route Structure

```
/[lang]/pool/
├── page.tsx              # Server component that renders PoolPageClient
└── PoolPageClient.tsx    # Client component with all pool functionality
```

## Features

### 1. Swap View
- **Swap Widget**: Execute LUKAS ↔ USDC trades
- **Quick Stats**: Display current price, 24h volume, total liquidity, and fee tier
- **Status Cards**: Show pool status and fair price information
- **Sticky Widget**: Swap widget remains visible while scrolling

### 2. Pool Metrics View
- **Pool Overview**: Key metrics in a grid layout
  - Current Price
  - 24h High
  - 24h Low
  - 24h Change
- **Monitoring Dashboard**: Full dashboard with:
  - Pool metrics panel
  - Transaction history
  - Activity feed
  - Price chart (24h with 1-hour candles)

### 3. Detailed View
- **Pool Configuration**: Token pair, fee tier, tick spacing, current tick
- **Liquidity Details**: Total liquidity, locked amounts, LP count, unclaimed fees
- **Trading Statistics**: Total swaps, 24h swaps, total volume, 24h volume
- **Price Information**: Current price, 24h high/low, price deviation
- **Full Monitoring Dashboard**: Complete pool monitoring interface

## Navigation

Users can navigate between views using the tab buttons at the top:
- **Swap**: Quick trading interface
- **Pool Metrics**: Overview with monitoring dashboard
- **Detailed View**: Comprehensive pool analysis

## Components Used

- `SwapWidget`: Trading interface component
- `MonitoringDashboard`: Real-time pool metrics and monitoring
- `PriceChart`: 24-hour price history with 1-hour candles

## Data Flow

```
PoolPageClient (Client Component)
├── State Management (activeView)
├── SwapWidget
│   └── Uses useLukasProtocol hook
├── Quick Stats (Static/Mock Data)
├── MonitoringDashboard
│   ├── usePoolMetrics hook
│   ├── PoolMetricsPanel
│   └── PriceChart
└── Detailed Analysis (Static/Mock Data)
```

## Styling

- **Dark Theme**: Slate-950 background with gradient overlays
- **Responsive**: Mobile-first design with breakpoints at md (768px) and lg (1024px)
- **Accent Colors**: Blue for primary actions, green for positive metrics, red for negative
- **Backdrop Blur**: Modern glassmorphism effects for cards and navigation

## Integration Points

### With Main Page
- Link added to CurrencyPageClient: "View Pool Metrics" button
- Maintains language parameter in URL

### With SDK
- Uses `useLukasProtocol` hook for SDK access
- Integrates with `usePoolMetrics` for real-time data
- Connects to `MonitoringDashboard` for comprehensive metrics

## Future Enhancements

1. **Real-time Updates**: Connect to WebSocket for live price updates
2. **Advanced Charts**: Add more chart types (candlestick, volume profile)
3. **Liquidity Depth**: Implement liquidity depth visualization
4. **Transaction Filtering**: Add advanced filtering options
5. **Export Data**: Allow users to export pool data
6. **Alerts**: Set price alerts and notifications

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Color contrast compliance
- Keyboard navigation support
- ARIA labels where needed

## Performance Considerations

- Sticky positioning for swap widget
- Lazy loading for charts
- Memoization of expensive calculations
- Efficient re-renders with proper dependency arrays
