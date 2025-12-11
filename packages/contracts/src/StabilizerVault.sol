// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IStabilizerVault} from "./interfaces/IStabilizerVault.sol";
import {ILatAmBasketIndex} from "./interfaces/ILatAmBasketIndex.sol";
import {LukasToken} from "./LukasToken.sol";
import {Owned} from "solmate/src/auth/Owned.sol";

/**
 * @title StabilizerVault
 * @notice Controlled module for LUKAS peg stabilization
 * @dev Executes monetary actions to maintain the LUKAS peg to the LatAm Peso Index
 * 
 * Responsibilities:
 * - Mint LUKAS when over-peg (price too high)
 * - Buyback & burn LUKAS when under-peg (price too low)
 * - Manage USDC/ETH collateral
 * - Add/remove liquidity from LUKAS/USDC pool
 * 
 * Eventually evolves into a DAO-governed module.
 */
contract StabilizerVault is IStabilizerVault, Owned {
    /// @notice The LUKAS token contract
    LukasToken public immutable lukas;
    
    /// @notice The LatAm Basket Index oracle
    ILatAmBasketIndex public immutable basketIndex;
    
    /// @notice USDC token address
    address public immutable usdc;
    
    /// @notice Addresses authorized to trigger stabilization (LukasHook, keepers)
    mapping(address => bool) public authorized;
    
    /// @notice Maximum mint per stabilization action (prevents manipulation)
    uint256 public maxMintPerAction;
    
    /// @notice Maximum buyback per stabilization action
    uint256 public maxBuybackPerAction;
    
    /// @notice Minimum deviation threshold to trigger stabilization (in bps, e.g., 100 = 1%)
    uint256 public deviationThreshold;
    
    /// @notice Cooldown between stabilization actions (prevents spam)
    uint256 public cooldownPeriod;
    
    /// @notice Last stabilization timestamp
    uint256 public lastStabilization;
    
    /// @notice Total LUKAS minted for stabilization
    uint256 public totalMinted;
    
    /// @notice Total LUKAS bought back
    uint256 public totalBoughtBack;

    event AuthorizationUpdated(address indexed account, bool authorized);
    event ParametersUpdated(uint256 maxMint, uint256 maxBuyback, uint256 threshold, uint256 cooldown);
    event CollateralDeposited(address indexed token, uint256 amount);
    event CollateralWithdrawn(address indexed token, uint256 amount, address indexed to);

    error Unauthorized();
    error CooldownNotElapsed();
    error DeviationBelowThreshold();
    error ExceedsMaxMint();
    error ExceedsMaxBuyback();
    error InsufficientCollateral();
    error ZeroAmount();

    modifier onlyAuthorized() {
        if (!authorized[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier cooldownElapsed() {
        if (block.timestamp < lastStabilization + cooldownPeriod) revert CooldownNotElapsed();
        _;
    }

    constructor(
        address _lukas,
        address _basketIndex,
        address _usdc
    ) Owned(msg.sender) {
        lukas = LukasToken(_lukas);
        basketIndex = ILatAmBasketIndex(_basketIndex);
        usdc = _usdc;
        
        // Default parameters
        maxMintPerAction = 10_000e18;      // 10,000 LUKAS max per mint
        maxBuybackPerAction = 10_000e18;   // 10,000 LUKAS max per buyback
        deviationThreshold = 100;           // 1% deviation threshold
        cooldownPeriod = 5 minutes;         // 5 minute cooldown
    }

    /**
     * @notice Update authorization for an address
     * @param account Address to update
     * @param _authorized Whether to authorize or revoke
     */
    function setAuthorized(address account, bool _authorized) external onlyOwner {
        authorized[account] = _authorized;
        emit AuthorizationUpdated(account, _authorized);
    }

    /**
     * @notice Update stabilization parameters
     */
    function setParameters(
        uint256 _maxMint,
        uint256 _maxBuyback,
        uint256 _threshold,
        uint256 _cooldown
    ) external onlyOwner {
        maxMintPerAction = _maxMint;
        maxBuybackPerAction = _maxBuyback;
        deviationThreshold = _threshold;
        cooldownPeriod = _cooldown;
        emit ParametersUpdated(_maxMint, _maxBuyback, _threshold, _cooldown);
    }

    /**
     * @inheritdoc IStabilizerVault
     * @dev Mints LUKAS to weaken price when over-peg
     */
    function stabilizeMint(uint256 amount, address recipient) 
        external 
        override 
        onlyAuthorized 
        cooldownElapsed 
    {
        if (amount == 0) revert ZeroAmount();
        if (amount > maxMintPerAction) revert ExceedsMaxMint();
        
        // Mint LUKAS to recipient (usually the pool or this vault)
        lukas.mint(recipient, amount);
        
        totalMinted += amount;
        lastStabilization = block.timestamp;
        
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        emit StabilizationMint(amount, 0, fairPrice); // poolPrice would come from hook
    }

    /**
     * @inheritdoc IStabilizerVault
     * @dev Buys back and burns LUKAS to strengthen price when under-peg
     */
    function stabilizeBuyback(uint256 amount) 
        external 
        override 
        onlyAuthorized 
        cooldownElapsed 
    {
        if (amount == 0) revert ZeroAmount();
        if (amount > maxBuybackPerAction) revert ExceedsMaxBuyback();
        
        // Check we have LUKAS to burn (from previous buyback swaps)
        if (lukas.balanceOf(address(this)) < amount) revert InsufficientCollateral();
        
        // Burn the LUKAS
        lukas.burn(address(this), amount);
        
        totalBoughtBack += amount;
        lastStabilization = block.timestamp;
        
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        emit StabilizationBuyback(amount, 0, fairPrice);
    }

    /**
     * @inheritdoc IStabilizerVault
     */
    function addLiquidity(uint256 lukasAmount, uint256 usdcAmount) 
        external 
        override 
        onlyAuthorized 
    {
        // TODO: Implement actual liquidity addition via Uniswap v4 PositionManager
        // This would involve:
        // 1. Approve tokens to PositionManager
        // 2. Call mint() or increaseLiquidity()
        
        emit LiquidityAdded(lukasAmount, usdcAmount);
    }

    /**
     * @inheritdoc IStabilizerVault
     */
    function removeLiquidity(uint256 liquidity) 
        external 
        override 
        onlyAuthorized 
    {
        // TODO: Implement actual liquidity removal via Uniswap v4 PositionManager
        
        emit LiquidityRemoved(0, 0); // Actual amounts would come from the removal
    }

    /**
     * @inheritdoc IStabilizerVault
     */
    function getCollateralBalance() 
        external 
        view 
        override 
        returns (uint256 usdcBalance, uint256 lukasBalance) 
    {
        // Read USDC balance
        (bool success, bytes memory data) = usdc.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        if (success && data.length >= 32) {
            usdcBalance = abi.decode(data, (uint256));
        }
        
        lukasBalance = lukas.balanceOf(address(this));
    }

    /**
     * @inheritdoc IStabilizerVault
     */
    function isAuthorized(address caller) external view override returns (bool) {
        return authorized[caller] || caller == owner;
    }

    /**
     * @notice Deposit collateral (USDC or LUKAS)
     * @dev Tokens must be approved before calling
     */
    function depositCollateral(address token, uint256 amount) external {
        (bool success,) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount)
        );
        require(success, "Transfer failed");
        emit CollateralDeposited(token, amount);
    }

    /**
     * @notice Withdraw collateral (owner only)
     */
    function withdrawCollateral(address token, uint256 amount, address to) external onlyOwner {
        (bool success,) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        require(success, "Transfer failed");
        emit CollateralWithdrawn(token, amount, to);
    }

    /**
     * @notice Calculate the current peg deviation
     * @param poolPrice Current pool price (1e18)
     * @return deviation Deviation in basis points (positive = over-peg, negative = under-peg)
     * @return isOverPeg True if LUKAS is trading above fair value
     */
    function calculateDeviation(uint256 poolPrice) 
        external 
        view 
        returns (int256 deviation, bool isOverPeg) 
    {
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        if (poolPrice > fairPrice) {
            deviation = int256(((poolPrice - fairPrice) * 10000) / fairPrice);
            isOverPeg = true;
        } else {
            deviation = -int256(((fairPrice - poolPrice) * 10000) / fairPrice);
            isOverPeg = false;
        }
    }

    /**
     * @notice Check if stabilization should be triggered
     * @param poolPrice Current pool price (1e18)
     * @return shouldStabilize True if deviation exceeds threshold
     * @return isOverPeg True if over-peg (should mint)
     * @return deviationBps Absolute deviation in basis points
     */
    function shouldStabilize(uint256 poolPrice) 
        external 
        view 
        returns (bool shouldStabilize, bool isOverPeg, uint256 deviationBps) 
    {
        uint256 fairPrice = basketIndex.getLukasFairPriceInUSDC();
        
        if (poolPrice > fairPrice) {
            deviationBps = ((poolPrice - fairPrice) * 10000) / fairPrice;
            isOverPeg = true;
        } else {
            deviationBps = ((fairPrice - poolPrice) * 10000) / fairPrice;
            isOverPeg = false;
        }
        
        shouldStabilize = deviationBps >= deviationThreshold && 
                          block.timestamp >= lastStabilization + cooldownPeriod;
    }

    /// @notice Receive ETH for collateral
    receive() external payable {}
}
