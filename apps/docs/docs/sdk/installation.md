# Installation

This guide will help you install and set up the Lukas SDK in your project.

**Current Version:** v0.2.22

## Prerequisites

- Node.js 16.x or higher
- npm, yarn, or pnpm package manager
- Basic knowledge of TypeScript/JavaScript
- Familiarity with Ethereum and web3 concepts

## Installation

Install the Lukas SDK using your preferred package manager:

```bash
# Using npm
npm install @lukas-protocol/sdk@^0.2.22

# Using yarn
yarn add @lukas-protocol/sdk@^0.2.22

# Using pnpm
pnpm add @lukas-protocol/sdk@^0.2.22
```

## Peer Dependencies

The SDK requires `ethers` v6.x as a peer dependency. If you don't have it installed:

```bash
npm install ethers@^6.0.0
```

## TypeScript Configuration

The SDK is written in TypeScript and includes type definitions. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

## Basic Setup

### Read-Only Mode

For read-only operations (querying data without transactions):

```typescript
import { LukasSDK } from '@lukas-protocol/sdk';

const sdk = new LukasSDK({
  network: {
    chainId: 80002, // Polygon Amoy testnet
    name: 'amoy',
  },
});

// You can now query data
const networkInfo = sdk.getNetworkInfo();
console.log('Connected to:', networkInfo.name);
```

### With Wallet Provider

For write operations (transactions), connect a wallet provider:

```typescript
import { LukasSDK } from '@lukas-protocol/sdk';
import { BrowserProvider } from 'ethers';

// Connect to MetaMask or other injected wallet
const provider = new BrowserProvider(window.ethereum);

const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
  provider,
});

// Check if signer is available
if (!sdk.isReadOnly()) {
  console.log('Wallet connected!');
  const signer = sdk.getSigner();
}
```

### With Custom RPC

Specify a custom RPC endpoint:

```typescript
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
  },
});
```

## Configuration Options

The SDK accepts various configuration options:

```typescript
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology', // Optional
    blockExplorer: 'https://amoy.polygonscan.com', // Optional
  },
  provider: yourProvider, // Optional - for write operations
  contracts: {
    // Optional - override default contract addresses
    lukasToken: '0x...',
    stabilizerVault: '0x...',
    latAmBasketIndex: '0x...',
    lukasHook: '0x...',
    usdc: '0x...',
  },
  options: {
    enableCaching: true, // Enable response caching
    cacheTimeout: 30000, // Cache timeout in ms (30 seconds)
    retryAttempts: 3, // Number of retry attempts
    retryDelay: 1000, // Delay between retries in ms
    enableEvents: true, // Enable event subscriptions
    logLevel: 'info', // Log level: 'debug' | 'info' | 'warn' | 'error'
  },
});
```

## Verifying Installation

Create a simple test file to verify the installation:

```typescript
// test-sdk.ts
import { LukasSDK } from '@lukas-protocol/sdk';

async function testSDK() {
  const sdk = new LukasSDK({
    network: {
      chainId: 80002,
      name: 'amoy',
    },
  });

  console.log('✅ SDK initialized successfully!');
  console.log('Network:', sdk.getNetworkInfo());
  console.log('Read-only mode:', sdk.isReadOnly());
}

testSDK().catch(console.error);
```

Run the test:

```bash
npx tsx test-sdk.ts
# or
ts-node test-sdk.ts
```

## Next Steps

Now that you have the SDK installed, you can:

- Learn about [Core Concepts](./core-concepts.md)
- Explore [API Reference](./api-reference.md)
- Check out [Examples](./examples.md)

## Troubleshooting

If you encounter issues during installation:

1. **Module not found errors**: Make sure you've installed all peer dependencies
2. **TypeScript errors**: Check your `tsconfig.json` configuration
3. **Network errors**: Verify your RPC endpoint is accessible
4. **Version conflicts**: Ensure you're using compatible versions of ethers and other dependencies

For more help, see the [Troubleshooting Guide](./troubleshooting.md).
