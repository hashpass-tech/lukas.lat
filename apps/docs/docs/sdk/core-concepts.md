# Core Concepts

Understanding these core concepts will help you use the Lukas SDK effectively.

## SDK Initialization

The SDK is initialized with a configuration object that defines the network, provider, and options:

```typescript
import { LukasSDK } from '@lukas/sdk';

const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
  provider: yourProvider, // Optional
  options: {
    enableCaching: true,
    logLevel: 'info',
  },
});
```

## Network Management

### Supported Networks

The SDK supports multiple networks with automatic contract address resolution:

- **Polygon Amoy Testnet** (chainId: 80002) - Default testnet
- **Custom Networks** - Configure your own

### Network Switching

Switch between networks dynamically:

```typescript
// Switch to a different network
await sdk.switchNetwork(1); // Mainnet

// Switch with custom contracts
await sdk.switchNetwork(80002, {
  lukasToken: '0x...',
  stabilizerVault: '0x...',
});
```

### Network Detection

Automatically detect and switch to the provider's network:

```typescript
// Auto-detect provider network
const networkInfo = await sdk.autoDetectNetwork();
console.log('Detected network:', networkInfo);

// Validate current network
const validation = await sdk.validateNetwork();
if (!validation.isValid) {
  console.log(`Network mismatch: expected ${validation.expected}, got ${validation.actual}`);
}
```

### Network Monitoring

Monitor network changes in real-time:

```typescript
// Listen for network changes
const unsubscribe = sdk.onNetworkChange((networkInfo) => {
  console.log('Network changed to:', networkInfo.name);
});

// Listen for network mismatches
sdk.onNetworkMismatch((expected, actual) => {
  console.warn(`Network mismatch: expected ${expected}, got ${actual}`);
});

// Start automatic monitoring (checks every 5 seconds by default)
sdk.startNetworkMonitoring();

// Stop monitoring when done
sdk.stopNetworkMonitoring();

// Clean up listener
unsubscribe();
```

## Provider Management

### Read-Only Mode

When no provider is supplied, the SDK operates in read-only mode:

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
});

console.log('Read-only:', sdk.isReadOnly()); // true

// Can query data
const contractManager = sdk.getContractManager();
const tokenInfo = await contractManager.getTokenInfo();
```

### Connecting a Provider

Connect a wallet provider for write operations:

```typescript
import { BrowserProvider } from 'ethers';

// Connect MetaMask
const provider = new BrowserProvider(window.ethereum);
await sdk.connect(provider);

console.log('Read-only:', sdk.isReadOnly()); // false

// Now you can perform transactions
const signer = sdk.getSigner();
```

### Requiring a Signer

For operations that require a signer, use `requireSigner()`:

```typescript
try {
  const signer = sdk.requireSigner();
  // Perform write operation
} catch (error) {
  console.error('Signer required for this operation');
}
```

## Contract Manager

The Contract Manager provides access to all smart contract interactions:

```typescript
const contractManager = sdk.getContractManager();

// Get contract instances
const lukasToken = contractManager.getLukasToken();
const vault = contractManager.getStabilizerVault();
const oracle = contractManager.getLatAmBasketIndex();

// Get contract addresses
const addresses = contractManager.getAddresses();
console.log('LUKAS Token:', addresses.lukasToken);
```

### Token Operations

```typescript
const contractManager = sdk.getContractManager();

// Get token information
const tokenInfo = await contractManager.getTokenInfo();
console.log('Token:', tokenInfo.name, tokenInfo.symbol);

// Get balance
const balance = await contractManager.getBalance(userAddress);
console.log('Balance:', balance.toString());

// Get allowance
const allowance = await contractManager.getAllowance(owner, spender);
console.log('Allowance:', allowance.toString());

// Transfer tokens (requires signer)
const tx = await contractManager.transfer(recipient, amount);
await tx.wait();

// Approve tokens (requires signer)
const approveTx = await contractManager.approve(spender, amount);
await approveTx.wait();
```

### Oracle Operations

```typescript
// Get fair price from oracle
const fairPrice = await contractManager.getFairPrice();
console.log('Fair Price:', fairPrice.toString());

// Get basket composition
const basket = await contractManager.getBasketComposition();
console.log('Currencies:', basket.currencies);
console.log('Weights:', basket.weights);

