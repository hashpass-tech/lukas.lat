

/**
 * Pool state information
 */
export interface PoolState {
  /** Current pool price (LUKAS per USDC) */
  price: number;
  /** sqrtPriceX96 from pool */
  sqrtPriceX96: bigint;
  /** Current tick */
  tick: number;
  /** Total liquidity in pool */
  liquidity: bigint;
  /** 24-hour volume */
  volume24h: number;
  /** Fee growth for token0 */
  feeGrowthToken0: bigint;
  /** Fee growth for token1 */
  feeGrowthToken1: bigint;
}

/**
 * Pool liquidity information
 */
export interface PoolLiquidity {
  /** Token0 liquidity */
  token0: bigint;
  /** Token1 liquidity */
  token1: bigint;
  /** Total value in USD */
  totalValueUSD: number;
}

/**
 * Transaction information
 */
export interface Transaction {
  /** Transaction hash */
  hash: string;
  /** Transaction type */
  type: 'swap' | 'add_liquidity' | 'remove_liquidity';
  /** Input token address */
  tokenIn: string;
  /** Output token address */
  tokenOut: string;
  /** Input amount */
  amountIn: bigint;
  /** Output amount */
  amountOut: bigint;
  /** Price impact percentage */
  priceImpact: number;
  /** Transaction timestamp */
  timestamp: number;
  /** Block number */
  blockNumber: number;
  /** Gas used */
  gasUsed: bigint;
  /** From address */
  from: string;
  /** Transaction status */
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Pool service interface for pool operations
 */
export interface PoolService {
  /**
   * Get current pool price
   */
  getPoolPrice(): Promise<number>;

  /**
   * Get pool state
   */
  getPoolState(): Promise<PoolState>;

  /**
   * Get pool liquidity
   */
  getPoolLiquidity(): Promise<PoolLiquidity>;

  /**
   * Get transaction history
   */
  getTransactionHistory(limit?: number, offset?: number): Promise<Transaction[]>;

  /**
   * Subscribe to pool updates
   */
  subscribeToPoolUpdates(callback: (state: PoolState) => void): () => void;

  /**
   * Get 24-hour volume
   */
  getVolume24h(): Promise<number>;

  /**
   * Get price deviation from fair value
   */
  getPriceDeviation(): Promise<number>;
}
