# Lukas SDK Examples

This directory contains practical examples demonstrating how to use the Lukas SDK.

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)
Introduction to SDK initialization and basic queries.

**Topics covered:**
- SDK initialization
- Network information
- Contract addresses
- Token information queries
- Balance queries

**Run:**
```bash
npx tsx examples/basic-usage.ts
```

### 2. Token Operations (`token-operations.ts`)
Complete guide to token transfers, approvals, and allowances.

**Topics covered:**
- Connecting wallet providers
- Checking balances and allowances
- Transferring tokens
- Approving token spending
- Using transferFrom
- Error handling

**Run:**
```bash
npx tsx examples/token-operations.ts
```

### 3. Oracle and Vault (`oracle-and-vault.ts`)
Working with price oracles and the stabilization vault.

**Topics covered:**
- Querying oracle price data
- Checking peg status
- Getting basket composition
- Vault information queries
- Authorization checks
- Stabilization operations

**Run:**
```bash
npx tsx examples/oracle-and-vault.ts
```

### 4. Network Management (`network-management.ts`)
Managing networks, switching, and monitoring.

**Topics covered:**
- Network switching
- Network detection
- Network monitoring
- Custom network configuration
- Handling network changes

**Run:**
```bash
npx tsx examples/network-management.ts
```

### 5. React Integration (`react-integration.tsx`)
Using the SDK in React applications.

**Topics covered:**
- Setting up SDK context provider
- Using SDK in React components
- Handling wallet connections
- Managing network changes
- Real-time data updates

**Note:** This is a TypeScript React component file. See the file for usage instructions.

## Prerequisites

Before running the examples, make sure you have:

1. Node.js 16.x or higher installed
2. The SDK dependencies installed:
   ```bash
   npm install
   ```

## Running Examples

### Using tsx (Recommended)

The easiest way to run the examples is using `tsx`:

```bash
# Install tsx globally (optional)
npm install -g tsx

# Run an example
npx tsx examples/basic-usage.ts
```

### Using ts-node

Alternatively, you can use `ts-node`:

```bash
# Install ts-node globally (optional)
npm install -g ts-node

# Run an example
ts-node examples/basic-usage.ts
```

### Compiling First

You can also compile the TypeScript files first:

```bash
# Compile
npx tsc examples/basic-usage.ts --outDir examples/dist

# Run
node examples/dist/basic-usage.js
```

## Configuration

### Network Configuration

Most examples use the Polygon Amoy testnet (chainId: 80002) by default. To use a different network, modify the network configuration in the example:

```typescript
const sdk = new LukasSDK({
  network: {
    chainId: 1, // Change to your desired network
    name: 'mainnet',
  },
});
```

### Custom Contract Addresses

If you're using custom contract deployments, provide the addresses:

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

### Environment Variables

You can use environment variables for sensitive data:

```bash
# Create .env file
echo "PRIVATE_KEY=your_private_key" > .env
echo "RPC_URL=https://rpc-amoy.polygon.technology" >> .env
```

Then load them in your example:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
    rpcUrl: process.env.RPC_URL,
  },
});
```

## Wallet Connection

Examples that require wallet connections (token-operations, oracle-and-vault) will run in read-only mode by default. To enable write operations:

1. **For Browser Environment:**
   ```typescript
   import { BrowserProvider } from 'ethers';
   
   const provider = new BrowserProvider(window.ethereum);
   await sdk.connect(provider);
   ```

2. **For Node.js with Private Key:**
   ```typescript
   import { JsonRpcProvider, Wallet } from 'ethers';
   
   const provider = new JsonRpcProvider(RPC_URL);
   const wallet = new Wallet(PRIVATE_KEY, provider);
   await sdk.connect(wallet);
   ```

## Troubleshooting

### Module Not Found

If you get "Cannot find module" errors:

```bash
# Make sure dependencies are installed
npm install

# Try running from the SDK root directory
cd packages/lukas-sdk
npx tsx examples/basic-usage.ts
```

### Network Connection Issues

If you get network connection errors:

1. Check your internet connection
2. Verify the RPC endpoint is accessible
3. Try a different RPC endpoint
4. Check if the RPC has rate limits

### TypeScript Errors

If you encounter TypeScript errors:

```bash
# Make sure TypeScript is installed
npm install -D typescript

# Check your TypeScript version
npx tsc --version
```

## Additional Resources

- **Full Documentation**: [docs.lukas.money/sdk](https://docs.lukas.money)
- **API Reference**: See the [API documentation](../../../apps/docs/docs/sdk/api-reference.md)
- **Migration Guide**: See the [migration guide](../../../apps/docs/docs/sdk/migration-guide.md)
- **Troubleshooting**: See the [troubleshooting guide](../../../apps/docs/docs/sdk/troubleshooting.md)

## Contributing

Found an issue or want to add a new example? Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Add your example with clear documentation
4. Submit a pull request

## License

MIT
