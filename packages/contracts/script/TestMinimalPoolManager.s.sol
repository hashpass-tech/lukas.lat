// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MinimalPoolManager} from "../src/MinimalPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

contract TestMinimalPoolManager is Script {
    // Deployed MinimalPoolManager address
    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    
    // Contract addresses
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant USDC_TOKEN = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;

    function run() public {
        vm.startBroadcast();

        MinimalPoolManager poolManager = MinimalPoolManager(POOL_MANAGER);

        console.log("=== Testing MinimalPoolManager ===");
        console.log("PoolManager Address:", address(poolManager));
        console.log("Owner:", poolManager.owner());

        // Create a test pool key (LUKAS/USDC)
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN < USDC_TOKEN ? LUKAS_TOKEN : USDC_TOKEN),
            currency1: Currency.wrap(LUKAS_TOKEN < USDC_TOKEN ? USDC_TOKEN : LUKAS_TOKEN),
            fee: 3000, // 0.3%
            tickSpacing: 60,
            hooks: IHooks(address(0)) // No hook for this test
        });

        console.log("Pool Key Created:");
        console.log("  Currency0:", Currency.unwrap(key.currency0));
        console.log("  Currency1:", Currency.unwrap(key.currency1));
        console.log("  Fee:", key.fee);

        // Test pool initialization
        uint160 sqrtPriceX96 = 79228162514264337593543950336; // 1:1 price
        
        try poolManager.initialize(key, sqrtPriceX96) returns (int24 tick) {
            console.log("Pool initialized successfully!");
            console.log("Initial tick:", tick);
            
            // Check pool state
            (uint160 price, int24 currentTick, uint24 protocolFee, uint24 lpFee) = poolManager.getSlot0(key.toId());
            console.log("Pool State:");
            console.log("  SqrtPriceX96:", price);
            console.log("  Tick:", currentTick);
            console.log("  Protocol Fee:", protocolFee);
            console.log("  LP Fee:", lpFee);
            
        } catch Error(string memory reason) {
            console.log("Pool initialization failed:", reason);
        } catch {
            console.log("Pool initialization failed with unknown error");
        }

        console.log("=== Test Complete ===");

        vm.stopBroadcast();
    }
}