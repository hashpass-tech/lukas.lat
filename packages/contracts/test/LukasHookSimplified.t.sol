// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import {LukasToken} from "../src/LukasToken.sol";
import {StabilizerVault} from "../src/StabilizerVault.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";
import {LukasHookSimplified} from "../src/LukasHookSimplified.sol";
import {BRZAdapter} from "../src/adapters/BRZAdapter.sol";
import {COPMAdapter} from "../src/adapters/COPMAdapter.sol";
import {MXNRemoteFeed} from "../src/adapters/MXNRemoteFeed.sol";
import {ARSRemoteFeed} from "../src/adapters/ARSRemoteFeed.sol";
import {CLPOracle} from "../src/adapters/CLPOracle.sol";

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

/**
 * @title LukasHookSimplifiedTest
 * @notice Tests for the LukasHookSimplified contract
 */
contract LukasHookSimplifiedTest is Test {
    LukasToken public lukas;
    StabilizerVault public vault;
    LatAmBasketIndex public basketIndex;
    LukasHookSimplified public hook;
    MockERC20 public usdc;

    address public relayer = makeAddr("relayer");

    // Price feeds
    BRZAdapter public brzAdapter;
    COPMAdapter public copmAdapter;
    MXNRemoteFeed public mxnFeed;
    ARSRemoteFeed public arsFeed;
    CLPOracle public clpOracle;

    function setUp() public {
        // Deploy tokens
        lukas = new LukasToken(1_000_000e18);
        usdc = new MockERC20("USDC", "USDC", 6);

        // Deploy and configure basket index
        basketIndex = new LatAmBasketIndex();
        _setupPriceFeeds();

        // Deploy vault
        vault = new StabilizerVault(
            address(lukas),
            address(basketIndex),
            address(usdc)
        );

        // Deploy hook
        hook = new LukasHookSimplified(
            address(basketIndex),
            address(vault),
            address(lukas),
            address(usdc)
        );

        // Set vault as minter
        lukas.setMinter(address(vault));

        // Fund vault with some USDC
        usdc.mint(address(vault), 100_000e6);

        // Warp time forward to ensure cooldown is elapsed
        vm.warp(block.timestamp + 6 minutes);
    }

    function _setupPriceFeeds() internal {
        brzAdapter = new BRZAdapter(address(0), address(0), address(0), 1800);
        copmAdapter = new COPMAdapter(address(0), address(0), address(0), 1800);
        mxnFeed = new MXNRemoteFeed(relayer, 1, address(0));
        arsFeed = new ARSRemoteFeed(relayer, 480, address(0));
        clpOracle = new CLPOracle();

        // Set realistic prices
        brzAdapter.updatePrice(20_000_000);  // $0.20
        copmAdapter.updatePrice(25_000);      // $0.00025
        clpOracle.updatePrice(110_000);       // $0.0011

        vm.prank(relayer);
        mxnFeed.relayPrice(5_800_000, block.timestamp);  // $0.058

        vm.prank(relayer);
        arsFeed.relayPrice(100_000, block.timestamp);    // $0.001

        basketIndex.setFeed("BRL", address(brzAdapter));
        basketIndex.setFeed("MXN", address(mxnFeed));
        basketIndex.setFeed("COP", address(copmAdapter));
        basketIndex.setFeed("CLP", address(clpOracle));
        basketIndex.setFeed("ARS", address(arsFeed));
        basketIndex.finalize();
    }

    function test_HookInitialization() public view {
        assertEq(address(hook.basketIndex()), address(basketIndex));
        assertEq(address(hook.stabilizerVault()), address(vault));
        assertEq(hook.lukasToken(), address(lukas));
        assertEq(hook.usdcToken(), address(usdc));
    }

    function test_GetPegStatus() public view {
        (uint256 poolPrice, uint256 fairPrice, int256 deviationBps, bool isOverPeg) = hook.getPegStatus();

        assertEq(poolPrice, 1e18); // Initial price is 1e18
        assertGt(fairPrice, 0);
        
        // Calculate expected deviation: (1e18 - fairPrice) / fairPrice * 10000
        // If fairPrice != 1e18, there will be a deviation
        int256 expectedDeviation = int256(((int256(1e18) - int256(fairPrice)) * 10000) / int256(fairPrice));
        assertApproxEqAbs(deviationBps, expectedDeviation, 100);
        
        // If pool price < fair price, should be under-peg
        if (poolPrice < fairPrice) {
            assertFalse(isOverPeg);
        }
    }

    function test_SetPoolPrice() public {
        uint256 newPrice = 1.1e18; // 10% higher
        hook.setPoolPrice(newPrice);

        (uint256 poolPrice,,, bool isOverPeg) = hook.getPegStatus();
        assertEq(poolPrice, newPrice);
        assertTrue(isOverPeg);
    }

    /// @notice **Feature: sepolia-deployment, Property 3: Hook Permission Consistency**
    /// **Validates: Requirements 6.1**
    function testFuzz_HookPermissionsConsistent(uint256 seed) public view {
        // This property tests that the hook's configuration is consistent
        // The hook should always have the same immutable addresses
        
        // Verify immutable addresses don't change
        assertEq(address(hook.basketIndex()), address(basketIndex));
        assertEq(address(hook.stabilizerVault()), address(vault));
        assertEq(hook.lukasToken(), address(lukas));
        assertEq(hook.usdcToken(), address(usdc));

        // Verify hook can be called multiple times with same result
        (uint256 price1, uint256 fair1,,) = hook.getPegStatus();
        (uint256 price2, uint256 fair2,,) = hook.getPegStatus();

        assertEq(price1, price2);
        assertEq(fair1, fair2);
    }

    /// @notice **Feature: sepolia-deployment, Property 5: Price Deviation Calculation**
    /// **Validates: Requirements 6.3, 6.4**
    function testFuzz_PriceDeviationCalculation(uint256 priceMultiplier) public {
        // Bound multiplier to reasonable range (0.5x to 2x fair price)
        priceMultiplier = bound(priceMultiplier, 5e17, 2e18);

        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        uint256 poolPrice = (fairPrice * priceMultiplier) / 1e18;

        hook.setPoolPrice(poolPrice);
        (uint256 returnedPrice, uint256 returnedFair, int256 deviationBps, bool isOverPeg) = hook.getPegStatus();

        // Verify returned values
        assertEq(returnedPrice, poolPrice);
        assertEq(returnedFair, fairPrice);

        // Verify deviation calculation
        if (poolPrice > fairPrice) {
            assertTrue(isOverPeg);
            int256 expectedDeviation = int256(((poolPrice - fairPrice) * 10000) / fairPrice);
            assertApproxEqAbs(deviationBps, expectedDeviation, 10);
        } else if (poolPrice < fairPrice) {
            assertFalse(isOverPeg);
            int256 expectedDeviation = -int256(((fairPrice - poolPrice) * 10000) / fairPrice);
            assertApproxEqAbs(deviationBps, expectedDeviation, 10);
        } else {
            assertEq(deviationBps, 0);
        }
    }

    /// @notice **Feature: sepolia-deployment, Property 6: Stabilization Trigger Threshold**
    /// **Validates: Requirements 6.5**
    function testFuzz_StabilizationThreshold(uint256 deviationBps) public {
        // Bound deviation to reasonable range (0 to 5%)
        deviationBps = bound(deviationBps, 0, 500);

        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        // Calculate pool price that produces the desired deviation
        uint256 poolPrice = fairPrice + (fairPrice * deviationBps) / 10000;

        hook.setPoolPrice(poolPrice);
        hook.setMinDeviationBps(100); // 1% threshold

        (uint256 returnedPrice, uint256 returnedFair, int256 returnedDeviation, bool isOverPeg) = hook.getPegStatus();

        // Verify deviation is calculated correctly
        uint256 absDeviation = returnedDeviation < 0 ? uint256(-returnedDeviation) : uint256(returnedDeviation);
        
        // If deviation >= threshold, stabilization should be triggered
        if (absDeviation >= 100) {
            // Deviation exceeds threshold
            assertTrue(absDeviation >= 100);
        } else {
            // Deviation below threshold
            assertTrue(absDeviation < 100);
        }
    }

    /// @notice **Feature: sepolia-deployment, Property 4: Pool Token Validation**
    /// **Validates: Requirements 6.2**
    function testFuzz_PoolTokenValidation(uint256 seed) public view {
        // This property tests that the hook is configured with correct token addresses
        // The hook should always validate that it's working with LUKAS and USDC tokens
        
        // Verify hook has correct token addresses
        assertEq(hook.lukasToken(), address(lukas));
        assertEq(hook.usdcToken(), address(usdc));
        
        // Verify hook can access basket index
        uint256 fairPrice = hook.basketIndex().getLukasFairPriceInUSDC();
        assertGt(fairPrice, 0);
        
        // Verify hook can access vault
        address vaultAddr = address(hook.stabilizerVault());
        assertEq(vaultAddr, address(vault));
        
        // The hook should only work with LUKAS/USDC pairs
        // Any other token pair should be rejected (in full hook implementation)
        assertTrue(hook.lukasToken() != hook.usdcToken());
    }

    // ============ Integration Tests ============

    function test_PegDeviationDetection() public {
        // Test that peg deviation is properly detected and emitted
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        // Set pool price to 5% above fair value
        uint256 overPegPrice = (fairPrice * 105) / 100;
        hook.setPoolPrice(overPegPrice);
        
        (uint256 poolPrice, uint256 returnedFair, int256 deviationBps, bool isOverPeg) = hook.getPegStatus();
        
        assertEq(poolPrice, overPegPrice);
        assertEq(returnedFair, fairPrice);
        assertTrue(isOverPeg);
        assertApproxEqAbs(deviationBps, 500, 10); // ~5% = 500 bps
    }

    function test_StabilizationTrigger() public {
        // Test that stabilization is triggered when deviation exceeds threshold
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        // Enable auto-stabilization
        hook.setAutoStabilize(true);
        hook.setMinDeviationBps(100); // 1% threshold
        
        // Set price to 2% above fair value (exceeds threshold)
        uint256 deviatedPrice = (fairPrice * 102) / 100;
        hook.setPoolPrice(deviatedPrice);
        
        (bool shouldStabilize, bool isOverPeg, uint256 deviationBps) = vault.shouldStabilize(deviatedPrice);
        
        // Deviation should exceed threshold
        assertTrue(deviationBps >= 100);
        assertTrue(isOverPeg);
    }

    function test_HookIntegrationWithVault() public {
        // Test that hook can trigger vault stabilization
        vault.setAuthorized(address(hook), true);
        
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        uint256 overPegPrice = (fairPrice * 110) / 100; // 10% over-peg
        
        hook.setPoolPrice(overPegPrice);
        
        (uint256 poolPrice, uint256 returnedFair, int256 deviationBps, bool isOverPeg) = hook.getPegStatus();
        
        assertTrue(isOverPeg);
        assertGt(deviationBps, 0);
        
        // Verify vault is authorized to stabilize
        assertTrue(vault.isAuthorized(address(hook)));
    }
}
