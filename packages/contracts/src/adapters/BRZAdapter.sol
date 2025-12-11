// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BasePriceFeed} from "./BasePriceFeed.sol";

/**
 * @title BRZAdapter
 * @notice Price feed adapter for BRL/USD using BRZ/USDT pool on Polygon
 * @dev Reads TWAP from BRZ stablecoin pool to derive BRL/USD rate
 * 
 * BRZ is a regulated Brazilian Real stablecoin (1 BRZ = 1 BRL)
 * Pool: BRZ/USDT on Polygon (e.g., QuickSwap, Uniswap)
 */
contract BRZAdapter is BasePriceFeed {
    /// @notice Address of the BRZ/USDT pool
    address public pool;
    
    /// @notice BRZ token address
    address public brzToken;
    
    /// @notice USDT token address  
    address public usdtToken;
    
    /// @notice Cached price (updated by keeper or on-demand)
    uint256 private cachedPrice;
    
    /// @notice Last update timestamp
    uint256 private lastUpdate;

    /// @notice TWAP observation window (default 30 minutes)
    uint32 public twapWindow;

    event PoolUpdated(address oldPool, address newPool);
    event PriceUpdated(uint256 price, uint256 timestamp);

    constructor(
        address _pool,
        address _brzToken,
        address _usdtToken,
        uint32 _twapWindow
    ) BasePriceFeed("BRL", 1 hours) {
        pool = _pool;
        brzToken = _brzToken;
        usdtToken = _usdtToken;
        twapWindow = _twapWindow;
    }

    /**
     * @notice Update the pool address
     * @param newPool New pool address
     */
    function setPool(address newPool) external onlyOwner {
        emit PoolUpdated(pool, newPool);
        pool = newPool;
    }

    /**
     * @notice Update TWAP window
     * @param newWindow New window in seconds
     */
    function setTwapWindow(uint32 newWindow) external onlyOwner {
        twapWindow = newWindow;
    }

    /**
     * @notice Manually update the cached price (for keeper integration)
     * @param price New price in 1e8 format
     */
    function updatePrice(uint256 price) external onlyOwner {
        cachedPrice = price;
        lastUpdate = block.timestamp;
        emit PriceUpdated(price, block.timestamp);
    }

    /**
     * @inheritdoc BasePriceFeed
     * @dev Returns BRL/USD price from BRZ pool
     *      Example: If 1 BRZ = 0.20 USDT, returns 20_000_000 (0.20 * 1e8)
     */
    function getPriceUSD() public view override returns (uint256 price, uint256 lastUpdated) {
        // In production, this would read from the actual pool TWAP
        // For now, return cached price set by keeper
        return (cachedPrice, lastUpdate);
    }

    /**
     * @notice Calculate TWAP from pool (placeholder for actual implementation)
     * @dev Override this in production with actual pool reading logic
     */
    function _calculateTWAP() internal view returns (uint256) {
        // TODO: Implement actual TWAP calculation from pool
        // This would use pool.observe() for Uniswap v3/v4 style pools
        // or read cumulative prices for v2 style pools
        return cachedPrice;
    }
}
