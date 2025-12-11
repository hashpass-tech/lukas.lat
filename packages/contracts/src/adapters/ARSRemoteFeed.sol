// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BasePriceFeed} from "./BasePriceFeed.sol";

/**
 * @title ARSRemoteFeed
 * @notice Cross-chain price feed for ARS/USD using wARS/USDC pool on World Chain
 * @dev Receives price updates via cross-chain messaging
 * 
 * wARS is a wrapped Argentine Peso on World Chain (1 wARS = 1 ARS)
 * Source: wARS/USDC pool on World Chain
 * Bridge: Cross-chain oracle relay to Polygon
 */
contract ARSRemoteFeed is BasePriceFeed {
    /// @notice Address authorized to relay cross-chain price updates
    address public relayer;
    
    /// @notice Source chain ID (World Chain)
    uint256 public sourceChainId;
    
    /// @notice Source pool address on World Chain
    address public sourcePool;
    
    /// @notice Cached price from cross-chain relay
    uint256 private cachedPrice;
    
    /// @notice Last update timestamp
    uint256 private lastUpdate;
    
    /// @notice Source timestamp (from origin chain)
    uint256 private sourceTimestamp;

    event RelayerUpdated(address oldRelayer, address newRelayer);
    event PriceRelayed(uint256 price, uint256 sourceTimestamp, uint256 relayTimestamp);

    error UnauthorizedRelayer();
    error StaleSourceData();

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert UnauthorizedRelayer();
        _;
    }

    constructor(
        address _relayer,
        uint256 _sourceChainId,
        address _sourcePool
    ) BasePriceFeed("ARS", 2 hours) { // Longer staleness for cross-chain
        relayer = _relayer;
        sourceChainId = _sourceChainId;
        sourcePool = _sourcePool;
    }

    /**
     * @notice Update the authorized relayer
     */
    function setRelayer(address newRelayer) external onlyOwner {
        emit RelayerUpdated(relayer, newRelayer);
        relayer = newRelayer;
    }

    /**
     * @notice Relay price from source chain
     * @param price Price in 1e8 format
     * @param _sourceTimestamp Timestamp from source chain
     */
    function relayPrice(uint256 price, uint256 _sourceTimestamp) external onlyRelayer {
        if (_sourceTimestamp <= sourceTimestamp) revert StaleSourceData();
        
        cachedPrice = price;
        sourceTimestamp = _sourceTimestamp;
        lastUpdate = block.timestamp;
        
        emit PriceRelayed(price, _sourceTimestamp, block.timestamp);
    }

    /**
     * @inheritdoc BasePriceFeed
     * @dev Returns ARS/USD price from cross-chain relay
     *      Example: If 1 ARS = 0.001 USD (blue rate), returns 100_000 (0.001 * 1e8)
     */
    function getPriceUSD() public view override returns (uint256 price, uint256 lastUpdated) {
        return (cachedPrice, lastUpdate);
    }

    /**
     * @notice Get the source chain timestamp
     */
    function getSourceTimestamp() external view returns (uint256) {
        return sourceTimestamp;
    }
}
