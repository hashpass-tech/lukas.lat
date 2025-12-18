# Lukas SDK Overview

The Lukas SDK is a comprehensive TypeScript library that provides developers with a clean, type-safe interface for interacting with the Lukas Protocol smart contracts.

## What is the Lukas SDK?

The Lukas SDK abstracts the complexity of direct blockchain interactions while maintaining full functionality and flexibility. It's designed to work seamlessly with modern web3 applications, supporting multiple wallet providers, networks, and both read-only and transactional operations.

## Key Features

### 🔒 Type Safety
Full TypeScript support with comprehensive type definitions ensures you catch errors at compile time and get excellent IDE autocomplete support.

### 🌐 Multi-Network Support
Easily switch between mainnet, testnets, and custom networks. The SDK handles contract address resolution automatically.

### 🔄 Network Management
Automatic network detection, switching, and monitoring. Get notified when users change networks in their wallet.

### 💰 Token Operations
Complete interface for LUKAS token operations including transfers, approvals, balance queries, and allowance management.

### 📊 Oracle Integration
Access real-time price data, peg status, and basket composition from the LatAm Basket Index oracle.

### 🏦 Vault Operations
Interact with the Stabilizer Vault for authorized stabilization operations and collateral management.

### ⚛️ React Integration
Built-in React hooks and context providers for seamless integration with React applications.

### 🔄 Automatic Retries
Built-in retry logic with exponential backoff for handling network issues gracefully.

### ✅ Thoroughly Tested
Comprehensive test suite including property-based tests to ensure correctness across all input ranges.

## Architecture

The SDK follows a layered architecture:

```
┌─────────────────────────────────────────┐
│        Application Layer                │
│   (React Hooks, Utilities, Examples)   │
├─────────────────────────────────────────┤
│         Service Layer                   │
│  (Token, Vault, Oracle Services)        │
├─────────────────────────────────────────┤
│          Core Layer                     │
│   (SDK Client, Contract Manager)        │
├─────────────────────────────────────────┤
│      Infrastructure Layer               │
│  (Provider, Network, Error Handling)    │
└─────────────────────────────────────────┘
```

## Core Components

### LukasSDK
The main SDK client that orchestrates all operations and provides access to individual services.

### ContractManager
Manages contract instances, handles network switching, and provides access to smart contract methods.

### NetworkManager
Handles network configuration, switching, detection, and monitoring.

### ProviderManager
Manages wallet provider abstraction and signer detection.

## Getting Started

Ready to start building? Check out the [Installation Guide](./installation.md) to get started with the Lukas SDK.

## Need Help?

- **API Reference**: See the [API Documentation](./api-reference.md)
- **Examples**: Check out the [Examples](./examples.md)
- **Troubleshooting**: Visit the [Troubleshooting Guide](./troubleshooting.md)
- **GitHub**: [Report issues or contribute](https://github.com/hashpass-tech/lukas-protocol)
