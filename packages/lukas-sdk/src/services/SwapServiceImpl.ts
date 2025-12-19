import { Contract, TransactionResponse } from 'ethers';
import type { BigNumber, SwapQuote } from '../types';
import type { SwapService } from './SwapService';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Implementation of SwapService for token swapping operations
 * Integrates with Uniswap V4 pools for LUKAS/USDC trading
 */
export class SwapServiceImpl implements SwapService {
  private poolManager: Contract;
  private swapRouter: Contract;
  private lukasTokenAddress: string;
  private usdcAddress: string;

  constructor(
    poolManager: Contract,
    swapRouter: Contract,
    lukasTokenAddress: string,
    usdcAddress: string
  ) {
    if (!poolManager || !swapRouter) {
      throw new Error('Pool manager and swap router contracts are required');
    }
    this.poolManager = poolManager;
    this.swapRouter = swapRouter;
    this.lukasTokenAddress = lukasTokenAddress;
    this.usdcAddress = usdcAddress;
  }

  /**
   * Get a quote for swapping tokens
   */
  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber,
    slippageTolerance: number = 0.5
  ): Promise<SwapQuote> {
    try {
      // Validate token pair
      if (!this.isValidTokenPair(tokenIn, tokenOut)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_PARAMETERS,
          `Invalid token pair: ${tokenIn} -> ${tokenOut}`
        );
      }

      // Check if pool exists
      const exists = await this.poolExists(tokenIn, tokenOut);
      if (!exists) {
        throw new LukasSDKError(
          LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
          'Pool does not exist for this token pair'
        );
      }

      // Get quote from pool (simulated swap)
      const amountOut = await this.simulateSwap(tokenIn, tokenOut, amountIn);

      // Calculate price impact
      const priceImpact = await this.calculatePriceImpact(tokenIn, tokenOut, amountIn, amountOut);

      // Calculate minimum amount out with slippage
      const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100));
      const minimumAmountOut = (BigInt(amountOut) * slippageMultiplier / BigInt(10000)).toString();

      return {
        amountIn,
        amountOut,
        priceImpact,
        minimumAmountOut,
        path: [tokenIn, tokenOut],
      };
    } catch (error) {
      if (error instanceof LukasSDKError) {
        throw error;
      }
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get swap quote',
        error
      );
    }
  }

  /**
   * Execute a token swap
   * Handles token approvals and executes the swap through the PoolManager
   */
  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber,
    minimumAmountOut: BigNumber,
    recipient?: string
  ): Promise<TransactionResponse> {
    try {
      // Validate token pair
      if (!this.isValidTokenPair(tokenIn, tokenOut)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_PARAMETERS,
          `Invalid token pair: ${tokenIn} -> ${tokenOut}`
        );
      }

      // Check if pool exists
      const exists = await this.poolExists(tokenIn, tokenOut);
      if (!exists) {
        throw new LukasSDKError(
          LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
          'Pool does not exist for this token pair'
        );
      }

      // Get signer for transaction
      const signer = (this.swapRouter as any).signer;
      if (!signer) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_PARAMETERS,
          'No signer available for swap execution'
        );
      }

      // Get recipient address (default to signer)
      const recipientAddress = recipient || await signer.getAddress();

      // Approve token spending if needed
      // Get token contract for approval
      const tokenABI = [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ];
      
      const tokenInContract = new Contract(tokenIn, tokenABI, signer);

      // Check current allowance
      const currentAllowance = await (tokenInContract as any).allowance(
        await signer.getAddress(),
        this.swapRouter.address
      );

      // If allowance is insufficient, approve the swap router
      if (BigInt(currentAllowance) < BigInt(amountIn)) {
        const approveTx = await (tokenInContract as any).approve(
          this.swapRouter.address,
          amountIn
        );
        await approveTx.wait();
      }

      // Build swap parameters
      // Determine swap direction (zeroForOne)
      const zeroForOne = tokenIn.toLowerCase() < tokenOut.toLowerCase();

      const swapParams = {
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMinimum: minimumAmountOut,
        recipient: recipientAddress,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
        zeroForOne,
      };

      // Execute swap
      const tx = await (this.swapRouter as any).swap(swapParams);
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) {
        throw error;
      }
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to execute swap: ${tokenIn} -> ${tokenOut}`,
        error
      );
    }
  }

  /**
   * Get the current price of LUKAS in USDC
   */
  async getLukasPrice(): Promise<BigNumber> {
    try {
      // Check if pool exists
      const exists = await this.poolExists(this.lukasTokenAddress, this.usdcAddress);
      if (!exists) {
        throw new LukasSDKError(
          LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
          'LUKAS/USDC pool does not exist'
        );
      }

      // Get current pool state
      const slot0 = await (this.poolManager as any).getSlot0(
        this.getPoolKey(this.lukasTokenAddress, this.usdcAddress)
      );

      // Extract sqrtPriceX96 from slot0
      const sqrtPriceX96 = slot0.sqrtPriceX96;

      // Convert sqrtPriceX96 to price
      // price = (sqrtPriceX96 / 2^96)^2
      const price = this.sqrtPriceX96ToPrice(sqrtPriceX96);

      return price.toString();
    } catch (error) {
      if (error instanceof LukasSDKError) {
        throw error;
      }
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get LUKAS price',
        error
      );
    }
  }

  /**
   * Check if a pool exists for the token pair
   */
  async poolExists(tokenA: string, tokenB: string): Promise<boolean> {
    try {
      const poolKey = this.getPoolKey(tokenA, tokenB);
      const poolId = await (this.poolManager as any).getPoolId(poolKey);
      
      // If poolId is zero, pool doesn't exist
      return poolId !== '0x0000000000000000000000000000000000000000000000000000000000000000';
    } catch (error) {
      // If call fails, assume pool doesn't exist
      return false;
    }
  }

  /**
   * Simulate a swap to get expected output amount using constant product formula
   * Formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
   * This accounts for the 0.3% fee (997/1000)
   */
  private async simulateSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber
  ): Promise<BigNumber> {
    try {
      // Get pool state to extract reserves
      const poolKey = this.getPoolKey(tokenIn, tokenOut);
      const slot0 = await (this.poolManager as any).getSlot0(poolKey);
      
      // For Uniswap V4, we need to use the sqrtPriceX96 to calculate output
      // Using the constant product formula with fee adjustment
      const amountInBigInt = BigInt(amountIn);
      const FEE_NUMERATOR = BigInt(997); // 0.3% fee = 1000 - 3
      const FEE_DENOMINATOR = BigInt(1000);
      
      // Calculate amountOut using constant product formula
      // amountOut = (amountIn * 997) / (1000 + (amountIn * 997) / reserveIn)
      // Simplified: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
      
      // For now, use a simplified calculation based on sqrtPriceX96
      const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96);
      const Q96 = BigInt(2) ** BigInt(96);
      
      // Calculate price from sqrtPriceX96
      // price = (sqrtPriceX96 / 2^96)^2
      const priceNumerator = sqrtPriceX96 * sqrtPriceX96;
      const priceDenominator = Q96 * Q96;
      
      // Calculate output amount: amountOut = amountIn * price * (1 - fee)
      const amountOutBeforeFee = (amountInBigInt * priceNumerator) / priceDenominator;
      const amountOut = (amountOutBeforeFee * FEE_NUMERATOR) / FEE_DENOMINATOR;
      
      return amountOut.toString();
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to simulate swap',
        error
      );
    }
  }

  /**
   * Calculate price impact of a swap
   * Price impact = (spotPrice - executionPrice) / spotPrice * 100
   * This represents the percentage difference between the current price and execution price
   */
  private async calculatePriceImpact(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber,
    amountOut: BigNumber
  ): Promise<number> {
    try {
      // Get current spot price
      const spotPrice = await this.getSpotPrice(tokenIn, tokenOut);
      
      // Calculate execution price (amountOut / amountIn)
      const amountInNum = Number(amountIn);
      const amountOutNum = Number(amountOut);
      
      if (amountInNum === 0) {
        return 0;
      }
      
      const executionPrice = amountOutNum / amountInNum;
      
      // Calculate price impact as percentage
      // Negative impact means worse price for user
      const priceImpact = ((spotPrice - executionPrice) / spotPrice) * 100;
      
      // Return absolute value to represent impact magnitude
      return Math.max(0, priceImpact);
    } catch (error) {
      // If we can't calculate price impact, return 0
      return 0;
    }
  }

  /**
   * Get spot price from pool
   */
  private async getSpotPrice(tokenA: string, tokenB: string): Promise<number> {
    try {
      const poolKey = this.getPoolKey(tokenA, tokenB);
      const slot0 = await (this.poolManager as any).getSlot0(poolKey);
      const sqrtPriceX96 = slot0.sqrtPriceX96;
      
      return this.sqrtPriceX96ToPrice(sqrtPriceX96);
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get spot price',
        error
      );
    }
  }

  /**
   * Convert sqrtPriceX96 to human-readable price
   */
  private sqrtPriceX96ToPrice(sqrtPriceX96: bigint): number {
    const Q96 = BigInt(2) ** BigInt(96);
    const price = (sqrtPriceX96 * sqrtPriceX96) / (Q96 * Q96);
    return Number(price) / 1e12; // Adjust for decimals
  }

  /**
   * Get pool key for token pair
   */
  private getPoolKey(tokenA: string, tokenB: string): any {
    // Sort tokens to get consistent pool key
    const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];

    return {
      currency0: token0,
      currency1: token1,
      fee: 3000, // 0.3% fee tier
      tickSpacing: 60,
      hooks: '0x0000000000000000000000000000000000000000', // No hooks for now
    };
  }

  /**
   * Validate if token pair is supported
   */
  private isValidTokenPair(tokenA: string, tokenB: string): boolean {
    const validTokens = [
      this.lukasTokenAddress.toLowerCase(),
      this.usdcAddress.toLowerCase(),
    ];

    return (
      validTokens.includes(tokenA.toLowerCase()) &&
      validTokens.includes(tokenB.toLowerCase()) &&
      tokenA.toLowerCase() !== tokenB.toLowerCase()
    );
  }
}
