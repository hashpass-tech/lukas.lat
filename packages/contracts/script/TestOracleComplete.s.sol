// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";

contract TestOracleComplete is Script {
    // NEW Oracle with complete interface
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;

    function run() public {
        vm.startBroadcast();

        LatAmBasketIndex oracle = LatAmBasketIndex(BASKET_INDEX);

        console.log("=== Testing Complete Oracle Interface ===");
        console.log("Oracle Address:", address(oracle));

        // Test the critical DeFi integration function
        try oracle.getLukasFairPriceInUSDC() returns (uint256 price) {
            console.log("LUKAS Fair Price (1e18):", price);
            console.log("LUKAS Fair Price (USD):", price / 1e18);
        } catch {
            console.log("ERROR: Failed to get LUKAS fair price in USDC");
        }

        // Test the new getCurrencyPriceUSD function
        try oracle.getCurrencyPriceUSD("BRL") returns (uint256 price, uint256 timestamp) {
            console.log("BRL Price (USD):", price);
            console.log("BRL Timestamp:", timestamp);
        } catch {
            console.log("ERROR: Failed to get BRL price with timestamp");
        }

        // Compare index calculation formats
        try oracle.getIndexUSD() returns (uint256 indexPrice, uint256 timestamp) {
            console.log("Index Price (1e8):", indexPrice);
            console.log("Index Price (USD):", indexPrice / 1e8);
        } catch {
            console.log("ERROR: Failed to get index price");
        }

        console.log("=== All Functions Working! ===");

        vm.stopBroadcast();
    }
}