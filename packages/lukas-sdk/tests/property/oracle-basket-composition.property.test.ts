import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { OracleServiceImpl } from '../../src/services/OracleServiceImpl';
import type { BasketComposition } from '../../src/types';

/**
 * **Feature: lukas-sdk, Property 14: Basket composition completeness**
 * **Validates: Requirements 4.4**
 * 
 * For any basket composition query, the response should include all currencies, 
 * their weights, and individual prices
 */
describe('Oracle Service - Basket Composition Property Tests', () => {
  let mockContract: any;
  let oracleService: OracleServiceImpl;
  const contractAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    // Create a mock contract
    mockContract = {
      getBasketComposition: vi.fn(),
    };

    // Create oracle service with mock contract
    oracleService = new OracleServiceImpl(mockContract, contractAddress);
  });

  it('Property 14: Basket composition completeness - All required fields present', async () => {
    // Generator for valid basket compositions
    const currencyGen = fc.stringOf(fc.char16bits(), { minLength: 1, maxLength: 3 });
    const basketGen = fc.tuple(
      fc.array(currencyGen, { minLength: 1, maxLength: 10, uniqueBy: (c) => c }),
      fc.integer({ min: 1, max: 10 })
    ).chain(([currencies, _]) =>
      fc.record({
        currencies: fc.constant(currencies),
        weights: fc.array(fc.integer({ min: 1, max: 10000 }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        prices: fc.array(fc.bigUintN(256), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        lastUpdated: fc.array(fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
      })
    );

    await fc.assert(
      fc.asyncProperty(basketGen, async (basketData) => {
        // Setup mock to return the generated basket composition
        mockContract.getBasketComposition.mockResolvedValue(basketData);

        // Call getBasketComposition
        const result = await oracleService.getBasketComposition();

        // Verify result is a valid BasketComposition object
        expect(result).toBeDefined();
        expect(result).toHaveProperty('currencies');
        expect(result).toHaveProperty('weights');
        expect(result).toHaveProperty('prices');
        expect(result).toHaveProperty('lastUpdated');

        // Verify currencies is a non-empty array
        expect(Array.isArray(result.currencies)).toBe(true);
        expect(result.currencies.length).toBeGreaterThan(0);

        // Verify weights is an array with same length as currencies
        expect(Array.isArray(result.weights)).toBe(true);
        expect(result.weights.length).toBe(result.currencies.length);

        // Verify prices is an array with same length as currencies
        expect(Array.isArray(result.prices)).toBe(true);
        expect(result.prices.length).toBe(result.currencies.length);

        // Verify lastUpdated is an array with same length as currencies
        expect(Array.isArray(result.lastUpdated)).toBe(true);
        expect(result.lastUpdated.length).toBe(result.currencies.length);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 14: Basket composition completeness - Weights are valid numbers', async () => {
    // Generator for valid basket compositions
    const currencyGen = fc.stringOf(fc.char16bits(), { minLength: 1, maxLength: 3 });
    const basketGen = fc.tuple(
      fc.array(currencyGen, { minLength: 1, maxLength: 10, uniqueBy: (c) => c }),
      fc.integer({ min: 1, max: 10 })
    ).chain(([currencies, _]) =>
      fc.record({
        currencies: fc.constant(currencies),
        weights: fc.array(fc.integer({ min: 1, max: 10000 }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        prices: fc.array(fc.bigUintN(256), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        lastUpdated: fc.array(fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
      })
    );

    await fc.assert(
      fc.asyncProperty(basketGen, async (basketData) => {
        // Setup mock to return the generated basket composition
        mockContract.getBasketComposition.mockResolvedValue(basketData);

        // Call getBasketComposition
        const result = await oracleService.getBasketComposition();

        // Verify all weights are valid numbers
        result.weights.forEach((weight) => {
          expect(typeof weight).toBe('number');
          expect(weight).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(weight)).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('Property 14: Basket composition completeness - Prices are valid strings', async () => {
    // Generator for valid basket compositions
    const currencyGen = fc.stringOf(fc.char16bits(), { minLength: 1, maxLength: 3 });
    const basketGen = fc.tuple(
      fc.array(currencyGen, { minLength: 1, maxLength: 10, uniqueBy: (c) => c }),
      fc.integer({ min: 1, max: 10 })
    ).chain(([currencies, _]) =>
      fc.record({
        currencies: fc.constant(currencies),
        weights: fc.array(fc.integer({ min: 1, max: 10000 }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        prices: fc.array(fc.bigUintN(256), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        lastUpdated: fc.array(fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
      })
    );

    await fc.assert(
      fc.asyncProperty(basketGen, async (basketData) => {
        // Setup mock to return the generated basket composition
        mockContract.getBasketComposition.mockResolvedValue(basketData);

        // Call getBasketComposition
        const result = await oracleService.getBasketComposition();

        // Verify all prices are valid numeric strings
        result.prices.forEach((price) => {
          expect(typeof price).toBe('string');
          expect(/^\d+$/.test(price)).toBe(true);
          expect(() => BigInt(price)).not.toThrow();
        });
      }),
      { numRuns: 100 }
    );
  });

  it('Property 14: Basket composition completeness - Timestamps are valid', async () => {
    // Generator for valid basket compositions
    const currencyGen = fc.stringOf(fc.char16bits(), { minLength: 1, maxLength: 3 });
    const basketGen = fc.tuple(
      fc.array(currencyGen, { minLength: 1, maxLength: 10, uniqueBy: (c) => c }),
      fc.integer({ min: 1, max: 10 })
    ).chain(([currencies, _]) =>
      fc.record({
        currencies: fc.constant(currencies),
        weights: fc.array(fc.integer({ min: 1, max: 10000 }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        prices: fc.array(fc.bigUintN(256), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        lastUpdated: fc.array(fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
      })
    );

    await fc.assert(
      fc.asyncProperty(basketGen, async (basketData) => {
        // Setup mock to return the generated basket composition
        mockContract.getBasketComposition.mockResolvedValue(basketData);

        // Call getBasketComposition
        const result = await oracleService.getBasketComposition();

        // Verify all timestamps are valid numbers
        result.lastUpdated.forEach((timestamp) => {
          expect(typeof timestamp).toBe('number');
          expect(timestamp).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(timestamp)).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('Property 14: Basket composition completeness - Invalid responses throw errors', async () => {
    // Generator for invalid responses
    const invalidResponseGen = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant({}),
      fc.constant({ currencies: [] }), // Empty currencies
      fc.constant({ currencies: ['USD'], weights: [] }), // Mismatched lengths
    );

    await fc.assert(
      fc.asyncProperty(invalidResponseGen, async (invalidResponse) => {
        // Setup mock to return invalid response
        mockContract.getBasketComposition.mockResolvedValue(invalidResponse);

        // Verify that calling getBasketComposition throws an error
        await expect(oracleService.getBasketComposition()).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  it('Property 14: Basket composition completeness - Array lengths are consistent', async () => {
    // Generator for valid basket compositions
    const currencyGen = fc.stringOf(fc.char16bits(), { minLength: 1, maxLength: 3 });
    const basketGen = fc.tuple(
      fc.array(currencyGen, { minLength: 1, maxLength: 10, uniqueBy: (c) => c }),
      fc.integer({ min: 1, max: 10 })
    ).chain(([currencies, _]) =>
      fc.record({
        currencies: fc.constant(currencies),
        weights: fc.array(fc.integer({ min: 1, max: 10000 }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        prices: fc.array(fc.bigUintN(256), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
        lastUpdated: fc.array(fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }), {
          minLength: currencies.length,
          maxLength: currencies.length,
        }),
      })
    );

    await fc.assert(
      fc.asyncProperty(basketGen, async (basketData) => {
        // Setup mock to return the generated basket composition
        mockContract.getBasketComposition.mockResolvedValue(basketData);

        // Call getBasketComposition
        const result = await oracleService.getBasketComposition();

        // Verify all arrays have the same length
        const expectedLength = result.currencies.length;
        expect(result.weights.length).toBe(expectedLength);
        expect(result.prices.length).toBe(expectedLength);
        expect(result.lastUpdated.length).toBe(expectedLength);
      }),
      { numRuns: 100 }
    );
  });
});
