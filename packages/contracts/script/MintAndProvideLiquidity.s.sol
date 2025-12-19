// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

interface ILukasToken is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @notice Mint LUKAS tokens and provide initial liquidity to LUKAS/USDC pool
 */
contract MintAndProvideLiquidity is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant LUKAS_HOOK = 0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519;

    uint256 constant LUKAS_AMOUNT = 10e18;
    uint256 constant USDC_AMOUNT = 976000;

    int24 constant TICK_LOWER = -887220;
    int24 constant TICK_UPPER = 887220;

    function run() public {
        vm.startBroadcast();

        address deployer = msg.sender;

        // Step 1: Mint LUKAS tokens if needed
        uint256 lukasBalance = IERC20(LUKAS_TOKEN).balanceOf(deployer);
        if (lukasBalance < LUKAS_AMOUNT) {
            uint256 amountToMint = LUKAS_AMOUNT - lukasBalance;
            ILukasToken(LUKAS_TOKEN).mint(deployer, amountToMint);
        }

        // Step 2: Approve tokens
        IERC20(LUKAS_TOKEN).approve(POOL_MANAGER, LUKAS_AMOUNT);
        IERC20(USDC).approve(POOL_MANAGER, USDC_AMOUNT);

        // Step 3: Create pool key
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN),
            currency1: Currency.wrap(USDC),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(LUKAS_HOOK)
        });

        // Step 4: Prepare liquidity parameters
        IPoolManager.ModifyLiquidityParams memory params = IPoolManager.ModifyLiquidityParams({
            tickLower: TICK_LOWER,
            tickUpper: TICK_UPPER,
            liquidityDelta: int256(LUKAS_AMOUNT),
            salt: bytes32(0)
        });

        // Step 5: Add liquidity
        IPoolManager(POOL_MANAGER).modifyLiquidity(key, params, "");

        vm.stopBroadcast();
    }
}
