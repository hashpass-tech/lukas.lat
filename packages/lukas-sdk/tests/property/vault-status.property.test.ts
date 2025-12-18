import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { VaultServiceImpl } from '../../src/services/VaultServiceImpl';
import { LukasSDKError } from '../../src/errors/LukasSDKError';

/**
 * Mock contract factory for testing
 */
function createMockContract(overrides: any = {}): any {
  return {
    getVaultInfo: vi.fn().mockResolvedValue(overrides.getVaultInfo || {
      maxMintPerAction: '1000000000000000000000',
      maxBuybackPerAction: '500000000000000000000',
      deviationThreshold: 500,
      cooldownPeriod: 3600,
      lastStabilization: Math.floor(Date.now() / 1000),
      totalMinted: '0',
      totalBoughtBack: '0',
    }),
    getCollateralBalance: vi.fn().mockResolvedValue(overrides.getCollateralBalance || {
      usdc: '1000000000000',
      lukas: '500000000000000000000',
      totalValueUSD: '1500000000000',
    }),
    isAuthorized: vi.fn().mockResolvedValue(overrides.isAuthorized ?? false),
    shouldStabilize: vi.fn().mockResolvedValue(overrides.shouldStabilize || {
      shouldStabilize: false,
      isOverPeg: false,
      deviationBps: 0,
      recommendedAmount: '0',
      canExecute: false,
    }),
    stabilizeMint: vi.fn().mockResolvedValue({ hash: '0x123' }),
    stabilizeBuyback: vi.fn().mockResolvedValue({ hash: '0x123' }),
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

describe('Vault Service Property Tests', () => {
  let vaultService: VaultServiceImpl;
  let mockContract: any;
  const validContractAddress = '0x' + 'a'.repeat(40);

  beforeEach(() => {
    mockContract = createMockContract();
    vaultService = new VaultServiceImpl(mockContract, validContractAddress);
  });

  /**
   * **Feature: lukas-sdk, Property 17: Vault status completeness**
   * **Validates: Requirements 5.2**
   * 
   * For any vault status query, the response should include current collateral
   * balances and all operational parameters
   */
  it('Property 17: Vault status completeness', async () => {
    // Generator for vault parameters
    const vaultParamsGen = fc.record({
      maxMintPerAction: fc.bigUintN(256).map(n => n.toString()),
      maxBuybackPerAction: fc.bigUintN(256).map(n => n.toString()),
      deviationThreshold: fc.integer({ min: 0, max: 10000 }),
      cooldownPeriod: fc.integer({ min: 0, max: 86400 }),
      lastStabilization: fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }),
      totalMinted: fc.bigUintN(256).map(n => n.toString()),
      totalBoughtBack: fc.bigUintN(256).map(n => n.toString()),
    });

    await fc.assert(
      fc.asyncProperty(vaultParamsGen, async (params) => {
        // Setup mock with specific vault parameters
        const mockContractWithParams = createMockContract({
          getVaultInfo: vi.fn().mockResolvedValue({
            maxMintPerAction: { toString: () => params.maxMintPerAction },
            maxBuybackPerAction: { toString: () => params.maxBuybackPerAction },
            deviationThreshold: params.deviationThreshold,
            cooldownPeriod: params.cooldownPeriod,
            lastStabilization: params.lastStabilization,
            totalMinted: { toString: () => params.totalMinted },
            totalBoughtBack: { toString: () => params.totalBoughtBack },
          }),
        });

        const service = new VaultServiceImpl(mockContractWithParams, validContractAddress);
        const vaultInfo = await service.getVaultInfo();

        // Verify all required fields are present
        expect(vaultInfo).toBeDefined();
        expect(vaultInfo.maxMintPerAction).toBe(params.maxMintPerAction);
        expect(vaultInfo.maxBuybackPerAction).toBe(params.maxBuybackPerAction);
        expect(vaultInfo.deviationThreshold).toBe(params.deviationThreshold);
        expect(vaultInfo.cooldownPeriod).toBe(params.cooldownPeriod);
        expect(vaultInfo.lastStabilization).toBe(params.lastStabilization);
        expect(vaultInfo.totalMinted).toBe(params.totalMinted);
        expect(vaultInfo.totalBoughtBack).toBe(params.totalBoughtBack);

        // Verify no fields are null or undefined
        expect(vaultInfo.maxMintPerAction).not.toBeNull();
        expect(vaultInfo.maxBuybackPerAction).not.toBeNull();
        expect(vaultInfo.deviationThreshold).not.toBeNull();
        expect(vaultInfo.cooldownPeriod).not.toBeNull();
        expect(vaultInfo.lastStabilization).not.toBeNull();
        expect(vaultInfo.totalMinted).not.toBeNull();
        expect(vaultInfo.totalBoughtBack).not.toBeNull();

        // Verify numeric fields are valid numbers
        expect(typeof vaultInfo.deviationThreshold).toBe('number');
        expect(typeof vaultInfo.cooldownPeriod).toBe('number');
        expect(typeof vaultInfo.lastStabilization).toBe('number');

        // Verify amount fields are valid number strings
        expect(() => BigInt(vaultInfo.maxMintPerAction)).not.toThrow();
        expect(() => BigInt(vaultInfo.maxBuybackPerAction)).not.toThrow();
        expect(() => BigInt(vaultInfo.totalMinted)).not.toThrow();
        expect(() => BigInt(vaultInfo.totalBoughtBack)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 17: Vault status completeness (collateral)**
   * **Validates: Requirements 5.2**
   * 
   * For any collateral balance query, the response should include USDC balance,
   * LUKAS balance, and total value in USD
   */
  it('Property 17: Vault status completeness - collateral balances', async () => {
    // Generator for collateral balances
    const collateralGen = fc.record({
      usdc: fc.bigUintN(256).map(n => n.toString()),
      lukas: fc.bigUintN(256).map(n => n.toString()),
      totalValueUSD: fc.bigUintN(256).map(n => n.toString()),
    });

    await fc.assert(
      fc.asyncProperty(collateralGen, async (collateral) => {
        // Setup mock with specific collateral balances
        const mockContractWithCollateral = createMockContract({
          getCollateralBalance: vi.fn().mockResolvedValue({
            usdc: { toString: () => collateral.usdc },
            lukas: { toString: () => collateral.lukas },
            totalValueUSD: { toString: () => collateral.totalValueUSD },
          }),
        });

        const service = new VaultServiceImpl(mockContractWithCollateral, validContractAddress);
        const collateralBalance = await service.getCollateralBalance();

        // Verify all required fields are present
        expect(collateralBalance).toBeDefined();
        expect(collateralBalance.usdc).toBe(collateral.usdc);
        expect(collateralBalance.lukas).toBe(collateral.lukas);
        expect(collateralBalance.totalValueUSD).toBe(collateral.totalValueUSD);

        // Verify no fields are null or undefined
        expect(collateralBalance.usdc).not.toBeNull();
        expect(collateralBalance.lukas).not.toBeNull();
        expect(collateralBalance.totalValueUSD).not.toBeNull();

        // Verify all fields are valid number strings
        expect(() => BigInt(collateralBalance.usdc)).not.toThrow();
        expect(() => BigInt(collateralBalance.lukas)).not.toThrow();
        expect(() => BigInt(collateralBalance.totalValueUSD)).not.toThrow();

        // Verify balances are non-negative
        expect(BigInt(collateralBalance.usdc) >= 0n).toBe(true);
        expect(BigInt(collateralBalance.lukas) >= 0n).toBe(true);
        expect(BigInt(collateralBalance.totalValueUSD) >= 0n).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 18: Authorization check accuracy**
   * **Validates: Requirements 5.4**
   * 
   * For any address, checking authorization status should return the correct
   * boolean indicating vault operation permissions
   */
  it('Property 18: Authorization check accuracy', async () => {
    await fc.assert(
      fc.asyncProperty(validAddressGen, fc.boolean(), async (address, isAuthorized) => {
        // Setup mock to return specific authorization status
        const mockContractWithAuth = createMockContract({
          isAuthorized: vi.fn().mockResolvedValue(isAuthorized),
        });

        const service = new VaultServiceImpl(mockContractWithAuth, validContractAddress);
        const result = await service.isAuthorized(address);

        // Verify result is a boolean
        expect(typeof result).toBe('boolean');
        expect(result).toBe(isAuthorized);

        // Verify the mock was called with correct parameters
        expect(mockContractWithAuth.isAuthorized).toHaveBeenCalledWith(address);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 18: Authorization check accuracy (invalid address)**
   * **Validates: Requirements 5.4**
   * 
   * For any invalid address, checking authorization should throw an error
   */
  it('Property 18: Authorization check accuracy - invalid address rejection', async () => {
    // Generator for invalid addresses
    const invalidAddressGen = fc.oneof(
      fc.constant(''),
      fc.constant('0x'),
      fc.constant('invalid'),
      fc.hexaString({ minLength: 39, maxLength: 39 }).map(hex => `0x${hex}`), // Too short
      fc.hexaString({ minLength: 41, maxLength: 41 }).map(hex => `0x${hex}`) // Too long
    );

    await fc.assert(
      fc.asyncProperty(invalidAddressGen, async (invalidAddress) => {
        const service = new VaultServiceImpl(mockContract, validContractAddress);

        // Verify error is thrown for invalid address
        await expect(service.isAuthorized(invalidAddress)).rejects.toThrow(LukasSDKError);
      }),
      { numRuns: 100 }
    );
  });
});
