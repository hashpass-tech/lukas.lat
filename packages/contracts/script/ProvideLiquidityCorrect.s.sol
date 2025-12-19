// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

/**
 * @notice Provide initial liquidity to LUKAS/USDC pool with CORRECT token addresses
 */
contract ProvideLiquidityCorrect is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant LUKAS_TOKEN = 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb; // CORRECT ADDRESS
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;

    uint256 constant LUKAS_AMOUNT = 10e18;
    uint256 constant USDC_AMOUNT = 976000;

    int24 constant TICK_LOWER = -887220;
    int24 constant TICK_UPPER = 887220;

    function run() public {
        vm.startBroadcast();

        // Step 1: Approve tokens
        IERC20(LUKAS_TOKEN).approve(POOL_MANAGER, LUKAS_AMOUNT);
        IERC20(USDC).approve(POOL_MANAGER, USDC_AMOUNT);

        // Step 2: Create pool key
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN),
            currency1: Currency.wrap(USDC),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });

        // Step 3: Prepare liquidity parameters
        IPoolManager.ModifyLiquidityParams memory params = IPoolManager.ModifyLiquidityParams({
            tickLower: TICK_LOWER,
            tickUpper: TICK_UPPER,
            liquidityDelta: int256(LUKAS_AMOUNT),
            salt: bytes32(0)
        });

        // Step 4: Add liquidity
        IPoolManager(POOL_MANAGER).modifyLiquidity(key, params, "");

        vm.stopBroadcast();
    }
}
