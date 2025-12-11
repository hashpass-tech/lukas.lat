// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ILatAmBasketIndex
 * @notice Interface for the LatAm Peso Index oracle
 * @dev Calculates weighted basket price: Σ (Fiat/USD_i * weight_i)
 * 
 * Basket Composition:
 * - BRL: 40%
 * - MXN: 30%
 * - COP: 15%
 * - CLP: 10%
 * - ARS: 5%
 * 
 * 1 LUKAS ≈ 1 LatAm Peso Index (LPI)
 */
interface ILatAmBasketIndex {
    /// @notice Emitted when a price feed is updated
    event FeedUpdated(string currency, address feed);
    
    /// @notice Emitted when the index is recalculated
    event IndexUpdated(uint256 indexValue, uint256 timestamp);

    /**
     * @notice Get the current LatAm Index value in USD
     * @return indexValue The weighted basket value normalized to 1e8
     * @return lastUpdated Timestamp of the oldest feed used
     */
    function getIndexUSD() external view returns (uint256 indexValue, uint256 lastUpdated);

    /**
     * @notice Get the fair price of LUKAS in USDC terms
     * @return price Price scaled to 1e18 for DeFi compatibility
     */
    function getLukasFairPriceInUSDC() external view returns (uint256 price);

    /**
     * @notice Get individual currency price
     * @param currency The ISO 4217 currency code
     * @return price Price in USD normalized to 1e8
     * @return weight Weight in basis points (10000 = 100%)
     */
    function getCurrencyPrice(string calldata currency) external view returns (uint256 price, uint256 weight);

    /**
     * @notice Check if any feed in the basket is stale
     * @return True if any feed is stale
     */
    function hasStaleFeeds() external view returns (bool);

    /**
     * @notice Get all currency weights
     * @return currencies Array of currency codes
     * @return weights Array of weights in basis points
     */
    function getWeights() external view returns (string[] memory currencies, uint256[] memory weights);
}
