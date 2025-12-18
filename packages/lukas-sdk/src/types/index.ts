import type { BigNumberish } from 'ethers';

// Type alias for BigNumber to maintain compatibility
export type BigNumber = BigNumberish;

/**
 * Token information interface
 */
export interface TokenInfo {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Token decimals */
  decimals: number;
  /** Total supply */
  totalSupply: BigNumber;
  /** Contract address */
  address: string;
}

/**
 * Vault information interface
 */
export interface VaultInfo {
  /** Maximum mint amount per action */
  maxMintPerAction: BigNumber;
  /** Maximum buyback amount per action */
  maxBuybackPerAction: BigNumber;
  /** Deviation threshold in basis points */
  deviationThreshold: number;
  /** Cooldown period in seconds */
  cooldownPeriod: number;
  /** Timestamp of last stabilization */
  lastStabilization: number;
  /** Total amount minted */
  totalMinted: BigNumber;
  /** Total amount bought back */
  totalBoughtBack: BigNumber;
}

/**
 * Price information interface
 */
export interface PriceInfo {
  /** Price value */
  price: BigNumber;
  /** Price decimals */
  decimals: number;
  /** Timestamp of price update */
  timestamp: number;
  /** Source of price data */
  source: string;
}

/**
 * Peg status interface
 */
export interface PegStatus {
  /** Current pool price */
  poolPrice: BigNumber;
  /** Fair price from oracle */
  fairPrice: BigNumber;
  /** Deviation in basis points */
  deviation: number;
  /** Whether price is over peg */
  isOverPeg: boolean;
  /** Whether stabilization should occur */
  shouldStabilize: boolean;
}

/**
 * Basket composition interface
 */
export interface BasketComposition {
  /** Currency symbols */
  currencies: string[];
  /** Currency weights in basis points */
  weights: number[];
  /** Individual currency prices */
  prices: BigNumber[];
  /** Last update timestamps */
  lastUpdated: number[];
}

/**
 * Stabilization check result
 */
export interface StabilizationCheck {
  /** Whether stabilization should occur */
  shouldStabilize: boolean;
  /** Whether price is over peg */
  isOverPeg: boolean;
  /** Deviation in basis points */
  deviationBps: number;
  /** Recommended stabilization amount */
  recommendedAmount: BigNumber;
  /** Whether operation can be executed */
  canExecute: boolean;
  /** Reason if operation cannot be executed */
  reason?: string;
}

/**
 * Collateral balance information
 */
export interface CollateralBalance {
  /** USDC balance */
  usdc: BigNumber;
  /** LUKAS balance */
  lukas: BigNumber;
  /** Total value in USD */
  totalValueUSD: BigNumber;
}

/**
 * Index information
 */
export interface IndexInfo {
  /** Index value in USD */
  valueUSD: BigNumber;
  /** Last update timestamp */
  lastUpdated: number;
  /** Whether index is stale */
  isStale: boolean;
}

/**
 * Currency price information
 */
export interface CurrencyPriceInfo {
  /** Currency symbol */
  currency: string;
  /** Price in USD */
  priceUSD: BigNumber;
  /** Last update timestamp */
  lastUpdated: number;
  /** Whether price is stale */
  isStale: boolean;
}

/**
 * Swap quote information
 */
export interface SwapQuote {
  /** Input amount */
  amountIn: BigNumber;
  /** Expected output amount */
  amountOut: BigNumber;
  /** Price impact percentage */
  priceImpact: number;
  /** Minimum amount out with slippage */
  minimumAmountOut: BigNumber;
  /** Token addresses in swap path */
  path: string[];
}

/**
 * Transfer event
 */
