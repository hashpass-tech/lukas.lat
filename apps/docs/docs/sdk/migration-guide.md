# Migration Guide

This guide will help you migrate from direct smart contract calls to using the Lukas SDK.

## Why Migrate to the SDK?

The Lukas SDK provides several advantages over direct contract calls:

- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Structured error handling with meaningful error codes
- **Network Management**: Automatic network detection and switching
- **Retry Logic**: Built-in retry mechanism for failed requests
- **Caching**: Intelligent caching to reduce RPC calls
- **Simplified API**: Clean, intuitive methods instead of raw contract calls
- **Maintenance**: Automatic updates when contracts change

## Before and After Comparison

### SDK Initialization

**Before (Direct Contract Calls):**
```typescript
import { ethers } from 'ethers';
import LukasTokenABI from './abis/LukasToken.json';
import StabilizerVaultABI from './abis/StabilizerVault.json';
import LatAmBasketIndexABI from './abis/LatAmBasketIndex.json';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const LUKAS_TOKEN_ADDRESS = '0x...';
const VAULT_ADDRESS = '0x...';
const ORACLE_ADDRESS = '0x...';

const lukasToken = new ethers.Contract(
  LUKAS_TOKEN_ADDRESS,
  LukasTokenABI,
  signer
);

const vault = new ethers.Contract(
  VAULT_ADDRESS,
  StabilizerVaultABI,
  signer
);

const oracle = new ethers.Contract(
  ORACLE_ADDRESS,
  LatAmBasketIndexABI,
  provider
);
```

**After (Using SDK):**
```typescript
import { LukasSDK } from '@lukas-protocol/sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);

const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
  provider,
});

const contractManager = sdk.getContractManager();
// All contracts are now accessible through contractManager
```

**Benefits:**
- No need to manage ABIs manually
- Automatic contract address resolution per network
- Single initialization point
- Built-in network validation

### Getting Token Balance

**Before:**
```typescript
const balance = await lukasToken.balanceOf(userAddress);
console.log('Balance:', ethers.formatUnits(balance, 18));
```

**After:**
```typescript
const balance = await contractManager.getBalance(userAddress);
console.log('Balance:', balance.toString());
```

**Benefits:**
- Cleaner method names
- Consistent error handling
- Automatic caching (if enabled)

### Transferring Tokens

**Before:**
```typescript
try {
  const amount = ethers.parseUnits('100', 18);
  const tx = await lukasToken.transfer(recipientAddress, amount);
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);
} catch (error) {
  console.error('Transfer failed:', error.message);
}
```

**After:**
```typescript
import { parseUnits } from 'ethers';

try {
  const amount = parseUnits('100', 18);
  const tx = await contractManager.transfer(recipientAddress, amount);
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);
} catch (error) {
  if (error instanceof LukasSDKError) {
    console.error('SDK Error:', error.code, error.message);
  } else {
    console.error('Transfer failed:', error.message);
  }
}
```

**Benefits:**
- Structured error handling with error codes
- Automatic retry on network failures
- Input validation

### Approving Tokens

**Before:**
```typescript
const amount = ethers.parseUnits('1000', 18);
const tx = await lukasToken.approve(spenderAddress, amount);
await tx.wait();

// Check allowance
const allowance = await lukasToken.allowance(ownerAddress, spenderAddress);
console.log('Allowance:', ethers.formatUnits(allowance, 18));
```

**After:**
```typescript
import { parseUnits } from 'ethers';

const amount = parseUnits('1000', 18);
const tx = await contractManager.approve(spenderAddress, amount);
await tx.wait();

// Check allowance
const allowance = await contractManager.getAllowance(ownerAddress, spenderAddress);
console.log('Allowance:', allowance.toString());
```

**Benefits:**
- Consistent API across all token operations
- Better error messages

### Getting Oracle Price

**Before:**
```typescript
const fairPrice = await oracle.getFairPrice();
console.log('Fair Price:', ethers.formatUnits(fairPrice, 18));

// Get basket composition
const currencies = await oracle.getCurrencies();
const weights = await oracle.getWeights();
const prices = [];
for (const currency of currencies) {
  const price = await oracle.getCurrencyPrice(currency);
  prices.push(price);
}
```

**After:**
```typescript
const fairPrice = await contractManager.getFairPrice();
console.log('Fair Price:', fairPrice.toString());

// Get basket composition (single call)
const basket = await contractManager.getBasketComposition();
console.log('Currencies:', basket.currencies);
console.log('Weights:', basket.weights);
console.log('Prices:', basket.prices);
```

**Benefits:**
- Reduced number of RPC calls
- Structured data format
- Automatic caching

### Checking Vault Status

**Before:**
```typescript
const maxMint = await vault.maxMintPerAction();
const maxBuyback = await vault.maxBuybackPerAction();
const threshold = await vault.deviationThreshold();
const cooldown = await vault.cooldownPeriod();
const lastStab = await vault.lastStabilization();

console.log('Vault Info:', {
  maxMint: ethers.formatUnits(maxMint, 18),
  maxBuyback: ethers.formatUnits(maxBuyback, 18),
  threshold: threshold.toString(),
  cooldown: cooldown.toString(),
  lastStab: new Date(lastStab.toNumber() * 1000),
});
```

