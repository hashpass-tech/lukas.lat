// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BasePriceFeed} from "./BasePriceFeed.sol";

/**
 * @title MXNRemoteFeed
 * @notice Cross-chain price feed for MXN/USD using MXNB/USDT pool on Ethereum
 * @dev Receives price updates via cross-chain messaging (LayerZero, Axelar, etc.)
 * 
 * MXNB is a Mexican Peso stablecoin on Ethereum (1 MXNB = 1 MXN)
 * Source: MXNB/USDT pool on Ethereum mainnet
 * Bridge: Cross-chain oracle relay to Polygon
 */
contract MXNRemoteFeed is BasePriceFeed {
    /// @notice Address authorized to relay cross-chain price updates
    address public relayer;
    
    /// @notice Source chain ID (Ethereum mainnet = 1)
    uint256 public sourceChainId;
    
    /// @notice Source pool address on Ethereum
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
    ) BasePriceFeed("MXN", 2 hours) { // Longer staleness for cross-chain
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
        // Ensure source data is not older than existing
        if (_sourceTimestamp <= sourceTimestamp) revert StaleSourceData();
        
        cachedPrice = price;
        sourceTimestamp = _sourceTimestamp;
        lastUpdate = block.timestamp;
        
        emit PriceRelayed(price, _sourceTimestamp, block.timestamp);
    }

    /**
     * @inheritdoc BasePriceFeed
     * @dev Returns MXN/USD price from cross-chain relay
     *      Example: If 1 MXN = 0.058 USD, returns 5_800_000 (0.058 * 1e8)
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
