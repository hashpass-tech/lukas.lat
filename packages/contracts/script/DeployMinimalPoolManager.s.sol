// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MinimalPoolManager} from "../src/MinimalPoolManager.sol";

contract DeployMinimalPoolManager is Script {
    function run() public {
        vm.startBroadcast();

        console.log("=== Deploying Minimal PoolManager ===");
        
        // Deploy MinimalPoolManager
        MinimalPoolManager poolManager = new MinimalPoolManager();
        console.log("MinimalPoolManager deployed at:", address(poolManager));
        console.log("Owner:", poolManager.owner());

        console.log("=== Deployment Complete ===");
        console.log("This is a MINIMAL implementation for testing only!");
        console.log("NOT suitable for production use.");

        vm.stopBroadcast();
    }
}