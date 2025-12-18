import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

// Re-export resilience utilities
export { retryWithBackoff, CircuitBreaker, withTimeout, resilientCall, batchWithResilience } from './Resilience';
export type { RetryConfig, CircuitBreakerConfig } from './Resilience';

// Re-export validation utilities
export {
  isValidAddress,
  validateAddress,
  validateAmount,
  validateAddresses,
  validateRequired,
  validateNonEmptyString,
  sanitizeInput,
  validateRange,
  validateEnum,
  validateObjectShape,
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateUrl,
  validateJson,
  validateBatch,
} from './Validation';

// Re-export caching utilities
export { CacheManager } from './CacheManager';
export type { CacheStats } from './CacheManager';

// Re-export batching utilities
export { BatchManager } from './BatchManager';

// Re-export background sync utilities
export { BackgroundSyncManager } from './BackgroundSyncManager';
export type { SyncTask, SyncTaskStatus } from './BackgroundSyncManager';

/**
 * Utility functions for the Lukas SDK
 */

/**
 * Format a BigNumber to a human-readable string
 */
export function formatUnits(value: unknown): string {
  // This will be implemented with proper BigNumber handling
  return String(value);
}

/**
 * Parse a human-readable string to BigNumber
 */
export function parseUnits(value: string): unknown {
  // This will be implemented with proper BigNumber handling
  return value;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff (legacy, use retryWithBackoff instead)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000,
  maxDelay: number = 30000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }

    // Calculate next delay with exponential backoff, capped at maxDelay
    const nextDelay = Math.min(delay * 2, maxDelay);

    await sleep(delay);
    return retry(fn, attempts - 1, nextDelay, maxDelay);
  }
}