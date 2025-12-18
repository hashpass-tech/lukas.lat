/**
 * Basic usage example for the Lukas SDK
 * 
 * This example demonstrates:
 * - SDK initialization
 * - Network information
 * - Token information queries
 * - Balance queries
 */

import { LukasSDK } from '../src/index';

async function basicExample(): Promise<void> {
  console.log('=== Lukas SDK Basic Usage Example ===\n');

  // Initialize the SDK for Polygon Amoy testnet (read-only mode)
  const sdk = new LukasSDK({
    network: {
      chainId: 80002,
      name: 'amoy',
      rpcUrl: 'https://rpc-amoy.polygon.technology',
    },
    options: {
      enableCaching: true,
      logLevel: 'info',
    },
  });

  console.log('✅ SDK initialized successfully!\n');

  // Get network information
  const networkInfo = sdk.getNetworkInfo();
  console.log('📡 Network Information:');
  console.log('  Chain ID:', networkInfo.chainId);
  console.log('  Name:', networkInfo.name);
  console.log('  RPC URL:', networkInfo.rpcUrl);
  console.log('  Block Explorer:', networkInfo.blockExplorer || 'N/A');
  console.log('  Read-only mode:', sdk.isReadOnly());
  console.log('');

  // Get contract addresses
  const contractManager = sdk.getContractManager();
  const addresses = contractManager.getAddresses();
  console.log('📝 Contract Addresses:');
  console.log('  LUKAS Token:', addresses.lukasToken);
  console.log('  Stabilizer Vault:', addresses.stabilizerVault);
  console.log('  LatAm Basket Index:', addresses.latAmBasketIndex);
  console.log('  LUKAS Hook:', addresses.lukasHook);
  console.log('  USDC:', addresses.usdc);
  console.log('');

  // Get token information
  try {
    console.log('🪙 Fetching token information...');
    const tokenInfo = await contractManager.getTokenInfo();
    console.log('  Name:', tokenInfo.name);
    console.log('  Symbol:', tokenInfo.symbol);
    console.log('  Decimals:', tokenInfo.decimals);
    console.log('  Total Supply:', tokenInfo.totalSupply.toString());
    console.log('  Contract Address:', tokenInfo.address);
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching token info:', error.message);
  }

  // Example: Query a balance (replace with actual address)
  const exampleAddress = '0x0000000000000000000000000000000000000000';
  try {
    console.log(`💰 Querying balance for ${exampleAddress}...`);
    const balance = await contractManager.getBalance(exampleAddress);
    console.log('  Balance:', balance.toString());
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching balance:', error.message);
  }

  // Get SDK options
  const options = sdk.getOptions();
  console.log('⚙️  SDK Options:');
  console.log('  Caching enabled:', options.enableCaching);
  console.log('  Cache timeout:', options.cacheTimeout, 'ms');
  console.log('  Retry attempts:', options.retryAttempts);
  console.log('  Log level:', options.logLevel);
  console.log('');

  console.log('✅ Example completed successfully!');
}

// Run the example
basicExample().catch((error) => {
  console.error('❌ Example failed:', error);
  process.exit(1);
});