// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LukasHookSimplified} from "../src/LukasHookSimplified.sol";

contract DeployLukasHookSimplified is Script {
    // Addresses from deployments.json
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;

    function run() public {
        vm.startBroadcast();

        console.log("Deploying LukasHookSimplified...");
        console.log("BasketIndex:", BASKET_INDEX);
        console.log("StabilizerVault:", STABILIZER_VAULT);
        console.log("LukasToken:", LUKAS_TOKEN);
        console.log("USDC:", USDC);

        LukasHookSimplified lukasHook = new LukasHookSimplified(
            BASKET_INDEX,
            STABILIZER_VAULT,
            LUKAS_TOKEN,
            USDC
        );
        
        console.log("[SUCCESS] LukasHookSimplified deployed at:", address(lukasHook));
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify contract on Polygonscan");
        console.log("2. Test peg monitoring with: forge script script/TestLukasHookSimplified.s.sol");
        console.log("3. Enable auto-stabilization when ready");

        vm.stopBroadcast();
    }
}
