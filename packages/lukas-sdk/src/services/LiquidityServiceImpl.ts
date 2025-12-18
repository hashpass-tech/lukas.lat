import { Contract, TransactionResponse, isAddress, BigNumberish } from 'ethers';
import type { BigNumber } from '../types';
import type { LiquidityService } from './LiquidityService';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Liquidity position information
 */
export interface LiquidityPosition {
  liquidity: BigNumber;
  lukasAmount: BigNumber;
  usdcAmount: BigNumber;
}

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
 * Implementation of LiquidityService for Uniswap v4 pool operations
 */
export class LiquidityServiceImpl implements LiquidityService {
  private contract: Contract;
  private contractAddress: string;
  private liquidityAddedListeners: Map<string, (event: any) => void> = new Map();
  private liquidityRemovedListeners: Map<string, (event: any) => void> = new Map();
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
   * Validate token balances before liquidity operation
   */
  private async validateTokenBalances(
    lukasAmount: BigNumber,
    usdcAmount: BigNumber,
    userAddress?: string
  ): Promise<void> {
    try {
      // If user address is provided, check balances
      if (userAddress) {
        this.validateAddress(userAddress, 'user address');

        // Get token balances (assuming contract has methods to check balances)
        const lukasBalance = await (this.contract as any).getLukasBalance?.(userAddress);
        const usdcBalance = await (this.contract as any).getUsdcBalance?.(userAddress);

        if (lukasBalance !== undefined && lukasBalance !== null) {
          const lukasAmountBN = typeof lukasAmount === 'string' ? BigInt(lukasAmount) : BigInt(lukasAmount.toString());
          const lukasBalanceBN = typeof lukasBalance === 'string' ? BigInt(lukasBalance) : BigInt(lukasBalance.toString());

          if (lukasBalanceBN < lukasAmountBN) {
            throw new LukasSDKError(
              LukasSDKErrorCode.INSUFFICIENT_BALANCE,
              `Insufficient LUKAS balance. Required: ${lukasAmount}, Available: ${lukasBalance}`
            );
          }
        }

        if (usdcBalance !== undefined && usdcBalance !== null) {
          const usdcAmountBN = typeof usdcAmount === 'string' ? BigInt(usdcAmount) : BigInt(usdcAmount.toString());
          const usdcBalanceBN = typeof usdcBalance === 'string' ? BigInt(usdcBalance) : BigInt(usdcBalance.toString());

          if (usdcBalanceBN < usdcAmountBN) {
            throw new LukasSDKError(
              LukasSDKErrorCode.INSUFFICIENT_BALANCE,
              `Insufficient USDC balance. Required: ${usdcAmount}, Available: ${usdcBalance}`
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      // Non-critical validation error, continue
    }
  }

  /**
   * Calculate minimum amounts with slippage tolerance
   */
  private calculateMinimumAmounts(
    lukasAmount: BigNumber,
    usdcAmount: BigNumber,
    slippageTolerance: number = 50 // default 0.5%
  ): { minLukas: BigNumber; minUsdc: BigNumber } {
    const lukasAmountBN = typeof lukasAmount === 'string' ? BigInt(lukasAmount) : BigInt(lukasAmount.toString());
    const usdcAmountBN = typeof usdcAmount === 'string' ? BigInt(usdcAmount) : BigInt(usdcAmount.toString());

    // Calculate minimum amounts: amount * (1 - slippage / 10000)
    const slippageMultiplier = BigInt(10000 - slippageTolerance);
    const minLukas = (lukasAmountBN * slippageMultiplier) / 10000n;
    const minUsdc = (usdcAmountBN * slippageMultiplier) / 10000n;

    return {
      minLukas: minLukas.toString(),
      minUsdc: minUsdc.toString(),
    };
  }

  /**
   * Perform pre-flight checks before liquidity operation
   */
  async preFlightCheck(
    lukasAmount: BigNumber,
    usdcAmount: BigNumber,
    userAddress?: string
  ): Promise<PreFlightCheckResult> {
    try {
      const warnings: string[] = [];

      // Validate amounts
      this.validateAmount(lukasAmount, 'LUKAS amount');
      this.validateAmount(usdcAmount, 'USDC amount');

      const lukasAmountBN = typeof lukasAmount === 'string' ? BigInt(lukasAmount) : BigInt(lukasAmount.toString());
      const usdcAmountBN = typeof usdcAmount === 'string' ? BigInt(usdcAmount) : BigInt(usdcAmount.toString());

      if (lukasAmountBN === 0n || usdcAmountBN === 0n) {
        return {
          canExecute: false,
          reason: 'Both LUKAS and USDC amounts must be greater than zero',
        };
      }

      // Check for very large amounts
      const maxAmount = BigInt('999999999999999999999999999999'); // Very large number
      if (lukasAmountBN > maxAmount || usdcAmountBN > maxAmount) {
        warnings.push('Amounts are unusually large');
      }

      // Validate token balances if user address provided
      if (userAddress) {
        try {
          await this.validateTokenBalances(lukasAmount, usdcAmount, userAddress);
        } catch (error) {
          if (error instanceof LukasSDKError && error.code === LukasSDKErrorCode.INSUFFICIENT_BALANCE) {
            return {
              canExecute: false,
              reason: error.message,
            };
          }
          warnings.push(`Balance check warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        canExecute: true,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        canExecute: false,
        reason: error instanceof Error ? error.message : 'Unknown error during pre-flight check',
      };
    }
  }

  /**
   * Add liquidity to the LUKAS/USDC pool
   */
  async addLiquidity(
    lukasAmount: BigNumber,
    usdcAmount: BigNumber,
    options?: LiquidityOperationOptions
  ): Promise<TransactionResponse> {
    try {
      this.validateAmount(lukasAmount, 'LUKAS amount');
      this.validateAmount(usdcAmount, 'USDC amount');

      // Verify both amounts are positive
      const lukasAmountBN = typeof lukasAmount === 'string' ? BigInt(lukasAmount) : BigInt(lukasAmount.toString());
      const usdcAmountBN = typeof usdcAmount === 'string' ? BigInt(usdcAmount) : BigInt(usdcAmount.toString());

      if (lukasAmountBN === 0n || usdcAmountBN === 0n) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_AMOUNT,
          'Both LUKAS and USDC amounts must be greater than zero'
        );
      }

      // Calculate minimum amounts with slippage tolerance
      const slippageTolerance = options?.slippageTolerance || 50; // default 0.5%
      const { minLukas, minUsdc } = this.calculateMinimumAmounts(
        lukasAmount,
        usdcAmount,
        slippageTolerance
      );

      // Use provided minimum amounts or calculated ones
      const finalMinLukas = options?.minLukasAmount || minLukas;
      const finalMinUsdc = options?.minUsdcAmount || minUsdc;

      const tx = await (this.contract as any).addLiquidity(
        lukasAmount,
        usdcAmount,
        finalMinLukas,
        finalMinUsdc
      );
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to add liquidity: ${lukasAmount} LUKAS and ${usdcAmount} USDC`,
        error
      );
    }
  }

  /**
   * Remove liquidity from the LUKAS/USDC pool
   */
  async removeLiquidity(liquidity: BigNumber): Promise<TransactionResponse> {
    try {
      this.validateAmount(liquidity, 'liquidity amount');

      // Verify liquidity amount is positive
      const liquidityBN = typeof liquidity === 'string' ? BigInt(liquidity) : BigInt(liquidity.toString());
      if (liquidityBN === 0n) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_AMOUNT,
          'Liquidity amount must be greater than zero'
        );
      }

      const tx = await (this.contract as any).removeLiquidity(liquidity);
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to remove liquidity: ${liquidity}`,
        error
      );
    }
  }

  /**
   * Get liquidity position for an address
   */
  async getLiquidityPosition(address: string): Promise<LiquidityPosition> {
    try {
      this.validateAddress(address, 'address');

      const positionData = await (this.contract as any).getLiquidityPosition(address);

      // Validate response structure
      if (!positionData || typeof positionData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid liquidity position data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const liquidity = positionData.liquidity || positionData[0];
      const lukasAmount = positionData.lukasAmount || positionData[1];
      const usdcAmount = positionData.usdcAmount || positionData[2];

      // Validate required fields
      if (liquidity === null || liquidity === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid liquidity in position data'
        );
      }
      if (lukasAmount === null || lukasAmount === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid LUKAS amount in position data'
        );
      }
      if (usdcAmount === null || usdcAmount === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid USDC amount in position data'
        );
      }

      return {
        liquidity: liquidity.toString(),
        lukasAmount: lukasAmount.toString(),
        usdcAmount: usdcAmount.toString(),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        `Failed to get liquidity position for ${address}`,
        error
      );
    }
  }

  /**
   * Subscribe to LiquidityAdded events
   */
  onLiquidityAdded(callback: (event: any) => void): () => void {
    const listenerId = `liquidityAdded_${this.listenerCounter++}`;
    this.liquidityAddedListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const liquidityAddedFilter = (this.contract as any).filters.LiquidityAdded?.();
    if (liquidityAddedFilter) {
      const listener = (
        provider: string,
        lukasAmount: BigNumberish,
        usdcAmount: BigNumberish,
        liquidity: BigNumberish,
        event: any
      ) => {
        const liquidityAddedEvent = {
          provider,
          lukasAmount: lukasAmount.toString(),
          usdcAmount: usdcAmount.toString(),
          liquidity: liquidity.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Math.floor(Date.now() / 1000),
        };
        callback(liquidityAddedEvent);
      };

      (this.contract as any).on(liquidityAddedFilter, listener);

      // Return unsubscribe function
      return () => {
        this.liquidityAddedListeners.delete(listenerId);
        (this.contract as any).off(liquidityAddedFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.liquidityAddedListeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to LiquidityRemoved events
   */
  onLiquidityRemoved(callback: (event: any) => void): () => void {
    const listenerId = `liquidityRemoved_${this.listenerCounter++}`;
    this.liquidityRemovedListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const liquidityRemovedFilter = (this.contract as any).filters.LiquidityRemoved?.();
    if (liquidityRemovedFilter) {
      const listener = (
        provider: string,
        lukasAmount: BigNumberish,
        usdcAmount: BigNumberish,
        liquidity: BigNumberish,
        event: any
      ) => {
        const liquidityRemovedEvent = {
          provider,
          lukasAmount: lukasAmount.toString(),
          usdcAmount: usdcAmount.toString(),
          liquidity: liquidity.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Math.floor(Date.now() / 1000),
        };
        callback(liquidityRemovedEvent);
      };

      (this.contract as any).on(liquidityRemovedFilter, listener);

      // Return unsubscribe function
      return () => {
        this.liquidityRemovedListeners.delete(listenerId);
        (this.contract as any).off(liquidityRemovedFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.liquidityRemovedListeners.delete(listenerId);
    };
  }
}
