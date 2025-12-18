// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {PoolModifyLiquidityTest} from "v4-core/src/test/PoolModifyLiquidityTest.sol";
import {ERC20} from "solmate/src/tokens/ERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";


contract AddLiquidity is Script {
    // Addresses from deployments.json
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    // Addresses (update from previous deployments)
    address constant POOL_MANAGER = address(0); // TODO: Replace with actual PoolManager address

    function run() public {
        vm.startBroadcast();

        IPoolManager poolManager = IPoolManager(POOL_MANAGER);
        PoolModifyLiquidityTest liquidityRouter = new PoolModifyLiquidityTest(poolManager);

        // Define pool key (same as InitializePool)
        Currency lukas = Currency.wrap(LUKAS_TOKEN);
        Currency usdc = Currency.wrap(USDC);
        (Currency currency0, Currency currency1) = Currency.unwrap(lukas) < Currency.unwrap(usdc)
            ? (lukas, usdc)
            : (usdc, lukas);

        address hookAddr = address(0); // TODO: Replace with actual LukasHook address

        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(hookAddr)
        });

        // Mint tokens (assuming deployer has minter role or tokens are available)
        // For testnet, you may need to mint tokens first
        // ERC20(LUKAS_TOKEN).approve(address(liquidityRouter), INITIAL_LUKAS);
        // ERC20(USDC).approve(address(liquidityRouter), INITIAL_USDC);

        // Add liquidity parameters
        int24 tickLower = -60; // Below current price
        int24 tickUpper = 60;  // Above current price
        int256 liquidityDelta = 1e18; // Amount of liquidity to add

        // Add liquidity
        liquidityRouter.modifyLiquidity(
            poolKey,
            IPoolManager.ModifyLiquidityParams({
                tickLower: tickLower,
                tickUpper: tickUpper,
                liquidityDelta: liquidityDelta,
                salt: 0
            }),
            ""
        );
        console.log("Initial liquidity added to LUKAS/USDC pool");

        vm.stopBroadcast();
    }
}