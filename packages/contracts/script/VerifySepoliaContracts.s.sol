// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

/**
 * @title VerifySepoliaContracts
 * @notice Verify all Lukas Protocol contracts on Sepolia Etherscan
 * 
 * Usage:
 * After deployment, update the contract addresses below, then run:
 * 
 * forge verify-contract \
 *   --chain-id 11155111 \
 *   --num-of-optimizations 200 \
 *   --watch \
 *   --etherscan-api-key $ETHERSCAN_API_KEY \
 *   --compiler-version v0.8.24+commit.e11b9ed9 \
 *   <CONTRACT_ADDRESS> \
 *   src/ContractName.sol:ContractName
 * 
 * Or use this script to verify all at once:
 * forge script script/VerifySepoliaContracts.s.sol:VerifySepoliaContracts --broadcast
 */
contract VerifySepoliaContracts is Script {
    // Update these with actual deployed addresses
    address constant LUKAS_TOKEN = address(0); // TODO: Update after deployment
    address constant BASKET_INDEX = address(0); // TODO: Update after deployment
    address constant STABILIZER_VAULT = address(0); // TODO: Update after deployment
    address constant LUKAS_HOOK = address(0); // TODO: Update after deployment

    function run() external {
        console.log("=== Verifying Lukas Protocol Contracts on Sepolia ===");
        console.log("");

        // Verify LukasToken
        console.log("1. Verifying LukasToken at:", LUKAS_TOKEN);
        console.log("   Command:");
        console.log("   forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch \\");
        console.log("     --etherscan-api-key $ETHERSCAN_API_KEY \\");
        console.log("     --compiler-version v0.8.24+commit.e11b9ed9 \\");
        console.log("     --constructor-args $(cast abi-encode 'constructor(uint256)' 1000000000000000000000000) \\");
        console.log("     ", LUKAS_TOKEN, " \\");
        console.log("     src/LukasToken.sol:LukasToken");
        console.log("");

        // Verify LatAmBasketIndex
        console.log("2. Verifying LatAmBasketIndex at:", BASKET_INDEX);
        console.log("   Command:");
        console.log("   forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch \\");
        console.log("     --etherscan-api-key $ETHERSCAN_API_KEY \\");
        console.log("     --compiler-version v0.8.24+commit.e11b9ed9 \\");
        console.log("     ", BASKET_INDEX, " \\");
        console.log("     src/oracles/LatAmBasketIndex.sol:LatAmBasketIndex");
        console.log("");

        // Verify StabilizerVault
        console.log("3. Verifying StabilizerVault at:", STABILIZER_VAULT);
        console.log("   Command:");
        console.log("   forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch \\");
        console.log("     --etherscan-api-key $ETHERSCAN_API_KEY \\");
        console.log("     --compiler-version v0.8.24+commit.e11b9ed9 \\");
        console.log("     --constructor-args $(cast abi-encode 'constructor(address,address,address)' \\");
        console.log("       ", LUKAS_TOKEN, " \\");
        console.log("       ", BASKET_INDEX, " \\");
        console.log("       0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238) \\");
        console.log("     ", STABILIZER_VAULT, " \\");
        console.log("     src/StabilizerVault.sol:StabilizerVault");
        console.log("");

        // Verify LukasHookSimplified
        console.log("4. Verifying LukasHookSimplified at:", LUKAS_HOOK);
        console.log("   Command:");
        console.log("   forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch \\");
        console.log("     --etherscan-api-key $ETHERSCAN_API_KEY \\");
        console.log("     --compiler-version v0.8.24+commit.e11b9ed9 \\");
        console.log("     --constructor-args $(cast abi-encode 'constructor(address,address,address,address)' \\");
        console.log("       ", BASKET_INDEX, " \\");
        console.log("       ", STABILIZER_VAULT, " \\");
        console.log("       ", LUKAS_TOKEN, " \\");
        console.log("       0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238) \\");
        console.log("     ", LUKAS_HOOK, " \\");
        console.log("     src/LukasHookSimplified.sol:LukasHookSimplified");
        console.log("");

        console.log("=== Verification Instructions ===");
        console.log("1. Update contract addresses in this script");
        console.log("2. Run each verification command above");
        console.log("3. Update deployments.json with verified: true");
        console.log("4. Commit changes");
    }
}
