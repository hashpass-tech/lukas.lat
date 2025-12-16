import type { TransactionResponse } from 'ethers';
import type { TokenInfo, BigNumber } from '../types';

/**
 * Token service interface for LUKAS token operations
 */
export interface TokenService {
  // Read operations
  getTokenInfo(): Promise<TokenInfo>;
  getBalance(address: string): Promise<BigNumber>;
  getAllowance(owner: string, spender: string): Promise<BigNumber>;
  getTotalSupply(): Promise<BigNumber>;
  
  // Write operations
  transfer(to: string, amount: BigNumber): Promise<TransactionResponse>;
  approve(spender: string, amount: BigNumber): Promise<TransactionResponse>;
  transferFrom(from: string, to: string, amount: BigNumber): Promise<TransactionResponse>;
}