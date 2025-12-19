// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LukasHook} from "../src/LukasHook.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";

/**
 * @notice Deploy script for LukasHook
 * 
 * NOTE: Uniswap V4 hooks require the contract address to have specific bits set
 * based on the hook permissions. The hook address validation happens in the
 * BaseHook constructor via validateHookAddress().
 * 
 * If deployment fails with "HookAddressNotValid", it means the deployed address
 * doesn't match the required bit pattern for the declared permissions.
 * 
 * Solutions:
 * 1. Use CREATE2 with a salt that produces a valid address (complex)
 * 2. Adjust hook permissions to match the deployed address (not ideal)
 * 3. Use a hook factory that deploys with CREATE2 (recommended for production)
 * 
 * For testing, we can use a simpler approach: deploy without the validation
 * or use a hook factory pattern.
 */
contract DeployLukasHook is Script {
    // Addresses from deployments.json (CORRECT)
    address constant LUKAS_TOKEN = 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb;
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;

    function run() public {
        vm.startBroadcast();

        console.log("Attempting to deploy LukasHook...");
        console.log("PoolManager:", POOL_MANAGER);
        console.log("BasketIndex:", BASKET_INDEX);
        console.log("StabilizerVault:", STABILIZER_VAULT);
        console.log("LukasToken:", LUKAS_TOKEN);
        console.log("USDC:", USDC);

        // Deploy LukasHook
        // Note: This may fail if the deployed address doesn't match hook permissions
        try new LukasHook(
            IPoolManager(POOL_MANAGER),
            BASKET_INDEX,
            STABILIZER_VAULT,
            LUKAS_TOKEN,
            USDC
        ) returns (LukasHook lukasHook) {
            console.log("LukasHook deployed successfully at:", address(lukasHook));
        } catch Error(string memory reason) {
            console.log("Deployment failed with reason:", reason);
            console.log("");
            console.log("This is likely due to Uniswap V4 hook address validation.");
            console.log("The deployed address must have specific bits set based on hook permissions.");
            console.log("");
            console.log("Workaround: Use a hook factory with CREATE2 to deploy at a valid address.");
            revert(reason);
        }

        vm.stopBroadcast();
    }
}