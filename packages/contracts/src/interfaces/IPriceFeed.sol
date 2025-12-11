// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPriceFeed
 * @notice Standard interface for all LUKAS price feed adapters
 * @dev All feeds return price normalized to 1e8 decimals (USD per unit)
 */
interface IPriceFeed {
    /**
     * @notice Get the current price in USD
     * @return price Price normalized to 1e8 decimals (e.g., 0.20 USD = 20_000_000)
     * @return lastUpdated Timestamp of the last price update
     */
    function getPriceUSD() external view returns (uint256 price, uint256 lastUpdated);

    /**
     * @notice Get the currency symbol this feed represents
     * @return The ISO 4217 currency code (e.g., "BRL", "MXN")
     */
    function currency() external view returns (string memory);

    /**
     * @notice Check if the price feed is considered stale
     * @return True if the feed data is stale and should not be trusted
     */
    function isStale() external view returns (bool);
}
