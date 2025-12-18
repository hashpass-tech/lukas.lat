import { Contract, TransactionResponse, isAddress, BigNumberish } from 'ethers';
import type { VaultInfo, CollateralBalance, StabilizationCheck, BigNumber } from '../types';
import type { VaultService } from './VaultService';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Implementation of VaultService for stabilization operations
 */
export class VaultServiceImpl implements VaultService {
  private contract: Contract;
  private contractAddress: string;
  private stabilizationMintListeners: Map<string, (event: any) => void> = new Map();
  private stabilizationBuybackListeners: Map<string, (event: any) => void> = new Map();
  private vaultParameterUpdateListeners: Map<string, (event: any) => void> = new Map();
  private listenerCounter = 0;

  constructor(contract: Contract, contractAddress: string) {
    if (!contract) {
      throw new Error('Contract instance is required');
    }
    if (!contractAddress || !isAddress(contractAddress)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_ADDRESS,
        `Invalid contract address: ${contractAddress}`
      );
    }
    this.contract = contract;
    this.contractAddress = contractAddress;
  }

  /**
   * Validate an Ethereum address
   */
  private validateAddress(address: string, fieldName: string = 'address'): void {
    if (!address || !isAddress(address)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_ADDRESS,
        `Invalid ${fieldName}: ${address}`
      );
    }
  }

  /**
   * Validate an amount is a valid positive number
   */
  private validateAmount(amount: BigNumberish, fieldName: string = 'amount'): void {
    if (amount === null || amount === undefined) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_AMOUNT,
        `${fieldName} is required`
      );
    }

    try {
      const amountBN = typeof amount === 'string' ? BigInt(amount) : BigInt(amount.toString());
      if (amountBN < 0n) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_AMOUNT,
          `${fieldName} must be non-negative`
        );
      }
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_AMOUNT,
        `Invalid ${fieldName}: ${amount}`
      );
    }
  }

  /**
   * Get vault information including parameters and limits
   */
  async getVaultInfo(): Promise<VaultInfo> {
    try {
      const vaultData = await (this.contract as any).getVaultInfo();

      // Validate response structure
      if (!vaultData || typeof vaultData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid vault info data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const maxMintPerAction = vaultData.maxMintPerAction || vaultData[0];
      const maxBuybackPerAction = vaultData.maxBuybackPerAction || vaultData[1];
      const deviationThreshold = vaultData.deviationThreshold || vaultData[2];
      const cooldownPeriod = vaultData.cooldownPeriod || vaultData[3];
      const lastStabilization = vaultData.lastStabilization || vaultData[4];
      const totalMinted = vaultData.totalMinted || vaultData[5];
      const totalBoughtBack = vaultData.totalBoughtBack || vaultData[6];

      // Validate required fields
      if (maxMintPerAction === null || maxMintPerAction === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid maxMintPerAction in vault info'
        );
      }
      if (maxBuybackPerAction === null || maxBuybackPerAction === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid maxBuybackPerAction in vault info'
        );
      }

      return {
        maxMintPerAction: maxMintPerAction.toString(),
        maxBuybackPerAction: maxBuybackPerAction.toString(),
        deviationThreshold: Number(deviationThreshold || 0),
        cooldownPeriod: Number(cooldownPeriod || 0),
        lastStabilization: Number(lastStabilization || 0),
        totalMinted: totalMinted.toString(),
        totalBoughtBack: totalBoughtBack.toString(),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get vault info',
        error
      );
    }
  }

  /**
   * Get collateral balance information
   */
  async getCollateralBalance(): Promise<CollateralBalance> {
    try {
      const collateralData = await (this.contract as any).getCollateralBalance();

      // Validate response structure
      if (!collateralData || typeof collateralData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid collateral balance data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const usdc = collateralData.usdc || collateralData[0];
      const lukas = collateralData.lukas || collateralData[1];
      const totalValueUSD = collateralData.totalValueUSD || collateralData[2];

      // Validate required fields
      if (usdc === null || usdc === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid USDC balance in collateral data'
        );
      }
      if (lukas === null || lukas === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid LUKAS balance in collateral data'
        );
      }

      return {
        usdc: usdc.toString(),
        lukas: lukas.toString(),
        totalValueUSD: totalValueUSD.toString(),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get collateral balance',
        error
      );
    }
  }

  /**
   * Check if an address is authorized for vault operations
   */
  async isAuthorized(address: string): Promise<boolean> {
    try {
      this.validateAddress(address, 'address');
      const authorized = await (this.contract as any).isAuthorized(address);

      // Validate response
      if (typeof authorized !== 'boolean') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid authorization status returned from contract'
        );
      }

      return authorized;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        `Failed to check authorization for ${address}`,
        error
      );
    }
  }

  /**
   * Check if stabilization should occur based on pool price
   */
  async shouldStabilize(poolPrice: BigNumber): Promise<StabilizationCheck> {
    try {
      this.validateAmount(poolPrice, 'pool price');

      const stabilizationData = await (this.contract as any).shouldStabilize(poolPrice);

      // Validate response structure
      if (!stabilizationData || typeof stabilizationData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid stabilization check data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const shouldStabilize = stabilizationData.shouldStabilize || stabilizationData[0];
      const isOverPeg = stabilizationData.isOverPeg || stabilizationData[1];
      const deviationBps = stabilizationData.deviationBps || stabilizationData[2];
      const recommendedAmount = stabilizationData.recommendedAmount || stabilizationData[3];
      const canExecute = stabilizationData.canExecute || stabilizationData[4];
      const reason = stabilizationData.reason || stabilizationData[5];

      // Validate required fields
      if (shouldStabilize === null || shouldStabilize === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid shouldStabilize in stabilization check'
        );
      }

      const result: any = {
        shouldStabilize: Boolean(shouldStabilize),
        isOverPeg: Boolean(isOverPeg || false),
        deviationBps: Number(deviationBps || 0),
        recommendedAmount: recommendedAmount.toString(),
        canExecute: Boolean(canExecute || false),
      };

      if (reason) {
        result.reason = String(reason);
      }

      return result;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to check stabilization status',
        error
      );
    }
  }

  /**
   * Execute stabilization mint operation (authorized only)
   */
  async stabilizeMint(amount: BigNumber, recipient: string): Promise<TransactionResponse> {
    try {
      this.validateAmount(amount, 'mint amount');
      this.validateAddress(recipient, 'recipient address');

      const tx = await (this.contract as any).stabilizeMint(amount, recipient);
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to execute stabilization mint of ${amount} to ${recipient}`,
        error
      );
    }
  }

  /**
   * Execute stabilization buyback operation (authorized only)
   */
  async stabilizeBuyback(amount: BigNumber): Promise<TransactionResponse> {
    try {
      this.validateAmount(amount, 'buyback amount');

      const tx = await (this.contract as any).stabilizeBuyback(amount);
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to execute stabilization buyback of ${amount}`,
        error
      );
    }
  }

  /**
   * Subscribe to StabilizationMint events
   */
  onStabilizationMint(callback: (event: any) => void): () => void {
    const listenerId = `stabilizationMint_${this.listenerCounter++}`;
    this.stabilizationMintListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const stabilizationMintFilter = (this.contract as any).filters.StabilizationMint?.();
    if (stabilizationMintFilter) {
      const listener = (
        amount: BigNumberish,
        poolPrice: BigNumberish,
        fairPrice: BigNumberish,
        recipient: string,
        event: any
      ) => {
        const stabilizationMintEvent = {
          amount: amount.toString(),
          poolPrice: poolPrice.toString(),
          fairPrice: fairPrice.toString(),
          recipient,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Math.floor(Date.now() / 1000),
        };
        callback(stabilizationMintEvent);
      };

      (this.contract as any).on(stabilizationMintFilter, listener);

      // Return unsubscribe function
      return () => {
        this.stabilizationMintListeners.delete(listenerId);
        (this.contract as any).off(stabilizationMintFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.stabilizationMintListeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to StabilizationBuyback events
   */
  onStabilizationBuyback(callback: (event: any) => void): () => void {
    const listenerId = `stabilizationBuyback_${this.listenerCounter++}`;
    this.stabilizationBuybackListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const stabilizationBuybackFilter = (this.contract as any).filters.StabilizationBuyback?.();
    if (stabilizationBuybackFilter) {
      const listener = (
        amount: BigNumberish,
        poolPrice: BigNumberish,
        fairPrice: BigNumberish,
        event: any
      ) => {
        const stabilizationBuybackEvent = {
          amount: amount.toString(),
          poolPrice: poolPrice.toString(),
          fairPrice: fairPrice.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Math.floor(Date.now() / 1000),
        };
        callback(stabilizationBuybackEvent);
      };

      (this.contract as any).on(stabilizationBuybackFilter, listener);

      // Return unsubscribe function
      return () => {
        this.stabilizationBuybackListeners.delete(listenerId);
        (this.contract as any).off(stabilizationBuybackFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.stabilizationBuybackListeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to VaultParameterUpdate events
   */
  onVaultParameterUpdate(callback: (event: any) => void): () => void {
    const listenerId = `vaultParameterUpdate_${this.listenerCounter++}`;
    this.vaultParameterUpdateListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const vaultParameterUpdateFilter = (this.contract as any).filters.VaultParameterUpdate?.();
    if (vaultParameterUpdateFilter) {
      const listener = (
        parameterName: string,
        oldValue: BigNumberish,
        newValue: BigNumberish,
        event: any
      ) => {
        const vaultParameterUpdateEvent = {
          parameterName,
          oldValue: oldValue.toString(),
          newValue: newValue.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Math.floor(Date.now() / 1000),
        };
        callback(vaultParameterUpdateEvent);
      };

      (this.contract as any).on(vaultParameterUpdateFilter, listener);

      // Return unsubscribe function
      return () => {
        this.vaultParameterUpdateListeners.delete(listenerId);
        (this.contract as any).off(vaultParameterUpdateFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.vaultParameterUpdateListeners.delete(listenerId);
    };
  }

  /**
   * Get stabilization history with optional filtering and pagination
   */
  async getStabilizationHistory(options?: any): Promise<any> {
    try {
      // Set default options
      const queryOptions = {
        startTime: options?.startTime || 0,
        endTime: options?.endTime || Math.floor(Date.now() / 1000),
        actionType: options?.actionType || undefined,
        page: options?.page || 1,
        pageSize: options?.pageSize || 50,
        sortOrder: options?.sortOrder || 'desc',
      };

      // Validate pagination parameters
      if (queryOptions.page < 1) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_PARAMETERS,
          'Page number must be at least 1'
        );
      }
      if (queryOptions.pageSize < 1 || queryOptions.pageSize > 1000) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_PARAMETERS,
          'Page size must be between 1 and 1000'
        );
      }

      // Call contract method to get history
      const historyData = await (this.contract as any).getStabilizationHistory(
        queryOptions.startTime,
        queryOptions.endTime,
        queryOptions.actionType,
        queryOptions.page,
        queryOptions.pageSize,
        queryOptions.sortOrder
      );

      // Validate response structure
      if (!historyData || typeof historyData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid stabilization history data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const entries = historyData.entries || historyData[0];
      const total = historyData.total || historyData[1];
      const page = historyData.page || historyData[2];
      const pageSize = historyData.pageSize || historyData[3];
      const hasMore = historyData.hasMore || historyData[4];

      // Validate required fields
      if (!Array.isArray(entries)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid entries array in stabilization history'
        );
      }

      // Convert entries to proper format
      const formattedEntries = entries.map((entry: any) => ({
        actionType: entry.actionType || entry[0],
        amount: (entry.amount || entry[1]).toString(),
        poolPrice: (entry.poolPrice || entry[2]).toString(),
        fairPrice: (entry.fairPrice || entry[3]).toString(),
        recipient: entry.recipient || entry[4],
        blockNumber: Number(entry.blockNumber || entry[5]),
        transactionHash: entry.transactionHash || entry[6],
        timestamp: Number(entry.timestamp || entry[7]),
      }));

      return {
        entries: formattedEntries,
        total: Number(total || 0),
        page: Number(page || 1),
        pageSize: Number(pageSize || 50),
        hasMore: Boolean(hasMore || false),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get stabilization history',
        error
      );
    }
  }
}
