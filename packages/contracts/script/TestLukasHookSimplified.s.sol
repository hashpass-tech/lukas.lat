// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LukasHookSimplified} from "../src/LukasHookSimplified.sol";
import {ILatAmBasketIndex} from "../src/interfaces/ILatAmBasketIndex.sol";

contract TestLukasHookSimplified is Script {
    // Deployed addresses
    address constant LUKAS_HOOK = 0x0; // Will be set after deployment
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;

    function run() public {
        vm.startBroadcast();

        console.log("=== Testing LukasHookSimplified ===");
        console.log("");

        // Get oracle reference
        ILatAmBasketIndex oracle = ILatAmBasketIndex(BASKET_INDEX);
        
        // Get fair price from oracle
        uint256 fairPrice = oracle.getLukasFairPriceInUSDC();
        console.log("Fair Price from Oracle:", fairPrice);
        console.log("Fair Price (formatted):", fairPrice / 1e16, "cents");
        console.log("");

        // Test 1: Check initial peg status
        console.log("Test 1: Initial Peg Status");
        console.log("Expected: Pool price = Fair price (parity)");
        console.log("");

        // Test 2: Simulate over-peg scenario
        console.log("Test 2: Over-Peg Scenario (5% above fair value)");
        uint256 overPegPrice = (fairPrice * 105) / 100;
        console.log("Setting pool price to:", overPegPrice);
        console.log("Expected: Deviation ~500 bps (5%)");
        console.log("");

        // Test 3: Simulate under-peg scenario
        console.log("Test 3: Under-Peg Scenario (5% below fair value)");
        uint256 underPegPrice = (fairPrice * 95) / 100;
        console.log("Setting pool price to:", underPegPrice);
        console.log("Expected: Deviation ~-500 bps (-5%)");
        console.log("");

        // Test 4: Simulate large swap
        console.log("Test 4: Large Swap Simulation");
        console.log("Simulating sale of 1000 LUKAS");
        console.log("Expected: Price impact and potential stabilization trigger");
        console.log("");

        console.log("=== Testing Complete ===");
        console.log("");
        console.log("To run actual tests:");
        console.log("1. Deploy hook: forge script script/DeployLukasHookSimplified.s.sol --broadcast");
        console.log("2. Update LUKAS_HOOK address in this script");
        console.log("3. Run tests: forge script script/TestLukasHookSimplified.s.sol --broadcast");

        vm.stopBroadcast();
    }
}
