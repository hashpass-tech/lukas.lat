// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ILatAmBasketIndex} from "../interfaces/ILatAmBasketIndex.sol";
import {IPriceFeed} from "../interfaces/IPriceFeed.sol";
import {Owned} from "solmate/src/auth/Owned.sol";

/**
 * @title LatAmBasketIndex
 * @notice Canonical on-chain oracle for the LatAm Peso Index (LPI)
 * @dev Calculates weighted basket: Σ (Fiat/USD_i * weight_i)
 * 
 * Basket Composition (immutable after deployment):
 * - BRL: 40% (4000 bps)
 * - MXN: 30% (3000 bps)
 * - COP: 15% (1500 bps)
 * - CLP: 10% (1000 bps)
 * - ARS: 5%  (500 bps)
 * 
 * Total: 100% (10000 bps)
 * 
 * 1 LUKAS ≈ 1 LPI (LatAm Peso Index)
 */
contract LatAmBasketIndex is ILatAmBasketIndex, Owned {
    /// @notice Basis points denominator (100% = 10000)
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    /// @notice Price decimals (1e8)
    uint256 public constant PRICE_DECIMALS = 1e8;
    
    /// @notice USDC decimals for DeFi compatibility (1e18)
    uint256 public constant USDC_DECIMALS = 1e18;

    /// @notice Currency codes in the basket
    string[] private currencies;
    
    /// @notice Weights in basis points (immutable after constructor)
    mapping(string => uint256) public weights;
    
    /// @notice Price feed addresses (upgradeable)
    mapping(string => IPriceFeed) public feeds;

    /// @notice Whether the basket has been finalized (weights locked)
    bool public finalized;

    error BasketNotFinalized();
    error BasketAlreadyFinalized();
    error InvalidWeight();
    error FeedNotSet(string currency);
    error WeightsMustSumTo100();

    constructor() Owned(msg.sender) {
        // Initialize basket with immutable weights
        _initializeBasket();
    }

    /**
     * @dev Initialize the basket weights (called once in constructor)
     */
    function _initializeBasket() internal {
        // BRL - Brazilian Real (40%)
        currencies.push("BRL");
        weights["BRL"] = 4000;
        
        // MXN - Mexican Peso (30%)
        currencies.push("MXN");
        weights["MXN"] = 3000;
        
        // COP - Colombian Peso (15%)
        currencies.push("COP");
        weights["COP"] = 1500;
        
        // CLP - Chilean Peso (10%)
        currencies.push("CLP");
        weights["CLP"] = 1000;
        
        // ARS - Argentine Peso (5%)
        currencies.push("ARS");
        weights["ARS"] = 500;
    }

    /**
     * @notice Set a price feed for a currency
     * @param currency The ISO 4217 currency code
     * @param feed The price feed contract address
     */
    function setFeed(string calldata currency, address feed) external onlyOwner {
        require(weights[currency] > 0, "Invalid currency");
        feeds[currency] = IPriceFeed(feed);
        emit FeedUpdated(currency, feed);
    }

    /**
     * @notice Finalize the basket (lock weights, enable index calculation)
     * @dev Can only be called once. Ensures all feeds are set.
     */
    function finalize() external onlyOwner {
        if (finalized) revert BasketAlreadyFinalized();
        
        // Verify all feeds are set
        for (uint256 i = 0; i < currencies.length; i++) {
            if (address(feeds[currencies[i]]) == address(0)) {
                revert FeedNotSet(currencies[i]);
            }
        }
        
        finalized = true;
    }

    /**
     * @inheritdoc ILatAmBasketIndex
     */
    function getIndexUSD() public view override returns (uint256 indexValue, uint256 lastUpdated) {
        if (!finalized) revert BasketNotFinalized();
        
        uint256 weightedSum = 0;
        uint256 oldestUpdate = type(uint256).max;
        
        for (uint256 i = 0; i < currencies.length; i++) {
            string memory curr = currencies[i];
            IPriceFeed feed = feeds[curr];
            
            (uint256 price, uint256 updated) = feed.getPriceUSD();
            
            // Weighted contribution: price * weight / BPS_DENOMINATOR
            weightedSum += (price * weights[curr]) / BPS_DENOMINATOR;
            
            // Track oldest update for staleness
            if (updated < oldestUpdate) {
                oldestUpdate = updated;
            }
        }
        
        return (weightedSum, oldestUpdate);
    }

    /**
     * @inheritdoc ILatAmBasketIndex
     * @dev Returns price scaled to 1e18 for DeFi compatibility
     *      If index = 0.15 USD (15_000_000 in 1e8), returns 0.15e18
     */
    function getLukasFairPriceInUSDC() external view override returns (uint256 price) {
        (uint256 indexValue,) = getIndexUSD();
        // Convert from 1e8 to 1e18
        return (indexValue * USDC_DECIMALS) / PRICE_DECIMALS;
    }

    /**
     * @inheritdoc ILatAmBasketIndex
     */
    function getCurrencyPrice(string calldata currency) 
        external 
        view 
        override 
        returns (uint256 price, uint256 weight) 
    {
        weight = weights[currency];
        if (weight == 0) revert FeedNotSet(currency);
        
        IPriceFeed feed = feeds[currency];
        if (address(feed) == address(0)) revert FeedNotSet(currency);
        
        (price,) = feed.getPriceUSD();
    }

    /**
     * @notice Get individual currency price with timestamp
     * @param currency The ISO 4217 currency code
     * @return price Price in USD normalized to 1e8
     * @return timestamp Last update timestamp
     */
    function getCurrencyPriceUSD(string calldata currency) 
        external 
        view 
        returns (uint256 price, uint256 timestamp) 
    {
        uint256 weight = weights[currency];
        if (weight == 0) revert FeedNotSet(currency);
        
        IPriceFeed feed = feeds[currency];
        if (address(feed) == address(0)) revert FeedNotSet(currency);
        
        return feed.getPriceUSD();
    }

    /**
     * @inheritdoc ILatAmBasketIndex
     */
    function hasStaleFeeds() external view override returns (bool) {
        for (uint256 i = 0; i < currencies.length; i++) {
            IPriceFeed feed = feeds[currencies[i]];
            if (address(feed) != address(0) && feed.isStale()) {
                return true;
            }
        }
        return false;
    }

    /**
     * @inheritdoc ILatAmBasketIndex
     */
    function getWeights() 
        external 
        view 
        override 
        returns (string[] memory _currencies, uint256[] memory _weights) 
    {
        _currencies = currencies;
        _weights = new uint256[](currencies.length);
        
        for (uint256 i = 0; i < currencies.length; i++) {
            _weights[i] = weights[currencies[i]];
        }
    }

    /**
     * @notice Get complete basket composition with prices
     * @return currencySymbols Array of currency codes
     * @return _weights Array of weights in basis points
     * @return prices Array of current prices in USD (1e8)
     * @return timestamps Array of last update timestamps
     */
    function getBasketComposition() 
        external 
        view 
        returns (
            string[] memory currencySymbols,
            uint256[] memory _weights,
            uint256[] memory prices,
            uint256[] memory timestamps
        ) 
    {
        currencySymbols = currencies;
        _weights = new uint256[](currencies.length);
        prices = new uint256[](currencies.length);
        timestamps = new uint256[](currencies.length);
        
        for (uint256 i = 0; i < currencies.length; i++) {
            string memory curr = currencies[i];
            _weights[i] = weights[curr];
            
            IPriceFeed feed = feeds[curr];
            if (address(feed) != address(0)) {
                (prices[i], timestamps[i]) = feed.getPriceUSD();
            }
        }
    }

    /**
     * @notice Get the number of currencies in the basket
     */
    function getCurrencyCount() external view returns (uint256) {
        return currencies.length;
    }
}
