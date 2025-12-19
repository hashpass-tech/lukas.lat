// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "v4-core/src/types/BeforeSwapDelta.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

/**
 * @title MinimalPoolManager
 * @notice Minimal implementation of IPoolManager for testing LukasHook
 * @dev Only implements functions needed for hook testing - NOT for production
 */
contract MinimalPoolManager {
    using PoolIdLibrary for PoolKey;

    struct PoolInfo {
        uint160 sqrtPriceX96;
        int24 tick;
        bool initialized;
    }

    mapping(PoolId => PoolInfo) public pools;
    address public owner;
    
    event Initialize(PoolId indexed poolId, uint160 sqrtPriceX96, int24 tick);
    event Swap(PoolId indexed poolId, address indexed sender, int128 amount0, int128 amount1);

    constructor() {
        owner = msg.sender;
    }

    function initialize(PoolKey memory key, uint160 sqrtPriceX96) external returns (int24 tick) {
        PoolId poolId = key.toId();
        
        // Call beforeInitialize hook if present
        if (address(key.hooks) != address(0)) {
            key.hooks.beforeInitialize(msg.sender, key, sqrtPriceX96);
        }
        
        // Initialize pool
        pools[poolId] = PoolInfo({
            sqrtPriceX96: sqrtPriceX96,
            tick: 0, // Simplified tick calculation
            initialized: true
        });
        
        tick = 0;
        
        // Call afterInitialize hook if present
        if (address(key.hooks) != address(0)) {
            key.hooks.afterInitialize(msg.sender, key, sqrtPriceX96, tick);
        }
        
        emit Initialize(poolId, sqrtPriceX96, tick);
    }

    function swap(
        PoolKey memory key,
        IPoolManager.SwapParams memory params,
        bytes calldata hookData
    ) external returns (BalanceDelta swapDelta) {
        PoolId poolId = key.toId();
        require(pools[poolId].initialized, "Pool not initialized");
        
        // Call beforeSwap hook if present
        if (address(key.hooks) != address(0)) {
            key.hooks.beforeSwap(msg.sender, key, params, hookData);
        }
        
        // Simulate price change (simplified)
        PoolInfo storage pool = pools[poolId];
        if (params.amountSpecified > 0) {
            // Buying token1 with token0 - price goes up
            pool.sqrtPriceX96 = uint160(uint256(pool.sqrtPriceX96) * 1001 / 1000); // +0.1%
        } else {
            // Selling token1 for token0 - price goes down  
            pool.sqrtPriceX96 = uint160(uint256(pool.sqrtPriceX96) * 999 / 1000); // -0.1%
        }
        
        // Mock delta (simplified)
        swapDelta = BalanceDelta.wrap(0);
        
        // Call afterSwap hook if present
        if (address(key.hooks) != address(0)) {
            key.hooks.afterSwap(msg.sender, key, params, swapDelta, hookData);
        }
        
        emit Swap(poolId, msg.sender, 0, 0); // Simplified event
    }

    function getSlot0(PoolId poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee) {
        PoolInfo memory pool = pools[poolId];
        return (pool.sqrtPriceX96, pool.tick, 0, 3000); // 0.3% fee
    }

    // Minimal implementations for interface compliance
    function modifyLiquidity(PoolKey memory, IPoolManager.ModifyLiquidityParams memory, bytes calldata) 
        external pure returns (BalanceDelta, BalanceDelta) {
        return (BalanceDelta.wrap(0), BalanceDelta.wrap(0));
    }

    function donate(PoolKey memory, uint256, uint256, bytes calldata) 
        external pure returns (BalanceDelta) {
        return BalanceDelta.wrap(0);
    }

    function sync(Currency) external pure {}
    function take(Currency, address, uint256) external pure {}
    function settle() external payable returns (uint256) { return msg.value; }
    function settleFor(address) external payable returns (uint256) { return msg.value; }
    function clear(Currency, uint256) external pure {}
    function mint(address, uint256, uint256) external pure {}
    function burn(address, uint256, uint256) external pure {}
    function updateDynamicLPFee(PoolKey memory, uint24) external pure {}
}