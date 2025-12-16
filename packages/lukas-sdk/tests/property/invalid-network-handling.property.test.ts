import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { LukasSDK } from '../../src/core/LukasSDK';
import { LukasSDKError, LukasSDKErrorCode } from '../../src/errors/LukasSDKError';
import type { LukasSDKConfig, NetworkConfig } from '../../src/core/types';

/**
 * **Feature: lukas-sdk, Property 2: Invalid network error handling**
 * **Validates: Requirements 1.5, 10.5**
 * 
 * For any invalid network configuration, the SDK should throw descriptive 
 * error messages and not initialize
 */
describe('Invalid Network Handling Property Tests', () => {
  it('Property 2: Invalid network error handling', () => {
    // Generator for invalid network configurations
    const invalidNetworkConfigGen = fc.oneof(
      // Missing chainId
      fc.record({
        name: fc.string({ minLength: 1 }),
        rpcUrl: fc.option(fc.webUrl()),
        blockExplorer: fc.option(fc.webUrl()),
      }),
      // Invalid chainId (not a number)
      fc.record({
        chainId: fc.oneof(fc.string(), fc.boolean(), fc.object()),
        name: fc.string({ minLength: 1 }),
        rpcUrl: fc.option(fc.webUrl()),
        blockExplorer: fc.option(fc.webUrl()),
      }),
      // Invalid chainId (negative or zero)
      fc.record({
        chainId: fc.integer({ max: 0 }),
        name: fc.string({ minLength: 1 }),
        rpcUrl: fc.option(fc.webUrl()),
        blockExplorer: fc.option(fc.webUrl()),
      }),
      // Missing name
      fc.record({
        chainId: fc.integer({ min: 1 }),
        rpcUrl: fc.option(fc.webUrl()),
        blockExplorer: fc.option(fc.webUrl()),
      }),
      // Invalid name (not a string)
      fc.record({
        chainId: fc.integer({ min: 1 }),
        name: fc.oneof(fc.integer(), fc.boolean(), fc.object()),
        rpcUrl: fc.option(fc.webUrl()),
        blockExplorer: fc.option(fc.webUrl()),
      }),
      // Empty name
      fc.record({
        chainId: fc.integer({ min: 1 }),
        name: fc.constant(''),
        rpcUrl: fc.option(fc.webUrl()),
        blockExplorer: fc.option(fc.webUrl()),
      }),
      // Invalid rpcUrl (not a string when provided)
      fc.record({
        chainId: fc.integer({ min: 1 }),
        name: fc.string({ minLength: 1 }),
        rpcUrl: fc.oneof(fc.integer(), fc.boolean(), fc.object()),
        blockExplorer: fc.option(fc.webUrl()),
      }),
      // Invalid blockExplorer (not a string when provided)
      fc.record({
        chainId: fc.integer({ min: 1 }),
        name: fc.string({ minLength: 1 }),
        rpcUrl: fc.option(fc.webUrl()),
        blockExplorer: fc.oneof(fc.integer(), fc.boolean(), fc.object()),
      })
    );

    // Generator for invalid contract addresses
    const invalidContractAddressesGen = fc.record({
      lukasToken: fc.option(fc.oneof(
        fc.string().filter(s => !/^0x[a-fA-F0-9]{40}$/.test(s)), // Invalid format
        fc.integer(),
        fc.boolean()
      )),
      stabilizerVault: fc.option(fc.oneof(
        fc.string().filter(s => !/^0x[a-fA-F0-9]{40}$/.test(s)),
        fc.integer(),
        fc.boolean()
      )),
      latAmBasketIndex: fc.option(fc.oneof(
        fc.string().filter(s => !/^0x[a-fA-F0-9]{40}$/.test(s)),
        fc.integer(),
        fc.boolean()
      )),
      lukasHook: fc.option(fc.oneof(
        fc.string().filter(s => !/^0x[a-fA-F0-9]{40}$/.test(s)),
        fc.integer(),
        fc.boolean()
      )),
      usdc: fc.option(fc.oneof(
        fc.string().filter(s => !/^0x[a-fA-F0-9]{40}$/.test(s)),
        fc.integer(),
        fc.boolean()
      )),
    });

    // Test invalid network configurations
    fc.assert(
      fc.property(invalidNetworkConfigGen, (invalidNetwork) => {
        const config: any = {
          network: invalidNetwork,
        };

        // Should throw LukasSDKError with appropriate error code
        expect(() => new LukasSDK(config)).toThrow(LukasSDKError);
        
        try {
          new LukasSDK(config);
          // Should not reach here
          expect(false).toBe(true);
        } catch (error) {
          expect(error).toBeInstanceOf(LukasSDKError);
          const sdkError = error as LukasSDKError;
          
          // Should have appropriate error code
          expect([
            LukasSDKErrorCode.INVALID_NETWORK_CONFIG,
            LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
            LukasSDKErrorCode.MISSING_CONTRACT_ADDRESS,
          ]).toContain(sdkError.code);
          
          // Should have descriptive error message
          expect(sdkError.message).toBeDefined();
          expect(typeof sdkError.message).toBe('string');
          expect(sdkError.message.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );

    // Test invalid contract addresses for custom networks
    fc.assert(
      fc.property(
        fc.record({
          chainId: fc.integer({ min: 1000000 }), // Use high chainId to avoid supported networks
          name: fc.string({ minLength: 1 }),
        }),
        invalidContractAddressesGen,
        (customNetwork, invalidContracts) => {
          const config: LukasSDKConfig = {
            network: customNetwork,
            contracts: invalidContracts as any,
          };

          // Should throw LukasSDKError
          expect(() => new LukasSDK(config)).toThrow(LukasSDKError);
          
          try {
            new LukasSDK(config);
            // Should not reach here
            expect(false).toBe(true);
          } catch (error) {
            expect(error).toBeInstanceOf(LukasSDKError);
            const sdkError = error as LukasSDKError;
            
            // Should have appropriate error code
            expect([
              LukasSDKErrorCode.INVALID_ADDRESS,
              LukasSDKErrorCode.MISSING_CONTRACT_ADDRESS,
            ]).toContain(sdkError.code);
            
            // Should have descriptive error message
            expect(sdkError.message).toBeDefined();
            expect(typeof sdkError.message).toBe('string');
            expect(sdkError.message.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );

    // Test custom network without contract addresses
    fc.assert(
      fc.property(
        fc.record({
          chainId: fc.integer({ min: 1000000 }), // Use high chainId to avoid supported networks
          name: fc.string({ minLength: 1 }),
        }),
        (customNetwork) => {
          const config: LukasSDKConfig = {
            network: customNetwork,
            // No contracts provided for custom network
          };

          // Should throw LukasSDKError about missing contract addresses
          expect(() => new LukasSDK(config)).toThrow(LukasSDKError);
          
          try {
            new LukasSDK(config);
            // Should not reach here
            expect(false).toBe(true);
          } catch (error) {
            expect(error).toBeInstanceOf(LukasSDKError);
            const sdkError = error as LukasSDKError;
            
            // Should have missing contract address error
            expect(sdkError.code).toBe(LukasSDKErrorCode.MISSING_CONTRACT_ADDRESS);
            
            // Should mention custom networks require contract addresses
            expect(sdkError.message).toContain('Custom networks require all contract addresses');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});