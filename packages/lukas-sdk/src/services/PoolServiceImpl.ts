import { Contract } from 'ethers';
import type { PoolService, PoolState, PoolLiquidity, Transaction } from './PoolService';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Implementation of PoolService for pool operations
 */
export class PoolServiceImpl implements PoolService {
  private poolManager: Contract;
  private oracleContract: Contract;
  private lukasTokenAddress: string;
  private usdcAddress: string;
  private subscriptions: Map<string, (state: PoolState) => void> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    poolManager: Contract,
    oracleContract: Contract,
    lukasTokenAddress: string,
    usdcAddress: string
  ) {
    if (!poolManager || !oracleContract) {
      throw new Error('Pool manager and oracle contracts are required');
    }
    this.poolManager = poolManager;
    this.oracleContract = oracleContract;
    this.lukasTokenAddress = lukasTokenAddress;
    this.usdcAddress = usdcAddress;
  }

  /**
   * Get current pool price
   */
  async getPoolPrice(): Promise<number> {
    try {
      const poolState = await this.getPoolState();
      return poolState.price;
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get pool price',
        error
      );
    }
  }

  /**
   * Get pool state
   */
  async getPoolState(): Promise<PoolState> {
    try {
      const poolKey = this.getPoolKey();
      
      // Get slot0 from pool manager
      const slot0 = await (this.poolManager as any).getSlot0(poolKey);
      
      // Get liquidity
      const liquidity = await (this.poolManager as any).getLiquidity(poolKey);
      
      // Convert sqrtPriceX96 to price
      const price = this.sqrtPriceX96ToPrice(slot0.sqrtPriceX96);
      
      return {
        price,
        sqrtPriceX96: slot0.sqrtPriceX96,
        tick: slot0.tick,
        liquidity,
        volume24h: 0, // TODO: Calculate from events
        feeGrowthToken0: slot0.feeGrowthGlobal0X128 || BigInt(0),
        feeGrowthToken1: slot0.feeGrowthGlobal1X128 || BigInt(0),
      };
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get pool state',
        error
      );
    }
  }

  /**
   * Get pool liquidity
   */
  async getPoolLiquidity(): Promise<PoolLiquidity> {
    try {
      const poolKey = this.getPoolKey();
      
      // Get liquidity amounts from pool
      const liquidityAmount = await (this.poolManager as any).getLiquidity(poolKey);
      
      // Get current price to calculate USD value
      const poolPrice = await this.getPoolPrice();
      
      // Estimate token amounts (simplified - would need actual position data)
      const token0Amount = BigInt(0); // TODO: Calculate from liquidity
      const token1Amount = BigInt(0); // TODO: Calculate from liquidity
      
      // Calculate total value (using liquidity amount and price)
      const totalValueUSD = Number(liquidityAmount) * poolPrice;
      
      return {
        token0: token0Amount,
        token1: token1Amount,
        totalValueUSD,
      };
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get pool liquidity',
        error
      );
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      const poolKey = this.getPoolKey();
      
      // Get pool ID from pool key
      const poolId = await (this.poolManager as any).getPoolId(poolKey);
      
      // Query Swap events from the pool
      const swapFilter = (this.poolManager as any).filters.Swap(poolId);
      const swapEvents = await this.poolManager.queryFilter(swapFilter);
      
      // Parse events and convert to Transaction objects
      const transactions: Transaction[] = [];
      
      for (const event of swapEvents) {
        try {
          // Type guard to check if this is an EventLog with args
          if (!('args' in event)) {
            continue;
          }
          
          const args = event.args as any;
          
          // Determine token direction based on amount signs
          const amount0 = args.amount0 as bigint;
          const amount1 = args.amount1 as bigint;
          
          const tokenIn = amount0 < 0n ? this.lukasTokenAddress : this.usdcAddress;
          const tokenOut = amount0 < 0n ? this.usdcAddress : this.lukasTokenAddress;
          const amountIn = amount0 < 0n ? -amount0 : amount1;
          const amountOut = amount0 < 0n ? amount1 : -amount0;
          
          // Get transaction receipt for gas info
          const receipt = await event.getTransactionReceipt();
          
          // Calculate price impact
          const currentPrice = this.sqrtPriceX96ToPrice(args.sqrtPriceX96);
          const executionPrice = Number(amountOut) / Number(amountIn);
          const priceImpact = ((executionPrice - currentPrice) / currentPrice) * 100;
          
          transactions.push({
            hash: event.transactionHash,
            type: 'swap',
            tokenIn,
            tokenOut,
            amountIn,
            amountOut: amountOut < 0n ? -amountOut : amountOut,
            priceImpact,
            timestamp: (await event.getBlock()).timestamp,
            blockNumber: event.blockNumber,
            gasUsed: receipt?.gasUsed || BigInt(0),
            from: event.transactionHash, // Will be updated with actual from address
            status: 'confirmed',
          });
        } catch (eventError) {
          // Log error but continue processing other events
          console.error('Error processing swap event:', eventError);
        }
      }
      
      // Sort by timestamp descending and apply pagination
      transactions.sort((a, b) => b.timestamp - a.timestamp);
      const paginatedTransactions = transactions.slice(offset, offset + limit);
      
      return paginatedTransactions;
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get transaction history',
        error
      );
    }
  }

  /**
   * Subscribe to pool updates
   */
  subscribeToPoolUpdates(callback: (state: PoolState) => void): () => void {
    const subscriptionId = Math.random().toString(36).substring(2, 11);
    this.subscriptions.set(subscriptionId, callback);

    // Start polling if this is the first subscription
    if (this.subscriptions.size === 1) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(subscriptionId);
      
      // Stop polling if no more subscriptions
      if (this.subscriptions.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Get 24-hour volume
   */
  async getVolume24h(): Promise<number> {
    try {
      // TODO: Calculate from swap events in the last 24 hours
      return 0;
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get 24-hour volume',
        error
      );
    }
  }

  /**
   * Get price deviation from fair value
   */
  async getPriceDeviation(): Promise<number> {
    try {
      // Get current pool price
      const poolPrice = await this.getPoolPrice();
      
      // Get fair price from oracle
      const fairPrice = await (this.oracleContract as any).getLukasFairPriceInUSDC();
      const fairPriceNumber = Number(fairPrice) / 1e6; // Assuming 6 decimals
      
      // Calculate deviation percentage
      const deviation = Math.abs((poolPrice - fairPriceNumber) / fairPriceNumber) * 100;
      
      return deviation;
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get price deviation',
        error
      );
    }
  }

  /**
   * Start polling for pool updates
   */
  private startPolling(): void {
    this.updateInterval = setInterval(async () => {
      try {
        const poolState = await this.getPoolState();
        
        // Notify all subscribers
        for (const callback of this.subscriptions.values()) {
          callback(poolState);
        }
      } catch (error) {
        // Log error but don't throw - polling should continue
        console.error('Error polling pool state:', error);
      }
    }, 10000); // Poll every 10 seconds
  }

  /**
   * Stop polling for pool updates
   */
  private stopPolling(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Convert sqrtPriceX96 to human-readable price
   * Formula: price = (sqrtPriceX96 / 2^96)^2
   */
  private sqrtPriceX96ToPrice(sqrtPriceX96: bigint): number {
    // sqrtPriceX96 is in Q64.96 format
    // price = (sqrtPriceX96 / 2^96)^2
    const Q96 = BigInt(2) ** BigInt(96);
    
    // Convert to decimal: sqrtPrice = sqrtPriceX96 / 2^96
    const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
    
    // price = sqrtPrice^2
    const price = sqrtPrice * sqrtPrice;
    
    // Adjust for token decimals (LUKAS: 18, USDC: 6)
    // price is in USDC per LUKAS, so we need to adjust for decimal difference
    return price / 1e12; // 18 - 6 = 12 decimal places
  }

  /**
   * Get pool key for LUKAS/USDC pair
   */
  private getPoolKey(): any {
    // Sort tokens to get consistent pool key
    const [token0, token1] = this.lukasTokenAddress.toLowerCase() < this.usdcAddress.toLowerCase()
      ? [this.lukasTokenAddress, this.usdcAddress]
      : [this.usdcAddress, this.lukasTokenAddress];

    return {
      currency0: token0,
      currency1: token1,
      fee: 3000, // 0.3% fee tier
      tickSpacing: 60,
      hooks: '0x0000000000000000000000000000000000000000', // No hooks
    };
  }
}