// Check for stale feeds
const hasStale = await contractManager.hasStaleFeeds();
if (hasStale) {
  console.warn('Some price feeds are stale');
}
```

### Vault Operations

```typescript
// Get vault information
const vaultInfo = await contractManager.getVaultInfo();
console.log('Max mint per action:', vaultInfo.maxMintPerAction);

// Check authorization
const isAuthorized = await contractManager.isAuthorized(address);

// Authorized operations (requires signer and authorization)
if (isAuthorized) {
  const tx = await contractManager.stabilizeMint(amount, recipient);
  await tx.wait();
}
```

## Error Handling

The SDK provides structured error handling:

```typescript
import { LukasSDKError, LukasSDKErrorCode } from '@lukas/sdk';

try {
  await sdk.switchNetwork(999999); // Invalid network
} catch (error) {
  if (error instanceof LukasSDKError) {
    console.error('Error code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    
    // Handle specific error types
    switch (error.code) {
      case LukasSDKErrorCode.NETWORK_NOT_SUPPORTED:
        console.log('Network not supported');
        break;
      case LukasSDKErrorCode.SIGNER_REQUIRED:
        console.log('Please connect your wallet');
        break;
      case LukasSDKErrorCode.INSUFFICIENT_BALANCE:
        console.log('Insufficient balance');
        break;
    }
  }
}
```

### Common Error Codes

- `NETWORK_NOT_SUPPORTED`: The specified network is not supported
- `NETWORK_CONNECTION_FAILED`: Failed to connect to the network
- `PROVIDER_NOT_AVAILABLE`: No provider available
- `CONTRACT_NOT_DEPLOYED`: Contract not deployed on this network
- `CONTRACT_CALL_FAILED`: Contract call failed
- `TRANSACTION_FAILED`: Transaction failed
- `INVALID_ADDRESS`: Invalid Ethereum address
- `INVALID_AMOUNT`: Invalid amount
- `INSUFFICIENT_BALANCE`: Insufficient token balance
- `INSUFFICIENT_ALLOWANCE`: Insufficient token allowance
- `UNAUTHORIZED`: Unauthorized operation
- `SIGNER_REQUIRED`: Signer required for this operation

## Configuration Options

### Caching

Enable caching to reduce RPC calls:

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  options: {
    enableCaching: true,
    cacheTimeout: 30000, // 30 seconds
  },
});
```

### Retry Logic

Configure automatic retries for failed requests:

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  options: {
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
});
```

### Logging

Control log verbosity:

```typescript
const sdk = new LukasSDK({
  network: { chainId: 80002, name: 'amoy' },
  options: {
    logLevel: 'debug', // 'debug' | 'info' | 'warn' | 'error'
  },
});
```

## Custom Networks

Add custom networks with your own contract addresses:

```typescript
const networkInfo = await sdk.addCustomNetwork({
  chainId: 31337,
  name: 'localhost',
  rpcUrl: 'http://localhost:8545',
  blockExplorer: undefined,
  contracts: {
    lukasToken: '0x...',
    stabilizerVault: '0x...',
    latAmBasketIndex: '0x...',
    lukasHook: '0x...',
    usdc: '0x...',
  },
});

console.log('Custom network added:', networkInfo);
```

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const balance = await contractManager.getBalance(address);
} catch (error) {
  console.error('Failed to get balance:', error);
}
```

### 2. Check Network Before Transactions

```typescript
const validation = await sdk.validateNetwork();
if (!validation.isValid) {
  console.error('Please switch to the correct network');
  return;
}
```

### 3. Verify Signer for Write Operations

```typescript
if (sdk.isReadOnly()) {
  console.error('Please connect your wallet');
  return;
}
```

### 4. Use Network Monitoring in dApps

```typescript
// Start monitoring when app loads
sdk.startNetworkMonitoring();

// Stop when app unmounts
sdk.stopNetworkMonitoring();
```

### 5. Clean Up Event Listeners

```typescript
const unsubscribe = sdk.onNetworkChange(handler);

// Clean up when done
unsubscribe();
```

## Next Steps

- Explore [API Reference](./api-reference.md) for detailed method documentation
- Check out [Examples](./examples.md) for practical use cases
- Learn about [React Integration](./react-integration.md) for React apps
