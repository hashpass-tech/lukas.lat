import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { LiquidityServiceImpl } from '../../src/services/LiquidityServiceImpl';
import { LukasSDKError } from '../../src/errors/LukasSDKError';

/**
 * Mock contract factory for testing
 */
function createMockContract(overrides: any = {}): any {
  return {
    addLiquidity: vi.fn().mockResolvedValue({ hash: '0x123' }),
    removeLiquidity: vi.fn().mockResolvedValue({ hash: '0x123' }),
    getLiquidityPosition: vi.fn().mockResolvedValue({
      liquidity: '1000000000000000000',
      lukasAmount: '500000000000000000',
      usdcAmount: '500000000000000000',
    }),
    filters: {
      LiquidityAdded: vi.fn().mockReturnValue({}),
      LiquidityRemoved: vi.fn().mockReturnValue({}),
    },
    on: vi.fn(),
    off: vi.fn(),
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

describe('Liquidity Service Property Tests', () => {
  let liquidityService: LiquidityServiceImpl;
  let mockContract: any;
  const validContractAddress = '0x' + 'a'.repeat(40);

  beforeEach(() => {
    mockContract = createMockContract();
    liquidityService = new LiquidityServiceImpl(mockContract, validContractAddress);
  });

  /**
   * **Feature: lukas-sdk, Property 19: Liquidity operation validity**
   * **Validates: Requirements 6.1, 6.2, 6.5**
   * 
   * For any valid liquidity operation parameters with sufficient tokens, the
   * operation should execute and return proper details
   */
  it('Property 19: Liquidity operation validity', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, validAmountGen, async (lukasAmount, usdcAmount) => {
        // Setup mock to return a transaction response
        const mockTx = { hash: '0x' + 'b'.repeat(64) };
        const mockContractWithAddLiquidity = createMockContract({
          addLiquidity: vi.fn().mockResolvedValue(mockTx),
        });

        const service = new LiquidityServiceImpl(mockContractWithAddLiquidity, validContractAddress);
        const result = await service.addLiquidity(lukasAmount, usdcAmount);

        // Verify transaction response is returned
        expect(result).toBeDefined();
        expect(result.hash).toBe(mockTx.hash);

        // Verify the mock was called with 4 parameters (amounts + minimum amounts for slippage)
        expect(mockContractWithAddLiquidity.addLiquidity).toHaveBeenCalled();
        const callArgs = mockContractWithAddLiquidity.addLiquidity.mock.calls[0];
        expect(callArgs).toHaveLength(4);
        expect(callArgs[0]).toBe(lukasAmount);
        expect(callArgs[1]).toBe(usdcAmount);
        // callArgs[2] and callArgs[3] are minimum amounts calculated with slippage
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 20: Liquidity position queries**
   * **Validates: Requirements 6.3**
   * 
   * For any valid address, querying liquidity positions should return current
   * position information
   */
  it('Property 20: Liquidity position queries', async () => {
    await fc.assert(
      fc.asyncProperty(validAddressGen, validAmountGen, validAmountGen, validAmountGen, async (address, liquidity, lukasAmount, usdcAmount) => {
        // Setup mock to return specific position data
        const mockContractWithPosition = createMockContract({
          getLiquidityPosition: vi.fn().mockResolvedValue({
            liquidity,
            lukasAmount,
            usdcAmount,
          }),
        });

        const service = new LiquidityServiceImpl(mockContractWithPosition, validContractAddress);
        const result = await service.getLiquidityPosition(address);

        // Verify all required fields are present
        expect(result).toBeDefined();
        expect(result.liquidity).toBe(liquidity);
        expect(result.lukasAmount).toBe(lukasAmount);
        expect(result.usdcAmount).toBe(usdcAmount);

        // Verify no fields are null or undefined
        expect(result.liquidity).not.toBeNull();
        expect(result.lukasAmount).not.toBeNull();
        expect(result.usdcAmount).not.toBeNull();

        // Verify all values are valid number strings
        expect(() => BigInt(result.liquidity)).not.toThrow();
        expect(() => BigInt(result.lukasAmount)).not.toThrow();
        expect(() => BigInt(result.usdcAmount)).not.toThrow();

        // Verify the mock was called with correct parameters
        expect(mockContractWithPosition.getLiquidityPosition).toHaveBeenCalledWith(address);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 21: Insufficient token protection**
   * **Validates: Requirements 6.4**
   * 
   * For any liquidity operation with insufficient tokens, the SDK should prevent
   * the transaction and return appropriate error
   */
  it('Property 21: Insufficient token protection', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, validAmountGen, async (lukasAmount, usdcAmount) => {
        // Setup mock to throw insufficient balance error
        const mockContractWithError = createMockContract({
          addLiquidity: vi.fn().mockRejectedValue(new Error('insufficient balance')),
        });

        const service = new LiquidityServiceImpl(mockContractWithError, validContractAddress);

        // Verify error is thrown
        await expect(service.addLiquidity(lukasAmount, usdcAmount)).rejects.toThrow(LukasSDKError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that remove liquidity operations work correctly
   */
  it('Remove liquidity operation validity', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, async (liquidity) => {
        // Setup mock to return a transaction response
        const mockTx = { hash: '0x' + 'c'.repeat(64) };
        const mockContractWithRemoveLiquidity = createMockContract({
          removeLiquidity: vi.fn().mockResolvedValue(mockTx),
        });

        const service = new LiquidityServiceImpl(mockContractWithRemoveLiquidity, validContractAddress);
        const result = await service.removeLiquidity(liquidity);

        // Verify transaction response is returned
        expect(result).toBeDefined();
        expect(result.hash).toBe(mockTx.hash);

        // Verify the mock was called with correct parameters
        expect(mockContractWithRemoveLiquidity.removeLiquidity).toHaveBeenCalledWith(liquidity);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that zero amounts are rejected
   */
  it('Zero amounts are rejected', async () => {
    const mockContractWithError = createMockContract();
    const service = new LiquidityServiceImpl(mockContractWithError, validContractAddress);

    // Test zero LUKAS amount
    await expect(service.addLiquidity('0', '1000000000000000000')).rejects.toThrow(LukasSDKError);

    // Test zero USDC amount
    await expect(service.addLiquidity('1000000000000000000', '0')).rejects.toThrow(LukasSDKError);

    // Test zero liquidity removal
    await expect(service.removeLiquidity('0')).rejects.toThrow(LukasSDKError);
  });

  /**
   * Test that invalid addresses are rejected
   */
  it('Invalid addresses are rejected', async () => {
    const mockContractWithError = createMockContract();
    const service = new LiquidityServiceImpl(mockContractWithError, validContractAddress);

    // Test invalid address
    await expect(service.getLiquidityPosition('invalid-address')).rejects.toThrow(LukasSDKError);
  });
});
