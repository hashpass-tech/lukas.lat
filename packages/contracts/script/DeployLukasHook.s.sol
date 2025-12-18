// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LukasHook} from "../src/LukasHook.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";

contract DeployLukasHook is Script {
    // Addresses from deployments.json
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    // Addresses (update from previous deployments)
    address constant POOL_MANAGER = address(0); // TODO: Replace with actual PoolManager address
    address constant BASKET_INDEX = address(0); // TODO: Replace with actual LatAmBasketIndex address

    function run() public {
        vm.startBroadcast();

        // Deploy LukasHook
        LukasHook lukasHook = new LukasHook(
            IPoolManager(POOL_MANAGER),
            BASKET_INDEX,
            STABILIZER_VAULT,
            LUKAS_TOKEN,
            USDC
        );
        console.log("LukasHook deployed at:", address(lukasHook));

        vm.stopBroadcast();
    }
}