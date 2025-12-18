// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PoolManager} from "v4-core/src/PoolManager.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/src/test/PoolModifyLiquidityTest.sol";

contract DeployUniswapV4 is Script {
    function run() public {
        vm.startBroadcast();

        // Deploy PoolManager
        PoolManager poolManager = new PoolManager(msg.sender); // msg.sender as initial owner
        console.log("PoolManager deployed at:", address(poolManager));

        // Deploy SwapRouter (using test contract for simplicity)
        PoolSwapTest swapRouter = new PoolSwapTest(poolManager);
        console.log("SwapRouter deployed at:", address(swapRouter));

        // Deploy LiquidityRouter (using test contract for simplicity)
        PoolModifyLiquidityTest liquidityRouter = new PoolModifyLiquidityTest(poolManager);
        console.log("LiquidityRouter deployed at:", address(liquidityRouter));

        vm.stopBroadcast();
    }
}