/**
 * Basic usage example for the Lukas SDK
 */

import { LukasSDK } from '../src/index';

async function basicExample(): Promise<void> {
  // Initialize the SDK for mainnet
  const sdk = new LukasSDK({
    network: {
      chainId: 1,
      name: 'mainnet',
    },
    options: {
      enableCaching: true,
      logLevel: 'info',
    },
  });

  console.log('SDK initialized successfully!');
  console.log('Network Info:', sdk.getNetworkInfo());
  console.log('Read-only mode:', sdk.isReadOnly());
  console.log('Options:', sdk.getOptions());
}

// Run the example
basicExample().catch(console.error);