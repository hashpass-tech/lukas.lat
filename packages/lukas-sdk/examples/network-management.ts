/**
 * Network management example for the Lukas SDK
 * 
 * This example demonstrates:
 * - Network switching
 * - Network detection
 * - Network monitoring
 * - Custom network configuration
 * - Handling network changes
 */

import { LukasSDK } from '../src/index';

async function networkManagementExample(): Promise<void> {
  console.log('=== Lukas SDK Network Management Example ===\n');

  // Initialize SDK with Polygon Amoy testnet
  const sdk = new LukasSDK({
    network: {
      chainId: 80002,
      name: 'amoy',
      rpcUrl: 'https://rpc-amoy.polygon.technology',
      blockExplorer: 'https://amoy.polygonscan.com',
    },
  });

  console.log('✅ SDK initialized\n');

  // 1. Get current network information
  console.log('📡 Current Network Information:');
  const networkInfo = sdk.getNetworkInfo();
  console.log('  Chain ID:', networkInfo.chainId);
  console.log('  Name:', networkInfo.name);
  console.log('  RPC URL:', networkInfo.rpcUrl);
  console.log('  Block Explorer:', networkInfo.blockExplorer);
  console.log('  Network Type:', sdk.getCurrentNetworkType());
  console.log('  Is Testnet:', sdk.isTestnet());
  console.log('');

  // 2. Network validation
  console.log('🔍 Validating network...');
  try {
    const validation = await sdk.validateNetwork();
    if (validation.isValid) {
      console.log('  ✅ Network is valid');
    } else {
      console.log('  ❌ Network mismatch!');
      console.log('    Expected:', validation.expected);
      console.log('    Actual:', validation.actual);
    }
    console.log('');
  } catch (error) {
    console.error('❌ Validation error:', error.message, '\n');
  }

  // 3. Network change listeners
  console.log('👂 Setting up network change listeners...');
  
  const unsubscribeChange = sdk.onNetworkChange((networkInfo) => {
    console.log('  🔄 Network changed!');
    console.log('    New network:', networkInfo.name);
    console.log('    Chain ID:', networkInfo.chainId);
  });

  const unsubscribeMismatch = sdk.onNetworkMismatch((expected, actual) => {
    console.log('  ⚠️  Network mismatch detected!');
    console.log('    Expected chain ID:', expected);
    console.log('    Actual chain ID:', actual);
  });

  console.log('  ✅ Listeners registered');
  console.log('');

  // 4. Network monitoring
  console.log('🔄 Starting network monitoring...');
  sdk.startNetworkMonitoring(5000); // Check every 5 seconds
  console.log('  ✅ Monitoring active:', sdk.isNetworkMonitoringActive());
  console.log('  Checking network every 5 seconds...');
  console.log('');

  // Wait a bit to demonstrate monitoring
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 5. Stop monitoring
  console.log('⏸️  Stopping network monitoring...');
  sdk.stopNetworkMonitoring();
  console.log('  ✅ Monitoring stopped:', !sdk.isNetworkMonitoringActive());
  console.log('');

  // 6. Network switching example
  console.log('🔀 Network Switching Example:');
  console.log('  Current network:', sdk.getNetworkInfo().name);
  console.log('');
  console.log('  To switch networks:');
  console.log('  ```typescript');
  console.log('  // Switch to another supported network');
  console.log('  await sdk.switchNetwork(1); // Mainnet');
  console.log('  ');
  console.log('  // Switch with custom contracts');
  console.log('  await sdk.switchNetwork(80002, {');
  console.log('    lukasToken: "0x...",');
  console.log('    stabilizerVault: "0x...",');
  console.log('  });');
  console.log('  ```\n');

  // 7. Custom network configuration
  console.log('🛠️  Custom Network Configuration:');
  console.log('  ```typescript');
  console.log('  // Add a custom network (e.g., local development)');
  console.log('  const customNetwork = await sdk.addCustomNetwork({');
  console.log('    chainId: 31337,');
  console.log('    name: "localhost",');
  console.log('    rpcUrl: "http://localhost:8545",');
  console.log('    contracts: {');
  console.log('      lukasToken: "0x...",');
  console.log('      stabilizerVault: "0x...",');
  console.log('      latAmBasketIndex: "0x...",');
  console.log('      lukasHook: "0x...",');
  console.log('      usdc: "0x...",');
  console.log('    },');
  console.log('  });');
  console.log('  console.log("Custom network added:", customNetwork.name);');
  console.log('  ```\n');

  // 8. Auto-detection example
  console.log('🔎 Auto-Detection Example:');
  console.log('  ```typescript');
  console.log('  // Automatically detect and switch to provider network');
  console.log('  const detectedNetwork = await sdk.autoDetectNetwork();');
  console.log('  if (detectedNetwork) {');
  console.log('    console.log("Switched to:", detectedNetwork.name);');
  console.log('  } else {');
  console.log('    console.log("Could not detect network");');
  console.log('  }');
  console.log('  ```\n');

  // 9. React integration example
  console.log('⚛️  React Integration Example:');
  console.log('  ```typescript');
  console.log('  function NetworkMonitor() {');
  console.log('    const [network, setNetwork] = useState(sdk.getNetworkInfo());');
  console.log('    ');
  console.log('    useEffect(() => {');
  console.log('      // Subscribe to network changes');
  console.log('      const unsubscribe = sdk.onNetworkChange((networkInfo) => {');
  console.log('        setNetwork(networkInfo);');
  console.log('      });');
  console.log('      ');
  console.log('      // Start monitoring');
  console.log('      sdk.startNetworkMonitoring();');
  console.log('      ');
  console.log('      // Cleanup');
  console.log('      return () => {');
  console.log('        unsubscribe();');
  console.log('        sdk.stopNetworkMonitoring();');
  console.log('      };');
  console.log('    }, []);');
  console.log('    ');
  console.log('    return (');
  console.log('      <div>');
  console.log('        <p>Network: {network.name}</p>');
  console.log('        <p>Chain ID: {network.chainId}</p>');
  console.log('      </div>');
  console.log('    );');
  console.log('  }');
  console.log('  ```\n');

  // 10. Best practices
  console.log('📚 BEST PRACTICES\n');
  console.log('  Network Management:');
  console.log('    ✓ Always validate network before transactions');
  console.log('    ✓ Monitor network changes in dApps');
  console.log('    ✓ Handle network mismatches gracefully');
  console.log('    ✓ Clean up listeners when components unmount');
  console.log('    ✓ Use auto-detection for better UX');
  console.log('');
  console.log('  Error Handling:');
  console.log('    ✓ Catch network switching errors');
  console.log('    ✓ Provide clear user feedback');
  console.log('    ✓ Implement retry logic for network issues');
  console.log('');
  console.log('  Performance:');
  console.log('    ✓ Adjust monitoring interval based on needs');
  console.log('    ✓ Stop monitoring when not needed');
  console.log('    ✓ Cache network information appropriately');
  console.log('');

  // Cleanup
  unsubscribeChange();
  unsubscribeMismatch();

  console.log('✅ Example completed!');
}

// Run the example
networkManagementExample().catch((error) => {
  console.error('❌ Example failed:', error);
  process.exit(1);
});
