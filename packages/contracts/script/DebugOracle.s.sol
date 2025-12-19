// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";

contract DebugOracle is Script {
    // Deployed LatAmBasketIndex address
    address constant BASKET_INDEX = 0x60971F82D2949BCE0C2De67A98274b56E34a9b6A;

    function run() public {
        vm.startBroadcast();

        LatAmBasketIndex oracle = LatAmBasketIndex(BASKET_INDEX);

        console.log("=== Debugging LatAmBasketIndex Oracle ===");

        // Check weights first
        try oracle.getWeights() returns (string[] memory currencies, uint256[] memory weights) {
            console.log("Number of currencies:", currencies.length);
            for (uint i = 0; i < currencies.length; i++) {
                console.log("Currency:", currencies[i]);
                console.log("Weight:", weights[i]);
            }
        } catch {
            console.log("ERROR: Failed to get weights");
        }

        // Test individual currency with exact names from weights
        try oracle.getCurrencyPrice("BRL") returns (uint256 price, uint256 weight) {
            console.log("BRL Price:", price);
            console.log("BRL Weight:", weight);
        } catch {
            console.log("ERROR: Failed to get BRL price via getCurrencyPrice");
        }

        // Test the new function
        try oracle.getCurrencyPriceUSD("BRL") returns (uint256 price, uint256 timestamp) {
            console.log("BRL Price (USD):", price);
            console.log("BRL Timestamp:", timestamp);
        } catch {
            console.log("ERROR: Failed to get BRL price via getCurrencyPriceUSD");
        }

        vm.stopBroadcast();
    }
}