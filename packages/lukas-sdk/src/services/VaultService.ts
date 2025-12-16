import type { TransactionResponse } from 'ethers';
import type { VaultInfo, CollateralBalance, StabilizationCheck, BigNumber } from '../types';

/**
 * Vault service interface for stabilization operations
 */
export interface VaultService {
  // Read operations
  getVaultInfo(): Promise<VaultInfo>;
  getCollateralBalance(): Promise<CollateralBalance>;
  isAuthorized(address: string): Promise<boolean>;
  shouldStabilize(poolPrice: BigNumber): Promise<StabilizationCheck>;
  
  // Write operations (authorized only)
  stabilizeMint(amount: BigNumber, recipient: string): Promise<TransactionResponse>;
  stabilizeBuyback(amount: BigNumber): Promise<TransactionResponse>;
}