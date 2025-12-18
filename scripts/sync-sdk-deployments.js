#!/usr/bin/env node

/**
 * Sync SDK Deployments Script
 * 
 * This script syncs contract deployments from packages/contracts/deployments.json
 * to the SDK package, ensuring the SDK always has the latest contract addresses.
 * 
 * Usage:
 *   node scripts/sync-sdk-deployments.js
 * 
 * This should be run:
 * 1. After deploying new contracts
 * 2. Before publishing a new SDK version
 * 3. As part of CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');

const DEPLOYMENTS_PATH = path.join(__dirname, '../packages/contracts/deployments.json');
const SDK_DEPLOYMENTS_PATH = path.join(__dirname, '../packages/lukas-sdk/deployments.json');

function main() {
  console.log('🔄 Syncing contract deployments to SDK...\n');

  // Read deployments
  if (!fs.existsSync(DEPLOYMENTS_PATH)) {
    console.error('❌ Error: deployments.json not found at', DEPLOYMENTS_PATH);
    process.exit(1);
  }

  const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
  
  // Validate deployments structure
  if (!deployments.networks || typeof deployments.networks !== 'object') {
    console.error('❌ Error: Invalid deployments.json structure');
    process.exit(1);
  }

  // Copy to SDK
  fs.writeFileSync(
    SDK_DEPLOYMENTS_PATH,
    JSON.stringify(deployments, null, 2) + '\n'
  );

  console.log('✅ Successfully synced deployments to SDK');
  console.log(`   Source: ${DEPLOYMENTS_PATH}`);
  console.log(`   Target: ${SDK_DEPLOYMENTS_PATH}\n`);

  // Print summary
  const networks = Object.keys(deployments.networks);
  console.log(`📊 Summary:`);
  console.log(`   Networks: ${networks.length}`);
  
  networks.forEach(chainId => {
    const network = deployments.networks[chainId];
    const contracts = Object.keys(network.contracts || {});
    const deployed = contracts.filter(name => {
      const addr = network.contracts[name]?.address;
      return addr && addr !== null && addr !== '0x...' && !addr.startsWith('0x0000000000000000000000000000000000000000');
    });
    
    console.log(`   - ${network.name} (${chainId}): ${deployed.length}/${contracts.length} contracts deployed`);
  });

  console.log('\n✨ Sync complete!');
}

main();
