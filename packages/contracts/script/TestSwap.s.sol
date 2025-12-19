// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";

/**
 * @title TestSwap
 * @notice Test swap execution on LUKAS/USDC pool
 * @dev Tests the full swap flow: approve → swap → verify balances
 */
contract TestSwap is Script {
    // Deployed contract addresses on Amoy
    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant LUKAS_TOKEN = 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant LUKAS_HOOK = address(0);

    // Pool configuration
    uint24 constant FEE = 3000; // 0.3%
    int24 constant TICK_SPACING = 60;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Testing swap on LUKAS/USDC pool");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Create pool key
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN),
            currency1: Currency.wrap(USDC),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(LUKAS_HOOK)
        });

        // Check balances before swap
        uint256 lukasBalanceBefore = IERC20(LUKAS_TOKEN).balanceOf(deployer);
        uint256 usdcBalanceBefore = IERC20(USDC).balanceOf(deployer);
        
        console.log("LUKAS balance before:", lukasBalanceBefore);
        console.log("USDC balance before:", usdcBalanceBefore);

        // Test swap: 1 USDC → LUKAS
        uint256 amountIn = 1e6; // 1 USDC (6 decimals)
        
        // Approve USDC
        IERC20(USDC).approve(POOL_MANAGER, amountIn);
        console.log("Approved USDC");

        // Execute swap
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: false, // USDC (token1) → LUKAS (token0)
            amountSpecified: -int256(amountIn), // Exact input
            sqrtPriceLimitX96: 0 // No price limit
        });

        try IPoolManager(POOL_MANAGER).swap(key, params, "") returns (BalanceDelta delta) {
            console.log("Swap successful!");
            
            // Check balances after swap
            uint256 lukasBalanceAfter = IERC20(LUKAS_TOKEN).balanceOf(deployer);
            uint256 usdcBalanceAfter = IERC20(USDC).balanceOf(deployer);
            
            console.log("LUKAS balance after:", lukasBalanceAfter);
            console.log("USDC balance after:", usdcBalanceAfter);
            console.log("LUKAS received:", lukasBalanceAfter - lukasBalanceBefore);
            console.log("USDC spent:", usdcBalanceBefore - usdcBalanceAfter);
        } catch Error(string memory reason) {
            console.log("Swap failed:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("Swap failed with low-level error");
            console.logBytes(lowLevelData);
        }

        vm.stopBroadcast();
    }

    /**
     * @notice Test reverse swap: LUKAS → USDC
     */
    function testReverseSwap() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Testing reverse swap: LUKAS -> USDC");

        vm.startBroadcast(deployerPrivateKey);

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN),
            currency1: Currency.wrap(USDC),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(LUKAS_HOOK)
        });

        // Test swap: 10 LUKAS → USDC
        uint256 amountIn = 10e18; // 10 LUKAS (18 decimals)
        
        // Approve LUKAS
        IERC20(LUKAS_TOKEN).approve(POOL_MANAGER, amountIn);
        console.log("Approved LUKAS");

        // Execute swap
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: true, // LUKAS (token0) → USDC (token1)
            amountSpecified: -int256(amountIn), // Exact input
            sqrtPriceLimitX96: 0 // No price limit
        });

        try IPoolManager(POOL_MANAGER).swap(key, params, "") returns (BalanceDelta delta) {
            console.log("Reverse swap successful!");
            
            uint256 lukasBalanceAfter = IERC20(LUKAS_TOKEN).balanceOf(deployer);
            uint256 usdcBalanceAfter = IERC20(USDC).balanceOf(deployer);
            
            console.log("LUKAS balance after:", lukasBalanceAfter);
            console.log("USDC balance after:", usdcBalanceAfter);
        } catch Error(string memory reason) {
            console.log("Reverse swap failed:", reason);
        }

        vm.stopBroadcast();
    }

    /**
     * @notice Get current pool state
     * @dev Note: getSlot0 may not be available in all IPoolManager implementations
     */
    function getPoolState() public view {
        console.log("Pool Manager:", POOL_MANAGER);
        console.log("LUKAS Token:", LUKAS_TOKEN);
        console.log("USDC:", USDC);
        console.log("Fee:", FEE);
        console.log("Tick Spacing:", uint256(int256(TICK_SPACING)));
    }
}
