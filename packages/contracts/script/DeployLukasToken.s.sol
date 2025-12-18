// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {LukasToken} from "../src/LukasToken.sol";

/**
 * @title DeployLukasToken
 * @notice Deploys the LUKAS ERC20 token
 * @dev Initial supply can be 0 (vault will mint) or a bootstrap amount
 */
contract DeployLukasToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy LukasToken with 0 initial supply
        // The StabilizerVault will be set as minter and handle all minting
        uint256 initialSupply = 0;
        
        LukasToken lukasToken = new LukasToken(initialSupply);
        
        console.log("========================================");
        console.log("LUKAS Token Deployment");
        console.log("========================================");
        console.log("LukasToken deployed at:", address(lukasToken));
        console.log("Initial supply:", initialSupply);
        console.log("Owner:", lukasToken.owner());
        console.log("Name:", lukasToken.name());
        console.log("Symbol:", lukasToken.symbol());
        console.log("Decimals:", lukasToken.decimals());
        console.log("========================================");
        console.log("");
        console.log("NEXT STEPS:");
        console.log("1. Save LukasToken address:", address(lukasToken));
        console.log("2. Verify on PolygonScan");
        console.log("3. Deploy LatAmBasketIndex oracle");
        console.log("4. Deploy StabilizerVault");
        console.log("5. Set StabilizerVault as minter:");
        console.log("   lukasToken.setMinter(stabilizerVault)");
        console.log("========================================");

        vm.stopBroadcast();
    }
}
