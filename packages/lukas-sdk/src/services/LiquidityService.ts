import type { TransactionResponse } from 'ethers';
import type { BigNumber } from '../types';

/**
 * Liquidity service interface for pool operations
 */
export interface LiquidityService {
  // Liquidity operations
  addLiquidity(lukasAmount: BigNumber, usdcAmount: BigNumber): Promise<TransactionResponse>;
  removeLiquidity(liquidity: BigNumber): Promise<TransactionResponse>;
  
  // Query operations
  getLiquidityPosition(address: string): Promise<{
    liquidity: BigNumber;
    lukasAmount: BigNumber;
    usdcAmount: BigNumber;
  }>;
}