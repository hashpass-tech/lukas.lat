// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ILatAmBasketIndex} from "./interfaces/ILatAmBasketIndex.sol";
import {IStabilizerVault} from "./interfaces/IStabilizerVault.sol";
import {StabilizerVault} from "./StabilizerVault.sol";
import {MockPriceOracle} from "./MockPriceOracle.sol";

/**
 * @title StabilizationTester
 * @notice Test harness for LUKAS stabilization logic without full Uniswap V4
 * @dev Simulates the core stabilization logic that would be in LukasHook
 */
contract StabilizationTester {
    ILatAmBasketIndex public immutable basketIndex;
    StabilizerVault public immutable stabilizerVault;
    MockPriceOracle public immutable priceOracle;
    
    address public owner;
    bool public autoStabilize;
    uint256 public minDeviationBps; // Minimum deviation to trigger stabilization
    
    event PegDeviation(
        uint256 poolPrice,
        uint256 fairPrice,
        int256 deviationBps,
        bool isOverPeg
    );
    
    event StabilizationTriggered(
        bool isOverPeg,
        uint256 amount,
        uint256 poolPrice,
        uint256 fairPrice
    );

    constructor(
        address _basketIndex,
        address _stabilizerVault,
        address _priceOracle
    ) {
        basketIndex = ILatAmBasketIndex(_basketIndex);
        stabilizerVault = StabilizerVault(payable(_stabilizerVault));
        priceOracle = MockPriceOracle(_priceOracle);
        owner = msg.sender;
        autoStabilize = true;
        minDeviationBps = 100; // 1% minimum deviation
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @notice Check current peg status and potentially trigger stabilization
     */
    function checkAndStabilize() external {
        uint256 poolPrice = priceOracle.getPrice();
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        (int256 deviationBps, bool isOverPeg) = _calculateDeviation(poolPrice, fairPrice);
        
        emit PegDeviation(poolPrice, fairPrice, deviationBps, isOverPeg);
        
        if (autoStabilize && _shouldStabilize(uint256(deviationBps < 0 ? -deviationBps : deviationBps))) {
            _triggerStabilization(poolPrice, fairPrice, isOverPeg, uint256(deviationBps < 0 ? -deviationBps : deviationBps));
        }
    }

    /**
     * @notice Simulate a swap and check for stabilization
     * @param amountIn Amount being swapped
     * @param isLukasIn True if selling LUKAS, false if buying LUKAS
     */
    function simulateSwapAndStabilize(uint256 amountIn, bool isLukasIn) external {
        // Simulate the swap price impact
        priceOracle.simulateSwap(amountIn, isLukasIn);
        
        // Check if stabilization is needed
        this.checkAndStabilize();
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
    function _shouldStabilize(uint256 absoluteDeviationBps) internal view returns (bool) {
        return absoluteDeviationBps >= minDeviationBps;
    }

    /**
     * @notice Trigger stabilization action
     */
    function _triggerStabilization(
        uint256 poolPrice,
        uint256 fairPrice,
        bool isOverPeg,
        uint256 deviationBps
    ) internal {
        // Calculate stabilization amount based on deviation
        uint256 baseAmount = 1000e18; // Base 1000 LUKAS
        uint256 amount = (baseAmount * deviationBps) / 10000; // Scale by deviation
        
        if (amount == 0) return;
        
        // Cap at reasonable limits
        if (amount > 10000e18) amount = 10000e18; // Max 10k LUKAS
        if (amount < 100e18) amount = 100e18;     // Min 100 LUKAS
        
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

    // ============ View Functions ============

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
            bool isOverPeg,
            bool shouldStabilize
        ) 
    {
        poolPrice = priceOracle.getPrice();
        fairPrice = basketIndex.getLukasFairPriceInUSDC();
        (deviationBps, isOverPeg) = _calculateDeviation(poolPrice, fairPrice);
        
        uint256 absDeviation = uint256(deviationBps < 0 ? -deviationBps : deviationBps);
        shouldStabilize = _shouldStabilize(absDeviation);
    }

    // ============ Admin Functions ============

    function setAutoStabilize(bool _autoStabilize) external onlyOwner {
        autoStabilize = _autoStabilize;
    }

    function setMinDeviationBps(uint256 _minDeviationBps) external onlyOwner {
        minDeviationBps = _minDeviationBps;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}