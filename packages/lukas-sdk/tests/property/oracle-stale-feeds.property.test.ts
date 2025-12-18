import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { OracleServiceImpl } from '../../src/services/OracleServiceImpl';

/**
 * **Feature: lukas-sdk, Property 15: Stale feed detection**
 * **Validates: Requirements 4.5**
 * 
 * For any price feed query when feeds are stale, the SDK should indicate 
 * staleness in the returned data
 */
describe('Oracle Service - Stale Feed Detection Property Tests', () => {
  let mockContract: any;
  let oracleService: OracleServiceImpl;
  const contractAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    // Create a mock contract
    mockContract = {
      hasStaleFeeds: vi.fn(),
      getIndexUSD: vi.fn(),
      getCurrencyPrice: vi.fn(),
    };

    // Create oracle service with mock contract
    oracleService = new OracleServiceImpl(mockContract, contractAddress);
  });

  it('Property 15: Stale feed detection - hasStaleFeeds returns boolean', async () => {
    // Generator for boolean values
    const staleFeedsGen = fc.boolean();

    await fc.assert(
      fc.asyncProperty(staleFeedsGen, async (isStale) => {
        // Setup mock to return the generated stale status
        mockContract.hasStaleFeeds.mockResolvedValue(isStale);

        // Call hasStaleFeeds
        const result = await oracleService.hasStaleFeeds();

        // Verify result is a boolean
        expect(typeof result).toBe('boolean');
        expect(result).toBe(isStale);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: Stale feed detection - IndexUSD includes staleness indicator', async () => {
    // Generator for index data with staleness
    const indexDataGen = fc.record({
      valueUSD: fc.bigUintN(256).filter(n => n > 0n),
      lastUpdated: fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }),
      isStale: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(indexDataGen, async (indexData) => {
        // Setup mock to return the generated index data
        mockContract.getIndexUSD.mockResolvedValue(indexData);

        // Call getIndexUSD
        const result = await oracleService.getIndexUSD();

        // Verify result includes staleness indicator
        expect(result).toHaveProperty('isStale');
        expect(typeof result.isStale).toBe('boolean');
        expect(result.isStale).toBe(indexData.isStale);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: Stale feed detection - CurrencyPrice includes staleness indicator', async () => {
    // Generator for currency price data with staleness
    const currencyGen = fc.stringOf(fc.char16bits(), { minLength: 1, maxLength: 3 });
    const currencyPriceGen = fc.tuple(currencyGen).chain(([currency]) =>
      fc.record({
        currency: fc.constant(currency),
        priceUSD: fc.bigUintN(256).filter(n => n > 0n),
        lastUpdated: fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }),
        isStale: fc.boolean(),
      })
    );

    await fc.assert(
      fc.asyncProperty(currencyPriceGen, async (currencyData) => {
        // Setup mock to return the generated currency price data
        mockContract.getCurrencyPrice.mockResolvedValue(currencyData);

        // Call getCurrencyPrice
        const result = await oracleService.getCurrencyPrice(currencyData.currency);

        // Verify result includes staleness indicator
        expect(result).toHaveProperty('isStale');
        expect(typeof result.isStale).toBe('boolean');
        expect(result.isStale).toBe(currencyData.isStale);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: Stale feed detection - Stale feeds are properly flagged', async () => {
    // Generator for stale feed scenarios
    const staleFeedGen = fc.record({
      valueUSD: fc.bigUintN(256).filter(n => n > 0n),
      lastUpdated: fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) - 3600 }), // Older than 1 hour
      isStale: fc.constant(true),
    });

    await fc.assert(
      fc.asyncProperty(staleFeedGen, async (staleData) => {
        // Setup mock to return stale data
        mockContract.getIndexUSD.mockResolvedValue(staleData);

        // Call getIndexUSD
        const result = await oracleService.getIndexUSD();

        // Verify staleness is properly indicated
        expect(result.isStale).toBe(true);
        expect(result.lastUpdated).toBeLessThan(Math.floor(Date.now() / 1000) - 1800); // At least 30 min old
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: Stale feed detection - Fresh feeds are not flagged as stale', async () => {
    // Generator for fresh feed scenarios
    const freshFeedGen = fc.record({
      valueUSD: fc.bigUintN(256).filter(n => n > 0n),
      lastUpdated: fc.integer({ min: Math.floor(Date.now() / 1000) - 300, max: Math.floor(Date.now() / 1000) }), // Within 5 minutes
      isStale: fc.constant(false),
    });

    await fc.assert(
      fc.asyncProperty(freshFeedGen, async (freshData) => {
        // Setup mock to return fresh data
        mockContract.getIndexUSD.mockResolvedValue(freshData);

        // Call getIndexUSD
        const result = await oracleService.getIndexUSD();

        // Verify staleness is not indicated
        expect(result.isStale).toBe(false);
        expect(result.lastUpdated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 600); // Within 10 minutes
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: Stale feed detection - Invalid responses throw errors', async () => {
    // Generator for invalid responses
    const invalidResponseGen = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant('invalid'),
      fc.constant(123),
      fc.constant({})
    );

    await fc.assert(
      fc.asyncProperty(invalidResponseGen, async (invalidResponse) => {
        // Setup mock to return invalid response
        mockContract.hasStaleFeeds.mockResolvedValue(invalidResponse);

        // Verify that calling hasStaleFeeds throws an error for non-boolean responses
        if (typeof invalidResponse !== 'boolean') {
          await expect(oracleService.hasStaleFeeds()).rejects.toThrow();
        }
      }),
      { numRuns: 50 }
    );
  });

  it('Property 15: Stale feed detection - Staleness is consistent across calls', async () => {
    // Generator for staleness status
    const staleFeedsGen = fc.boolean();

    await fc.assert(
      fc.asyncProperty(staleFeedsGen, async (isStale) => {
        // Setup mock to return the same staleness status
        mockContract.hasStaleFeeds.mockResolvedValue(isStale);

        // Call hasStaleFeeds multiple times
        const result1 = await oracleService.hasStaleFeeds();
        const result2 = await oracleService.hasStaleFeeds();

        // Verify results are identical
        expect(result1).toBe(result2);
        expect(result1).toBe(isStale);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: Stale feed detection - Timestamp validity', async () => {
    // Generator for index data with valid timestamps
    const indexDataGen = fc.record({
      valueUSD: fc.bigUintN(256).filter(n => n > 0n),
      lastUpdated: fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }),
      isStale: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(indexDataGen, async (indexData) => {
        // Setup mock to return the generated index data
        mockContract.getIndexUSD.mockResolvedValue(indexData);

        // Call getIndexUSD
        const result = await oracleService.getIndexUSD();

        // Verify timestamp is valid
        expect(typeof result.lastUpdated).toBe('number');
        expect(result.lastUpdated).toBeGreaterThanOrEqual(0);
        expect(result.lastUpdated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 1);
      }),
      { numRuns: 100 }
    );
  });
});
