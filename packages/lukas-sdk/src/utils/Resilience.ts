import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';
import { sleep } from './index';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Circuit breaker state
 */
type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Configuration for circuit breaker
 */
export interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeout?: number;
  monitorInterval?: number;
}

/**
 * Default circuit breaker configuration
 */
const DEFAULT_CIRCUIT_BREAKER_CONFIG: Required<CircuitBreakerConfig> = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitorInterval: 5000, // 5 seconds
};

/**
 * Circuit breaker for handling cascading failures
 */
export class CircuitBreaker {
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private state: CircuitBreakerState = 'closed';
  private config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.config.resetTimeout) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new LukasSDKError(
          LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
          'Circuit breaker is open. Too many failures. Please try again later'
        );
      }
    }

    try {
      const result = await fn();

      // Handle success
      if (this.state === 'half-open') {
        this.successCount++;
        // If we've had enough successes, close the circuit
        if (this.successCount >= 2) {
          this.state = 'closed';
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else if (this.state === 'closed') {
        // Reset failure count on success
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.config.failureThreshold) {
        this.state = 'open';
      }

      throw error;
    }
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Timeout wrapper for promises
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new LukasSDKError(
              LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
              timeoutMessage
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Retry with circuit breaker and timeout
 */
export async function resilientCall<T>(
  fn: () => Promise<T>,
  options: {
    retryConfig?: RetryConfig;
    circuitBreaker?: CircuitBreaker;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { retryConfig, circuitBreaker, timeoutMs = 30000 } = options;

  const executeWithTimeout = async () => {
    if (timeoutMs) {
      return withTimeout(fn(), timeoutMs, 'Network request timed out');
    }
    return fn();
  };

  if (circuitBreaker) {
    return circuitBreaker.execute(() => retryWithBackoff(executeWithTimeout, retryConfig));
  }

  return retryWithBackoff(executeWithTimeout, retryConfig);
}

/**
 * Batch multiple operations with resilience
 */
export async function batchWithResilience<T>(
  operations: Array<() => Promise<T>>,
  options: {
    concurrency?: number;
    retryConfig?: RetryConfig;
    circuitBreaker?: CircuitBreaker;
  } = {}
): Promise<T[]> {
  const { concurrency = 3, retryConfig, circuitBreaker } = options;
  const results: T[] = [];
  const queue = [...operations];

  const worker = async () => {
    while (queue.length > 0) {
      const operation = queue.shift();
      if (!operation) break;

      try {
        const result = await resilientCall(operation, {
          retryConfig,
          circuitBreaker,
        });
        results.push(result);
      } catch (error) {
        // Continue with other operations even if one fails
        console.error('Batch operation failed:', error);
      }
    }
  };

  // Create worker promises
  const workers = Array(Math.min(concurrency, operations.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);

  return results;
}
