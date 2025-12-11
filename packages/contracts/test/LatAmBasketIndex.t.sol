// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";
import {BRZAdapter} from "../src/adapters/BRZAdapter.sol";
import {COPMAdapter} from "../src/adapters/COPMAdapter.sol";
import {MXNRemoteFeed} from "../src/adapters/MXNRemoteFeed.sol";
import {ARSRemoteFeed} from "../src/adapters/ARSRemoteFeed.sol";
import {CLPOracle} from "../src/adapters/CLPOracle.sol";

/**
 * @title LatAmBasketIndexTest
 * @notice Tests for the LatAm Peso Index oracle
 */
contract LatAmBasketIndexTest is Test {
    LatAmBasketIndex public basketIndex;
    
    BRZAdapter public brzAdapter;
    COPMAdapter public copmAdapter;
    MXNRemoteFeed public mxnFeed;
    ARSRemoteFeed public arsFeed;
    CLPOracle public clpOracle;

    address public relayer = makeAddr("relayer");

    // Realistic prices (in 1e8 format)
    // BRL: ~0.20 USD
    uint256 constant BRL_PRICE = 20_000_000;
    // MXN: ~0.058 USD
    uint256 constant MXN_PRICE = 5_800_000;
    // COP: ~0.00025 USD
    uint256 constant COP_PRICE = 25_000;
    // CLP: ~0.0011 USD
    uint256 constant CLP_PRICE = 110_000;
    // ARS: ~0.001 USD (blue rate)
    uint256 constant ARS_PRICE = 100_000;

    function setUp() public {
        // Deploy basket index
        basketIndex = new LatAmBasketIndex();
        
        // Deploy adapters
        brzAdapter = new BRZAdapter(address(0), address(0), address(0), 1800);
        copmAdapter = new COPMAdapter(address(0), address(0), address(0), 1800);
        mxnFeed = new MXNRemoteFeed(relayer, 1, address(0));
        arsFeed = new ARSRemoteFeed(relayer, 480, address(0));
        clpOracle = new CLPOracle();
        
        // Set prices
        brzAdapter.updatePrice(BRL_PRICE);
        copmAdapter.updatePrice(COP_PRICE);
        
        vm.prank(relayer);
        mxnFeed.relayPrice(MXN_PRICE, block.timestamp);
        
        vm.prank(relayer);
        arsFeed.relayPrice(ARS_PRICE, block.timestamp);
        
        clpOracle.updatePrice(CLP_PRICE);
        
        // Configure basket index with feeds
        basketIndex.setFeed("BRL", address(brzAdapter));
        basketIndex.setFeed("MXN", address(mxnFeed));
        basketIndex.setFeed("COP", address(copmAdapter));
        basketIndex.setFeed("CLP", address(clpOracle));
        basketIndex.setFeed("ARS", address(arsFeed));
        
        // Finalize the basket
        basketIndex.finalize();
    }

    function test_BasketWeights() public view {
        (string[] memory currencies, uint256[] memory weights) = basketIndex.getWeights();
        
        assertEq(currencies.length, 5, "Should have 5 currencies");
        
        // Verify weights
        assertEq(weights[0], 4000, "BRL should be 40%");
        assertEq(weights[1], 3000, "MXN should be 30%");
        assertEq(weights[2], 1500, "COP should be 15%");
        assertEq(weights[3], 1000, "CLP should be 10%");
        assertEq(weights[4], 500, "ARS should be 5%");
        
        // Verify total is 100%
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
        }
        assertEq(totalWeight, 10000, "Total weight should be 100%");
    }

    function test_GetIndexUSD() public view {
        (uint256 indexValue,) = basketIndex.getIndexUSD();
        
        // Calculate expected index:
        // BRL: 20_000_000 * 0.40 = 8_000_000
        // MXN: 5_800_000 * 0.30 = 1_740_000
        // COP: 25_000 * 0.15 = 3_750
        // CLP: 110_000 * 0.10 = 11_000
        // ARS: 100_000 * 0.05 = 5_000
        // Total: 9_759_750 (≈ $0.0976 USD)
        
        uint256 expectedIndex = (BRL_PRICE * 4000 / 10000) +
                                (MXN_PRICE * 3000 / 10000) +
                                (COP_PRICE * 1500 / 10000) +
                                (CLP_PRICE * 1000 / 10000) +
                                (ARS_PRICE * 500 / 10000);
        
        assertEq(indexValue, expectedIndex, "Index value should match weighted calculation");
    }

    function test_GetLukasFairPriceInUSDC() public view {
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        // Should be index value scaled from 1e8 to 1e18
        (uint256 indexValue,) = basketIndex.getIndexUSD();
        uint256 expectedPrice = (indexValue * 1e18) / 1e8;
        
        assertEq(fairPrice, expectedPrice, "Fair price should be index scaled to 1e18");
    }

    function test_GetCurrencyPrice() public view {
        (uint256 brlPrice, uint256 brlWeight) = basketIndex.getCurrencyPrice("BRL");
        assertEq(brlPrice, BRL_PRICE, "BRL price should match");
        assertEq(brlWeight, 4000, "BRL weight should be 40%");
        
        (uint256 mxnPrice, uint256 mxnWeight) = basketIndex.getCurrencyPrice("MXN");
        assertEq(mxnPrice, MXN_PRICE, "MXN price should match");
        assertEq(mxnWeight, 3000, "MXN weight should be 30%");
    }

    function test_CannotFinalizeWithoutAllFeeds() public {
        LatAmBasketIndex newIndex = new LatAmBasketIndex();
        
        // Only set some feeds
        newIndex.setFeed("BRL", address(brzAdapter));
        newIndex.setFeed("MXN", address(mxnFeed));
        
        // Should revert when trying to finalize
        vm.expectRevert();
        newIndex.finalize();
    }

    function test_CannotFinalizeTwice() public {
        vm.expectRevert(LatAmBasketIndex.BasketAlreadyFinalized.selector);
        basketIndex.finalize();
    }

    function test_CannotGetIndexBeforeFinalized() public {
        LatAmBasketIndex newIndex = new LatAmBasketIndex();
        
        vm.expectRevert(LatAmBasketIndex.BasketNotFinalized.selector);
        newIndex.getIndexUSD();
    }

    function test_HasStaleFeeds() public {
        // Initially not stale
        assertFalse(basketIndex.hasStaleFeeds(), "Feeds should not be stale initially");
        
        // Warp time past staleness threshold (1 hour for most feeds)
        vm.warp(block.timestamp + 2 hours);
        
        assertTrue(basketIndex.hasStaleFeeds(), "Feeds should be stale after 2 hours");
    }

    function test_PriceUpdate() public {
        // Update BRL price
        uint256 newBrlPrice = 22_000_000; // BRL strengthens to $0.22
        brzAdapter.updatePrice(newBrlPrice);
        
        (uint256 brlPrice,) = basketIndex.getCurrencyPrice("BRL");
        assertEq(brlPrice, newBrlPrice, "BRL price should be updated");
        
        // Index should reflect new price
        (uint256 indexValue,) = basketIndex.getIndexUSD();
        
        uint256 expectedIndex = (newBrlPrice * 4000 / 10000) +
                                (MXN_PRICE * 3000 / 10000) +
                                (COP_PRICE * 1500 / 10000) +
                                (CLP_PRICE * 1000 / 10000) +
                                (ARS_PRICE * 500 / 10000);
        
        assertEq(indexValue, expectedIndex, "Index should reflect updated BRL price");
    }
}
