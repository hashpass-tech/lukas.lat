// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StabilizerVault} from "../src/StabilizerVault.sol";
import {StabilizationTester} from "../src/StabilizationTester.sol";
import {MockPriceOracle} from "../src/MockPriceOracle.sol";

contract SetupStabilizationTesting is Script {
    // Deployed contract addresses
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;
    address constant STABILIZATION_TESTER = 0x5294A384C9df8651376d735F8E99a98e9998ccB8;
    address constant MOCK_PRICE_ORACLE = 0x1D60b0ab3BaA77bd80bF492DB66A2D1F589D3943;

    function run() public {
        vm.startBroadcast();

        console.log("=== Setting up Stabilization Testing ===");

        StabilizerVault vault = StabilizerVault(payable(STABILIZER_VAULT));
        StabilizationTester tester = StabilizationTester(STABILIZATION_TESTER);
        MockPriceOracle oracle = MockPriceOracle(MOCK_PRICE_ORACLE);

        // 1. Authorize the tester in the vault
        console.log("1. Authorizing StabilizationTester in StabilizerVault...");
        try vault.setAuthorized(STABILIZATION_TESTER, true) {
            console.log("   [SUCCESS] Authorization successful");
        } catch {
            console.log("   [ERROR] Authorization failed (may already be authorized or not owner)");
        }

        // 2. Check current peg status
        console.log("2. Checking current peg status...");
        try tester.getPegStatus() returns (
            uint256 poolPrice,
            uint256 fairPrice,
            int256 deviationBps,
            bool isOverPeg,
            bool shouldStabilize
        ) {
            console.log("   Pool Price (LUKAS/USDC):", poolPrice);
            console.log("   Fair Price (from oracle):", fairPrice);
            console.log("   Deviation (bps):", deviationBps < 0 ? uint256(-deviationBps) : uint256(deviationBps));
            console.log("   Is Over Peg:", isOverPeg);
            console.log("   Should Stabilize:", shouldStabilize);
        } catch {
            console.log("   [ERROR] Failed to get peg status");
        }

        // 3. Test scenario: Simulate selling LUKAS (price should drop)
        console.log("3. Testing over-peg scenario (selling LUKAS)...");
        console.log("   Setting price to 1.05 USDC per LUKAS (5% over-peg)");
        try oracle.setPrice(1.05e18) {
            console.log("   [SUCCESS] Price set successfully");
            
            // Check if stabilization triggers
            try tester.checkAndStabilize() {
                console.log("   [SUCCESS] Stabilization check completed");
            } catch {
                console.log("   [ERROR] Stabilization check failed");
            }
        } catch {
            console.log("   [ERROR] Failed to set price");
        }

        // 4. Test scenario: Under-peg
        console.log("4. Testing under-peg scenario...");
        console.log("   Setting price to 0.95 USDC per LUKAS (5% under-peg)");
        try oracle.setPrice(0.95e18) {
            console.log("   [SUCCESS] Price set successfully");
            
            try tester.checkAndStabilize() {
                console.log("   [SUCCESS] Stabilization check completed");
            } catch {
                console.log("   [ERROR] Stabilization check failed");
            }
        } catch {
            console.log("   [ERROR] Failed to set price");
        }

        // 5. Reset to parity
        console.log("5. Resetting to parity (1:1)...");
        try oracle.setPrice(1e18) {
            console.log("   [SUCCESS] Price reset to 1:1 parity");
        } catch {
            console.log("   [ERROR] Failed to reset price");
        }

        console.log("=== Setup and Testing Complete ===");

        vm.stopBroadcast();
    }
}