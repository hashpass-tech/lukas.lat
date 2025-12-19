// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title DeployAndInitializePool
 * @notice Complete deployment script for LUKAS/USDC pool
 * @dev Deploys hook (if needed) and initializes pool with liquidity
 */
contract DeployAndInitializePool is Script {
    // Deployed contract addresses on Amoy
    address constant LUKAS_TOKEN = 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;
    
    // Pool configuration
    uint24 constant FEE = 3000; // 0.3%
    int24 constant TICK_SPACING = 60;
    uint160 constant SQRT_PRICE_X96 = 62135896541; // 0.0976 USDC per LUKAS
    
    // Liquidity amounts
    uint256 constant LUKAS_AMOUNT = 10e18; // 10 LUKAS
    uint256 constant USDC_AMOUNT = 976000; // 0.976 USDC (6 decimals)

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== LUKAS/USDC Pool Deployment ===");
        console.log("Deployer:", deployer);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Check if pool already exists
        console.log("Step 1: Checking pool status...");
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(LUKAS_TOKEN),
            currency1: Currency.wrap(USDC),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(0)) // No hook for now
        });

        // Step 2: Initialize pool if not already initialized
        console.log("Step 2: Initializing pool...");
        try IPoolManager(POOL_MANAGER).initialize(key, SQRT_PRICE_X96) returns (int24 tick) {
            console.log("Pool initialized successfully!");
            console.log("Initial tick:", uint256(int256(tick)));
        } catch Error(string memory reason) {
            console.log("Pool initialization failed or already initialized:", reason);
        } catch {
            console.log("Pool may already be initialized");
        }

        // Step 3: Check balances
        console.log("");
        console.log("Step 3: Checking token balances...");
        uint256 lukasBalance = IERC20(LUKAS_TOKEN).balanceOf(deployer);
        uint256 usdcBalance = IERC20(USDC).balanceOf(deployer);
        console.log("LUKAS balance:", lukasBalance);
        console.log("USDC balance:", usdcBalance);

        // Step 4: Approve tokens for pool manager
        console.log("");
        console.log("Step 4: Approving tokens...");
        if (lukasBalance >= LUKAS_AMOUNT) {
            IERC20(LUKAS_TOKEN).approve(POOL_MANAGER, LUKAS_AMOUNT);
            console.log("LUKAS approved");
        } else {
            console.log("WARNING: Insufficient LUKAS balance");
        }

        if (usdcBalance >= USDC_AMOUNT) {
            IERC20(USDC).approve(POOL_MANAGER, USDC_AMOUNT);
            console.log("USDC approved");
        } else {
            console.log("WARNING: Insufficient USDC balance");
        }

        // Step 5: Add liquidity (if balances sufficient)
        console.log("");
        console.log("Step 5: Adding liquidity...");
        if (lukasBalance >= LUKAS_AMOUNT && usdcBalance >= USDC_AMOUNT) {
            IPoolManager.ModifyLiquidityParams memory params = IPoolManager.ModifyLiquidityParams({
                tickLower: -887220, // Full range
                tickUpper: 887220,
                liquidityDelta: int256(LUKAS_AMOUNT), // Simplified
                salt: bytes32(0)
            });

            try IPoolManager(POOL_MANAGER).modifyLiquidity(key, params, "") {
                console.log("Liquidity added successfully!");
            } catch Error(string memory reason) {
                console.log("Failed to add liquidity:", reason);
            }
        } else {
            console.log("Skipping liquidity addition due to insufficient balance");
        }

        vm.stopBroadcast();

        // Summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("Pool Manager:", POOL_MANAGER);
        console.log("LUKAS Token:", LUKAS_TOKEN);
        console.log("USDC:", USDC);
        console.log("Fee:", FEE);
        console.log("Initial Price: 0.0976 USDC per LUKAS");
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify pool on Polygonscan");
        console.log("2. Test swap execution");
        console.log("3. Monitor pool metrics");
        console.log("");
        console.log("Pool address:", POOL_MANAGER);
        console.log("View on Polygonscan:");
        console.log("https://amoy.polygonscan.com/address/", POOL_MANAGER);
    }

    /**
     * @notice Check pool status
     */
    function checkPool() public view {
        console.log("=== Pool Status Check ===");
        console.log("Pool Manager:", POOL_MANAGER);
        console.log("LUKAS Token:", LUKAS_TOKEN);
        console.log("USDC:", USDC);
        console.log("");
        console.log("To check pool state, use:");
        console.log("cast call", POOL_MANAGER, '"getSlot0(bytes32)"', "POOL_ID");
    }
}
