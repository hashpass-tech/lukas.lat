// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

contract InitializePool is Script {
    // Addresses from deployments.json
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    // Addresses (update from previous deployments)
    address constant POOL_MANAGER = address(0); // TODO: Replace with actual PoolManager address
    address constant LUKAS_HOOK = address(0); // TODO: Replace with actual LukasHook address

    function run() public {
        vm.startBroadcast();

        IPoolManager poolManager = IPoolManager(POOL_MANAGER);

        // Define currencies
        Currency lukas = Currency.wrap(LUKAS_TOKEN);
        Currency usdc = Currency.wrap(USDC);

        // Ensure currency0 < currency1
        (Currency currency0, Currency currency1) = Currency.unwrap(lukas) < Currency.unwrap(usdc)
            ? (lukas, usdc)
            : (usdc, lukas);

        // Pool parameters
        uint24 fee = 3000; // 0.3%
        int24 tickSpacing = 60;
        address hookAddr = LUKAS_HOOK;

        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(hookAddr)
        });

        // Initial sqrt price for 1:1 ratio
        uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(0);

        // Initialize pool
        poolManager.initialize(poolKey, sqrtPriceX96);
        console.log("LUKAS/USDC pool initialized");

        vm.stopBroadcast();
    }
}