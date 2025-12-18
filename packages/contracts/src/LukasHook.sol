// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "./periphery/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

import {ILatAmBasketIndex} from "./interfaces/ILatAmBasketIndex.sol";
import {IStabilizerVault} from "./interfaces/IStabilizerVault.sol";
import {StabilizerVault} from "./StabilizerVault.sol";

/**
 * @title LukasHook
 * @notice Uniswap v4 hook for LUKAS/USDC pool peg stabilization
 * @dev Attached to the LUKAS/USDC pool to monitor and maintain the peg
 * 
 * Responsibilities:
 * - Read LUKAS pool mid-price after each swap
 * - Compare to fair value from LatAmBasketIndex
 * - Emit peg deviation events
 * - Optionally trigger StabilizerVault actions:
 *   - Mint LUKAS (over-peg) → weaken price
 *   - Buyback & burn LUKAS (under-peg) → strengthen price
 * 
 * Stabilization Logic:
 * - If LUKAS too expensive: mint small amount → increase supply → weaken price
 * - If LUKAS too cheap: buyback & burn → decrease supply → strengthen price
 */
contract LukasHook is BaseHook {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    /// @notice The LatAm Basket Index oracle
    ILatAmBasketIndex public immutable basketIndex;
    
    /// @notice The Stabilizer Vault for mint/burn operations
    StabilizerVault public immutable stabilizerVault;
    
    /// @notice LUKAS token address
    address public immutable lukasToken;
    
    /// @notice USDC token address
    address public immutable usdcToken;
    
    /// @notice Whether automatic stabilization is enabled
    bool public autoStabilize;
    
    /// @notice Minimum swap size to trigger stabilization check (prevents dust attacks)
    uint256 public minSwapForStabilization;

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

    error InvalidPool();

    constructor(
        IPoolManager _poolManager,
        address _basketIndex,
        address _stabilizerVault,
        address _lukasToken,
        address _usdcToken
    ) BaseHook(_poolManager) {
        basketIndex = ILatAmBasketIndex(_basketIndex);
        stabilizerVault = StabilizerVault(payable(_stabilizerVault));
        lukasToken = _lukasToken;
        usdcToken = _usdcToken;
        
        autoStabilize = false; // Disabled by default, enable after testing
        minSwapForStabilization = 100e18; // 100 LUKAS/USDC minimum

        validateHookAddress(this);
    }

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: true,  // Validate pool configuration
                afterInitialize: false,
                beforeAddLiquidity: false,
                afterAddLiquidity: false,
                beforeRemoveLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: false,
                afterSwap: true,          // Monitor price after swaps
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }

    function validateHookAddress(BaseHook _this) internal pure override {
        Hooks.validateHookPermissions(_this, getHookPermissions());
    }

    /**
     * @notice Validate pool initialization
     * @dev Ensures the pool is LUKAS/USDC with correct configuration
     */
    function _beforeInitialize(
        address,
        PoolKey calldata key,
        uint160
    ) internal override returns (bytes4) {
        // Verify this is a LUKAS/USDC pool
        address token0 = Currency.unwrap(key.currency0);
        address token1 = Currency.unwrap(key.currency1);
        
        bool isValidPair = (token0 == lukasToken && token1 == usdcToken) ||
                           (token0 == usdcToken && token1 == lukasToken);
        
        if (!isValidPair) revert InvalidPool();
        
        return BaseHook.beforeInitialize.selector;
    }

    /**
     * @notice Monitor price after each swap and potentially trigger stabilization
     */
    function _afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata swapParams,
        BalanceDelta delta,
        bytes calldata
    ) internal override returns (bytes4, int128) {
        // Get current pool price
        uint256 poolPrice = _getPoolPrice(key);
        
        // Get fair price from basket index
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        // Calculate deviation
        (int256 deviationBps, bool isOverPeg) = _calculateDeviation(poolPrice, fairPrice);
        
        // Emit deviation event for off-chain monitoring
        emit PegDeviation(poolPrice, fairPrice, deviationBps, isOverPeg);
        
        // Check if we should trigger stabilization
        if (autoStabilize && _shouldStabilize(swapParams, delta)) {
            _triggerStabilization(poolPrice, fairPrice, isOverPeg);
        }
        
        return (BaseHook.afterSwap.selector, 0);
    }

    /**
     * @notice Get the current pool mid-price
     * @dev Converts sqrtPriceX96 to a human-readable price in 1e18
     */
    function _getPoolPrice(PoolKey calldata key) internal view returns (uint256) {
        PoolId poolId = key.toId();
        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(poolId);
        
        // Convert sqrtPriceX96 to price
        // price = (sqrtPriceX96 / 2^96)^2
        // For 1e18 precision: price = (sqrtPriceX96^2 * 1e18) / 2^192
        uint256 price = uint256(sqrtPriceX96) * uint256(sqrtPriceX96);
        
        // Scale to 1e18
        // Note: This assumes token0 is LUKAS and token1 is USDC
        // Adjust if the pair is reversed
        return (price * 1e18) >> 192;
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
     * @notice Check if stabilization should be triggered
     */
    function _shouldStabilize(
        IPoolManager.SwapParams calldata swapParams,
        BalanceDelta delta
    ) internal view returns (bool) {
        // Check minimum swap size
        uint256 swapSize = swapParams.amountSpecified < 0 
            ? uint256(-swapParams.amountSpecified) 
            : uint256(swapParams.amountSpecified);
            
        if (swapSize < minSwapForStabilization) {
            return false;
        }
        
        // Delegate to vault's shouldStabilize logic
        // This checks deviation threshold and cooldown
        return true; // Simplified; actual logic in vault
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
        
        // Scale amount proportionally to deviation (simplified)
        uint256 amount = (deviation * 1000) / fairPrice; // 0.1% of deviation
        
        if (amount == 0) return;
        
        // Cap at vault limits
        if (isOverPeg) {
            // Over-peg: mint to weaken price
            try stabilizerVault.stabilizeMint(amount, address(stabilizerVault)) {
                emit StabilizationTriggered(true, amount, poolPrice, fairPrice);
            } catch {
                // Stabilization failed (cooldown, limits, etc.)
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

    // ============ Admin Functions ============

    /**
     * @notice Enable/disable automatic stabilization
     */
    function setAutoStabilize(bool enabled) external {
        // In production, add access control
        autoStabilize = enabled;
    }

    /**
     * @notice Set minimum swap size for stabilization
     */
    function setMinSwapForStabilization(uint256 minSwap) external {
        // In production, add access control
        minSwapForStabilization = minSwap;
    }

    function _beforeAddLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) internal override returns (bytes4) {
        return BaseHook.beforeAddLiquidity.selector;
    }

    function _beforeRemoveLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) internal override returns (bytes4) {
        return BaseHook.beforeRemoveLiquidity.selector;
    }

    function _afterAddLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) internal override returns (bytes4, BalanceDelta) {
        return (BaseHook.afterAddLiquidity.selector, BalanceDeltaLibrary.ZERO_DELTA);
    }

    function _afterRemoveLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) internal override returns (bytes4, BalanceDelta) {
        return (BaseHook.afterRemoveLiquidity.selector, BalanceDeltaLibrary.ZERO_DELTA);
    }

    function _beforeSwap(
        address,
        PoolKey calldata,
        IPoolManager.SwapParams calldata,
        bytes calldata
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterInitialize(
        address,
        PoolKey calldata,
        uint160,
        int24
    ) internal override returns (bytes4) {
        return BaseHook.afterInitialize.selector;
    }

    function _beforeDonate(
        address,
        PoolKey calldata,
        uint256,
        uint256,
        bytes calldata
    ) internal override returns (bytes4) {
        return BaseHook.beforeDonate.selector;
    }

    function _afterDonate(
        address,
        PoolKey calldata,
        uint256,
        uint256,
        bytes calldata
    ) internal override returns (bytes4) {
        return BaseHook.afterDonate.selector;
    }

    // ============ View Functions ============

    /**
     * @notice Get current peg status
     * @param key The pool key
     * @return poolPrice Current pool price (1e18)
     * @return fairPrice Fair price from basket index (1e18)
     * @return deviationBps Deviation in basis points
     * @return isOverPeg True if trading above fair value
     */
    function getPegStatus(PoolKey calldata key) 
        external 
        view 
        returns (
            uint256 poolPrice,
            uint256 fairPrice,
            int256 deviationBps,
            bool isOverPeg
        ) 
    {
        poolPrice = _getPoolPrice(key);
        fairPrice = basketIndex.getLukasFairPriceInUSDC();
        (deviationBps, isOverPeg) = _calculateDeviation(poolPrice, fairPrice);
    }
}
