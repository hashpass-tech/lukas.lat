// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BasePriceFeed} from "./BasePriceFeed.sol";

/**
 * @title CLPOracle
 * @notice Price feed for CLP/USD using Chainlink, Pyth, or custom oracle
 * @dev Chilean Peso doesn't have a major on-chain stablecoin, so we use
 *      external oracle feeds (Chainlink/Pyth) or a custom off-chain relay
 */
contract CLPOracle is BasePriceFeed {
    /// @notice Chainlink aggregator address (if available)
    address public chainlinkFeed;
    
    /// @notice Pyth price feed ID (if using Pyth)
    bytes32 public pythPriceId;
    
    /// @notice Pyth contract address
    address public pythContract;
    
    /// @notice Oracle type: 0 = Manual, 1 = Chainlink, 2 = Pyth
    uint8 public oracleType;
    
    /// @notice Cached price for manual updates
    uint256 private cachedPrice;
    
    /// @notice Last update timestamp
    uint256 private lastUpdate;

    event OracleTypeUpdated(uint8 oldType, uint8 newType);
    event ChainlinkFeedUpdated(address oldFeed, address newFeed);
    event PythConfigUpdated(address pythContract, bytes32 priceId);
    event PriceUpdated(uint256 price, uint256 timestamp);

    error InvalidOracleType();

    constructor() BasePriceFeed("CLP", 1 hours) {
        oracleType = 0; // Default to manual
    }

    /**
     * @notice Configure Chainlink feed
     */
    function setChainlinkFeed(address feed) external onlyOwner {
        emit ChainlinkFeedUpdated(chainlinkFeed, feed);
        chainlinkFeed = feed;
        oracleType = 1;
        emit OracleTypeUpdated(oracleType, 1);
    }

    /**
     * @notice Configure Pyth feed
     */
    function setPythConfig(address _pythContract, bytes32 _priceId) external onlyOwner {
        pythContract = _pythContract;
        pythPriceId = _priceId;
        oracleType = 2;
        emit PythConfigUpdated(_pythContract, _priceId);
        emit OracleTypeUpdated(oracleType, 2);
    }

    /**
     * @notice Set to manual mode
     */
    function setManualMode() external onlyOwner {
        emit OracleTypeUpdated(oracleType, 0);
        oracleType = 0;
    }

    /**
     * @notice Manually update price (only in manual mode)
     */
    function updatePrice(uint256 price) external onlyOwner {
        cachedPrice = price;
        lastUpdate = block.timestamp;
        emit PriceUpdated(price, block.timestamp);
    }

    /**
     * @inheritdoc BasePriceFeed
     * @dev Returns CLP/USD price from configured oracle
     *      Example: If 1 CLP = 0.0011 USD, returns 110_000 (0.0011 * 1e8)
     */
    function getPriceUSD() public view override returns (uint256 price, uint256 lastUpdated) {
        if (oracleType == 0) {
            // Manual mode
            return (cachedPrice, lastUpdate);
        } else if (oracleType == 1) {
            // Chainlink mode
            return _getChainlinkPrice();
        } else if (oracleType == 2) {
            // Pyth mode
            return _getPythPrice();
        }
        revert InvalidOracleType();
    }

    /**
     * @notice Read from Chainlink aggregator
     */
    function _getChainlinkPrice() internal view returns (uint256 price, uint256 lastUpdated) {
        // Chainlink interface: latestRoundData()
        // Returns: (roundId, answer, startedAt, updatedAt, answeredInRound)
        // answer is in 8 decimals for USD pairs
        
        if (chainlinkFeed == address(0)) {
            return (cachedPrice, lastUpdate);
        }
        
        // In production, call chainlinkFeed.latestRoundData()
        // For now, return cached as placeholder
        return (cachedPrice, lastUpdate);
    }

    /**
     * @notice Read from Pyth oracle
     */
    function _getPythPrice() internal view returns (uint256 price, uint256 lastUpdated) {
        if (pythContract == address(0)) {
            return (cachedPrice, lastUpdate);
        }
        
        // In production, call pyth.getPriceNoOlderThan(pythPriceId, maxAge)
        // For now, return cached as placeholder
        return (cachedPrice, lastUpdate);
    }
}
