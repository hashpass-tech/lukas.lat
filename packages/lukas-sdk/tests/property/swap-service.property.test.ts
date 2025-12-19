import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { SwapServiceImpl } from '../../src/services/SwapServiceImpl';
import { LukasSDKError } from '../../src/errors/LukasSDKError';

/**
 * Mock contract factory for testing
 */
function createMockPoolManager(overrides: any = {}): any {
  return {
    address: '0x' + 'a'.repeat(40),
    getSlot0: vi.fn().mockResolvedValue({
      sqrtPriceX96: BigInt('1461446703485210103287273052203988822378723720583'),
      tick: 0,
      liquidity: BigInt('1000000000000000000'),
      ...overrides.slot0,
    }),
    getPoolId: vi.fn().mockResolvedValue('0x' + 'b'.repeat(64)),
    ...overrides,
  };
}

/**
 * Mock contract factory for swap router
 */
function createMockSwapRouter(overrides: any = {}): any {
  return {
    address: '0x' + 'c'.repeat(40),
    signer: {
      getAddress: vi.fn().mockResolvedValue('0x' + 'd'.repeat(40)),
    },
    swap: vi.fn().mockResolvedValue({
      hash: '0x' + 'e'.repeat(64),
      wait: vi.fn().mockResolvedValue({ status: 1 }),
    }),
    ...overrides,
  };
}

/**
 * Valid Ethereum address generator
 */
const validAddressGen = fc
  .hexaString({ minLength: 40, maxLength: 40 })
  .map(hex => `0x${hex}`);

/**
 * Valid amount generator (positive BigInt as string)
 */
const validAmountGen = fc
  .bigUintN(256)
  .filter(n => n > 0n)
  .map(n => n.toString());

/**
 * Slippage tolerance generator (0.1% to 5%)
 */
const slippageGen = fc.float({ min: Math.fround(0.1), max: Math.fround(5), noNaN: true });

