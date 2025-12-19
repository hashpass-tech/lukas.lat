# Contract Detection Logic - TODO for v0.2.34

## Issue
The Live indicator and price display in SwapWidget are not reliably detecting when contracts are deployed on a network.

**Current Behavior:**
- Sometimes shows "Live" when contracts are not actually deployed
- Price display inconsistent across network switches
- Contract detection depends on SDK's `networkInfo.contracts` which may not update properly

**Expected Behavior:**
- Show "● Live" (green) only when contracts are verified on-chain
- Show "● Not Live" (grey) when contracts are not deployed
- Consistent behavior across all networks (Ethereum Mainnet, Polygon Amoy, Sepolia)

## Root Cause
The SDK's `networkInfo.contracts` may not be properly updated when switching networks, or the contract addresses may be cached/stale.

## Proposed Solutions

### Solution 1: On-Chain Contract Verification (Recommended)
Implement direct on-chain verification using `eth_call`:
```typescript
async function verifyContractExists(address: string, provider: any): Promise<boolean> {
  try {
    const code = await provider.getCode(address);
    return code !== '0x'; // Contract exists if code is not empty
  } catch {
    return false;
  }
}
```

### Solution 2: Separate Contract Registry Service
Create an independent contract registry that:
- Maintains a mapping of chainId → contract addresses
- Validates contracts on initialization
- Provides real-time contract status

### Solution 3: Network-Specific Detection with Fallback
Combine deployments.json with on-chain verification:
- First check deployments.json for known networks
- Fall back to on-chain verification if needed
- Cache results with TTL

## Files to Update
- `apps/web/src/components/SwapWidget.tsx` - Contract detection logic
- `apps/web/src/app/providers/lukas-sdk-provider.tsx` - SDK initialization
- `apps/web/src/lib/network-colors.ts` - Add contract verification utilities

## Testing Checklist
- [ ] Connect to Ethereum Mainnet → should show "Not Live"
- [ ] Connect to Polygon Amoy → should show "Live"
- [ ] Connect to Sepolia → should show "Live"
- [ ] Switch between networks → Live indicator updates correctly
- [ ] Price displays only when contracts are Live
- [ ] Console logs show correct contract addresses for each network

## Priority
High - Affects user experience and contract interaction reliability

## Estimated Effort
2-3 hours for implementation and testing
