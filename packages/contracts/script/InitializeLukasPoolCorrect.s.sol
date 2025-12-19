// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

/**
 * @notice Initialize LUKAS/USDC pool with CORRECT token addresses
 * 
 * CORRECT Addresses:
 * - LUKAS Token: 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb
 * - USDC: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
 * - PoolManager: 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E
 * - Hook: None (address(0))
 */
contract InitializeLukasPoolCorrect is Script {
    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant LUKAS_TOKEN = 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb; // CORRECT ADDRESS
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant LUKAS_HOOK = address(0); // No hook for now

    // Pool configuration
    uint24 constant FEE = 3000; // 0.3%
    int24 constant TICK_SPACING = 60;
    uint160 constant SQRT_PRICE_X96 = 62135896541; // 0.0976 USDC per LUKAS

    function run() public {
        vm.startBroadcast();

        // Create pool key with CORRECT token address
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN),
            currency1: Currency.wrap(USDC),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(LUKAS_HOOK)
        });

        // Initialize pool
        IPoolManager(POOL_MANAGER).initialize(key, SQRT_PRICE_X96);

        vm.stopBroadcast();
    }
}
