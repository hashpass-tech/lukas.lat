# Troubleshooting

Common issues and solutions when working with the Lukas SDK.

## Installation Issues

### Module Not Found

**Problem:** `Cannot find module '@lukas-protocol/sdk'`

**Solution:**
1. Verify the package is installed:
   ```bash
   npm list @lukas-protocol/sdk
   ```
2. Reinstall if necessary:
   ```bash
   npm install @lukas-protocol/sdk
   ```
3. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### TypeScript Errors

**Problem:** TypeScript compilation errors with SDK types

**Solution:**
1. Ensure you're using TypeScript 4.5 or higher
2. Check your `tsconfig.json` includes proper settings:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "node",
       "esModuleInterop": true,
       "skipLibCheck": true
     }
   }
   ```
3. Install type definitions for ethers:
   ```bash
   npm install --save-dev @types/node
   ```

### Peer Dependency Warnings

**Problem:** Peer dependency warnings for `ethers`

**Solution:**
Install the correct version of ethers:
```bash
npm install ethers@^6.0.0
```

## Network Issues

### Network Not Supported

**Problem:** `LukasSDKError: NETWORK_NOT_SUPPORTED`

**Solution:**
1. Verify you're using a supported network (chainId: 80002 for Polygon Amoy)
2. For custom networks, provide contract addresses:
   ```typescript
   const sdk = new LukasSDK({
     network: {
       chainId: 31337,
       name: 'localhost',
     },
     contracts: {
       lukasToken: '0x...',
       stabilizerVault: '0x...',
       latAmBasketIndex: '0x...',
       lukasHook: '0x...',
       usdc: '0x...',
     },
   });
   ```

### Network Connection Failed

**Problem:** `LukasSDKError: NETWORK_CONNECTION_FAILED`

**Solution:**
1. Check your internet connection
2. Verify the RPC endpoint is accessible:
   ```typescript
   const sdk = new LukasSDK({
     network: {
       chainId: 80002,
       name: 'amoy',
       rpcUrl: 'https://rpc-amoy.polygon.technology',
     },
   });
   ```
3. Try a different RPC endpoint
4. Check if the RPC endpoint has rate limits

### Network Mismatch

**Problem:** Provider network doesn't match configured network

**Solution:**
1. Use auto-detection:
   ```typescript
   await sdk.autoDetectNetwork();
   ```
2. Or prompt user to switch networks in their wallet
3. Monitor network changes:
   ```typescript
   sdk.onNetworkMismatch((expected, actual) => {
     alert(`Please switch to network ${expected}`);
   });
   ```

## Provider Issues

### Provider Not Available

**Problem:** `LukasSDKError: PROVIDER_NOT_AVAILABLE`

**Solution:**
1. Check if MetaMask or another wallet is installed
2. Verify the provider is properly initialized:
   ```typescript
   if (typeof window.ethereum !== 'undefined') {
     const provider = new BrowserProvider(window.ethereum);
     await sdk.connect(provider);
   } else {
     console.error('Please install MetaMask');
   }
   ```

### Signer Required

**Problem:** `LukasSDKError: SIGNER_REQUIRED`

**Solution:**
1. Connect a wallet provider:
   ```typescript
   const provider = new BrowserProvider(window.ethereum);
   await sdk.connect(provider);
   ```
2. Check if in read-only mode:
   ```typescript
   if (sdk.isReadOnly()) {
     console.log('Please connect your wallet');
   }
   ```

### User Rejected Request

**Problem:** User rejected the connection request in their wallet

**Solution:**
1. Handle the rejection gracefully:
   ```typescript
   try {
     await sdk.connect(provider);
   } catch (error) {
     if (error.code === 4001) {
       console.log('User rejected the request');
     }
   }
   ```
2. Provide clear instructions to the user
3. Add a retry mechanism

## Contract Issues

### Contract Not Deployed

**Problem:** `LukasSDKError: CONTRACT_NOT_DEPLOYED`

**Solution:**
1. Verify you're on the correct network
2. Check if contracts are deployed on this network
3. For custom networks, provide contract addresses manually

### Contract Call Failed

**Problem:** `LukasSDKError: CONTRACT_CALL_FAILED`

**Solution:**
1. Check if the contract method exists
2. Verify you have the correct permissions
3. Ensure you're passing valid parameters
4. Check if the contract is paused or has restrictions

### Transaction Failed

**Problem:** Transaction reverts or fails

**Solution:**
1. Check error message for revert reason:
   ```typescript
   try {
     const tx = await contractManager.transfer(to, amount);
     await tx.wait();
   } catch (error) {
     console.error('Transaction failed:', error.message);
   }
   ```
2. Common causes:
   - Insufficient balance
   - Insufficient allowance
   - Gas limit too low
   - Slippage too high
3. Verify transaction parameters before sending

## Balance and Allowance Issues

### Insufficient Balance

**Problem:** `LukasSDKError: INSUFFICIENT_BALANCE`

**Solution:**
1. Check balance before transaction:
   ```typescript
   const balance = await contractManager.getBalance(address);
   if (balance.lt(amount)) {
     console.error('Insufficient balance');
   }
   ```
2. Ensure you're checking the correct address
3. Verify the amount includes decimals

### Insufficient Allowance

**Problem:** `LukasSDKError: INSUFFICIENT_ALLOWANCE`

**Solution:**
1. Approve tokens before transferFrom:
   ```typescript
   // First approve
   const approveTx = await contractManager.approve(spender, amount);
   await approveTx.wait();
   
   // Then transfer
   const transferTx = await contractManager.transferFrom(from, to, amount);
   await transferTx.wait();
   ```
2. Check current allowance:
   ```typescript
   const allowance = await contractManager.getAllowance(owner, spender);
   console.log('Current allowance:', allowance.toString());
   ```

## Data Issues

### Invalid Address

**Problem:** `LukasSDKError: INVALID_ADDRESS`

**Solution:**
1. Verify address format (must be a valid Ethereum address)
2. Use ethers utilities to validate:
   ```typescript
   import { isAddress } from 'ethers';
   
   if (!isAddress(address)) {
     console.error('Invalid address');
   }
   ```
3. Check for typos or missing characters

### Invalid Amount

**Problem:** `LukasSDKError: INVALID_AMOUNT`

**Solution:**
1. Ensure amount is a valid BigNumber
2. Check for negative values
3. Verify decimal places:
   ```typescript
   import { parseUnits } from 'ethers';
   
   const amount = parseUnits('100', 18); // 100 tokens with 18 decimals
   ```

### Stale Data

**Problem:** Price feeds or data appears outdated

**Solution:**
1. Check for stale feeds:
   ```typescript
   const hasStale = await contractManager.hasStaleFeeds();
   if (hasStale) {
     console.warn('Some price feeds are stale');
   }
   ```
2. Disable caching for real-time data:
   ```typescript
   const sdk = new LukasSDK({
     network: { chainId: 80002, name: 'amoy' },
     options: {
       enableCaching: false,
     },
   });
   ```
3. Reduce cache timeout:
   ```typescript
   options: {
     cacheTimeout: 5000, // 5 seconds
   }
   ```

## Performance Issues

### Slow Response Times

**Problem:** SDK methods take too long to respond

**Solution:**
1. Enable caching:
   ```typescript
   options: {
     enableCaching: true,
     cacheTimeout: 30000,
   }
   ```
2. Use a faster RPC endpoint
3. Batch multiple calls when possible
4. Check network latency

### High Gas Costs

**Problem:** Transactions have unexpectedly high gas costs

**Solution:**
1. Check gas price before sending:
   ```typescript
   const feeData = await provider.getFeeData();
   console.log('Gas price:', feeData.gasPrice);
   ```
2. Wait for lower gas prices
3. Use gas estimation:
   ```typescript
   const estimatedGas = await contract.estimateGas.transfer(to, amount);
   ```

## React Integration Issues

### Hooks Not Working

**Problem:** React hooks not updating or causing errors

**Solution:**
1. Ensure SDK is properly initialized in context
2. Check for proper cleanup:
   ```typescript
   useEffect(() => {
     const unsubscribe = sdk.onNetworkChange(handler);
     return () => unsubscribe();
   }, []);
   ```
3. Verify React version compatibility

### State Not Updating

**Problem:** Component state not updating with SDK data

**Solution:**
1. Use proper async handling:
   ```typescript
   useEffect(() => {
     let mounted = true;
     
     async function fetchData() {
       const data = await sdk.getContractManager().getTokenInfo();
       if (mounted) {
         setTokenInfo(data);
       }
     }
     
     fetchData();
     return () => { mounted = false; };
   }, []);
   ```
2. Check for race conditions
3. Use proper dependency arrays

## Debugging Tips

### Enable Debug Logging

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  options: {
    logLevel: 'debug',
  },
});
```

