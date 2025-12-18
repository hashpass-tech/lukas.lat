import type { TransactionResponse } from 'ethers';
import type { VaultInfo, CollateralBalance, StabilizationCheck, BigNumber, StabilizationMintEvent, StabilizationBuybackEvent, VaultParameterUpdateEvent, StabilizationHistory, StabilizationHistoryOptions } from '../types';

/**
 * Vault service interface for stabilization operations
 */
export interface VaultService {
  // Read operations
  getVaultInfo(): Promise<VaultInfo>;
  getCollateralBalance(): Promise<CollateralBalance>;
  isAuthorized(address: string): Promise<boolean>;
  shouldStabilize(poolPrice: BigNumber): Promise<StabilizationCheck>;
  getStabilizationHistory(options?: StabilizationHistoryOptions): Promise<StabilizationHistory>;
  
  // Write operations (authorized only)
  stabilizeMint(amount: BigNumber, recipient: string): Promise<TransactionResponse>;
  stabilizeBuyback(amount: BigNumber): Promise<TransactionResponse>;
  
  // Event operations
  onStabilizationMint(callback: (event: StabilizationMintEvent) => void): () => void;
  onStabilizationBuyback(callback: (event: StabilizationBuybackEvent) => void): () => void;
  onVaultParameterUpdate(callback: (event: VaultParameterUpdateEvent) => void): () => void;
}