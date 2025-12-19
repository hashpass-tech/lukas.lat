// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title CheckPoolStatus
 * @notice Check the status of deployed contracts and pool
 */
contract CheckPoolStatus is Script {
    // Deployed contract addresses on Amoy
    address constant LUKAS_TOKEN = 0x63524b53983960231b7b86CDEdDf050Ceb9263Cb;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant POOL_MANAGER = 0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E;
    address constant BASKET_INDEX = 0x1Dccf1fB82946a293E03036e85edc2139cba1541;
    address constant STABILIZER_VAULT = 0x5c5BC89db3f3e3e3e3e3E3E3e3E3e3E3E3e3e3e3;
    address constant LUKAS_HOOK = 0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519;

    function run() public view {
        console.log("=== LUKAS Protocol Status Check ===");
        console.log("");

        // Check contract deployments
        console.log("Contract Addresses:");
        console.log("-------------------");
        console.log("LUKAS Token:", LUKAS_TOKEN);
        console.log("USDC:", USDC);
        console.log("Pool Manager:", POOL_MANAGER);
        console.log("Basket Index:", BASKET_INDEX);
        console.log("Stabilizer Vault:", STABILIZER_VAULT);
        console.log("Lukas Hook:", LUKAS_HOOK);
        console.log("");

        // Check if contracts have code
        console.log("Contract Code Check:");
        console.log("-------------------");
        console.log("LUKAS Token has code:", LUKAS_TOKEN.code.length > 0);
        console.log("USDC has code:", USDC.code.length > 0);
        console.log("Pool Manager has code:", POOL_MANAGER.code.length > 0);
        console.log("Basket Index has code:", BASKET_INDEX.code.length > 0);
        console.log("Stabilizer Vault has code:", STABILIZER_VAULT.code.length > 0);
        console.log("Lukas Hook has code:", LUKAS_HOOK.code.length > 0);
        console.log("");

        // Check token supplies
        console.log("Token Information:");
        console.log("-------------------");
        try IERC20(LUKAS_TOKEN).totalSupply() returns (uint256 supply) {
            console.log("LUKAS Total Supply:", supply);
        } catch {
            console.log("LUKAS: Failed to get total supply");
        }

        try IERC20(USDC).totalSupply() returns (uint256 supply) {
            console.log("USDC Total Supply:", supply);
        } catch {
            console.log("USDC: Failed to get total supply");
        }
        console.log("");

        // Pool Manager balance (liquidity)
        console.log("Pool Liquidity:");
        console.log("-------------------");
        uint256 lukasInPool = IERC20(LUKAS_TOKEN).balanceOf(POOL_MANAGER);
        uint256 usdcInPool = IERC20(USDC).balanceOf(POOL_MANAGER);
        console.log("LUKAS in pool:", lukasInPool);
        console.log("USDC in pool:", usdcInPool);
        console.log("");

        // Links
        console.log("Polygonscan Links:");
        console.log("-------------------");
        console.log("Pool Manager:");
        console.log("  https://amoy.polygonscan.com/address/", POOL_MANAGER);
        console.log("LUKAS Token:");
        console.log("  https://amoy.polygonscan.com/address/", LUKAS_TOKEN);
        console.log("Lukas Hook:");
        console.log("  https://amoy.polygonscan.com/address/", LUKAS_HOOK);
        console.log("");

        console.log("=== Status Check Complete ===");
    }
}