**After:**
```typescript
const vaultInfo = await contractManager.getVaultInfo();
console.log('Vault Info:', {
  maxMint: vaultInfo.maxMintPerAction.toString(),
  maxBuyback: vaultInfo.maxBuybackPerAction.toString(),
  threshold: vaultInfo.deviationThreshold,
  cooldown: vaultInfo.cooldownPeriod,
  lastStab: new Date(vaultInfo.lastStabilization * 1000),
});
```

**Benefits:**
- Single call instead of multiple
- Structured response
- Better performance

### Network Switching

**Before:**
```typescript
// Manual network switching
const chainId = await provider.getNetwork().then(n => n.chainId);

if (chainId !== 80002) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13882' }], // 80002 in hex
    });
  } catch (error) {
    console.error('Failed to switch network:', error);
  }
}

// Update contract instances manually
const lukasToken = new ethers.Contract(
  LUKAS_TOKEN_ADDRESS,
  LukasTokenABI,
  signer
);
```

**After:**
```typescript
// Automatic network detection
const networkInfo = await sdk.autoDetectNetwork();
console.log('Switched to:', networkInfo?.name);

// Or manual switching
await sdk.switchNetwork(80002);

// Contracts are automatically updated
const balance = await contractManager.getBalance(address);
```

**Benefits:**
- Automatic contract address resolution
- Network validation
- Simplified network management

## Step-by-Step Migration

### Step 1: Install the SDK

```bash
npm install @lukas-protocol/sdk
```

### Step 2: Replace Contract Initialization

**Remove:**
```typescript
import LukasTokenABI from './abis/LukasToken.json';
import StabilizerVaultABI from './abis/StabilizerVault.json';
import LatAmBasketIndexABI from './abis/LatAmBasketIndex.json';

const lukasToken = new ethers.Contract(address, LukasTokenABI, signer);
const vault = new ethers.Contract(address, StabilizerVaultABI, signer);
const oracle = new ethers.Contract(address, LatAmBasketIndexABI, provider);
```

**Add:**
```typescript
import { LukasSDK } from '@lukas-protocol/sdk';

const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  provider,
});

const contractManager = sdk.getContractManager();
```

### Step 3: Update Contract Calls

Replace direct contract method calls with SDK methods:

| Direct Contract Call | SDK Method |
|---------------------|------------|
| `lukasToken.balanceOf(address)` | `contractManager.getBalance(address)` |
| `lukasToken.transfer(to, amount)` | `contractManager.transfer(to, amount)` |
| `lukasToken.approve(spender, amount)` | `contractManager.approve(spender, amount)` |
| `lukasToken.allowance(owner, spender)` | `contractManager.getAllowance(owner, spender)` |
| `lukasToken.name()` | `contractManager.getTokenInfo()` (returns all info) |
| `oracle.getFairPrice()` | `contractManager.getFairPrice()` |
| `vault.isAuthorized(address)` | `contractManager.isAuthorized(address)` |
| `vault.stabilizeMint(amount, recipient)` | `contractManager.stabilizeMint(amount, recipient)` |

### Step 4: Update Error Handling

**Before:**
```typescript
try {
  const tx = await lukasToken.transfer(to, amount);
  await tx.wait();
} catch (error) {
  console.error('Error:', error.message);
}
```

**After:**
```typescript
import { LukasSDKError, LukasSDKErrorCode } from '@lukas-protocol/sdk';

try {
  const tx = await contractManager.transfer(to, amount);
  await tx.wait();
} catch (error) {
  if (error instanceof LukasSDKError) {
    switch (error.code) {
      case LukasSDKErrorCode.INSUFFICIENT_BALANCE:
        console.error('Insufficient balance');
        break;
      case LukasSDKErrorCode.SIGNER_REQUIRED:
        console.error('Please connect wallet');
        break;
      default:
        console.error('SDK Error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Step 5: Add Network Monitoring (Optional)

```typescript
// Monitor network changes
sdk.onNetworkChange((networkInfo) => {
  console.log('Network changed:', networkInfo.name);
  // Update UI or refetch data
});

// Start monitoring
sdk.startNetworkMonitoring();
```

### Step 6: Enable Caching (Optional)

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  provider,
  options: {
    enableCaching: true,
    cacheTimeout: 30000, // 30 seconds
  },
});
```

## React Migration

### Before (Direct Contract Calls in React)

```typescript
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import LukasTokenABI from './abis/LukasToken.json';

function TokenBalance({ address }: { address: string }) {
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    async function fetchBalance() {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        LUKAS_TOKEN_ADDRESS,
        LukasTokenABI,
        provider
      );
      
      const bal = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(bal, 18));
    }

    fetchBalance();
  }, [address]);

  return <div>Balance: {balance}</div>;
}
```

### After (Using SDK in React)

