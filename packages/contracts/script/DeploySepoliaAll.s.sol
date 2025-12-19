// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {LukasToken} from "../src/LukasToken.sol";
import {StabilizerVault} from "../src/StabilizerVault.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";
import {BRZAdapter} from "../src/adapters/BRZAdapter.sol";
import {COPMAdapter} from "../src/adapters/COPMAdapter.sol";
import {MXNRemoteFeed} from "../src/adapters/MXNRemoteFeed.sol";
import {ARSRemoteFeed} from "../src/adapters/ARSRemoteFeed.sol";
import {CLPOracle} from "../src/adapters/CLPOracle.sol";
import {LukasHookSimplified} from "../src/LukasHookSimplified.sol";

/**
 * @title DeploySepoliaAll
 * @notice Deploy all Lukas Protocol contracts to Sepolia testnet
 * 
 * Usage:
 * forge script script/DeploySepoliaAll.s.sol:DeploySepoliaAll \
 *   --rpc-url $SEPOLIA_RPC_URL \
 *   --broadcast \
 *   --verify
 */
contract DeploySepoliaAll is Script {
    // Sepolia addresses
    address constant SEPOLIA_USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address constant SEPOLIA_POOL_MANAGER = 0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A;

    // Deployed contracts
    LukasToken public lukasToken;
    LatAmBasketIndex public basketIndex;
    StabilizerVault public stabilizerVault;
    LukasHookSimplified public lukasHook;

    // Price feeds
    BRZAdapter public brzAdapter;
    COPMAdapter public copmAdapter;
    MXNRemoteFeed public mxnFeed;
    ARSRemoteFeed public arsFeed;
    CLPOracle public clpOracle;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Deploying Lukas Protocol to Sepolia ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        // 1. Deploy LukasToken with 1M initial supply
        console.log("\n1. Deploying LukasToken...");
        lukasToken = new LukasToken(1_000_000e18);
        console.log("LukasToken deployed at:", address(lukasToken));

        // 2. Deploy price feed adapters
        console.log("\n2. Deploying price feed adapters...");
        brzAdapter = new BRZAdapter(address(0), address(0), address(0), 1800);
        console.log("BRZAdapter deployed at:", address(brzAdapter));

        copmAdapter = new COPMAdapter(address(0), address(0), address(0), 1800);
        console.log("COPMAdapter deployed at:", address(copmAdapter));

        mxnFeed = new MXNRemoteFeed(vm.addr(deployerPrivateKey), 1, address(0));
        console.log("MXNRemoteFeed deployed at:", address(mxnFeed));

        arsFeed = new ARSRemoteFeed(vm.addr(deployerPrivateKey), 480, address(0));
        console.log("ARSRemoteFeed deployed at:", address(arsFeed));

        clpOracle = new CLPOracle();
        console.log("CLPOracle deployed at:", address(clpOracle));

        // 3. Deploy LatAmBasketIndex
        console.log("\n3. Deploying LatAmBasketIndex...");
        basketIndex = new LatAmBasketIndex();
        console.log("LatAmBasketIndex deployed at:", address(basketIndex));

        // 4. Configure price feeds
        console.log("\n4. Configuring price feeds...");
        brzAdapter.updatePrice(20_000_000);  // $0.20
        copmAdapter.updatePrice(25_000);      // $0.00025
        clpOracle.updatePrice(110_000);       // $0.0011
        mxnFeed.relayPrice(5_800_000, block.timestamp);  // $0.058
        arsFeed.relayPrice(100_000, block.timestamp);    // $0.001

        basketIndex.setFeed("BRL", address(brzAdapter));
        basketIndex.setFeed("MXN", address(mxnFeed));
        basketIndex.setFeed("COP", address(copmAdapter));
        basketIndex.setFeed("CLP", address(clpOracle));
        basketIndex.setFeed("ARS", address(arsFeed));
        basketIndex.finalize();
        console.log("Price feeds configured and finalized");

        // 5. Deploy StabilizerVault
        console.log("\n5. Deploying StabilizerVault...");
        stabilizerVault = new StabilizerVault(
            address(lukasToken),
            address(basketIndex),
            SEPOLIA_USDC
        );
        console.log("StabilizerVault deployed at:", address(stabilizerVault));

        // 6. Deploy LukasHookSimplified
        console.log("\n6. Deploying LukasHookSimplified...");
        lukasHook = new LukasHookSimplified(
            address(basketIndex),
            address(stabilizerVault),
            address(lukasToken),
            SEPOLIA_USDC
        );
        console.log("LukasHookSimplified deployed at:", address(lukasHook));

        // 7. Configure permissions
        console.log("\n7. Configuring permissions...");
        lukasToken.setMinter(address(stabilizerVault));
        console.log("StabilizerVault set as minter");

        stabilizerVault.setAuthorized(address(lukasHook), true);
        console.log("LukasHook authorized for stabilization");

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("LukasToken:", address(lukasToken));
        console.log("LatAmBasketIndex:", address(basketIndex));
        console.log("StabilizerVault:", address(stabilizerVault));
        console.log("LukasHookSimplified:", address(lukasHook));
        console.log("\nUpdate deployments.json with these addresses!");
    }
}