export interface TransferEvent {
  /** From address */
  from: string;
  /** To address */
  to: string;
  /** Transfer amount */
  amount: BigNumber;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Approval event
 */
export interface ApprovalEvent {
  /** Owner address */
  owner: string;
  /** Spender address */
  spender: string;
  /** Approved amount */
  amount: BigNumber;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}


/**
 * Stabilization mint event
 */
export interface StabilizationMintEvent {
  /** Mint amount */
  amount: BigNumber;
  /** Pool price at time of mint */
  poolPrice: BigNumber;
  /** Fair price at time of mint */
  fairPrice: BigNumber;
  /** Recipient address */
  recipient: string;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Stabilization buyback event
 */
export interface StabilizationBuybackEvent {
  /** Buyback amount */
  amount: BigNumber;
  /** Pool price at time of buyback */
  poolPrice: BigNumber;
  /** Fair price at time of buyback */
  fairPrice: BigNumber;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Vault parameter update event
 */
export interface VaultParameterUpdateEvent {
  /** Parameter name that was updated */
  parameterName: string;
  /** Old parameter value */
  oldValue: BigNumber;
  /** New parameter value */
  newValue: BigNumber;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}


/**
 * Union type for all event data
 */
export type EventData =
  | TransferEvent
  | ApprovalEvent
  | StabilizationMintEvent
  | StabilizationBuybackEvent
  | VaultParameterUpdateEvent
  | IndexUpdateEvent
  | PegDeviationEvent
  | LiquidityAddedEvent
  | LiquidityRemovedEvent;

/**
 * Index update event
 */
export interface IndexUpdateEvent {
  /** Updated index value in USD */
  valueUSD: BigNumber;
  /** Currencies in the basket */
  currencies: string[];
  /** Currency weights in basis points */
  weights: number[];
  /** Individual currency prices */
  prices: BigNumber[];
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Peg deviation event
 */
export interface PegDeviationEvent {
  /** Pool price */
  poolPrice: BigNumber;
  /** Fair price */
  fairPrice: BigNumber;
  /** Deviation in basis points */
  deviationBps: number;
  /** Whether price is over peg */
  isOverPeg: boolean;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Liquidity added event
 */
export interface LiquidityAddedEvent {
  /** Provider address */
  provider: string;
  /** Liquidity amount */
  liquidity: BigNumber;
  /** Lower tick */
  tickLower: number;
  /** Upper tick */
  tickUpper: number;
  /** Amount of token 0 */
  amount0: BigNumber;
  /** Amount of token 1 */
  amount1: BigNumber;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Liquidity removed event
 */
export interface LiquidityRemovedEvent {
  /** Provider address */
  provider: string;
  /** Liquidity amount */
  liquidity: BigNumber;
  /** Lower tick */
  tickLower: number;
  /** Upper tick */
  tickUpper: number;
  /** Amount of token 0 */
  amount0: BigNumber;
  /** Amount of token 1 */
  amount1: BigNumber;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Stabilization history entry
 */
export interface StabilizationHistoryEntry {
  /** Type of stabilization action (mint or buyback) */
  actionType: 'mint' | 'buyback';
  /** Amount of stabilization */
  amount: BigNumber;
  /** Pool price at time of action */
  poolPrice: BigNumber;
  /** Fair price at time of action */
  fairPrice: BigNumber;
  /** Recipient address (for mint actions) */
  recipient?: string;
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: string;
  /** Timestamp of action */
  timestamp: number;
}

/**
 * Stabilization history query result
 */
export interface StabilizationHistory {
  /** Array of stabilization history entries */
  entries: StabilizationHistoryEntry[];
  /** Total number of entries matching the query */
  total: number;
  /** Current page number */
  page: number;
  /** Number of entries per page */
  pageSize: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Stabilization history query options
 */
export interface StabilizationHistoryOptions {
  /** Start timestamp (inclusive) */
  startTime?: number;
  /** End timestamp (inclusive) */
  endTime?: number;
  /** Filter by action type */
  actionType?: 'mint' | 'buyback';
  /** Page number (1-indexed) */
  page?: number;
  /** Number of entries per page */
  pageSize?: number;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}
