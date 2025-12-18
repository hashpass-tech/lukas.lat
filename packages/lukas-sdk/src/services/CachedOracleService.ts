import { Contract } from 'ethers';
import type { PriceInfo, PegStatus, BasketComposition, IndexInfo, CurrencyPriceInfo, BigNumber } from '../types';
import type { OracleService } from './OracleService';
import { OracleServiceImpl } from './OracleServiceImpl';
import { CacheManager } from '../utils/CacheManager';
import { BatchManager } from '../utils/BatchManager';

/**
 * CachedOracleService wraps OracleServiceImpl with intelligent caching and batching
 * 
 * Provides:
 * - TTL-based caching for price and oracle data
 * - Request batching for multiple concurrent calls
 * - Stale-while-revalidate patterns for price feeds
 * - Automatic cache invalidation on oracle updates
 */
export class CachedOracleService implements OracleService {
  private baseService: OracleServiceImpl;
  private cacheManager: CacheManager;
  private batchManager: BatchManager;
  private contractAddress: string;

  constructor(
    contract: Contract,
    contractAddress: string,
    cacheManager?: CacheManager,
    batchManager?: BatchManager
  ) {
    this.baseService = new OracleServiceImpl(contract, contractAddress);
    this.contractAddress = contractAddress;
    this.cacheManager = cacheManager || new CacheManager(30000, 1000);
    this.batchManager = batchManager || new BatchManager(100, 50);
  }

  /**
   * Get current price with caching and batching
   */
  async getCurrentPrice(): Promise<PriceInfo> {
    const cacheKey = `currentPrice:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<PriceInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `currentPrice:${this.contractAddress}`,
      'getCurrentPrice',
      () => this.baseService.getCurrentPrice()
    );

    // Cache the result with shorter TTL for price data
    this.cacheManager.set(cacheKey, result, 15000); // 15 second TTL for prices

    return result;
  }

  /**
   * Get fair price with caching and batching
   */
  async getFairPrice(): Promise<BigNumber> {
    const cacheKey = `fairPrice:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<BigNumber>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `fairPrice:${this.contractAddress}`,
      'getFairPrice',
      () => this.baseService.getFairPrice()
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 15000); // 15 second TTL

    return result;
  }

  /**
   * Get index USD with caching and batching
   */
  async getIndexUSD(): Promise<IndexInfo> {
    const cacheKey = `indexUSD:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<IndexInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `indexUSD:${this.contractAddress}`,
      'getIndexUSD',
      () => this.baseService.getIndexUSD()
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 20000); // 20 second TTL

    return result;
  }

  /**
   * Get currency price with caching and batching
   */
  async getCurrencyPrice(currency: string): Promise<CurrencyPriceInfo> {
    const cacheKey = CacheManager.generateKey('currencyPrice', this.contractAddress, currency);

    // Check cache first
    const cached = this.cacheManager.get<CurrencyPriceInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `currencyPrice:${this.contractAddress}`,
      currency,
      () => this.baseService.getCurrencyPrice(currency)
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 15000); // 15 second TTL

    return result;
  }

  /**
   * Get peg status with caching and batching
   */
  async getPegStatus(): Promise<PegStatus> {
    const cacheKey = `pegStatus:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<PegStatus>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `pegStatus:${this.contractAddress}`,
      'getPegStatus',
      () => this.baseService.getPegStatus()
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 15000); // 15 second TTL

    return result;
  }

  /**
   * Get basket composition with caching and batching
   */
  async getBasketComposition(): Promise<BasketComposition> {
    const cacheKey = `basketComposition:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<BasketComposition>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `basketComposition:${this.contractAddress}`,
      'getBasketComposition',
      () => this.baseService.getBasketComposition()
    );

    // Cache the result with longer TTL since basket composition changes less frequently
    this.cacheManager.set(cacheKey, result, 60000); // 1 minute TTL

    return result;
  }

  /**
   * Check for stale feeds with caching
   */
  async hasStaleFeeds(): Promise<boolean> {
    const cacheKey = `hasStaleFeeds:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `hasStaleFeeds:${this.contractAddress}`,
      'hasStaleFeeds',
      () => this.baseService.hasStaleFeeds()
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 10000); // 10 second TTL for staleness checks

    return result;
  }

  /**
   * Subscribe to IndexUpdate events
   */
  onIndexUpdate(callback: (event: any) => void): () => void {
    // Wrap callback to invalidate cache on index update
    const wrappedCallback = (event: any) => {
      this.invalidatePriceCache();
      callback(event);
    };

    return this.baseService.onIndexUpdate(wrappedCallback);
  }

  /**
   * Subscribe to PegDeviation events
   */
  onPegDeviation(callback: (event: any) => void): () => void {
    // Wrap callback to invalidate cache on peg deviation
    const wrappedCallback = (event: any) => {
      this.invalidatePegCache();
      callback(event);
    };

    return this.baseService.onPegDeviation(wrappedCallback);
  }

  /**
   * Invalidate price-related caches
   */
  private invalidatePriceCache(): void {
    this.cacheManager.deletePattern(
      `^(currentPrice|fairPrice|indexUSD|currencyPrice):${this.contractAddress}`
    );
  }

  /**
   * Invalidate peg-related caches
   */
  private invalidatePegCache(): void {
    this.cacheManager.deletePattern(`^pegStatus:${this.contractAddress}`);
  }

  /**
   * Get cache manager
   */
  getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * Get batch manager
   */
  getBatchManager(): BatchManager {
    return this.batchManager;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cacheManager.deletePattern(
      `^(currentPrice|fairPrice|indexUSD|currencyPrice|pegStatus|basketComposition|hasStaleFeeds):${this.contractAddress}`
    );
  }
}
