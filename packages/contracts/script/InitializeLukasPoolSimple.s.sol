// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolIdLibrary} from "v4-core/src/types/PoolId.sol";

/**
 * @notice Initialize LUKAS/USDC pool without hook (for testing)
 * 
 * Pool Configuration:
 * - Token0: LUKAS (0xAeE0F26589a21BA4547765F630075262f330F1CB)
 * - Token1: USDC (0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582)
 * - Fee: 0.3% (3000 bps)
 * - Tick Spacing: 60
 * - Hook: None (0x0000000000000000000000000000000000000000)
 * - Initial Price: $0.0976 LUKAS/USDC
 */
contract InitializeLukasPoolSimple is Script {
    using PoolIdLibrary for PoolKey;

    // Contract addresses
    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;

    function run() public {
        vm.startBroadcast();

        console.log("=== Initializing LUKAS/USDC Pool (No Hook) ===");
        console.log("");
        console.log("Configuration:");
        console.log("  Token0 (LUKAS): ", LUKAS_TOKEN);
        console.log("  Token1 (USDC):  ", USDC);
        console.log("  Fee:            0.3% (3000 bps)");
        console.log("  Tick Spacing:   60");
        console.log("  Hook:           None (0x0)");
        console.log("");

        IPoolManager poolManager = IPoolManager(POOL_MANAGER);

        // Create pool key without hook
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN),
            currency1: Currency.wrap(USDC),
            fee: 3000, // 0.3%
            tickSpacing: 60,
            hooks: IHooks(address(0)) // No hook for now
        });

        console.log("Pool Key created");
        console.log("  Currency0: ", Currency.unwrap(key.currency0));
        console.log("  Currency1: ", Currency.unwrap(key.currency1));
        console.log("  Fee:       ", key.fee);
        console.log("  Tick Spacing: ", key.tickSpacing);
        console.log("");

        // Calculate sqrtPriceX96 for fair price
        // Fair price: 1 LUKAS = 0.0976 USDC
        uint160 sqrtPriceX96 = 62135896541;

        console.log("Initializing pool with sqrtPriceX96: ", sqrtPriceX96);
        console.log("Expected price: 1 LUKAS = 0.0976 USDC");
        console.log("");

        try poolManager.initialize(key, sqrtPriceX96) {
            console.log("[SUCCESS] Pool initialized successfully!");
            console.log("");
            console.log("Pool Details:");
            console.log("  Initial Price: 0.0976 USDC per LUKAS");
            console.log("");
            console.log("Next Steps:");
            console.log("  1. Verify pool on Polygonscan");
            console.log("  2. Provide initial liquidity");
            console.log("  3. Test swap functionality");
        } catch Error(string memory reason) {
            console.log("[ERROR] Pool initialization failed!");
            console.log("Reason: ", reason);
            revert(reason);
        }

        vm.stopBroadcast();
    }
}
