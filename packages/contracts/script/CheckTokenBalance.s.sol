// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CheckTokenBalance is Script {
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;

    function run() public view {
        address deployer = msg.sender;
        
        // Check LUKAS balance
        uint256 lukasBalance = IERC20(LUKAS_TOKEN).balanceOf(deployer);
        
        // Check USDC balance
        uint256 usdcBalance = IERC20(USDC).balanceOf(deployer);
    }
}
