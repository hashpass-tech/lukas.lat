import { Contract, TransactionResponse } from 'ethers';
import type { TokenInfo, BigNumber, TransferEvent, ApprovalEvent } from '../types';
import type { TokenService } from './TokenService';
import { TokenServiceImpl } from './TokenServiceImpl';
import { CacheManager } from '../utils/CacheManager';
import { BatchManager } from '../utils/BatchManager';

/**
 * CachedTokenService wraps TokenServiceImpl with intelligent caching and batching
 * 
 * Provides:
 * - TTL-based caching for read operations
 * - Request batching for multiple concurrent calls
 * - Cache invalidation on write operations
 * - Stale-while-revalidate patterns
 */
export class CachedTokenService implements TokenService {
  private baseService: TokenServiceImpl;
  private cacheManager: CacheManager;
  private batchManager: BatchManager;
  private contractAddress: string;

  constructor(
    contract: Contract,
    contractAddress: string,
    cacheManager?: CacheManager,
    batchManager?: BatchManager
  ) {
    this.baseService = new TokenServiceImpl(contract, contractAddress);
    this.contractAddress = contractAddress;
    this.cacheManager = cacheManager || new CacheManager(30000, 1000);
    this.batchManager = batchManager || new BatchManager(100, 50);
  }

  /**
   * Get token information with caching
   */
  async getTokenInfo(): Promise<TokenInfo> {
    const cacheKey = `tokenInfo:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<TokenInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `tokenInfo:${this.contractAddress}`,
      'getTokenInfo',
      () => this.baseService.getTokenInfo()
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 60000); // 1 minute TTL for token info

    return result;
  }

  /**
   * Get token balance with caching and batching
   */
  async getBalance(address: string): Promise<BigNumber> {
    const cacheKey = CacheManager.generateKey('balance', this.contractAddress, address);

    // Check cache first
    const cached = this.cacheManager.get<BigNumber>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `balance:${this.contractAddress}`,
      address,
      () => this.baseService.getBalance(address)
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 30000); // 30 second TTL for balances

    return result;
  }

  /**
   * Get allowance with caching and batching
   */
  async getAllowance(owner: string, spender: string): Promise<BigNumber> {
    const cacheKey = CacheManager.generateKey('allowance', this.contractAddress, owner, spender);

    // Check cache first
    const cached = this.cacheManager.get<BigNumber>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `allowance:${this.contractAddress}`,
      CacheManager.generateKey(owner, spender),
      () => this.baseService.getAllowance(owner, spender)
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 30000); // 30 second TTL for allowances

    return result;
  }

  /**
   * Get total supply with caching
   */
  async getTotalSupply(): Promise<BigNumber> {
    const cacheKey = `totalSupply:${this.contractAddress}`;

    // Check cache first
    const cached = this.cacheManager.get<BigNumber>(cacheKey);
    if (cached) {
      return cached;
    }

    // Batch the request
    const result = await this.batchManager.batch(
      `totalSupply:${this.contractAddress}`,
      'getTotalSupply',
      () => this.baseService.getTotalSupply()
    );

    // Cache the result
    this.cacheManager.set(cacheKey, result, 60000); // 1 minute TTL for total supply

    return result;
  }

  /**
   * Transfer tokens (invalidates cache)
   */
  async transfer(to: string, amount: BigNumber): Promise<TransactionResponse> {
    const result = await this.baseService.transfer(to, amount);

    // Invalidate relevant caches
    this.invalidateBalanceCache();

    return result;
  }

  /**
   * Approve tokens (invalidates cache)
   */
  async approve(spender: string, amount: BigNumber): Promise<TransactionResponse> {
    const result = await this.baseService.approve(spender, amount);

    // Invalidate relevant caches
    this.invalidateAllowanceCache();

    return result;
  }

  /**
   * Transfer from (invalidates cache)
   */
  async transferFrom(from: string, to: string, amount: BigNumber): Promise<TransactionResponse> {
    const result = await this.baseService.transferFrom(from, to, amount);

    // Invalidate relevant caches
    this.invalidateBalanceCache();
    this.invalidateAllowanceCache();

    return result;
  }

  /**
   * Subscribe to Transfer events
   */
  onTransfer(callback: (event: TransferEvent) => void): () => void {
    // Wrap callback to invalidate cache on transfer
    const wrappedCallback = (event: TransferEvent) => {
      this.invalidateBalanceCache();
      callback(event);
    };

    return this.baseService.onTransfer(wrappedCallback);
  }

  /**
   * Subscribe to Approval events
   */
  onApproval(callback: (event: ApprovalEvent) => void): () => void {
    // Wrap callback to invalidate cache on approval
    const wrappedCallback = (event: ApprovalEvent) => {
      this.invalidateAllowanceCache();
      callback(event);
    };

    return this.baseService.onApproval(wrappedCallback);
  }

  /**
   * Invalidate balance cache
   */
  private invalidateBalanceCache(): void {
    this.cacheManager.deletePattern(`^balance:${this.contractAddress}:`);
  }

  /**
   * Invalidate allowance cache
   */
  private invalidateAllowanceCache(): void {
    this.cacheManager.deletePattern(`^allowance:${this.contractAddress}:`);
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
    this.cacheManager.deletePattern(`^(balance|allowance|tokenInfo|totalSupply):${this.contractAddress}`);
  }
}
