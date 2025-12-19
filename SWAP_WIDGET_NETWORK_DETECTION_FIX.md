# SwapWidget Network Detection Fix

## Problem
When connected to Chain 56 (BSC) or any unsupported network where contracts aren't deployed, the SwapWidget was still showing a LUKAS price (0.097600 USDC). This was misleading because:
1. No contracts exist on that network
2. There's no actual pool to get price data from
3. Users couldn't perform swaps anyway

## Root Cause
The price fetching logic had a fallback that would show a mock price even when `networkWarning` was set, because:
- The price fetch effect didn't check `hasContracts` state
- The mock price fallback was always applied when SDK service failed
- No guard to prevent price display on unsupported networks

## Solution
Implemented proper network-aware price handling:

### 1. Added `hasContracts` State
```typescript
const [hasContracts, setHasContracts] = useState(false);
```

### 2. Network Validation Effect
Checks if contracts are deployed on the current network:
```typescript
useEffect(() => {
  if (!isInitialized || !networkInfo) {
    setNetworkWarning('SDK initializing...');
    setHasContracts(false);
    setPrice(null);
    return;
  }

  const { lukasToken, usdc } = networkInfo.contracts;
  const zeroAddr = '0x0000000000000000000000000000000000000000';
  
  if (lukasToken === zeroAddr || usdc === zeroAddr) {
    setNetworkWarning(`Contracts not deployed on this network (Chain ${chainId})`);
    setHasContracts(false);
    setPrice(null);
  } else {
    setNetworkWarning(null);
    setHasContracts(true);
  }
}, [isInitialized, networkInfo, chainId]);
```

### 3. Conditional Price Fetching
Price is only fetched when contracts are available:
```typescript
useEffect(() => {
  if (!sdk || !isInitialized || !hasContracts) {
    setPrice(null);
    return;
  }
  // ... fetch price only if hasContracts is true
}, [sdk, isInitialized, hasContracts]);
```

### 4. Network Dialog Integration
When user clicks "Switch Network" button, the Web3SettingsDialog opens:
```typescript
{networkWarning && (
  <div className="mb-3 sm:mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg...">
    <span className="mt-0.5">⚠️</span>
    <div className="flex-1">
      <p>{networkWarning}</p>
      <button
        onClick={() => setShowNetworkDialog(true)}
        className="mt-2 text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Switch Network
      </button>
    </div>
  </div>
)}
```

### 5. Unsupported Network Message
When no contracts are available, shows helpful message instead of price:
```typescript
{networkWarning ? (
  <div className="w-full mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
      🔗 Unsupported Network
    </div>
    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-3">
      Contracts are deployed on Ethereum Sepolia and Polygon Amoy testnet
    </p>
    <div className="flex gap-2 justify-center flex-wrap">
      <span className="text-xs px-2 py-1 bg-blue-500/20 rounded text-blue-600 dark:text-blue-400">🔵 Sepolia</span>
      <span className="text-xs px-2 py-1 bg-blue-500/20 rounded text-blue-600 dark:text-blue-400">🟣 Polygon Amoy</span>
    </div>
  </div>
) : (
  // Show price button only if contracts are available
)}
```

## Behavior Changes

### Before
- Connected to Chain 56 (BSC)
- SwapWidget shows: "1 LUKAS = 0.097600 USDC"
- User confused - no contracts exist there

### After
- Connected to Chain 56 (BSC)
- SwapWidget shows: "🔗 Unsupported Network"
- Message: "Contracts are deployed on Ethereum Sepolia and Polygon Amoy testnet"
- "Switch Network" button opens Web3SettingsDialog
- User can easily switch to supported network

## Supported Networks
- ✅ Ethereum Sepolia (11155111)
- ✅ Polygon Amoy (80002)
- ❌ All other networks show unsupported message

## Files Modified
- `apps/web/src/components/SwapWidget.tsx` - Complete rewrite with network detection

## Testing
1. Connect wallet to Chain 56 (BSC)
2. Verify SwapWidget shows "Unsupported Network" message
3. Click "Switch Network" button
4. Verify Web3SettingsDialog opens
5. Switch to Sepolia or Polygon Amoy
6. Verify price displays correctly
7. Verify all swap functionality works
