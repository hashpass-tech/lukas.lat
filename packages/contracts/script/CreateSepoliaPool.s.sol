// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

/**
 * @title CreateSepoliaPool
 * @notice Create LUKAS/USDC pool on Uniswap V4 Sepolia
 * 
 * Pool Configuration:
 * - Token0: LUKAS (0x...)
 * - Token1: USDC (0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238)
 * - Fee: 3000 (0.3%)
 * - Tick Spacing: 60
 * - Initial Price: ~$0.10 USDC per LUKAS
 * 
 * Usage:
 * forge script script/CreateSepoliaPool.s.sol:CreateSepoliaPool \
 *   --rpc-url $SEPOLIA_RPC_URL \
 *   --broadcast
 */
contract CreateSepoliaPool is Script {
    // Sepolia addresses
    address constant POOL_MANAGER = 0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A;
    address constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

    // Update these with actual deployed addresses
    address constant LUKAS_TOKEN = address(0); // TODO: Update after deployment
    address constant STABILIZER_VAULT = address(0); // TODO: Update after deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Creating LUKAS/USDC Pool on Sepolia ===");
        console.log("PoolManager:", POOL_MANAGER);
        console.log("LUKAS Token:", LUKAS_TOKEN);
        console.log("USDC Token:", USDC);

        // Ensure LUKAS < USDC for proper token ordering
        (address token0, address token1) = LUKAS_TOKEN < USDC
            ? (LUKAS_TOKEN, USDC)
            : (USDC, LUKAS_TOKEN);

        console.log("Token0:", token0);
        console.log("Token1:", token1);

        // Create pool key
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: 3000, // 0.3%
            tickSpacing: 60,
            hooks: IHooks(address(0)) // No hooks for initial pool
        });

        // Calculate sqrtPriceX96 for initial price
        // Target price: 0.10 USDC per LUKAS (if LUKAS is token0)
        // sqrtPriceX96 = sqrt(price) * 2^96
        // For price = 0.10: sqrt(0.10) ≈ 0.316227766
        // sqrtPriceX96 ≈ 0.316227766 * 79228162514264337593543950336 ≈ 25054144837504793118641380352
        uint160 sqrtPriceX96;

        if (token0 == LUKAS_TOKEN) {
            // LUKAS is token0, USDC is token1
            // Price = 0.10 USDC per LUKAS
            sqrtPriceX96 = 25054144837504793118641380352;
        } else {
            // USDC is token0, LUKAS is token1
            // Price = 10 LUKAS per USDC (inverse)
            sqrtPriceX96 = 79228162514264337593543950336 * 10; // Approximate
        }

        console.log("sqrtPriceX96:", sqrtPriceX96);

        // Initialize pool
        IPoolManager poolManager = IPoolManager(POOL_MANAGER);
        int24 tick = poolManager.initialize(key, sqrtPriceX96);

        console.log("Pool initialized at tick:", tick);
        console.log("Pool creation complete!");

        // Log pool details for reference
        console.log("");
        console.log("=== Pool Details ===");
        console.log("Token0:", token0);
        console.log("Token1:", token1);
        console.log("Fee:", 3000, "(0.3%)");
        console.log("Tick Spacing:", 60);
        console.log("Initial Tick:", tick);
        console.log("sqrtPriceX96:", sqrtPriceX96);
        console.log("");
        console.log("Next steps:");
        console.log("1. Approve tokens to PoolManager");
        console.log("2. Add liquidity using modifyLiquidity");
        console.log("3. Update deployments.json with pool address");

        vm.stopBroadcast();
    }
}
