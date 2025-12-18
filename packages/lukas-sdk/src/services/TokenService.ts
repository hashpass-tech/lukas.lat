import type { TransactionResponse } from 'ethers';
import type { TokenInfo, BigNumber, TransferEvent, ApprovalEvent } from '../types';

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
  
  // Event operations
  onTransfer(callback: (event: TransferEvent) => void): () => void;
  onApproval(callback: (event: ApprovalEvent) => void): () => void;
}