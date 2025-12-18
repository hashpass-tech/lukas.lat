import type { TransactionResponse } from 'ethers';
import type { BigNumber } from '../types';

/**
 * Swap quote information
 */
export interface SwapQuote {
  amountIn: BigNumber;
  amountOut: BigNumber;
  priceImpact: number; // Percentage
  minimumAmountOut: BigNumber; // With slippage
  path: string[]; // Token addresses in swap path
}

/**
 * Swap service interface for token swapping operations
 */
export interface SwapService {
  /**
   * Get a quote for swapping tokens
   */
  getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber,
    slippageTolerance?: number
  ): Promise<SwapQuote>;

  /**
   * Execute a token swap
   */
  executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber,
    minimumAmountOut: BigNumber,
    recipient?: string
  ): Promise<TransactionResponse>;

  /**
   * Get the current price of LUKAS in USDC
   */
  getLukasPrice(): Promise<BigNumber>;

  /**
   * Check if a pool exists for the token pair
   */
  poolExists(tokenA: string, tokenB: string): Promise<boolean>;
}
