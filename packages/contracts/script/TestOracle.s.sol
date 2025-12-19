// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";

contract TestOracle is Script {
    // Deployed LatAmBasketIndex address (NEW - with complete interface)
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;

    function run() public {
        vm.startBroadcast();

        LatAmBasketIndex oracle = LatAmBasketIndex(BASKET_INDEX);

        console.log("=== Testing LatAmBasketIndex Oracle ===");
        console.log("Oracle Address:", address(oracle));

        // Test basic functionality
        try oracle.getIndexUSD() returns (uint256 indexPrice, uint256 timestamp) {
            console.log("Index Price (USD):", indexPrice);
            console.log("Last Updated:", timestamp);
        } catch {
            console.log("ERROR: Failed to get index price");
        }

        // Test individual currency prices
        string[5] memory currencies = ["BRL", "MXN", "ARS", "CLP", "COP"];
        
        for (uint i = 0; i < currencies.length; i++) {
            try oracle.getCurrencyPrice(currencies[i]) returns (uint256 price, uint256 weight) {
                console.log("Currency:", currencies[i]);
                console.log("  Price (USD):", price);
                console.log("  Weight (bps):", weight);
            } catch {
                console.log("ERROR: Failed to get price for", currencies[i]);
            }
        }

        // Test basket composition
        try oracle.getBasketComposition() returns (
            string[] memory currencySymbols,
            uint256[] memory weights,
            uint256[] memory prices,
            uint256[] memory timestamps
        ) {
            console.log("=== Basket Composition ===");
            console.log("Number of currencies:", currencySymbols.length);
            
            uint256 totalWeight = 0;
            for (uint i = 0; i < currencySymbols.length; i++) {
                console.log("Currency:", currencySymbols[i]);
                console.log("  Weight (bps):", weights[i]);
                console.log("  Price (USD):", prices[i]);
                console.log("  Timestamp:", timestamps[i]);
                totalWeight += weights[i];
            }
            console.log("Total Weight (should be 10000):", totalWeight);
        } catch {
            console.log("ERROR: Failed to get basket composition");
        }

        // Test staleness detection
        try oracle.hasStaleFeeds() returns (bool isStale) {
            console.log("Has Stale Feeds:", isStale);
        } catch {
            console.log("ERROR: Failed to check staleness");
        }

        console.log("=== Oracle Test Complete ===");

        vm.stopBroadcast();
    }
}