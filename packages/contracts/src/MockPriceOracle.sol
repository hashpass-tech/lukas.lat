// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockPriceOracle
 * @notice Simple mock oracle for testing LUKAS stabilization logic
 * @dev Simulates pool price changes for testing purposes
 */
contract MockPriceOracle {
    uint256 public currentPrice; // Price in 1e18 format (LUKAS per USDC)
    address public owner;
    
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor(uint256 _initialPrice) {
        owner = msg.sender;
        currentPrice = _initialPrice;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @notice Get current LUKAS price in USDC terms
     * @return price Price in 1e18 format
     */
    function getPrice() external view returns (uint256 price) {
        return currentPrice;
    }

    /**
     * @notice Set new price (for testing scenarios)
     * @param newPrice New price in 1e18 format
     */
    function setPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = currentPrice;
        currentPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }

    /**
     * @notice Simulate a swap that changes price
     * @param amountIn Amount being swapped in
     * @param isLukasIn True if swapping LUKAS for USDC, false for USDC to LUKAS
     */
    function simulateSwap(uint256 amountIn, bool isLukasIn) external {
        // Simple price impact simulation
        uint256 impact = (amountIn * 10) / 1e18; // 0.001% impact per 1 token
        
        if (isLukasIn) {
            // Selling LUKAS -> price goes down
            currentPrice = currentPrice > impact ? currentPrice - impact : currentPrice / 2;
        } else {
            // Buying LUKAS -> price goes up
            currentPrice = currentPrice + impact;
        }
        
        emit PriceUpdated(currentPrice, currentPrice);
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}