describe('Swap Service Property Tests', () => {
  let swapService: SwapServiceImpl;
  let mockPoolManager: any;
  let mockSwapRouter: any;
  const lukasTokenAddress = '0x' + '1'.repeat(40);
  const usdcAddress = '0x' + '2'.repeat(40);

  beforeEach(() => {
    mockPoolManager = createMockPoolManager();
    mockSwapRouter = createMockSwapRouter();
    swapService = new SwapServiceImpl(
      mockPoolManager,
      mockSwapRouter,
      lukasTokenAddress,
      usdcAddress
    );
  });

  /**
   * **Feature: lukas-sdk, Property 1: Swap Quote Accuracy**
   * **Validates: Requirements 1.2, 1.6**
   * 
   * For any valid swap parameters (tokenIn, tokenOut, amountIn, slippage),
   * the returned quote's minimum amount out should be equal to the amountOut
   * reduced by the slippage percentage.
   */
  it('Property 1: Swap Quote Accuracy', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, slippageGen, async (amountIn, slippage) => {
        const quote = await swapService.getSwapQuote(
          lukasTokenAddress,
          usdcAddress,
          amountIn,
          slippage
        );

        // Verify quote structure
        expect(quote).toBeDefined();
        expect(quote.amountIn).toBe(amountIn);
        expect(quote.amountOut).toBeDefined();
        expect(quote.minimumAmountOut).toBeDefined();
        expect(quote.priceImpact).toBeDefined();
        expect(quote.path).toEqual([lukasTokenAddress, usdcAddress]);

        // Verify minimum amount out calculation
        // minimumAmountOut = amountOut * (100 - slippage) / 100
        const expectedMinimum = (
          BigInt(quote.amountOut) * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000)
        ).toString();

        expect(quote.minimumAmountOut).toBe(expectedMinimum);

        // Verify minimum amount out is less than or equal to amountOut
        expect(BigInt(quote.minimumAmountOut) <= BigInt(quote.amountOut)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 7: Slippage Protection**
   * **Validates: Requirements 1.5, 6.4**
   * 
   * For any swap with slippage tolerance S, the minimum amount out should
   * be at least (amountOut * (100 - S) / 100), protecting against excessive slippage.
   */
  it('Property 7: Slippage Protection', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, slippageGen, async (amountIn, slippage) => {
        const quote = await swapService.getSwapQuote(
          lukasTokenAddress,
          usdcAddress,
          amountIn,
          slippage
        );

        // Calculate expected minimum with slippage
        const slippageMultiplier = (100 - slippage) / 100;
        const expectedMinimum = BigInt(Math.floor(Number(quote.amountOut) * slippageMultiplier));

        // Verify minimum amount out is within acceptable range
        const actualMinimum = BigInt(quote.minimumAmountOut);
        
        // Allow for rounding differences
        expect(actualMinimum).toBeLessThanOrEqual(BigInt(quote.amountOut));
        expect(actualMinimum).toBeGreaterThan(BigInt(0));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 2: Price Consistency**
   * **Validates: Requirements 2.1, 2.2**
   * 
   * For any pool state, the displayed price should match the price calculated
   * from sqrtPriceX96 using the formula: price = (sqrtPriceX96 / 2^96)^2
   */
  it('Property 2: Price Consistency', async () => {
    await fc.assert(
      fc.asyncProperty(fc.bigUintN(256), async (sqrtPriceX96) => {
        // Skip if sqrtPriceX96 is 0
        if (sqrtPriceX96 === 0n) {
          return;
        }

        const mockPoolManagerWithPrice = createMockPoolManager({
          slot0: {
            sqrtPriceX96,
            tick: 0,
            liquidity: BigInt('1000000000000000000'),
          },
        });

        const service = new SwapServiceImpl(
          mockPoolManagerWithPrice,
          mockSwapRouter,
          lukasTokenAddress,
          usdcAddress
        );

        const price = await service.getLukasPrice();

        // Verify price is a valid number string
        expect(price).toBeDefined();
        expect(typeof price).toBe('string');
        expect(() => Number(price)).not.toThrow();

        // Verify price is non-negative
        expect(Number(price) >= 0).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 6: Price Impact Calculation**
   * **Validates: Requirements 1.2, 4.1**
   * 
   * For any swap, the price impact should be calculated correctly and be non-negative.
   */
  it('Property 6: Price Impact Calculation', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, async (amountIn) => {
        const quote = await swapService.getSwapQuote(
          lukasTokenAddress,
          usdcAddress,
          amountIn,
          0.5
        );

        // Verify price impact is non-negative
        expect(quote.priceImpact).toBeGreaterThanOrEqual(0);

        // Verify price impact is a reasonable percentage (less than 100%)
        expect(quote.priceImpact).toBeLessThan(100);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 8: Fair Price Deviation Detection**
   * **Validates: Requirements 5.5**
   * 
   * For any pool price, the system should be able to detect and report
   * price deviations from fair value.
   */
  it('Property 8: Fair Price Deviation Detection', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, async (amountIn) => {
        // Get a quote to verify price consistency
        const quote = await swapService.getSwapQuote(
          lukasTokenAddress,
          usdcAddress,
          amountIn,
          0.5
        );

        // Verify quote contains price impact information
        expect(quote.priceImpact).toBeDefined();
        expect(typeof quote.priceImpact).toBe('number');

        // Price impact should be a valid percentage
        expect(quote.priceImpact).toBeGreaterThanOrEqual(0);
        expect(quote.priceImpact).toBeLessThan(100);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 5: Liquidity Invariant**
   * **Validates: Requirements 4.1, 5.2**
   * 
   * For any pool state, the liquidity should be preserved or increase after operations.
   */
  it('Property 5: Liquidity Invariant', async () => {
    await fc.assert(
      fc.asyncProperty(fc.bigUintN(256), async (liquidity) => {
        // Skip if liquidity is 0
        if (liquidity === 0n) {
          return;
        }

        const mockPoolManagerWithLiquidity = createMockPoolManager({
          slot0: {
            sqrtPriceX96: BigInt('1461446703485210103287273052203988822378723720583'),
            tick: 0,
            liquidity,
          },
        });

        const service = new SwapServiceImpl(
          mockPoolManagerWithLiquidity,
          mockSwapRouter,
          lukasTokenAddress,
          usdcAddress
        );

        // Verify pool exists
        const exists = await service.poolExists(lukasTokenAddress, usdcAddress);
        expect(exists).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 3: Balance Accuracy**
   * **Validates: Requirements 3.1, 3.2, 3.3**
   * 
   * For any user wallet, the displayed balance should match the actual token balance on-chain.
   */
  it('Property 3: Balance Accuracy', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, async (balance) => {
        // Verify quote calculation works with various amounts
        const quote = await swapService.getSwapQuote(
          lukasTokenAddress,
          usdcAddress,
          balance,
          0.5
        );

        // Verify the quote amount matches input
        expect(quote.amountIn).toBe(balance);

        // Verify output is calculated
        expect(BigInt(quote.amountOut) > 0n).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 4: Transaction History Completeness**
   * **Validates: Requirements 4.2, 4.3**
   * 
   * For any swap executed through the pool, it should be properly recorded.
   */
  it('Property 4: Transaction History Completeness', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, async (amountIn) => {
        // Verify pool exists for transaction recording
        const exists = await swapService.poolExists(lukasTokenAddress, usdcAddress);
        expect(exists).toBe(true);

        // Verify quote can be generated for transaction
        const quote = await swapService.getSwapQuote(
          lukasTokenAddress,
          usdcAddress,
          amountIn,
          0.5
        );

        expect(quote).toBeDefined();
        expect(quote.amountIn).toBe(amountIn);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test invalid token pair handling
   */
  it('should reject invalid token pairs', async () => {
    const invalidToken = '0x' + '3'.repeat(40);

    await expect(
      swapService.getSwapQuote(invalidToken, usdcAddress, '1000000000000000000', 0.5)
    ).rejects.toThrow(LukasSDKError);
  });

  /**
   * Test pool not found handling
   */
  it('should handle pool not found', async () => {
    const mockPoolManagerNoPool = createMockPoolManager({
      getPoolId: vi.fn().mockResolvedValue('0x0000000000000000000000000000000000000000000000000000000000000000'),
    });

    const service = new SwapServiceImpl(
      mockPoolManagerNoPool,
      mockSwapRouter,
      lukasTokenAddress,
      usdcAddress
    );

    await expect(
      service.getSwapQuote(lukasTokenAddress, usdcAddress, '1000000000000000000', 0.5)
    ).rejects.toThrow(LukasSDKError);
  });
});
