#!/usr/bin/env node

/**
 * Sync Deployments Script
 * 
 * This script synchronizes contract deployment addresses across:
 * - SDK (packages/lukas-sdk/src/core/types.ts)
 * - Web App (apps/web/src/lib/web3-config.ts)
 * - Documentation (apps/docs/docs/contracts/deployments.md)
 * 
 * Source of truth: packages/contracts/deployments.json
 */

const fs = require('fs');
const path = require('path');

// Paths
const DEPLOYMENTS_PATH = path.join(__dirname, '../packages/contracts/deployments.json');
const SDK_NETWORK_CONFIG_PATH = path.join(__dirname, '../packages/lukas-sdk/src/core/NetworkManager.ts');
const WEB_CONFIG_PATH = path.join(__dirname, '../apps/web/src/lib/web3-config.ts');
const DOCS_PATH = path.join(__dirname, '../apps/docs/docs/contracts/deployments.md');

console.log('🔄 Syncing contract deployments...\n');

// Read deployments.json
let deployments;
try {
  const deploymentsData = fs.readFileSync(DEPLOYMENTS_PATH, 'utf8');
  deployments = JSON.parse(deploymentsData);
  console.log('✅ Loaded deployments.json');
} catch (error) {
  console.error('❌ Error reading deployments.json:', error.message);
  process.exit(1);
}

// Update SDK NetworkManager
function updateSDKNetworkManager() {
  console.log('\n📦 Updating SDK NetworkManager...');
  
  try {
    let sdkContent = fs.readFileSync(SDK_NETWORK_CONFIG_PATH, 'utf8');
    
    // Generate network configurations
    const networks = Object.entries(deployments.networks).map(([chainId, network]) => {
      const contracts = network.contracts;
      return `  ${chainId}: {
    chainId: ${chainId},
    name: '${network.name.toLowerCase().replace(/\s+/g, '-')}',
    rpcUrl: '${network.rpcUrl}',
    blockExplorer: '${network.blockExplorer}',
    contracts: {
      lukasToken: '${contracts.LukasToken.address || '0x0000000000000000000000000000000000000000'}',
      stabilizerVault: '${contracts.StabilizerVault.address || '0x0000000000000000000000000000000000000000'}',
      latAmBasketIndex: '${contracts.LatAmBasketIndex.address || '0x0000000000000000000000000000000000000000'}',
      lukasHook: '${contracts.LukasHook.address || '0x0000000000000000000000000000000000000000'}',
      usdc: '${contracts.USDC.address || '0x0000000000000000000000000000000000000000'}',
    },
  }`;
    }).join(',\n');
    
    // Find and replace the SUPPORTED_NETWORKS object
    const networkRegex = /export const SUPPORTED_NETWORKS: Record<number, NetworkConfig & \{ contracts: ContractAddresses \}> = \{[\s\S]*?\n\};/;
    
    const newNetworksBlock = `export const SUPPORTED_NETWORKS: Record<number, NetworkConfig & { contracts: ContractAddresses }> = {
${networks}
};`;
    
    if (networkRegex.test(sdkContent)) {
      sdkContent = sdkContent.replace(networkRegex, newNetworksBlock);
      fs.writeFileSync(SDK_NETWORK_CONFIG_PATH, sdkContent, 'utf8');
      console.log('✅ SDK NetworkManager updated');
    } else {
      console.log('⚠️  Could not find SUPPORTED_NETWORKS in SDK NetworkManager');
    }
  } catch (error) {
    console.error('❌ Error updating SDK:', error.message);
  }
}

// Update Web App Config
function updateWebConfig() {
  console.log('\n🌐 Updating Web App config...');
  
  try {
    // Check if file exists, if not create it
    if (!fs.existsSync(WEB_CONFIG_PATH)) {
      console.log('📝 Creating web3-config.ts...');
      
      const webConfigContent = `/**
 * Web3 Configuration
 * 
 * Contract addresses and network configuration for the web app.
 * Auto-generated from packages/contracts/deployments.json
 * 
 * DO NOT EDIT MANUALLY - Run 'npm run sync-deployments' to update
 */

export const SUPPORTED_NETWORKS = ${JSON.stringify(deployments.networks, null, 2)};

export const DEFAULT_NETWORK = 80002; // Polygon Amoy Testnet

export function getContractAddresses(chainId: number) {
  const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
  if (!network) {
    throw new Error(\`Unsupported network: \${chainId}\`);
  }
  return network.contracts;
}

export function getNetworkInfo(chainId: number) {
  const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
  if (!network) {
    throw new Error(\`Unsupported network: \${chainId}\`);
  }
  return {
    name: network.name,
    chainId: network.chainId,
    rpcUrl: network.rpcUrl,
    blockExplorer: network.blockExplorer,
  };
}
`;
      
      fs.writeFileSync(WEB_CONFIG_PATH, webConfigContent, 'utf8');
      console.log('✅ Web config created');
    } else {
      let webContent = fs.readFileSync(WEB_CONFIG_PATH, 'utf8');
      
      // Replace SUPPORTED_NETWORKS
      const networkRegex = /export const SUPPORTED_NETWORKS = \{[\s\S]*?\};/;
      const newNetworksBlock = `export const SUPPORTED_NETWORKS = ${JSON.stringify(deployments.networks, null, 2)};`;
      
      if (networkRegex.test(webContent)) {
        webContent = webContent.replace(networkRegex, newNetworksBlock);
        fs.writeFileSync(WEB_CONFIG_PATH, webContent, 'utf8');
        console.log('✅ Web config updated');
      } else {
        console.log('⚠️  Could not find SUPPORTED_NETWORKS in web config');
      }
    }
  } catch (error) {
    console.error('❌ Error updating web config:', error.message);
  }
}

// Update Documentation
function updateDocumentation() {
  console.log('\n📚 Updating documentation...');
  
  try {
    // The documentation is manually maintained but we can update the timestamp
    if (fs.existsSync(DOCS_PATH)) {
      let docsContent = fs.readFileSync(DOCS_PATH, 'utf8');
      
      // Update last updated timestamp
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      docsContent = docsContent.replace(
        /\*\*Last Updated:\*\* .*/,
        `**Last Updated:** ${today}`
      );
      
      fs.writeFileSync(DOCS_PATH, docsContent, 'utf8');
      console.log('✅ Documentation timestamp updated');
    } else {
      console.log('⚠️  Documentation file not found');
    }
  } catch (error) {
    console.error('❌ Error updating documentation:', error.message);
  }
}

// Update deployments.json timestamp
function updateDeploymentsTimestamp() {
  console.log('\n⏰ Updating deployments.json timestamp...');
  
  try {
    deployments.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(deployments, null, 2) + '\n', 'utf8');
    console.log('✅ Deployments timestamp updated');
  } catch (error) {
    console.error('❌ Error updating timestamp:', error.message);
  }
}

// Main execution
function main() {
  updateSDKNetworkManager();
  updateWebConfig();
  updateDocumentation();
  updateDeploymentsTimestamp();
  
  console.log('\n✨ Deployment sync complete!\n');
  console.log('📝 Summary:');
  console.log('  - SDK NetworkManager: Updated');
  console.log('  - Web App Config: Updated');
  console.log('  - Documentation: Updated');
  console.log('  - Deployments JSON: Timestamp updated');
  console.log('\n💡 Remember to commit these changes!\n');
}

main();
