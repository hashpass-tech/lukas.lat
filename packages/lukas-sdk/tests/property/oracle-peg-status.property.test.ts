import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { OracleServiceImpl } from '../../src/services/OracleServiceImpl';
import type { PegStatus } from '../../src/types';

/**
 * **Feature: lukas-sdk, Property 13: Peg status completeness**
 * **Validates: Requirements 4.3**
 * 
 * For any peg status query, the response should include deviation percentage, 
 * over/under peg indication, and all required fields
 */
describe('Oracle Service - Peg Status Completeness Property Tests', () => {
  let mockContract: any;
  let oracleService: OracleServiceImpl;
  const contractAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    // Create a mock contract
    mockContract = {
      getPegStatus: vi.fn(),
    };

    // Create oracle service with mock contract
    oracleService = new OracleServiceImpl(mockContract, contractAddress);
  });

  it('Property 13: Peg status completeness - All required fields present', async () => {
    // Generator for valid peg status data
    const pegStatusGen = fc.record({
      poolPrice: fc.bigUintN(256).filter(n => n > 0n),
      fairPrice: fc.bigUintN(256).filter(n => n > 0n),
      deviation: fc.integer({ min: -10000, max: 10000 }),
      isOverPeg: fc.boolean(),
      shouldStabilize: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(pegStatusGen, async (pegData) => {
        // Setup mock to return the generated peg status
        mockContract.getPegStatus.mockResolvedValue(pegData);

        // Call getPegStatus
        const result = await oracleService.getPegStatus();

        // Verify result is a valid PegStatus object
        expect(result).toBeDefined();
        expect(result).toHaveProperty('poolPrice');
        expect(result).toHaveProperty('fairPrice');
        expect(result).toHaveProperty('deviation');
        expect(result).toHaveProperty('isOverPeg');
        expect(result).toHaveProperty('shouldStabilize');

        // Verify poolPrice is a valid string
        expect(typeof result.poolPrice).toBe('string');
        expect(/^\d+$/.test(result.poolPrice)).toBe(true);

        // Verify fairPrice is a valid string
        expect(typeof result.fairPrice).toBe('string');
        expect(/^\d+$/.test(result.fairPrice)).toBe(true);

        // Verify deviation is a number
        expect(typeof result.deviation).toBe('number');
        expect(Number.isFinite(result.deviation)).toBe(true);

        // Verify isOverPeg is a boolean
        expect(typeof result.isOverPeg).toBe('boolean');

        // Verify shouldStabilize is a boolean
        expect(typeof result.shouldStabilize).toBe('boolean');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 13: Peg status completeness - Prices are positive', async () => {
    // Generator for valid peg status data
    const pegStatusGen = fc.record({
      poolPrice: fc.bigUintN(256).filter(n => n > 0n),
      fairPrice: fc.bigUintN(256).filter(n => n > 0n),
      deviation: fc.integer({ min: -10000, max: 10000 }),
      isOverPeg: fc.boolean(),
      shouldStabilize: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(pegStatusGen, async (pegData) => {
        // Setup mock to return the generated peg status
        mockContract.getPegStatus.mockResolvedValue(pegData);

        // Call getPegStatus
        const result = await oracleService.getPegStatus();

        // Verify poolPrice is positive
        expect(BigInt(result.poolPrice)).toBeGreaterThan(0n);

        // Verify fairPrice is positive
        expect(BigInt(result.fairPrice)).toBeGreaterThan(0n);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 13: Peg status completeness - Deviation is within reasonable bounds', async () => {
    // Generator for valid peg status data
    const pegStatusGen = fc.record({
      poolPrice: fc.bigUintN(256).filter(n => n > 0n),
      fairPrice: fc.bigUintN(256).filter(n => n > 0n),
      deviation: fc.integer({ min: -10000, max: 10000 }),
      isOverPeg: fc.boolean(),
      shouldStabilize: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(pegStatusGen, async (pegData) => {
        // Setup mock to return the generated peg status
        mockContract.getPegStatus.mockResolvedValue(pegData);

        // Call getPegStatus
        const result = await oracleService.getPegStatus();

        // Verify deviation is within reasonable bounds (basis points)
        expect(result.deviation).toBeGreaterThanOrEqual(-10000);
        expect(result.deviation).toBeLessThanOrEqual(10000);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 13: Peg status completeness - isOverPeg is a boolean', async () => {
    // Generator for valid peg status data
    const pegStatusGen = fc.record({
      poolPrice: fc.bigUintN(256).filter(n => n > 0n),
      fairPrice: fc.bigUintN(256).filter(n => n > 0n),
      deviation: fc.integer({ min: -10000, max: 10000 }),
      isOverPeg: fc.boolean(),
      shouldStabilize: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(pegStatusGen, async (pegData) => {
        // Setup mock to return the generated peg status
        mockContract.getPegStatus.mockResolvedValue(pegData);

        // Call getPegStatus
        const result = await oracleService.getPegStatus();

        // Verify isOverPeg is a boolean
        expect(typeof result.isOverPeg).toBe('boolean');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 13: Peg status completeness - Invalid responses throw errors', async () => {
    // Generator for invalid responses (truly invalid, not just incomplete)
    const invalidResponseGen = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant({}),
      fc.constant({ poolPrice: '100' }), // Missing fairPrice
    );

    await fc.assert(
      fc.asyncProperty(invalidResponseGen, async (invalidResponse) => {
        // Setup mock to return invalid response
        mockContract.getPegStatus.mockResolvedValue(invalidResponse);

        // Verify that calling getPegStatus throws an error
        await expect(oracleService.getPegStatus()).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  it('Property 13: Peg status completeness - Consistent across multiple calls', async () => {
    // Generator for valid peg status data
    const pegStatusGen = fc.record({
      poolPrice: fc.bigUintN(256).filter(n => n > 0n),
      fairPrice: fc.bigUintN(256).filter(n => n > 0n),
      deviation: fc.integer({ min: -10000, max: 10000 }),
      isOverPeg: fc.boolean(),
      shouldStabilize: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(pegStatusGen, async (pegData) => {
        // Setup mock to return the same peg status
        mockContract.getPegStatus.mockResolvedValue(pegData);

        // Call getPegStatus multiple times
        const result1 = await oracleService.getPegStatus();
        const result2 = await oracleService.getPegStatus();

        // Verify results are identical
        expect(result1.poolPrice).toBe(result2.poolPrice);
        expect(result1.fairPrice).toBe(result2.fairPrice);
        expect(result1.deviation).toBe(result2.deviation);
        expect(result1.isOverPeg).toBe(result2.isOverPeg);
        expect(result1.shouldStabilize).toBe(result2.shouldStabilize);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 13: Peg status completeness - Prices can be converted to BigInt', async () => {
    // Generator for valid peg status data
    const pegStatusGen = fc.record({
      poolPrice: fc.bigUintN(256).filter(n => n > 0n),
      fairPrice: fc.bigUintN(256).filter(n => n > 0n),
      deviation: fc.integer({ min: -10000, max: 10000 }),
      isOverPeg: fc.boolean(),
      shouldStabilize: fc.boolean(),
    });

    await fc.assert(
      fc.asyncProperty(pegStatusGen, async (pegData) => {
        // Setup mock to return the generated peg status
        mockContract.getPegStatus.mockResolvedValue(pegData);

        // Call getPegStatus
        const result = await oracleService.getPegStatus();

        // Verify prices can be converted to BigInt
        expect(() => BigInt(result.poolPrice)).not.toThrow();
        expect(() => BigInt(result.fairPrice)).not.toThrow();

        // Verify converted values are positive
        expect(BigInt(result.poolPrice)).toBeGreaterThan(0n);
        expect(BigInt(result.fairPrice)).toBeGreaterThan(0n);
      }),
      { numRuns: 100 }
    );
  });
});
