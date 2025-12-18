// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPriceFeed} from "../interfaces/IPriceFeed.sol";

contract MockPriceFeed is IPriceFeed {
    string public currency;
    uint256 public price;
    uint256 public lastUpdated;

    constructor(string memory _currency, uint256 _price) {
        currency = _currency;
        price = _price;
        lastUpdated = block.timestamp;
    }

    function getPriceUSD() external view returns (uint256, uint256) {
        return (price, lastUpdated);
    }

    function isStale() external view returns (bool) {
        return false;
    }
}