import type { TransactionResponse } from 'ethers';
import type { BigNumber } from '../types';

/**
 * Liquidity operation options
 */
export interface LiquidityOperationOptions {
  slippageTolerance?: number; // in basis points (e.g., 50 = 0.5%)
  minLukasAmount?: BigNumber;
  minUsdcAmount?: BigNumber;
}

/**
 * Pre-flight check result
 */
export interface PreFlightCheckResult {
  canExecute: boolean;
  reason?: string;
  warnings?: string[];
}

/**
 * Liquidity service interface for pool operations
 */
export interface LiquidityService {
  // Liquidity operations
  addLiquidity(
    lukasAmount: BigNumber,
    usdcAmount: BigNumber,
    options?: LiquidityOperationOptions
  ): Promise<TransactionResponse>;
  removeLiquidity(liquidity: BigNumber): Promise<TransactionResponse>;
  
  // Query operations
  getLiquidityPosition(address: string): Promise<{
    liquidity: BigNumber;
    lukasAmount: BigNumber;
    usdcAmount: BigNumber;
  }>;

  // Validation operations
  preFlightCheck(
    lukasAmount: BigNumber,
    usdcAmount: BigNumber,
    userAddress?: string
  ): Promise<PreFlightCheckResult>;

  // Event subscriptions
  onLiquidityAdded(callback: (event: any) => void): () => void;
  onLiquidityRemoved(callback: (event: any) => void): () => void;
}