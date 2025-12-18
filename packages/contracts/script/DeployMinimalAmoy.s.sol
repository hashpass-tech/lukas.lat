// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

/**
 * Minimal deployment script for Lukas Protocol on Polygon Amoy
 * Deploys essential contracts for testing core functionality
 */

// Minimal LatAmBasketIndex Oracle
contract LatAmBasketIndex {
    address public lukasToken;
    address public usdc;
    uint256 public currentPrice = 1e18; // 1 USD
    uint256 public fairPrice = 1e18;
    uint256 public lastUpdate;
    
    event IndexUpdate(uint256 newValue, uint256 timestamp);
    event PegDeviation(uint256 poolPrice, uint256 fairPrice, uint256 deviationBps, bool isOverPeg);
    
    constructor(address _lukasToken, address _usdc) {
        lukasToken = _lukasToken;
        usdc = _usdc;
        lastUpdate = block.timestamp;
    }
    
    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
    }
    
    function getFairPrice() external view returns (uint256) {
        return fairPrice;
    }
    
    function getIndexUSD() external view returns (uint256 valueUSD, uint256 lastUpdated, bool isStale) {
        return (currentPrice, lastUpdate, block.timestamp - lastUpdate > 1 hours);
    }
    
    function getCurrencyPrice(string memory currency) external view returns (string memory, uint256, uint256, bool) {
        return (currency, currentPrice, lastUpdate, block.timestamp - lastUpdate > 1 hours);
    }
    
    function getPegStatus() external view returns (uint256, uint256, uint256, bool, bool) {
        uint256 deviation = currentPrice > fairPrice 
            ? ((currentPrice - fairPrice) * 10000) / fairPrice
            : ((fairPrice - currentPrice) * 10000) / fairPrice;
        bool isOverPeg = currentPrice > fairPrice;
        bool shouldStabilize = deviation > 200; // 2%
        return (currentPrice, fairPrice, deviation, isOverPeg, shouldStabilize);
    }
    
    function getBasketComposition() external view returns (string[] memory, uint256[] memory, uint256[] memory, uint256[] memory) {
        string[] memory currencies = new string[](1);
        currencies[0] = "USD";
        uint256[] memory weights = new uint256[](1);
        weights[0] = 10000;
        uint256[] memory prices = new uint256[](1);
        prices[0] = currentPrice;
        uint256[] memory timestamps = new uint256[](1);
        timestamps[0] = lastUpdate;
        return (currencies, weights, prices, timestamps);
    }
    
    function hasStaleFeeds() external view returns (bool) {
        return block.timestamp - lastUpdate > 1 hours;
    }
    
    function updatePrice(uint256 newPrice) external {
        currentPrice = newPrice;
        lastUpdate = block.timestamp;
        emit IndexUpdate(newPrice, block.timestamp);
    }
}

// Minimal StabilizerVault
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IOracle {
    function getCurrentPrice() external view returns (uint256);
    function getFairPrice() external view returns (uint256);
}

contract StabilizerVault {
    address public lukasToken;
    address public usdc;
    address public oracle;
    address public owner;
    
    uint256 public maxMintPerAction = 10000e18;
    uint256 public maxBuybackPerAction = 10000e6;
    uint256 public deviationThreshold = 200; // 2%
    uint256 public cooldownPeriod = 1 hours;
    uint256 public lastStabilization;
    uint256 public totalMinted;
    uint256 public totalBoughtBack;
    
    event StabilizationMint(uint256 amount, uint256 poolPrice, uint256 fairPrice, address recipient);
    event StabilizationBuyback(uint256 amount, uint256 poolPrice, uint256 fairPrice);
    
    constructor(address _lukasToken, address _usdc, address _oracle) {
        lukasToken = _lukasToken;
        usdc = _usdc;
        oracle = _oracle;
        owner = msg.sender;
        lastStabilization = block.timestamp;
    }
    
    function getVaultInfo() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        return (maxMintPerAction, maxBuybackPerAction, deviationThreshold, cooldownPeriod, lastStabilization, totalMinted, totalBoughtBack);
    }
    
    function getCollateralBalance() external view returns (uint256, uint256, uint256) {
        uint256 usdcBal = IERC20(usdc).balanceOf(address(this));
        uint256 lukasBal = IERC20(lukasToken).balanceOf(address(this));
        uint256 totalValue = usdcBal + (lukasBal * IOracle(oracle).getCurrentPrice() / 1e18);
        return (usdcBal, lukasBal, totalValue);
    }
    
    function isAuthorized(address account) external view returns (bool) {
        return account == owner;
    }
    
    function shouldStabilize(uint256 poolPrice) external view returns (bool, bool, uint256, uint256, bool, string memory) {
        uint256 fairPrice = IOracle(oracle).getFairPrice();
        uint256 deviation = poolPrice > fairPrice 
            ? ((poolPrice - fairPrice) * 10000) / fairPrice
            : ((fairPrice - poolPrice) * 10000) / fairPrice;
        
        bool isOverPeg = poolPrice > fairPrice;
        bool needsStabilization = deviation >= deviationThreshold;
        bool canExecute = block.timestamp >= lastStabilization + cooldownPeriod;
        
        return (needsStabilization, isOverPeg, deviation, 1000e18, canExecute, "");
    }
    
    function stabilizeMint(uint256 amount, address recipient) external returns (bool) {
        require(msg.sender == owner, "Not authorized");
        require(amount <= maxMintPerAction, "Amount too large");
        
        totalMinted += amount;
        lastStabilization = block.timestamp;
        
        emit StabilizationMint(amount, 0, 0, recipient);
        return true;
    }
    
    function stabilizeBuyback(uint256 amount) external returns (bool) {
        require(msg.sender == owner, "Not authorized");
        require(amount <= maxBuybackPerAction, "Amount too large");
        
        totalBoughtBack += amount;
        lastStabilization = block.timestamp;
        
        emit StabilizationBuyback(amount, 0, 0);
        return true;
    }
}

contract DeployMinimalAmoy is Script {
    // Amoy testnet addresses
    address constant LUKAS_TOKEN = 0xAeE0F26589a21BA4547765F630075262f330F1CB;
    address constant USDC_TOKEN = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying minimal Lukas Protocol contracts on Amoy...");
        
        // Deploy Oracle
        console.log("Deploying LatAmBasketIndex Oracle...");
        LatAmBasketIndex oracle = new LatAmBasketIndex(LUKAS_TOKEN, USDC_TOKEN);
        console.log("Oracle deployed at:", address(oracle));
        
        // Deploy Vault
        console.log("Deploying StabilizerVault...");
        StabilizerVault vault = new StabilizerVault(LUKAS_TOKEN, USDC_TOKEN, address(oracle));
        console.log("Vault deployed at:", address(vault));
        
        console.log("Deployment Complete!");
        console.log("Update deployments.json:");
        console.log("  LatAmBasketIndex:", address(oracle));
        console.log("  StabilizerVault:", address(vault));
        
        vm.stopBroadcast();
    }
}
