# Lukas SDK

A comprehensive TypeScript SDK for interacting with the Lukas Protocol smart contracts.

## 🚀 Quick Setup

### Installation

```bash
npm install @lukas-protocol/sdk
# or
yarn add @lukas-protocol/sdk
# or
pnpm add @lukas-protocol/sdk
```

### Basic Usage

```typescript
import { LukasSDK } from '@lukas-protocol/sdk';

// Initialize the SDK (read-only mode)
const sdk = new LukasSDK({
  network: {
    chainId: 80002, // Polygon Amoy testnet
    name: 'amoy',
  },
});

// Get token information
const tokenInfo = await sdk.getContractManager().getTokenInfo();
console.log('Token:', tokenInfo);

// Check network info
const networkInfo = sdk.getNetworkInfo();
console.log('Network:', networkInfo);
```

### With Wallet Provider

```typescript
import { LukasSDK } from '@lukas-protocol/sdk';
import { BrowserProvider } from 'ethers';

// Connect with MetaMask or other wallet
const provider = new BrowserProvider(window.ethereum);

const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
  provider,
});

// Now you can perform write operations
const signer = sdk.getSigner();
if (signer) {
  // Transfer tokens, approve, etc.
}
```

### React Integration

```typescript
import { useLukasSDK } from '@lukas-protocol/sdk/react';

function MyComponent() {
  const { sdk, isConnected } = useLukasSDK();
  
  // Use SDK in your component
  const handleGetBalance = async () => {
    const balance = await sdk.getContractManager().getBalance(address);
    console.log('Balance:', balance);
  };
  
  return <button onClick={handleGetBalance}>Get Balance</button>;
}
```

## 📚 Features

- 🔒 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🌐 **Multi-Network**: Support for mainnet, testnets, and custom networks
- 🔄 **Network Switching**: Automatic network detection and switching
- 💰 **Token Operations**: Transfer, approve, and manage LUKAS tokens
- 📊 **Oracle Data**: Access real-time price and peg information
- 🏦 **Vault Operations**: Interact with the stabilization vault
- 💧 **Liquidity Management**: Add and remove liquidity from pools
- ⚛️ **React Integration**: Built-in React hooks for easy integration
- 🔄 **Automatic Retries**: Built-in retry logic with exponential backoff
- 📝 **Comprehensive Logging**: Detailed logging and error handling
- ✅ **Property-Based Testing**: Thoroughly tested with property-based tests

## 🔧 Configuration

### Network Configuration

```typescript
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology', // Optional
    blockExplorer: 'https://amoy.polygonscan.com', // Optional
  },
  options: {
    enableCaching: true,
    cacheTimeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000,
    logLevel: 'info',
  },
});
```

### Custom Contract Addresses

```typescript
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
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

## 📖 Core Concepts

### Network Management

The SDK supports multiple networks and automatic network switching:

```typescript
// Switch networks
await sdk.switchNetwork(1); // Switch to mainnet

// Auto-detect provider network
const networkInfo = await sdk.autoDetectNetwork();

// Monitor network changes
sdk.onNetworkChange((networkInfo) => {
  console.log('Network changed:', networkInfo);
});

// Start automatic monitoring
sdk.startNetworkMonitoring();
```

### Contract Manager

Access smart contracts through the Contract Manager:

```typescript
const contractManager = sdk.getContractManager();

// Get token information
const tokenInfo = await contractManager.getTokenInfo();

// Get balances
const balance = await contractManager.getBalance(address);

// Get contract instances
const lukasToken = contractManager.getLukasToken();
const vault = contractManager.getStabilizerVault();
```

### Read-Only vs Write Operations

The SDK automatically detects if a signer is available:

```typescript
// Check if in read-only mode
if (sdk.isReadOnly()) {
  console.log('Read-only mode - connect a wallet for write operations');
}

// Require signer for write operations
try {
  const signer = sdk.requireSigner();
  // Perform write operations
} catch (error) {
  console.error('Signer required:', error);
}
```

## 🌐 Supported Networks

- **Polygon Amoy Testnet** (chainId: 80002) - Default testnet
- **Custom Networks** - Configure your own network and contract addresses

## 📦 Package Structure

```
@lukas-protocol/sdk
├── core/           # Core SDK functionality
├── services/       # Service interfaces
├── types/          # TypeScript type definitions
├── errors/         # Error handling
├── utils/          # Utility functions
└── react/          # React integration (optional)
```

## 🔗 Links

- **Full Documentation**: [docs.lukas.money/sdk](https://docs.lukas.money)
- **GitHub**: [github.com/lukas-protocol/lukas](https://github.com/lukas-protocol/lukas)
- **Examples**: See the `examples/` directory
- **API Reference**: See full documentation

## 🤝 Contributing

This package is part of the Lukas Protocol monorepo. See the main README for development instructions.

## 📄 License

MIT