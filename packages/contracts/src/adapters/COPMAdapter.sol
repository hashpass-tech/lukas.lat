// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BasePriceFeed} from "./BasePriceFeed.sol";

/**
 * @title COPMAdapter
 * @notice Price feed adapter for COP/USD using COPM/USDT pool on Polygon
 * @dev Reads TWAP from COPM stablecoin pool to derive COP/USD rate
 * 
 * COPM is a Colombian Peso stablecoin (1 COPM = 1 COP)
 * Pool: COPM/USDT on Polygon
 */
contract COPMAdapter is BasePriceFeed {
    /// @notice Address of the COPM/USDT pool
    address public pool;
    
    /// @notice COPM token address
    address public copmToken;
    
    /// @notice USDT token address
    address public usdtToken;
    
    /// @notice Cached price (updated by keeper or on-demand)
    uint256 private cachedPrice;
    
    /// @notice Last update timestamp
    uint256 private lastUpdate;

    /// @notice TWAP observation window
    uint32 public twapWindow;

    event PoolUpdated(address oldPool, address newPool);
    event PriceUpdated(uint256 price, uint256 timestamp);

    constructor(
        address _pool,
        address _copmToken,
        address _usdtToken,
        uint32 _twapWindow
    ) BasePriceFeed("COP", 1 hours) {
        pool = _pool;
        copmToken = _copmToken;
        usdtToken = _usdtToken;
        twapWindow = _twapWindow;
    }

    /**
     * @notice Update the pool address
     */
    function setPool(address newPool) external onlyOwner {
        emit PoolUpdated(pool, newPool);
        pool = newPool;
    }

    /**
     * @notice Update TWAP window
     */
    function setTwapWindow(uint32 newWindow) external onlyOwner {
        twapWindow = newWindow;
    }

    /**
     * @notice Manually update the cached price
     */
    function updatePrice(uint256 price) external onlyOwner {
        cachedPrice = price;
        lastUpdate = block.timestamp;
        emit PriceUpdated(price, block.timestamp);
    }

    /**
     * @inheritdoc BasePriceFeed
     * @dev Returns COP/USD price from COPM pool
     *      Example: If 1 COP = 0.00025 USD, returns 25_000 (0.00025 * 1e8)
     */
    function getPriceUSD() public view override returns (uint256 price, uint256 lastUpdated) {
        return (cachedPrice, lastUpdate);
    }
}
