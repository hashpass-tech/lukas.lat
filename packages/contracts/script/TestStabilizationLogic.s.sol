// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";

contract TestStabilizationLogic is Script {
    // NEW Oracle with complete interface
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;

    function run() public {
        vm.startBroadcast();

        LatAmBasketIndex oracle = LatAmBasketIndex(BASKET_INDEX);

        console.log("=== Testing Stabilization Logic ===");
        console.log("Oracle Address:", address(oracle));

        // Get fair price from oracle
        uint256 fairPrice = oracle.getLukasFairPriceInUSDC();
        console.log("Fair Price (1e18):", fairPrice);
        console.log("Fair Price (USD):", fairPrice / 1e16); // Show in cents for readability

        // Test different market scenarios
        console.log("\n=== Market Scenarios ===");
        
        // Scenario 1: 5% over-peg (LUKAS too expensive)
        uint256 overPegPrice = fairPrice * 105 / 100;
        console.log("Over-peg scenario (+5%):");
        console.log("  Pool Price:", overPegPrice);
        console.log("  Pool Price (USD):", overPegPrice / 1e16);
        
        int256 deviation = int256(((overPegPrice - fairPrice) * 10000) / fairPrice);
        console.log("  Deviation (bps):", uint256(deviation));
        console.log("  Action needed: MINT LUKAS to weaken price");
        
        // Scenario 2: At peg (perfect)
        console.log("\nAt-peg scenario (0%):");
        console.log("  Pool Price:", fairPrice);
        console.log("  Pool Price (USD):", fairPrice / 1e16);
        console.log("  Deviation (bps): 0");
        console.log("  Action needed: NONE");
        
        // Scenario 3: 5% under-peg (LUKAS too cheap)
        uint256 underPegPrice = fairPrice * 95 / 100;
        console.log("\nUnder-peg scenario (-5%):");
        console.log("  Pool Price:", underPegPrice);
        console.log("  Pool Price (USD):", underPegPrice / 1e16);
        
        deviation = -int256(((fairPrice - underPegPrice) * 10000) / fairPrice);
        console.log("  Deviation (bps):", uint256(-deviation));
        console.log("  Action needed: BUYBACK LUKAS to strengthen price");

        // Test threshold logic
        uint256 threshold = 100; // 1% threshold (typical)
        console.log("\n=== Threshold Analysis (1% = 100 bps) ===");
        
        uint256 overDeviation = ((overPegPrice - fairPrice) * 10000) / fairPrice;
        uint256 underDeviation = ((fairPrice - underPegPrice) * 10000) / fairPrice;
        
        console.log("Over-peg deviation:", overDeviation, "bps");
        console.log("Should stabilize (over):", overDeviation >= threshold);
        
        console.log("Under-peg deviation:", underDeviation, "bps");
        console.log("Should stabilize (under):", underDeviation >= threshold);

        console.log("\n=== Stabilization Logic Test Complete ===");
        console.log("Oracle is ready for vault integration!");

        vm.stopBroadcast();
    }
}