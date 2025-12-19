// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import {LukasToken} from "../src/LukasToken.sol";
import {StabilizerVault} from "../src/StabilizerVault.sol";
import {LatAmBasketIndex} from "../src/oracles/LatAmBasketIndex.sol";
import {BRZAdapter} from "../src/adapters/BRZAdapter.sol";
import {COPMAdapter} from "../src/adapters/COPMAdapter.sol";
import {MXNRemoteFeed} from "../src/adapters/MXNRemoteFeed.sol";
import {ARSRemoteFeed} from "../src/adapters/ARSRemoteFeed.sol";
import {CLPOracle} from "../src/adapters/CLPOracle.sol";

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

/**
 * @title StabilizerVaultTest
 * @notice Tests for the LUKAS Stabilizer Vault
 */
contract StabilizerVaultTest is Test {
    LukasToken public lukas;
    StabilizerVault public vault;
    LatAmBasketIndex public basketIndex;
    MockERC20 public usdc;

    address public keeper = makeAddr("keeper");
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
        
        // Set vault as minter
        lukas.setMinter(address(vault));
        
        // Authorize keeper
        vault.setAuthorized(keeper, true);
        
        // Fund vault with some USDC
        usdc.mint(address(vault), 100_000e6);
        
        // Warp time forward to ensure cooldown is elapsed from deployment
        // This allows the first stabilization call to succeed without cooldown restriction
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

    function test_Initialization() public view {
        assertEq(address(vault.lukas()), address(lukas));
        assertEq(address(vault.basketIndex()), address(basketIndex));
        assertEq(vault.usdc(), address(usdc));
        assertTrue(vault.isAuthorized(keeper));
    }

    function test_StabilizeMint() public {
        uint256 mintAmount = 1000e18;
        uint256 vaultBalanceBefore = lukas.balanceOf(address(vault));
        
        vm.prank(keeper);
        vault.stabilizeMint(mintAmount, address(vault));
        
        uint256 vaultBalanceAfter = lukas.balanceOf(address(vault));
        assertEq(vaultBalanceAfter - vaultBalanceBefore, mintAmount);
        assertEq(vault.totalMinted(), mintAmount);
    }

    function test_StabilizeBuyback() public {
        // First mint some LUKAS to the vault
        uint256 mintAmount = 1000e18;
        vm.prank(keeper);
        vault.stabilizeMint(mintAmount, address(vault));
        
        // Wait for cooldown
        vm.warp(block.timestamp + 6 minutes);
        
        // Now buyback
        uint256 buybackAmount = 500e18;
        uint256 supplyBefore = lukas.totalSupply();
        
        vm.prank(keeper);
        vault.stabilizeBuyback(buybackAmount);
        
        uint256 supplyAfter = lukas.totalSupply();
        assertEq(supplyBefore - supplyAfter, buybackAmount);
        assertEq(vault.totalBoughtBack(), buybackAmount);
    }

    function test_CooldownEnforced() public {
        uint256 mintAmount = 1000e18;
        
        // First mint succeeds (cooldown already elapsed in setUp)
        vm.prank(keeper);
        vault.stabilizeMint(mintAmount, address(vault));
        
        // Second mint should fail immediately (cooldown not elapsed)
        vm.prank(keeper);
        vm.expectRevert(StabilizerVault.CooldownNotElapsed.selector);
        vault.stabilizeMint(mintAmount, address(vault));
        
        // After cooldown, should succeed
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(keeper);
        vault.stabilizeMint(mintAmount, address(vault));
    }

    function test_MaxMintEnforced() public {
        uint256 excessiveAmount = 20_000e18; // Exceeds default 10,000 max
        
        // Cooldown is already elapsed in setUp, so this should fail on max mint check
        vm.prank(keeper);
        vm.expectRevert(StabilizerVault.ExceedsMaxMint.selector);
        vault.stabilizeMint(excessiveAmount, address(vault));
    }

    function test_OnlyAuthorizedCanStabilize() public {
        address unauthorized = makeAddr("unauthorized");
        
        vm.prank(unauthorized);
        vm.expectRevert(StabilizerVault.Unauthorized.selector);
        vault.stabilizeMint(1000e18, address(vault));
    }

    function test_OwnerCanStabilize() public {
        // Owner should be able to stabilize without explicit authorization
        vault.stabilizeMint(1000e18, address(vault));
        assertEq(vault.totalMinted(), 1000e18);
    }

    function test_CalculateDeviation() public view {
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        // Test over-peg (pool price 10% higher)
        uint256 overPegPrice = fairPrice * 110 / 100;
        (int256 deviation, bool isOverPeg) = vault.calculateDeviation(overPegPrice);
        
        assertTrue(isOverPeg, "Should be over-peg");
        assertApproxEqAbs(deviation, 1000, 10); // ~10% = 1000 bps
        
        // Test under-peg (pool price 5% lower)
        uint256 underPegPrice = fairPrice * 95 / 100;
        (deviation, isOverPeg) = vault.calculateDeviation(underPegPrice);
        
        assertFalse(isOverPeg, "Should be under-peg");
        assertApproxEqAbs(deviation, -500, 10); // ~-5% = -500 bps
    }

    function test_ShouldStabilize() public {
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        // Price at 2% deviation (above 1% threshold)
        uint256 deviatedPrice = fairPrice * 102 / 100;
        (bool should, bool isOverPeg, uint256 deviationBps) = vault.shouldStabilize(deviatedPrice);
        
        // shouldStabilize checks both deviation AND cooldown
        // Since cooldown is elapsed in setUp, this should return true
        assertTrue(should, "Should trigger stabilization at 2% deviation");
        assertTrue(isOverPeg, "Should be over-peg");
        assertApproxEqAbs(deviationBps, 200, 10); // ~2% = 200 bps
        
        // Price at 0.5% deviation (below threshold)
        uint256 smallDeviation = fairPrice * 1005 / 1000;
        (should,,) = vault.shouldStabilize(smallDeviation);
        
        assertFalse(should, "Should not trigger at 0.5% deviation");
    }

    function test_UpdateParameters() public {
        vault.setParameters(
            50_000e18,  // maxMint
            50_000e18,  // maxBuyback
            50,         // 0.5% threshold
            10 minutes  // cooldown
        );
        
        assertEq(vault.maxMintPerAction(), 50_000e18);
        assertEq(vault.maxBuybackPerAction(), 50_000e18);
        assertEq(vault.deviationThreshold(), 50);
        assertEq(vault.cooldownPeriod(), 10 minutes);
    }

    function test_GetCollateralBalance() public view {
        (uint256 usdcBalance, uint256 lukasBalance) = vault.getCollateralBalance();
        
        assertEq(usdcBalance, 100_000e6);
        assertEq(lukasBalance, 0);
    }

    /// @notice **Feature: sepolia-deployment, Property 1: Cooldown Enforcement After Action**
    /// **Validates: Requirements 1.4**
    function testFuzz_CooldownEnforcedAfterAction(uint256 waitTime) public {
        // Bound waitTime to reasonable range (0 to 10 minutes)
        waitTime = bound(waitTime, 0, 10 minutes);
        
        uint256 mintAmount = 1000e18;
        
        // First stabilization succeeds (cooldown already elapsed in setUp)
        vm.prank(keeper);
        vault.stabilizeMint(mintAmount, address(vault));
        
        uint256 lastStabilizationTime = block.timestamp;
        
        // Immediately after, second call should fail
        vm.prank(keeper);
        vm.expectRevert(StabilizerVault.CooldownNotElapsed.selector);
        vault.stabilizeMint(mintAmount, address(vault));
        
        // Warp by waitTime
        vm.warp(block.timestamp + waitTime);
        
        // If waitTime < cooldownPeriod (5 minutes), should still fail
        if (waitTime < vault.cooldownPeriod()) {
            vm.prank(keeper);
            vm.expectRevert(StabilizerVault.CooldownNotElapsed.selector);
            vault.stabilizeMint(mintAmount, address(vault));
        } else {
            // If waitTime >= cooldownPeriod, should succeed
            vm.prank(keeper);
            vault.stabilizeMint(mintAmount, address(vault));
            assertEq(vault.totalMinted(), mintAmount * 2);
        }
    }
}
