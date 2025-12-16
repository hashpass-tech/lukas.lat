# Lukas SDK

A comprehensive TypeScript SDK for interacting with the Lukas Protocol smart contracts.

## Installation

```bash
npm install @lukas/sdk
# or
yarn add @lukas/sdk
# or
pnpm add @lukas/sdk
```

## Quick Start

```typescript
import { LukasSDK } from '@lukas/sdk';

// Initialize the SDK
const sdk = new LukasSDK({
  network: {
    chainId: 1,
    name: 'mainnet',
  },
  // provider: yourProvider, // Optional - for read-only mode
});

// Get token information
const tokenInfo = await sdk.token.getTokenInfo();
console.log(tokenInfo);

// Check peg status
const pegStatus = await sdk.oracle.getPegStatus();
console.log(pegStatus);
```

## Features

- 🔒 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🌐 **Multi-Network**: Support for mainnet, testnets, and custom networks
- 🔄 **Real-time Events**: Subscribe to protocol events and updates
- 💰 **Token Operations**: Transfer, approve, and manage LUKAS tokens
- 📊 **Oracle Data**: Access real-time price and peg information
- 🏦 **Vault Operations**: Interact with the stabilization vault
- 💧 **Liquidity Management**: Add and remove liquidity from pools
- ⚛️ **React Integration**: Built-in React hooks for easy integration
- 🔄 **Automatic Retries**: Built-in retry logic with exponential backoff
- 📝 **Comprehensive Logging**: Detailed logging and error handling

## Documentation

Full documentation is available at [docs.lukas.money](https://docs.lukas.money)

## Development

This package is part of the Lukas Protocol monorepo. See the main README for development instructions.

## License

MIT