```typescript
import { useLukasSDK } from '@lukas-protocol/sdk/react';
import { useEffect, useState } from 'react';

function TokenBalance({ address }: { address: string }) {
  const { sdk } = useLukasSDK();
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (!sdk) return;

    async function fetchBalance() {
      const contractManager = sdk.getContractManager();
      const bal = await contractManager.getBalance(address);
      setBalance(bal.toString());
    }

    fetchBalance();
  }, [sdk, address]);

  return <div>Balance: {balance}</div>;
}
```

### Setting Up React Provider

```typescript
import { LukasSDKProvider } from '@lukas-protocol/sdk/react';

function App() {
  return (
    <LukasSDKProvider
      defaultNetwork={{
        chainId: 80002,
        name: 'amoy',
      }}
    >
      <YourApp />
    </LukasSDKProvider>
  );
}
```

## Best Practices

### 1. Initialize SDK Once

Create a single SDK instance and reuse it throughout your application:

```typescript
// sdk.ts
import { LukasSDK } from '@lukas-protocol/sdk';

export const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  options: {
    enableCaching: true,
    logLevel: 'info',
  },
});

// Use in other files
import { sdk } from './sdk';
```

### 2. Handle Errors Consistently

Create a centralized error handler:

```typescript
import { LukasSDKError, LukasSDKErrorCode } from '@lukas-protocol/sdk';

export function handleSDKError(error: unknown): string {
  if (error instanceof LukasSDKError) {
    switch (error.code) {
      case LukasSDKErrorCode.NETWORK_NOT_SUPPORTED:
        return 'Please switch to a supported network';
      case LukasSDKErrorCode.SIGNER_REQUIRED:
        return 'Please connect your wallet';
      case LukasSDKErrorCode.INSUFFICIENT_BALANCE:
        return 'Insufficient balance for this transaction';
      default:
        return error.message;
    }
  }
  return 'An unexpected error occurred';
}
```

### 3. Use Network Monitoring

Monitor network changes to keep your UI in sync:

```typescript
useEffect(() => {
  const unsubscribe = sdk.onNetworkChange((networkInfo) => {
    // Refetch data or update UI
    refetchData();
  });

  sdk.startNetworkMonitoring();

  return () => {
    unsubscribe();
    sdk.stopNetworkMonitoring();
  };
}, []);
```

### 4. Enable Caching for Read Operations

Reduce RPC calls by enabling caching:

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  options: {
    enableCaching: true,
    cacheTimeout: 30000,
  },
});
```

### 5. Validate Before Transactions

Always validate before sending transactions:

```typescript
// Check balance
const balance = await contractManager.getBalance(userAddress);
if (balance.lt(amount)) {
  throw new Error('Insufficient balance');
}

// Check network
const validation = await sdk.validateNetwork();
if (!validation.isValid) {
  throw new Error('Wrong network');
}

// Perform transaction
const tx = await contractManager.transfer(to, amount);
```

## Common Migration Issues

### Issue: "Contract not deployed"

**Cause:** Wrong network or missing contract addresses

**Solution:**
```typescript
// Verify network
const networkInfo = sdk.getNetworkInfo();
console.log('Current network:', networkInfo);

// Or provide custom addresses
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  contracts: {
    lukasToken: '0x...',
    stabilizerVault: '0x...',
    // ... other addresses
  },
});
```

### Issue: "Signer required"

**Cause:** Trying to perform write operations without a connected wallet

**Solution:**
```typescript
// Check if wallet is connected
if (sdk.isReadOnly()) {
  // Connect wallet
  const provider = new BrowserProvider(window.ethereum);
  await sdk.connect(provider);
}

// Or require signer
try {
  const signer = sdk.requireSigner();
  // Perform write operation
} catch (error) {
  console.error('Please connect your wallet');
}
```

### Issue: Type errors with BigNumber

**Cause:** Different BigNumber types between ethers v5 and v6

**Solution:**
```typescript
// Use ethers v6 utilities
import { parseUnits, formatUnits } from 'ethers';

const amount = parseUnits('100', 18);
const formatted = formatUnits(balance, 18);
```

## Performance Optimization

### Batch Multiple Calls

Instead of multiple individual calls:

```typescript
// Before
const name = await lukasToken.name();
const symbol = await lukasToken.symbol();
const decimals = await lukasToken.decimals();
const totalSupply = await lukasToken.totalSupply();
```

Use the SDK's combined methods:

```typescript
// After
const tokenInfo = await contractManager.getTokenInfo();
// Returns: { name, symbol, decimals, totalSupply, address }
```

### Enable Caching

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  options: {
    enableCaching: true,
    cacheTimeout: 30000,
  },
});
```

### Use Read-Only Mode When Possible

```typescript
// For read-only operations, don't connect a signer
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
  },
});

// Connect signer only when needed
await sdk.connect(provider);
```

## Next Steps

- Review the [API Reference](./api-reference.md) for complete method documentation
- Check out [Examples](./examples.md) for practical use cases
- Read [Best Practices](./core-concepts.md#best-practices) for optimal usage
- Visit the [Troubleshooting Guide](./troubleshooting.md) if you encounter issues
