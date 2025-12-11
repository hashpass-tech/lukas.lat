// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IStabilizerVault
 * @notice Interface for the LUKAS stabilization vault
 * @dev Handles mint/burn operations and liquidity management for peg maintenance
 */
interface IStabilizerVault {
    /// @notice Emitted when LUKAS is minted to stabilize an over-peg condition
    event StabilizationMint(uint256 amount, uint256 poolPrice, uint256 fairPrice);
    
    /// @notice Emitted when LUKAS is bought back to stabilize an under-peg condition
    event StabilizationBuyback(uint256 amount, uint256 poolPrice, uint256 fairPrice);
    
    /// @notice Emitted when liquidity is added to the pool
    event LiquidityAdded(uint256 lukasAmount, uint256 usdcAmount);
    
    /// @notice Emitted when liquidity is removed from the pool
    event LiquidityRemoved(uint256 lukasAmount, uint256 usdcAmount);

    /**
     * @notice Mint LUKAS to weaken price when over-peg
     * @param amount Amount of LUKAS to mint
     * @param recipient Address to receive minted LUKAS
     */
    function stabilizeMint(uint256 amount, address recipient) external;

    /**
     * @notice Buyback and burn LUKAS to strengthen price when under-peg
     * @param amount Amount of LUKAS to buyback
     */
    function stabilizeBuyback(uint256 amount) external;

    /**
     * @notice Add liquidity to the LUKAS/USDC pool
     * @param lukasAmount Amount of LUKAS to add
     * @param usdcAmount Amount of USDC to add
     */
    function addLiquidity(uint256 lukasAmount, uint256 usdcAmount) external;

    /**
     * @notice Remove liquidity from the LUKAS/USDC pool
     * @param liquidity Amount of liquidity to remove
     */
    function removeLiquidity(uint256 liquidity) external;

    /**
     * @notice Get the current collateral balance
     * @return usdc USDC balance
     * @return lukas LUKAS balance
     */
    function getCollateralBalance() external view returns (uint256 usdc, uint256 lukas);

    /**
     * @notice Check if the vault is authorized to perform stabilization
     * @param caller Address to check
     * @return True if authorized
     */
    function isAuthorized(address caller) external view returns (bool);
}
