import type { PriceInfo, PegStatus, BasketComposition, IndexInfo, CurrencyPriceInfo, BigNumber } from '../types';

/**
 * Oracle service interface for price and index data
 */
export interface OracleService {
  // Price operations
  getCurrentPrice(): Promise<PriceInfo>;
  getFairPrice(): Promise<BigNumber>;
  getIndexUSD(): Promise<IndexInfo>;
  getCurrencyPrice(currency: string): Promise<CurrencyPriceInfo>;
  
  // Peg operations
  getPegStatus(): Promise<PegStatus>;
  getBasketComposition(): Promise<BasketComposition>;
  hasStaleFeeds(): Promise<boolean>;
}