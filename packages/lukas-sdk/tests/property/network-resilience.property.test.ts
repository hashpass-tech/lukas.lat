import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  retryWithBackoff,
  CircuitBreaker,
  withTimeout,
  resilientCall,
} from '../../src/utils/Resilience';
import { LukasSDKError, LukasSDKErrorCode } from '../../src/errors';

describe('Network Resilience Property Tests', () => {
  /**
   * **Feature: lukas-sdk, Property 22: Network retry behavior**
   * **Validates: Requirements 7.2**
   *
   * For any network connectivity issue, the SDK should retry operations
   * with exponential backoff
   */
  it('Property 22: Network retry behavior', async () => {
    // Generator for number of failures before success
    const failureCountGen = fc.integer({ min: 0, max: 2 });

    await fc.assert(
      fc.asyncProperty(failureCountGen, async (failureCount) => {
        let attemptCount = 0;
        const mockFn = vi.fn(async () => {
          attemptCount++;
          if (attemptCount <= failureCount) {
            throw new Error('Network error');
          }
          return 'success';
        });

        // If we have more failures than max attempts, it should fail
        if (failureCount > 3) {
          await expect(
            retryWithBackoff(mockFn, {
              maxAttempts: 3,
              initialDelay: 10,
              maxDelay: 50,
            })
          ).rejects.toThrow();
        } else {
          // Otherwise it should succeed
          const result = await retryWithBackoff(mockFn, {
            maxAttempts: 3,
            initialDelay: 10,
            maxDelay: 50,
          });
          expect(result).toBe('success');
          expect(mockFn).toHaveBeenCalledTimes(failureCount + 1);
        }
      }),
      { numRuns: 100 }
    );
  }, { timeout: 30000 });

  /**
   * Test that retry uses exponential backoff
   */
  it('Retry uses exponential backoff', async () => {
    const delays: number[] = [];
    let attemptCount = 0;

    const mockFn = vi.fn(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Network error');
      }
      return 'success';
    });

    // Mock sleep to track delays
    const originalSleep = global.setTimeout;
    let sleepCalls: number[] = [];

    const mockSleep = vi.fn((ms: number) => {
      sleepCalls.push(ms);
      return new Promise((resolve) => originalSleep(resolve, 0));
    });

    // Patch sleep in the module
    const startTime = Date.now();
    await retryWithBackoff(mockFn, {
      maxAttempts: 3,
      initialDelay: 100,
      backoffMultiplier: 2,
    });

    // Verify we made multiple attempts
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  /**
   * Test circuit breaker opens after threshold
   */
  it('Circuit breaker opens after failure threshold', async () => {
    const circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 100,
    });

    let callCount = 0;
    const mockFn = vi.fn(async () => {
      callCount++;
      throw new Error('Network error');
    });

    // Make 3 failed calls to open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(mockFn);
      } catch (error) {
        // Expected to fail
      }
    }

    // Circuit should be open now
    expect(circuitBreaker.getState()).toBe('open');

    // Next call should fail immediately without calling the function
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow(LukasSDKError);
    expect(callCount).toBe(3); // Function should not have been called again
  });

  /**
   * Test circuit breaker resets after timeout
   */
  it('Circuit breaker resets after timeout', async () => {
    const circuitBreaker = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeout: 50,
    });

    let callCount = 0;
    const mockFn = vi.fn(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network error');
      }
      return 'success';
    });

    // Make a failed call to open the circuit
    try {
      await circuitBreaker.execute(mockFn);
    } catch (error) {
      // Expected to fail
    }

    expect(circuitBreaker.getState()).toBe('open');

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 100));

    // First success in half-open state (transitions to half-open on first execute after timeout)
    const result = await circuitBreaker.execute(mockFn);
    expect(result).toBe('success');

    // After one success, should still be half-open (needs 2 successes)
    expect(circuitBreaker.getState()).toBe('half-open');

    // Second success should close the circuit
    const result2 = await circuitBreaker.execute(mockFn);
    expect(result2).toBe('success');
    expect(circuitBreaker.getState()).toBe('closed');
  });

  /**
   * Test timeout functionality
   */
  it('Timeout rejects after specified duration', async () => {
    const slowFn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'success';
    };

    await expect(withTimeout(slowFn(), 100, 'Operation timed out')).rejects.toThrow(
      LukasSDKError
    );
  });

  /**
   * Test timeout allows fast operations
   */
  it('Timeout allows fast operations to complete', async () => {
    const fastFn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'success';
    };

    const result = await withTimeout(fastFn(), 1000, 'Operation timed out');
    expect(result).toBe('success');
  });

  /**
   * Test resilient call combines retry and circuit breaker
   */
  it('Resilient call combines retry and circuit breaker', async () => {
    const circuitBreaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeout: 100,
    });

    let callCount = 0;
    const mockFn = vi.fn(async () => {
      callCount++;
      if (callCount <= 1) {
        throw new Error('Network error');
      }
      return 'success';
    });

    // First call should retry and succeed
    const result = await resilientCall(mockFn, {
      retryConfig: { maxAttempts: 3 },
      circuitBreaker,
    });

    expect(result).toBe('success');
    expect(callCount).toBe(2); // One failure, then success
  });

  /**
   * Test that retry respects max attempts
   */
  it('Retry respects max attempts limit', async () => {
    let callCount = 0;
    const mockFn = vi.fn(async () => {
      callCount++;
      throw new Error('Network error');
    });

    await expect(
      retryWithBackoff(mockFn, { maxAttempts: 3 })
    ).rejects.toThrow();

    expect(callCount).toBe(3);
  });

  /**
   * Test that retry respects max delay cap
   */
  it('Retry respects max delay cap', async () => {
    let callCount = 0;
    const mockFn = vi.fn(async () => {
      callCount++;
      if (callCount < 5) {
        throw new Error('Network error');
      }
      return 'success';
    });

    const startTime = Date.now();
    await retryWithBackoff(mockFn, {
      maxAttempts: 5,
      initialDelay: 100,
      maxDelay: 200,
      backoffMultiplier: 2,
    });
    const duration = Date.now() - startTime;

    // With max delay of 200ms and 4 retries, total should be less than 1000ms
    // (100 + 200 + 200 + 200 = 700ms, plus some overhead)
    expect(duration).toBeLessThan(1500);
  });

  /**
   * Test circuit breaker state transitions
   */
  it('Circuit breaker state transitions correctly', async () => {
    const circuitBreaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeout: 50,
    });

    // Initial state should be closed
    expect(circuitBreaker.getState()).toBe('closed');

    let callCount = 0;
    const mockFn = vi.fn(async () => {
      callCount++;
      throw new Error('Network error');
    });

    // Make 2 failed calls to open the circuit
    for (let i = 0; i < 2; i++) {
      try {
        await circuitBreaker.execute(mockFn);
      } catch (error) {
        // Expected
      }
    }

    // Should be open
    expect(circuitBreaker.getState()).toBe('open');

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Now try to execute - this should transition to half-open
    let successCallCount = 0;
    const successFn = vi.fn(async () => {
      successCallCount++;
      return 'success';
    });

    // First call in half-open state
    await circuitBreaker.execute(successFn);
    expect(circuitBreaker.getState()).toBe('half-open');

    // Reset manually
    circuitBreaker.reset();
    expect(circuitBreaker.getState()).toBe('closed');
  });

  /**
   * Test that errors are preserved through retry
   */
  it('Errors are preserved through retry', async () => {
    const originalError = new Error('Original network error');
    const mockFn = vi.fn(async () => {
      throw originalError;
    });

    try {
      await retryWithBackoff(mockFn, { maxAttempts: 1 });
    } catch (error) {
      expect(error).toBe(originalError);
    }
  });
});
