// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPriceFeed} from "../interfaces/IPriceFeed.sol";
import {Owned} from "solmate/src/auth/Owned.sol";

/**
 * @title BasePriceFeed
 * @notice Abstract base contract for price feed adapters
 * @dev Provides common functionality for staleness checks and ownership
 */
abstract contract BasePriceFeed is IPriceFeed, Owned {
    /// @notice Maximum age of price data before considered stale (default 1 hour)
    uint256 public stalenessThreshold;
    
    /// @notice The currency code this feed represents
    string public override currency;

    /// @notice Emitted when staleness threshold is updated
    event StalenessThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);

    constructor(
        string memory _currency,
        uint256 _stalenessThreshold
    ) Owned(msg.sender) {
        currency = _currency;
        stalenessThreshold = _stalenessThreshold;
    }

    /**
     * @notice Update the staleness threshold
     * @param newThreshold New threshold in seconds
     */
    function setStalenessThreshold(uint256 newThreshold) external onlyOwner {
        emit StalenessThresholdUpdated(stalenessThreshold, newThreshold);
        stalenessThreshold = newThreshold;
    }

    /**
     * @inheritdoc IPriceFeed
     */
    function isStale() public view virtual override returns (bool) {
        (, uint256 lastUpdated) = getPriceUSD();
        return block.timestamp - lastUpdated > stalenessThreshold;
    }

    /**
     * @inheritdoc IPriceFeed
     */
    function getPriceUSD() public view virtual override returns (uint256 price, uint256 lastUpdated);
}
