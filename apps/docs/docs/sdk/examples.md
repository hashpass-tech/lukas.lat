# Examples

Practical examples demonstrating how to use the Lukas SDK in various scenarios.

## Basic Usage

Simple example showing SDK initialization and basic queries.

```typescript
import { LukasSDK } from '@lukas/sdk';

// Initialize SDK
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
});

// Get network info
const networkInfo = sdk.getNetworkInfo();
console.log('Connected to:', networkInfo.name);

// Get token information
const contractManager = sdk.getContractManager();
const tokenInfo = await contractManager.getTokenInfo();
console.log('Token:', tokenInfo.name, tokenInfo.symbol);

// Query balance
const balance = await contractManager.getBalance(userAddress);
console.log('Balance:', balance.toString());
```

[View full example →](https://github.com/lukas-protocol/lukas/blob/main/packages/lukas-sdk/examples/basic-usage.ts)

## Token Operations

Examples of token transfers, approvals, and allowance management.

### Checking Balance

```typescript
const contractManager = sdk.getContractManager();
const balance = await contractManager.getBalance(address);
console.log('Balance:', balance.toString());
```

### Transferring Tokens

```typescript
import { parseUnits } from 'ethers';

// Connect wallet first
const provider = new BrowserProvider(window.ethereum);
await sdk.connect(provider);

// Transfer tokens
const amount = parseUnits('100', 18); // 100 LUKAS
const tx = await contractManager.transfer(recipientAddress, amount);
console.log('Transaction hash:', tx.hash);

// Wait for confirmation
const receipt = await tx.wait();
console.log('Confirmed in block:', receipt.blockNumber);
```

### Approving Tokens

```typescript
import { parseUnits } from 'ethers';

// Approve tokens for spending
const amount = parseUnits('1000', 18); // 1000 LUKAS
const tx = await contractManager.approve(spenderAddress, amount);
await tx.wait();
console.log('Approval confirmed');

// Check allowance
const allowance = await contractManager.getAllowance(ownerAddress, spenderAddress);
console.log('Allowance:', allowance.toString());
```

[View full example →](https://github.com/lukas-protocol/lukas/blob/main/packages/lukas-sdk/examples/token-operations.ts)

## Oracle and Vault Operations

Working with price oracles and the stabilization vault.

### Getting Fair Price

```typescript
const contractManager = sdk.getContractManager();

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

### Vault Information

```typescript
// Get vault info
const vaultInfo = await contractManager.getVaultInfo();
console.log('Max mint per action:', vaultInfo.maxMintPerAction.toString());
console.log('Deviation threshold:', vaultInfo.deviationThreshold, 'bps');

// Check authorization
const isAuthorized = await contractManager.isAuthorized(address);
console.log('Authorized:', isAuthorized);
```

### Stabilization Operations (Authorized Only)

```typescript
import { parseUnits } from 'ethers';

// Check authorization first
const signer = sdk.getSigner();
const signerAddress = await signer.getAddress();
const isAuthorized = await contractManager.isAuthorized(signerAddress);

if (!isAuthorized) {
  throw new Error('Not authorized for stabilization');
}

// Perform stabilization mint
const amount = parseUnits('1000', 18);
const tx = await contractManager.stabilizeMint(amount, recipientAddress);
await tx.wait();
console.log('Stabilization mint completed');
```

[View full example →](https://github.com/lukas-protocol/lukas/blob/main/packages/lukas-sdk/examples/oracle-and-vault.ts)

## Network Management

Managing networks, switching, and monitoring.

### Network Switching

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

```typescript
// Auto-detect provider network
const networkInfo = await sdk.autoDetectNetwork();
if (networkInfo) {
  console.log('Switched to:', networkInfo.name);
}

// Validate current network
const validation = await sdk.validateNetwork();
if (!validation.isValid) {
  console.log('Network mismatch!');
  console.log('Expected:', validation.expected);
  console.log('Actual:', validation.actual);
}
```

### Network Monitoring

```typescript
// Listen for network changes
const unsubscribe = sdk.onNetworkChange((networkInfo) => {
  console.log('Network changed to:', networkInfo.name);
});

// Listen for mismatches
sdk.onNetworkMismatch((expected, actual) => {
  console.warn(`Please switch to network ${expected}`);
});

// Start automatic monitoring
sdk.startNetworkMonitoring(5000); // Check every 5 seconds

// Stop monitoring
sdk.stopNetworkMonitoring();

// Clean up
unsubscribe();
```

### Custom Networks

```typescript
// Add custom network
const networkInfo = await sdk.addCustomNetwork({
  chainId: 31337,
  name: 'localhost',
  rpcUrl: 'http://localhost:8545',
  contracts: {
    lukasToken: '0x...',
    stabilizerVault: '0x...',
    latAmBasketIndex: '0x...',
    lukasHook: '0x...',
    usdc: '0x...',
  },
});

console.log('Custom network added:', networkInfo.name);
```

[View full example →](https://github.com/lukas-protocol/lukas/blob/main/packages/lukas-sdk/examples/network-management.ts)

## React Integration

Using the SDK in React applications.

### SDK Provider Setup

```typescript
import { LukasSDKProvider } from '@lukas/sdk/react';

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

### Using the SDK Hook

```typescript
import { useLukasSDK } from '@lukas/sdk/react';

function MyComponent() {
  const { sdk, isConnected, connect, disconnect } = useLukasSDK();

  const handleConnect = async () => {
    await connect();
  };

  return (
    <div>
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Fetching Data in React

```typescript
import { useLukasSDK } from '@lukas/sdk/react';
import { useEffect, useState } from 'react';

function TokenBalance({ address }: { address: string }) {
  const { sdk } = useLukasSDK();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sdk) return;

    async function fetchBalance() {
      try {
        const contractManager = sdk.getContractManager();
        const balanceValue = await contractManager.getBalance(address);
        setBalance(balanceValue.toString());
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [sdk, address]);

  if (loading) return <div>Loading...</div>;
  return <div>Balance: {balance}</div>;
}
```

### Network Monitoring in React

```typescript
import { useLukasSDK } from '@lukas/sdk/react';
import { useEffect, useState } from 'react';

function NetworkMonitor() {
  const { sdk } = useLukasSDK();
  const [network, setNetwork] = useState(sdk?.getNetworkInfo());

  useEffect(() => {
    if (!sdk) return;

    // Subscribe to network changes
    const unsubscribe = sdk.onNetworkChange((networkInfo) => {
      setNetwork(networkInfo);
    });

    // Start monitoring
    sdk.startNetworkMonitoring();

    // Cleanup
    return () => {
      unsubscribe();
      sdk.stopNetworkMonitoring();
    };
  }, [sdk]);

  return (
    <div>
      <p>Network: {network?.name}</p>
      <p>Chain ID: {network?.chainId}</p>
    </div>
  );
}
```

### Transaction Component

```typescript
import { useLukasSDK } from '@lukas/sdk/react';
import { useState } from 'react';
import { parseUnits } from 'ethers';

function TransferTokens() {
  const { sdk, isConnected } = useLukasSDK();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sdk || !isConnected) {
      alert('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const contractManager = sdk.getContractManager();
      const amountWei = parseUnits(amount, 18);
      
      const tx = await contractManager.transfer(recipient, amountWei);
      await tx.wait();
      
      alert('Transfer successful!');
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransfer}>
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={!isConnected || loading}>
        {loading ? 'Transferring...' : 'Transfer'}
      </button>
    </form>
  );
}
```

[View full example →](https://github.com/lukas-protocol/lukas/blob/main/packages/lukas-sdk/examples/react-integration.tsx)

## Error Handling

Proper error handling patterns.

### Basic Error Handling

```typescript
import { LukasSDKError, LukasSDKErrorCode } from '@lukas/sdk';

try {
  const balance = await contractManager.getBalance(address);
  console.log('Balance:', balance.toString());
} catch (error) {
  if (error instanceof LukasSDKError) {
    console.error('SDK Error:', error.code, error.message);
    
    switch (error.code) {
      case LukasSDKErrorCode.NETWORK_NOT_SUPPORTED:
        console.log('Please switch to a supported network');
        break;
      case LukasSDKErrorCode.SIGNER_REQUIRED:
        console.log('Please connect your wallet');
        break;
      case LukasSDKErrorCode.INSUFFICIENT_BALANCE:
        console.log('Insufficient balance for this transaction');
        break;
      default:
        console.log('An error occurred');
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Transaction Error Handling

```typescript
try {
  // Check balance first
  const balance = await contractManager.getBalance(userAddress);
  if (balance.lt(amount)) {
    throw new Error('Insufficient balance');
  }

  // Perform transfer
  const tx = await contractManager.transfer(recipient, amount);
  console.log('Transaction sent:', tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('Transaction confirmed:', receipt.blockNumber);
} catch (error) {
  if (error.code === 4001) {
    console.log('User rejected the transaction');
  } else if (error.code === -32603) {
    console.log('Internal JSON-RPC error');
  } else {
    console.error('Transaction failed:', error.message);
  }
}
```

## Running the Examples

All examples are available in the SDK repository:

```bash
# Clone the repository
git clone https://github.com/lukas-protocol/lukas.git
cd lukas/packages/lukas-sdk

# Install dependencies
npm install

# Run an example
npx tsx examples/basic-usage.ts
npx tsx examples/token-operations.ts
npx tsx examples/oracle-and-vault.ts
npx tsx examples/network-management.ts
```

## Next Steps

- Review the [API Reference](./api-reference.md) for detailed method documentation
- Check the [Troubleshooting Guide](./troubleshooting.md) if you encounter issues
- Explore [Core Concepts](./core-concepts.md) for deeper understanding
