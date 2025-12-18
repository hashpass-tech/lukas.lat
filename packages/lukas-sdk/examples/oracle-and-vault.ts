/**
 * Oracle and Vault operations example for the Lukas SDK
 * 
 * This example demonstrates:
 * - Querying oracle price data
 * - Checking peg status
 * - Getting basket composition
 * - Vault information queries
 * - Authorization checks
 * - Stabilization operations (for authorized users)
 */

import { LukasSDK } from '../src/index';
import { parseUnits } from 'ethers';

async function oracleAndVaultExample(): Promise<void> {
  console.log('=== Lukas SDK Oracle and Vault Example ===\n');

  // Initialize SDK
  const sdk = new LukasSDK({
    network: {
      chainId: 80002,
      name: 'amoy',
    },
  });

  console.log('✅ SDK initialized\n');

  const contractManager = sdk.getContractManager();

  // ===== ORACLE OPERATIONS =====
  console.log('📊 ORACLE OPERATIONS\n');

  // 1. Get fair price from oracle
  console.log('💵 Fetching fair price from LatAm Basket Index...');
  try {
    const fairPrice = await contractManager.getFairPrice();
    console.log('  Fair Price:', fairPrice.toString(), '(raw)');
    console.log('  Fair Price:', parseUnits(fairPrice.toString(), -18), 'USD');
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching fair price:', error.message, '\n');
  }

  // 2. Get basket composition
  console.log('🧺 Fetching basket composition...');
  try {
    const basket = await contractManager.getBasketComposition();
    console.log('  Currencies:', basket.currencies.join(', '));
    console.log('  Weights (basis points):');
    basket.currencies.forEach((currency, i) => {
      const weightPercent = (basket.weights[i] / 100).toFixed(2);
      console.log(`    ${currency}: ${weightPercent}%`);
    });
    console.log('  Prices:');
    basket.currencies.forEach((currency, i) => {
      console.log(`    ${currency}: ${basket.prices[i].toString()}`);
    });
    console.log('  Last Updated:');
    basket.currencies.forEach((currency, i) => {
      const date = new Date(basket.lastUpdated[i] * 1000);
      console.log(`    ${currency}: ${date.toISOString()}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching basket composition:', error.message, '\n');
  }

  // 3. Check for stale feeds
  console.log('🔍 Checking for stale price feeds...');
  try {
    const hasStale = await contractManager.hasStaleFeeds();
    if (hasStale) {
      console.log('  ⚠️  Warning: Some price feeds are stale!');
    } else {
      console.log('  ✅ All price feeds are up to date');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error checking stale feeds:', error.message, '\n');
  }

  // ===== VAULT OPERATIONS =====
  console.log('🏦 VAULT OPERATIONS\n');

  // 4. Get vault information
  console.log('📋 Fetching vault information...');
  try {
    const vaultInfo = await contractManager.getVaultInfo();
    console.log('  Max Mint Per Action:', vaultInfo.maxMintPerAction.toString());
    console.log('  Max Buyback Per Action:', vaultInfo.maxBuybackPerAction.toString());
    console.log('  Deviation Threshold:', vaultInfo.deviationThreshold, 'bps');
    console.log('  Cooldown Period:', vaultInfo.cooldownPeriod, 'seconds');
    
    const lastStabDate = new Date(vaultInfo.lastStabilization * 1000);
    console.log('  Last Stabilization:', lastStabDate.toISOString());
    
    console.log('  Total Minted:', vaultInfo.totalMinted.toString());
    console.log('  Total Bought Back:', vaultInfo.totalBoughtBack.toString());
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching vault info:', error.message, '\n');
  }

  // 5. Check authorization
  const exampleAddress = '0x1234567890123456789012345678901234567890';
  console.log(`🔐 Checking authorization for ${exampleAddress}...`);
  try {
    const isAuthorized = await contractManager.isAuthorized(exampleAddress);
    if (isAuthorized) {
      console.log('  ✅ Address is authorized for vault operations');
    } else {
      console.log('  ❌ Address is NOT authorized for vault operations');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error checking authorization:', error.message, '\n');
  }

  // 6. Stabilization operations (requires authorization and signer)
  console.log('⚖️  STABILIZATION OPERATIONS\n');
  
  if (sdk.isReadOnly()) {
    console.log('  ⚠️  Running in read-only mode');
    console.log('  Stabilization operations require:');
    console.log('    1. Connected wallet (signer)');
    console.log('    2. Authorized address');
    console.log('');
    
    console.log('  Example: Stabilization Mint');
    console.log('  ```typescript');
    console.log('  // Check if authorized');
    console.log('  const signer = sdk.getSigner();');
    console.log('  const signerAddress = await signer.getAddress();');
    console.log('  const isAuthorized = await contractManager.isAuthorized(signerAddress);');
    console.log('  ');
    console.log('  if (!isAuthorized) {');
    console.log('    throw new Error("Not authorized for stabilization");');
    console.log('  }');
    console.log('  ');
    console.log('  // Perform stabilization mint');
    console.log('  const amount = parseUnits("1000", 18); // 1000 LUKAS');
    console.log('  const recipient = "0x...";');
    console.log('  const tx = await contractManager.stabilizeMint(amount, recipient);');
    console.log('  console.log("Stabilization mint tx:", tx.hash);');
    console.log('  await tx.wait();');
    console.log('  ```\n');
    
    console.log('  Example: Stabilization Buyback');
    console.log('  ```typescript');
    console.log('  // Perform stabilization buyback');
    console.log('  const amount = parseUnits("500", 18); // 500 LUKAS');
    console.log('  const tx = await contractManager.stabilizeBuyback(amount);');
    console.log('  console.log("Stabilization buyback tx:", tx.hash);');
    console.log('  await tx.wait();');
    console.log('  ```\n');
  } else {
    // If connected, check authorization and potentially perform operations
    try {
      const signer = sdk.getSigner();
      if (signer) {
        const signerAddress = await signer.getAddress();
        const isAuthorized = await contractManager.isAuthorized(signerAddress);
        
        if (isAuthorized) {
          console.log('  ✅ You are authorized for stabilization operations');
          console.log('  You can now call:');
          console.log('    - contractManager.stabilizeMint(amount, recipient)');
          console.log('    - contractManager.stabilizeBuyback(amount)');
        } else {
          console.log('  ❌ Your address is not authorized for stabilization');
        }
      }
    } catch (error) {
      console.error('❌ Error checking signer authorization:', error.message);
    }
    console.log('');
  }

  // 7. Monitoring and best practices
  console.log('📚 BEST PRACTICES\n');
  console.log('  Oracle Data:');
  console.log('    - Always check for stale feeds before using prices');
  console.log('    - Monitor basket composition changes');
  console.log('    - Cache oracle data appropriately');
  console.log('');
  console.log('  Vault Operations:');
  console.log('    - Verify authorization before attempting operations');
  console.log('    - Check cooldown period compliance');
  console.log('    - Respect max mint/buyback limits');
  console.log('    - Monitor deviation thresholds');
  console.log('');
  console.log('  Error Handling:');
  console.log('    - Handle unauthorized access gracefully');
  console.log('    - Check for stale data errors');
  console.log('    - Validate amounts against limits');
  console.log('');

  console.log('✅ Example completed!');
}

// Run the example
oracleAndVaultExample().catch((error) => {
  console.error('❌ Example failed:', error);
  process.exit(1);
});
