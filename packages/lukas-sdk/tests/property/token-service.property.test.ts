import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TokenServiceImpl } from '../../src/services/TokenServiceImpl';
import { LukasSDKError } from '../../src/errors/LukasSDKError';

/**
 * Mock contract factory for testing
 */
function createMockContract(overrides: any = {}): any {
  return {
    name: vi.fn().mockResolvedValue(overrides.name || 'Lukas Token'),
    symbol: vi.fn().mockResolvedValue(overrides.symbol || 'LUKAS'),
    decimals: vi.fn().mockResolvedValue(overrides.decimals ?? 18),
    totalSupply: vi.fn().mockResolvedValue(overrides.totalSupply || '1000000000000000000000000'),
    balanceOf: vi.fn().mockResolvedValue(overrides.balanceOf || '0'),
    allowance: vi.fn().mockResolvedValue(overrides.allowance || '0'),
    transfer: vi.fn().mockResolvedValue({ hash: '0x123' }),
    approve: vi.fn().mockResolvedValue({ hash: '0x123' }),
    transferFrom: vi.fn().mockResolvedValue({ hash: '0x123' }),
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
  .map(n => n.toString());

describe('Token Service Property Tests', () => {
  let tokenService: TokenServiceImpl;
  let mockContract: any;
  const validContractAddress = '0x' + 'a'.repeat(40);

  beforeEach(() => {
    mockContract = createMockContract();
    tokenService = new TokenServiceImpl(mockContract, validContractAddress);
  });

  /**
   * **Feature: lukas-sdk, Property 3: Token information completeness**
   * **Validates: Requirements 2.1, 2.4**
   * 
   * For any network state, calling getTokenInfo should return all required fields
   * (name, symbol, decimals, totalSupply, address)
   */
  it('Property 3: Token information completeness', async () => {
    // Generator for valid token names (alphanumeric strings)
    const validNameGen = fc
      .stringMatching(/^[a-zA-Z0-9 ]{1,50}$/);

    // Generator for valid token symbols (uppercase alphanumeric)
    const validSymbolGen = fc
      .stringMatching(/^[A-Z0-9]{1,10}$/);

    // Generator for token metadata
    const tokenMetadataGen = fc.record({
      name: validNameGen,
      symbol: validSymbolGen,
      decimals: fc.integer({ min: 0, max: 36 }),
      totalSupply: fc.bigUintN(256).map(n => n.toString()),
    });

    await fc.assert(
      fc.asyncProperty(tokenMetadataGen, async (metadata) => {
        // Setup mock with specific metadata - use proper BigInt objects
        const totalSupplyBN = { toString: () => metadata.totalSupply };
        const mockContractWithMetadata = createMockContract({
          name: vi.fn().mockResolvedValue(metadata.name),
          symbol: vi.fn().mockResolvedValue(metadata.symbol),
          decimals: vi.fn().mockResolvedValue(metadata.decimals),
          totalSupply: vi.fn().mockResolvedValue(totalSupplyBN),
        });

        const service = new TokenServiceImpl(mockContractWithMetadata, validContractAddress);
        const tokenInfo = await service.getTokenInfo();

        // Verify all required fields are present
        expect(tokenInfo).toBeDefined();
        expect(tokenInfo.name).toBe(metadata.name);
        expect(tokenInfo.symbol).toBe(metadata.symbol);
        expect(tokenInfo.decimals).toBe(metadata.decimals);
        expect(tokenInfo.totalSupply).toBe(metadata.totalSupply);
        expect(tokenInfo.address).toBe(validContractAddress);

        // Verify no fields are null or undefined
        expect(tokenInfo.name).not.toBeNull();
        expect(tokenInfo.symbol).not.toBeNull();
        expect(tokenInfo.decimals).not.toBeNull();
        expect(tokenInfo.totalSupply).not.toBeNull();
        expect(tokenInfo.address).not.toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 4: Balance query consistency**
   * **Validates: Requirements 2.2**
   * 
   * For any valid address, querying balance should return a valid BigNumber
   * representing the current LUKAS balance
   */
  it('Property 4: Balance query consistency', async () => {
    await fc.assert(
      fc.asyncProperty(validAddressGen, validAmountGen, async (address, balance) => {
        // Setup mock to return specific balance
        const mockContractWithBalance = createMockContract({
          balanceOf: vi.fn().mockResolvedValue(balance),
        });

        const service = new TokenServiceImpl(mockContractWithBalance, validContractAddress);
        const result = await service.getBalance(address);

        // Verify result is a valid string representation of the balance
        expect(result).toBe(balance);
        expect(typeof result).toBe('string');

        // Verify it's a valid number string
        expect(() => BigInt(result)).not.toThrow();

        // Verify the balance is non-negative
        expect(BigInt(result) >= 0n).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 5: Allowance query consistency**
   * **Validates: Requirements 2.3**
   * 
   * For any valid owner and spender address pair, querying allowances should
   * return the correct approved amount
   */
  it('Property 5: Allowance query consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAddressGen,
        validAddressGen,
        validAmountGen,
        async (owner, spender, allowance) => {
          // Setup mock to return specific allowance
          const mockContractWithAllowance = createMockContract({
            allowance: vi.fn().mockResolvedValue(allowance),
          });

          const service = new TokenServiceImpl(mockContractWithAllowance, validContractAddress);
          const result = await service.getAllowance(owner, spender);

          // Verify result is a valid string representation of the allowance
          expect(result).toBe(allowance);
          expect(typeof result).toBe('string');

          // Verify it's a valid number string
          expect(() => BigInt(result)).not.toThrow();

          // Verify the allowance is non-negative
          expect(BigInt(result) >= 0n).toBe(true);

          // Verify the mock was called with correct parameters
          expect(mockContractWithAllowance.allowance).toHaveBeenCalledWith(owner, spender);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 7: Transfer operation validity**
   * **Validates: Requirements 3.1**
   * 
   * For any valid transfer parameters with sufficient balance, the transfer
   * method should execute successfully and return transaction details
   */
  it('Property 7: Transfer operation validity', async () => {
    await fc.assert(
      fc.asyncProperty(validAddressGen, validAmountGen, async (recipient, amount) => {
        // Setup mock to return a transaction response
        const mockTx = { hash: '0x' + 'b'.repeat(64) };
        const mockContractWithTransfer = createMockContract({
          transfer: vi.fn().mockResolvedValue(mockTx),
        });

        const service = new TokenServiceImpl(mockContractWithTransfer, validContractAddress);
        const result = await service.transfer(recipient, amount);

        // Verify transaction response is returned
        expect(result).toBeDefined();
        expect(result.hash).toBe(mockTx.hash);

        // Verify the mock was called with correct parameters
        expect(mockContractWithTransfer.transfer).toHaveBeenCalledWith(recipient, amount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 8: Insufficient balance protection**
   * **Validates: Requirements 3.4**
   * 
   * For any transfer attempt with insufficient balance, the SDK should prevent
   * the transaction and return an appropriate error
   */
  it('Property 8: Insufficient balance protection', async () => {
    await fc.assert(
      fc.asyncProperty(validAddressGen, validAmountGen, async (recipient, amount) => {
        // Setup mock to throw insufficient balance error
        const mockContractWithError = createMockContract({
          transfer: vi.fn().mockRejectedValue(new Error('insufficient balance')),
        });

        const service = new TokenServiceImpl(mockContractWithError, validContractAddress);

        // Verify error is thrown
        await expect(service.transfer(recipient, amount)).rejects.toThrow(LukasSDKError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 9: Approval operation validity**
   * **Validates: Requirements 3.2**
   * 
   * For any valid approval parameters, the approve method should set the
   * allowance and return transaction confirmation
   */
  it('Property 9: Approval operation validity', async () => {
    await fc.assert(
      fc.asyncProperty(validAddressGen, validAmountGen, async (spender, amount) => {
        // Setup mock to return a transaction response
        const mockTx = { hash: '0x' + 'c'.repeat(64) };
        const mockContractWithApprove = createMockContract({
          approve: vi.fn().mockResolvedValue(mockTx),
        });

        const service = new TokenServiceImpl(mockContractWithApprove, validContractAddress);
        const result = await service.approve(spender, amount);

        // Verify transaction response is returned
        expect(result).toBeDefined();
        expect(result.hash).toBe(mockTx.hash);

        // Verify the mock was called with correct parameters
        expect(mockContractWithApprove.approve).toHaveBeenCalledWith(spender, amount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 10: TransferFrom with allowance**
   * **Validates: Requirements 3.3**
   * 
   * For any valid transferFrom parameters with sufficient allowance, the
   * operation should execute successfully
   */
  it('Property 10: TransferFrom with allowance', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAddressGen,
        validAddressGen,
        validAmountGen,
        async (from, to, amount) => {
          // Setup mock to return a transaction response
          const mockTx = { hash: '0x' + 'd'.repeat(64) };
          const mockContractWithTransferFrom = createMockContract({
            transferFrom: vi.fn().mockResolvedValue(mockTx),
          });

          const service = new TokenServiceImpl(mockContractWithTransferFrom, validContractAddress);
          const result = await service.transferFrom(from, to, amount);

          // Verify transaction response is returned
          expect(result).toBeDefined();
          expect(result.hash).toBe(mockTx.hash);

          // Verify the mock was called with correct parameters
          expect(mockContractWithTransferFrom.transferFrom).toHaveBeenCalledWith(from, to, amount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 11: Insufficient allowance protection**
   * **Validates: Requirements 3.5**
   * 
   * For any transferFrom attempt with insufficient allowance, the SDK should
   * prevent the transaction and return an appropriate error
   */
  it('Property 11: Insufficient allowance protection', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAddressGen,
        validAddressGen,
        validAmountGen,
        async (from, to, amount) => {
          // Setup mock to throw insufficient allowance error
          const mockContractWithError = createMockContract({
            transferFrom: vi.fn().mockRejectedValue(new Error('insufficient allowance')),
          });

          const service = new TokenServiceImpl(mockContractWithError, validContractAddress);

          // Verify error is thrown
          await expect(service.transferFrom(from, to, amount)).rejects.toThrow(LukasSDKError);
        }
      ),
      { numRuns: 100 }
    );
  });
});
