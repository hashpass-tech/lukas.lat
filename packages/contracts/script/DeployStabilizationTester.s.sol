// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockPriceOracle} from "../src/MockPriceOracle.sol";
import {StabilizationTester} from "../src/StabilizationTester.sol";

contract DeployStabilizationTester is Script {
    // Deployed contract addresses
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;

    function run() public {
        vm.startBroadcast();

        console.log("=== Deploying Stabilization Testing Infrastructure ===");

        // Deploy MockPriceOracle with initial price of 1 LUKAS = 1 USDC
        uint256 initialPrice = 1e18; // 1:1 parity
        MockPriceOracle priceOracle = new MockPriceOracle(initialPrice);
        console.log("MockPriceOracle deployed at:", address(priceOracle));
        console.log("Initial price (LUKAS/USDC):", initialPrice);

        // Deploy StabilizationTester
        StabilizationTester tester = new StabilizationTester(
            BASKET_INDEX,
            STABILIZER_VAULT,
            address(priceOracle)
        );
        console.log("StabilizationTester deployed at:", address(tester));

        // Set up the tester as authorized in the vault (if we're the owner)
        console.log("=== Setup Instructions ===");
        console.log("1. Authorize StabilizationTester in StabilizerVault:");
        console.log("   stabilizerVault.setAuthorized(", address(tester), ", true)");
        console.log("2. Test stabilization scenarios:");
        console.log("   tester.simulateSwapAndStabilize(1000e18, true)  // Sell LUKAS");
        console.log("   tester.simulateSwapAndStabilize(1000e18, false) // Buy LUKAS");

        console.log("=== Deployment Complete ===");

        vm.stopBroadcast();
    }
}