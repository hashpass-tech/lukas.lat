// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {StabilizerVault} from "../src/StabilizerVault.sol";
import {LukasToken} from "../src/LukasToken.sol";
import {ILatAmBasketIndex} from "../src/interfaces/ILatAmBasketIndex.sol";

/**
 * @title DeployStabilizerVault
 * @notice Deploys the StabilizerVault for LUKAS peg maintenance
 * @dev Requires LukasToken, LatAmBasketIndex, and USDC addresses
 */
contract DeployStabilizerVault is Script {
    // ====== UPDATE THESE ADDRESSES AFTER PHASE 1 & 2 ======
    address constant LUKAS_TOKEN = address(0); // TODO: Update with deployed LukasToken
    address constant BASKET_INDEX = address(0); // TODO: Update with deployed LatAmBasketIndex
    address constant USDC_TOKEN = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582; // Official Polygon Amoy USDC
    
    // Stabilizer parameters
    uint256 constant MAX_MINT_PER_ACTION = 10000 ether; // 10k LUKAS max per mint
    uint256 constant MAX_BUYBACK_PER_ACTION = 10000 ether; // 10k LUKAS max per buyback
    uint256 constant DEVIATION_THRESHOLD = 200; // 2% deviation triggers stabilization
    uint256 constant COOLDOWN_PERIOD = 1 hours; // 1 hour between stabilizations

    function run() external {
        require(LUKAS_TOKEN != address(0), "Update LUKAS_TOKEN address");
        require(BASKET_INDEX != address(0), "Update BASKET_INDEX address");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy StabilizerVault
        StabilizerVault vault = new StabilizerVault(
            LUKAS_TOKEN,
            BASKET_INDEX,
            USDC_TOKEN
        );
        
        // Set parameters
        vault.setParameters(
            MAX_MINT_PER_ACTION,
            MAX_BUYBACK_PER_ACTION,
            DEVIATION_THRESHOLD,
            COOLDOWN_PERIOD
        );
        
        console.log("========================================");
        console.log("StabilizerVault Deployment");
        console.log("========================================");
        console.log("StabilizerVault deployed at:", address(vault));
        console.log("LukasToken:", LUKAS_TOKEN);
        console.log("BasketIndex:", BASKET_INDEX);
        console.log("USDC:", USDC_TOKEN);
        console.log("Owner:", deployer);
        console.log("");
        console.log("Parameters:");
        console.log("- Max Mint:", MAX_MINT_PER_ACTION / 1e18, "LUKAS");
        console.log("- Max Buyback:", MAX_BUYBACK_PER_ACTION / 1e18, "LUKAS");
        console.log("- Deviation Threshold:", DEVIATION_THRESHOLD / 100, "%");
        console.log("- Cooldown:", COOLDOWN_PERIOD / 3600, "hours");
        console.log("========================================");
        console.log("");
        console.log("NEXT STEPS:");
        console.log("1. Save StabilizerVault address:", address(vault));
        console.log("2. Set vault as LukasToken minter:");
        console.log("   cast send", LUKAS_TOKEN);
        console.log("   'setMinter(address)'", address(vault));
        console.log("3. Verify on PolygonScan");
        console.log("4. Deploy Uniswap V4 core contracts");
        console.log("========================================");

        vm.stopBroadcast();
    }
}