### Check SDK Status

```typescript
console.log('Initialized:', sdk.isInitialized());
console.log('Read-only:', sdk.isReadOnly());
console.log('Network:', sdk.getNetworkInfo());
console.log('Provider:', sdk.getProvider());
console.log('Signer:', sdk.getSigner());
```

### Inspect Contract Addresses

```typescript
const addresses = sdk.getContractManager().getAddresses();
console.log('Contract addresses:', addresses);
```

### Monitor Network Changes

```typescript
sdk.onNetworkChange((networkInfo) => {
  console.log('Network changed:', networkInfo);
});

sdk.onNetworkMismatch((expected, actual) => {
  console.warn('Network mismatch:', { expected, actual });
});

sdk.startNetworkMonitoring();
```

## Getting Help

If you're still experiencing issues:

1. **Check the documentation**: Review the [API Reference](./api-reference.md) and [Examples](./examples.md)
2. **Search existing issues**: Check [GitHub Issues](https://github.com/hashpass-tech/lukas-protocol/issues)
3. **Create a new issue**: Provide:
   - SDK version
   - Network and chain ID
   - Code snippet reproducing the issue
   - Error messages and stack traces
   - Browser/Node.js version
4. **Join the community**: Ask questions in our Discord or Telegram

## Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Network not supported" | Invalid chain ID | Use supported network or provide custom contracts |
| "Signer required" | No wallet connected | Connect wallet provider |
| "Insufficient balance" | Not enough tokens | Check balance before transaction |
| "Insufficient allowance" | Not enough approved tokens | Approve tokens first |
| "Transaction failed" | Contract revert | Check revert reason and parameters |
| "Provider not available" | No wallet installed | Install MetaMask or other wallet |
| "Contract not deployed" | Wrong network | Switch to correct network |
| "Invalid address" | Malformed address | Verify address format |
| "Network connection failed" | RPC issue | Check RPC endpoint and internet |
| "Unauthorized" | Missing permissions | Check authorization status |
