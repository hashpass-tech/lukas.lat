// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";
import {MockPriceFeed} from "../src/oracles/MockPriceFeed.sol";

contract DeployLatAmBasketIndex is Script {
    // Testnet prices (1e8 decimals)
    uint256 constant BRL_PRICE = 20_000_000; // ~0.20 USD
    uint256 constant MXN_PRICE = 5_800_000;  // ~0.058 USD
    uint256 constant COP_PRICE = 25_000;     // ~0.00025 USD
    uint256 constant CLP_PRICE = 110_000;    // ~0.0011 USD
    uint256 constant ARS_PRICE = 100_000;    // ~0.001 USD

    function run() public {
        vm.startBroadcast();

        // Deploy LatAmBasketIndex
        LatAmBasketIndex basketIndex = new LatAmBasketIndex();
        console.log("LatAmBasketIndex deployed at:", address(basketIndex));

        // Deploy mock price feeds
        MockPriceFeed brzFeed = new MockPriceFeed("BRL", BRL_PRICE);
        MockPriceFeed mxnFeed = new MockPriceFeed("MXN", MXN_PRICE);
        MockPriceFeed copFeed = new MockPriceFeed("COP", COP_PRICE);
        MockPriceFeed clpFeed = new MockPriceFeed("CLP", CLP_PRICE);
        MockPriceFeed arsFeed = new MockPriceFeed("ARS", ARS_PRICE);

        // Set feeds
        basketIndex.setFeed("BRL", address(brzFeed));
        basketIndex.setFeed("MXN", address(mxnFeed));
        basketIndex.setFeed("COP", address(copFeed));
        basketIndex.setFeed("CLP", address(clpFeed));
        basketIndex.setFeed("ARS", address(arsFeed));

        // Finalize the basket
        basketIndex.finalize();
        console.log("LatAmBasketIndex finalized");

        vm.stopBroadcast();
    }
}