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