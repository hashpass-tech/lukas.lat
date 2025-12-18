/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * CacheManager for intelligent caching of read operations
 * 
 * Provides TTL-based caching with cache invalidation and warming strategies.
 * Supports both simple key-value caching and complex cache key generation.
 */
export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private defaultTTL: number;
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(defaultTTL: number = 30000, maxSize: number = 1000) {
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    this.startCleanup();
  }

  /**
   * Generate a cache key from multiple parameters
   */
  static generateKey(...params: any[]): string {
    return params
      .map(p => {
        if (typeof p === 'object') {
          return JSON.stringify(p);
        }
        return String(p);
      })
      .join(':');
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Enforce max size by removing oldest entries if needed
    if (this.cache.size > this.maxSize - 1) {
      let oldestKey: string | null = null;
      let oldestTimestamp = Date.now();

      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTimestamp) {
          oldestTimestamp = v.timestamp;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: RegExp | string): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Warm cache with initial values
   */
  warm<T>(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl);
    }
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every 5 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5000);

    // Allow the interval to be garbage collected if needed
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
  }

  /**
   * Stop the cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}
