// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";

contract FinalizeOracle is Script {
    // Deployed LatAmBasketIndex address
    address constant BASKET_INDEX = 0x60971F82D2949BCE0C2De67A98274b56E34a9b6A;

    function run() public {
        vm.startBroadcast();

        LatAmBasketIndex oracle = LatAmBasketIndex(BASKET_INDEX);

        console.log("=== Finalizing LatAmBasketIndex Oracle ===");
        console.log("Oracle Address:", address(oracle));

        // Check if already finalized
        try oracle.finalized() returns (bool isFinalized) {
            console.log("Already finalized:", isFinalized);
            if (!isFinalized) {
                console.log("Finalizing oracle...");
                oracle.finalize();
                console.log("Oracle finalized successfully!");
            }
        } catch {
            console.log("ERROR: Failed to check/finalize oracle");
        }

        vm.stopBroadcast();
    }
}