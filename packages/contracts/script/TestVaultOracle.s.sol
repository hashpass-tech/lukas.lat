// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StabilizerVault} from "../src/StabilizerVault.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";

contract TestVaultOracle is Script {
    // Contract addresses
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;

    function run() public {
        vm.startBroadcast();

        StabilizerVault vault = StabilizerVault(payable(STABILIZER_VAULT));
        LatAmBasketIndex oracle = LatAmBasketIndex(BASKET_INDEX);

        console.log("=== Testing Vault-Oracle Integration ===");
        console.log("Vault Address:", address(vault));
        console.log("Oracle Address:", address(oracle));

        // Test oracle integration
        try oracle.getLukasFairPriceInUSDC() returns (uint256 fairPrice) {
            console.log("Fair Price from Oracle (1e18):", fairPrice);
            
            // Test different pool prices for deviation calculation
            uint256[3] memory testPrices = [
                fairPrice * 105 / 100, // 5% over-peg
                fairPrice,              // At peg
                fairPrice * 95 / 100    // 5% under-peg
            ];
            
            for (uint i = 0; i < testPrices.length; i++) {
                uint256 poolPrice = testPrices[i];
                
                try vault.calculateDeviation(poolPrice) returns (int256 deviation, bool isOverPeg) {
                    console.log("Pool Price:", poolPrice);
                    console.log("  Deviation (bps):", uint256(deviation < 0 ? -deviation : deviation));
                    console.log("  Is Over Peg:", isOverPeg);
                } catch {
                    console.log("ERROR: Failed to calculate deviation for price", poolPrice);
                }
                
                try vault.shouldStabilize(poolPrice) returns (bool shouldStab, bool isOver, uint256 devBps) {
                    console.log("  Should Stabilize:", shouldStab);
                    console.log("  Deviation BPS:", devBps);
                } catch {
                    console.log("ERROR: Failed to check shouldStabilize for price", poolPrice);
                }
            }
        } catch {
            console.log("ERROR: Failed to get fair price from oracle");
        }

        // Test vault parameters
        try vault.deviationThreshold() returns (uint256 threshold) {
            console.log("Deviation Threshold (bps):", threshold);
        } catch {
            console.log("ERROR: Failed to get deviation threshold");
        }

        try vault.cooldownPeriod() returns (uint256 cooldown) {
            console.log("Cooldown Period (seconds):", cooldown);
        } catch {
            console.log("ERROR: Failed to get cooldown period");
        }

        console.log("=== Vault-Oracle Integration Test Complete ===");

        vm.stopBroadcast();
    }
}