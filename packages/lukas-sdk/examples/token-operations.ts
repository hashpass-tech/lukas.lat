/**
 * Token operations example for the Lukas SDK
 * 
 * This example demonstrates:
 * - Connecting a wallet provider
 * - Checking balances and allowances
 * - Transferring tokens
 * - Approving token spending
 * - Using transferFrom
 */

import { LukasSDK } from '../src/index';
import { BrowserProvider, parseUnits } from 'ethers';

async function tokenOperationsExample(): Promise<void> {
  console.log('=== Lukas SDK Token Operations Example ===\n');

  // Initialize SDK
  const sdk = new LukasSDK({
    network: {
      chainId: 80002,
      name: 'amoy',
    },
  });

  console.log('✅ SDK initialized\n');

  // Connect wallet (in a real app, this would be MetaMask or another wallet)
  // For this example, we'll show the pattern
  console.log('📱 Connecting wallet...');
  
  // In a browser environment with MetaMask:
  // const provider = new BrowserProvider(window.ethereum);
  // await sdk.connect(provider);
  
  // For this example, we'll simulate the connection check
  if (sdk.isReadOnly()) {
    console.log('⚠️  Running in read-only mode');
    console.log('   To perform transactions, connect a wallet provider\n');
  } else {
    console.log('✅ Wallet connected\n');
  }

  const contractManager = sdk.getContractManager();

  // Example addresses (replace with real addresses)
  const userAddress = '0x1234567890123456789012345678901234567890';
  const recipientAddress = '0x0987654321098765432109876543210987654321';
  const spenderAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

  // 1. Check token balance
  console.log('💰 Checking token balance...');
  try {
    const balance = await contractManager.getBalance(userAddress);
    console.log(`  Balance: ${balance.toString()} (raw)`);
    console.log(`  Balance: ${parseUnits(balance.toString(), -18)} LUKAS\n`);
  } catch (error) {
    console.error('❌ Error checking balance:', error.message, '\n');
  }

  // 2. Check allowance
  console.log('🔍 Checking token allowance...');
  try {
    const allowance = await contractManager.getAllowance(userAddress, spenderAddress);
    console.log(`  Allowance: ${allowance.toString()} (raw)`);
    console.log(`  Allowance: ${parseUnits(allowance.toString(), -18)} LUKAS\n`);
  } catch (error) {
    console.error('❌ Error checking allowance:', error.message, '\n');
  }

  // 3. Transfer tokens (requires signer)
  console.log('💸 Transfer example:');
  if (sdk.isReadOnly()) {
    console.log('  ⚠️  Skipped - requires wallet connection');
    console.log('  Code example:');
    console.log('  ```typescript');
    console.log('  const amount = parseUnits("100", 18); // 100 LUKAS');
    console.log('  const tx = await contractManager.transfer(recipientAddress, amount);');
    console.log('  console.log("Transaction hash:", tx.hash);');
    console.log('  const receipt = await tx.wait();');
    console.log('  console.log("Transaction confirmed in block:", receipt.blockNumber);');
    console.log('  ```\n');
  } else {
    try {
      const amount = parseUnits('100', 18); // 100 LUKAS
      console.log(`  Transferring ${parseUnits(amount.toString(), -18)} LUKAS to ${recipientAddress}...`);
      
      const tx = await contractManager.transfer(recipientAddress, amount);
      console.log('  Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('  ✅ Transaction confirmed in block:', receipt.blockNumber, '\n');
    } catch (error) {
      console.error('❌ Transfer failed:', error.message, '\n');
    }
  }

  // 4. Approve tokens (requires signer)
  console.log('✅ Approve example:');
  if (sdk.isReadOnly()) {
    console.log('  ⚠️  Skipped - requires wallet connection');
    console.log('  Code example:');
    console.log('  ```typescript');
    console.log('  const amount = parseUnits("1000", 18); // 1000 LUKAS');
    console.log('  const tx = await contractManager.approve(spenderAddress, amount);');
    console.log('  console.log("Approval transaction hash:", tx.hash);');
    console.log('  await tx.wait();');
    console.log('  console.log("Approval confirmed!");');
    console.log('  ```\n');
  } else {
    try {
      const amount = parseUnits('1000', 18); // 1000 LUKAS
      console.log(`  Approving ${parseUnits(amount.toString(), -18)} LUKAS for ${spenderAddress}...`);
      
      const tx = await contractManager.approve(spenderAddress, amount);
      console.log('  Approval transaction hash:', tx.hash);
      
      await tx.wait();
      console.log('  ✅ Approval confirmed!\n');
    } catch (error) {
      console.error('❌ Approval failed:', error.message, '\n');
    }
  }

  // 5. Best practices
  console.log('📚 Best Practices:');
  console.log('  1. Always check balance before transfers');
  console.log('  2. Check allowance before transferFrom');
  console.log('  3. Handle errors gracefully');
  console.log('  4. Wait for transaction confirmations');
  console.log('  5. Use proper decimal handling with parseUnits/formatUnits');
  console.log('');

  // 6. Error handling example
  console.log('🛡️  Error Handling Example:');
  console.log('  ```typescript');
  console.log('  try {');
  console.log('    const balance = await contractManager.getBalance(address);');
  console.log('    if (balance.lt(amount)) {');
  console.log('      throw new Error("Insufficient balance");');
  console.log('    }');
  console.log('    const tx = await contractManager.transfer(to, amount);');
  console.log('    await tx.wait();');
  console.log('  } catch (error) {');
  console.log('    if (error instanceof LukasSDKError) {');
  console.log('      console.error("SDK Error:", error.code, error.message);');
  console.log('    } else {');
  console.log('      console.error("Unexpected error:", error);');
  console.log('    }');
  console.log('  }');
  console.log('  ```\n');

  console.log('✅ Example completed!');
}

// Run the example
tokenOperationsExample().catch((error) => {
  console.error('❌ Example failed:', error);
  process.exit(1);
});
