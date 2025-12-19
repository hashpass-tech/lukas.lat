// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ILatAmBasketIndex} from "./interfaces/ILatAmBasketIndex.sol";
import {IStabilizerVault} from "./interfaces/IStabilizerVault.sol";
import {StabilizerVault} from "./StabilizerVault.sol";

/**
 * @title LukasHookSimplified
 * @notice Simplified hook for testing peg stabilization without full Uniswap V4
 * @dev This version doesn't inherit from BaseHook to avoid address validation issues
 * 
 * Responsibilities:
 * - Monitor LUKAS/USDC pool price
 * - Compare to fair value from LatAmBasketIndex
 * - Trigger stabilization when needed
 */
contract LukasHookSimplified {
    /// @notice The LatAm Basket Index oracle
    ILatAmBasketIndex public immutable basketIndex;
    
    /// @notice The Stabilizer Vault for mint/burn operations
    StabilizerVault public immutable stabilizerVault;
    
    /// @notice LUKAS token address
    address public immutable lukasToken;
    
    /// @notice USDC token address
    address public immutable usdcToken;
    
    /// @notice Current pool price (in 1e18 format)
    uint256 public currentPoolPrice;
    
    /// @notice Whether automatic stabilization is enabled
    bool public autoStabilize;
    
    /// @notice Minimum deviation to trigger stabilization (in basis points)
    uint256 public minDeviationBps = 100; // 1%
    
    /// @notice Minimum swap size to trigger stabilization
    uint256 public minSwapForStabilization = 100e18;

    /// @notice Emitted when peg deviation is detected
    event PegDeviation(
        uint256 poolPrice,
        uint256 fairPrice,
        int256 deviationBps,
        bool isOverPeg
    );
    
    /// @notice Emitted when stabilization is triggered
    event StabilizationTriggered(
        bool isOverPeg,
        uint256 amount,
        uint256 poolPrice,
        uint256 fairPrice
    );

    constructor(
        address _basketIndex,
        address _stabilizerVault,
        address _lukasToken,
        address _usdcToken
    ) {
        basketIndex = ILatAmBasketIndex(_basketIndex);
        stabilizerVault = StabilizerVault(payable(_stabilizerVault));
        lukasToken = _lukasToken;
        usdcToken = _usdcToken;
        
        autoStabilize = false; // Disabled by default
        currentPoolPrice = 1e18; // Start at parity
    }

    /**
     * @notice Simulate a swap and check for stabilization
     * @param swapAmount Amount being swapped
     * @param isSelling True if selling LUKAS, false if buying
     */
    function simulateSwap(uint256 swapAmount, bool isSelling) external {
        if (swapAmount < minSwapForStabilization) {
            return;
        }

        // Simulate price impact
        // Selling LUKAS: price goes down
        // Buying LUKAS: price goes up
        uint256 priceImpact = (swapAmount * 1e18) / (1000e18); // 0.1% impact per 1000 LUKAS
        
        if (isSelling) {
            currentPoolPrice = currentPoolPrice > priceImpact 
                ? currentPoolPrice - priceImpact 
                : 0;
        } else {
            currentPoolPrice = currentPoolPrice + priceImpact;
        }

        _checkAndStabilize();
    }

    /**
     * @notice Manually set pool price for testing
     */
    function setPoolPrice(uint256 price) external {
        currentPoolPrice = price;
        _checkAndStabilize();
    }

    /**
     * @notice Check peg and trigger stabilization if needed
     */
    function _checkAndStabilize() internal {
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        (int256 deviationBps, bool isOverPeg) = _calculateDeviation(currentPoolPrice, fairPrice);
        
        emit PegDeviation(currentPoolPrice, fairPrice, deviationBps, isOverPeg);
        
        // Check if deviation exceeds threshold
        uint256 absDev = deviationBps < 0 ? uint256(-deviationBps) : uint256(deviationBps);
        
        if (autoStabilize && absDev >= minDeviationBps) {
            _triggerStabilization(currentPoolPrice, fairPrice, isOverPeg);
        }
    }

    /**
     * @notice Calculate price deviation in basis points
     */
    function _calculateDeviation(uint256 poolPrice, uint256 fairPrice) 
        internal 
        pure 
        returns (int256 deviationBps, bool isOverPeg) 
    {
        if (poolPrice > fairPrice) {
            deviationBps = int256(((poolPrice - fairPrice) * 10000) / fairPrice);
            isOverPeg = true;
        } else {
            deviationBps = -int256(((fairPrice - poolPrice) * 10000) / fairPrice);
            isOverPeg = false;
        }
    }

    /**
     * @notice Trigger stabilization action
     */
    function _triggerStabilization(
        uint256 poolPrice,
        uint256 fairPrice,
        bool isOverPeg
    ) internal {
        // Calculate stabilization amount based on deviation
        uint256 deviation = isOverPeg 
            ? poolPrice - fairPrice 
            : fairPrice - poolPrice;
        
        // Scale amount proportionally to deviation
        uint256 amount = (deviation * 1000) / fairPrice;
        
        if (amount == 0) return;
        
        if (isOverPeg) {
            // Over-peg: mint to weaken price
            try stabilizerVault.stabilizeMint(amount, address(stabilizerVault)) {
                emit StabilizationTriggered(true, amount, poolPrice, fairPrice);
            } catch {
                // Stabilization failed
            }
        } else {
            // Under-peg: buyback to strengthen price
            try stabilizerVault.stabilizeBuyback(amount) {
                emit StabilizationTriggered(false, amount, poolPrice, fairPrice);
            } catch {
                // Stabilization failed
            }
        }
    }

    /**
     * @notice Get current peg status
     */
    function getPegStatus() 
        external 
        view 
        returns (
            uint256 poolPrice,
            uint256 fairPrice,
            int256 deviationBps,
            bool isOverPeg
        ) 
    {
        poolPrice = currentPoolPrice;
        fairPrice = basketIndex.getLukasFairPriceInUSDC();
        (deviationBps, isOverPeg) = _calculateDeviation(poolPrice, fairPrice);
    }

    /**
     * @notice Enable/disable automatic stabilization
     */
    function setAutoStabilize(bool enabled) external {
        autoStabilize = enabled;
    }

    /**
     * @notice Set minimum deviation threshold
     */
    function setMinDeviationBps(uint256 bps) external {
        minDeviationBps = bps;
    }

    /**
     * @notice Set minimum swap size for stabilization
     */
    function setMinSwapForStabilization(uint256 minSwap) external {
        minSwapForStabilization = minSwap;
    }
}
