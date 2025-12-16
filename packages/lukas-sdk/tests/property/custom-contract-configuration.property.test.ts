import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { LukasSDK } from '../../src/core/LukasSDK';
import { NetworkManager } from '../../src/core/NetworkManager';
import type { LukasSDKConfig, ContractAddresses } from '../../src/core/types';

/**
 * **Feature: lukas-sdk, Property 26: Custom contract configuration**
 * **Validates: Requirements 10.4**
 * 
 * For any valid custom contract addresses, the SDK should accept the configuration 
 * and connect to the specified contracts
 */
describe('Custom Contract Configuration Property Tests', () => {
  it('Property 26: Custom contract configuration', () => {
    // Generator for valid contract addresses
    const validContractAddressGen = fc.hexaString({ minLength: 40, maxLength: 40 })
      .map(s => `0x${s}`);

    // Generator for complete contract addresses
    const completeContractAddressesGen = fc.record({
      lukasToken: validContractAddressGen,
      stabilizerVault: validContractAddressGen,
      latAmBasketIndex: validContractAddressGen,
      lukasHook: validContractAddressGen,
      usdc: validContractAddressGen,
    });

    // Generator for custom networks (non-supported chain IDs)
    const customNetworkGen = fc.record({
      chainId: fc.integer({ min: 1000000, max: 9999999 }), // Use high chainIds to avoid supported networks
      name: fc.string({ minLength: 1, maxLength: 50 }),
      rpcUrl: fc.option(fc.webUrl(), { nil: undefined }),
      blockExplorer: fc.option(fc.webUrl(), { nil: undefined }),
    });

    // Test custom contract configuration with custom networks
    fc.assert(
      fc.property(
        customNetworkGen,
        completeContractAddressesGen,
        (network, contracts) => {
          // Ensure this is not a supported network
          if (NetworkManager.isNetworkSupported(network.chainId)) {
            return; // Skip supported networks for this test
          }

          const config: LukasSDKConfig = {
            network,
            contracts,
          };

          // Should successfully initialize SDK with custom contracts
          const sdk = new LukasSDK(config);

          // Verify SDK is properly initialized
          expect(sdk).toBeInstanceOf(LukasSDK);
          expect(sdk.isInitialized()).toBe(true);

          // Verify network information matches configuration
          const networkInfo = sdk.getNetworkInfo();
          expect(networkInfo.chainId).toBe(network.chainId);
          expect(networkInfo.name).toBe(network.name);

          // Verify custom contract addresses are used
          expect(networkInfo.contracts.lukasToken).toBe(contracts.lukasToken);
          expect(networkInfo.contracts.stabilizerVault).toBe(contracts.stabilizerVault);
          expect(networkInfo.contracts.latAmBasketIndex).toBe(contracts.latAmBasketIndex);
          expect(networkInfo.contracts.lukasHook).toBe(contracts.lukasHook);
          expect(networkInfo.contracts.usdc).toBe(contracts.usdc);

          // All contract addresses should be valid format
          expect(networkInfo.contracts.lukasToken).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.stabilizerVault).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.latAmBasketIndex).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.lukasHook).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.usdc).toMatch(/^0x[a-fA-F0-9]{40}$/);

          // SDK should be in read-only mode by default (no provider)
          expect(sdk.isReadOnly()).toBe(true);
        }
      ),
      { numRuns: 100 }
    );

    // Test partial contract override for supported networks
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(NetworkManager['SUPPORTED_NETWORKS']).map(Number)),
        fc.record({
          lukasToken: fc.option(validContractAddressGen, { nil: undefined }),
          stabilizerVault: fc.option(validContractAddressGen, { nil: undefined }),
          latAmBasketIndex: fc.option(validContractAddressGen, { nil: undefined }),
          lukasHook: fc.option(validContractAddressGen, { nil: undefined }),
          usdc: fc.option(validContractAddressGen, { nil: undefined }),
        }),
        (chainId, partialContracts) => {
          const defaultConfig = NetworkManager.getDefaultNetworkConfig(chainId);
          
          const config: LukasSDKConfig = {
            network: {
              chainId,
              name: defaultConfig.name,
            },
            contracts: partialContracts,
          };

          // Should successfully initialize SDK with partial contract overrides
          const sdk = new LukasSDK(config);

          // Verify SDK is properly initialized
          expect(sdk).toBeInstanceOf(LukasSDK);
          expect(sdk.isInitialized()).toBe(true);

          // Verify network information
          const networkInfo = sdk.getNetworkInfo();
          expect(networkInfo.chainId).toBe(chainId);

          // Verify contract addresses - should use custom ones where provided, defaults otherwise
          if (partialContracts.lukasToken) {
            expect(networkInfo.contracts.lukasToken).toBe(partialContracts.lukasToken);
          } else {
            expect(networkInfo.contracts.lukasToken).toBe(defaultConfig.contracts.lukasToken);
          }

          if (partialContracts.stabilizerVault) {
            expect(networkInfo.contracts.stabilizerVault).toBe(partialContracts.stabilizerVault);
          } else {
            expect(networkInfo.contracts.stabilizerVault).toBe(defaultConfig.contracts.stabilizerVault);
          }

          if (partialContracts.latAmBasketIndex) {
            expect(networkInfo.contracts.latAmBasketIndex).toBe(partialContracts.latAmBasketIndex);
          } else {
            expect(networkInfo.contracts.latAmBasketIndex).toBe(defaultConfig.contracts.latAmBasketIndex);
          }

          if (partialContracts.lukasHook) {
            expect(networkInfo.contracts.lukasHook).toBe(partialContracts.lukasHook);
          } else {
            expect(networkInfo.contracts.lukasHook).toBe(defaultConfig.contracts.lukasHook);
          }

          if (partialContracts.usdc) {
            expect(networkInfo.contracts.usdc).toBe(partialContracts.usdc);
          } else {
            expect(networkInfo.contracts.usdc).toBe(defaultConfig.contracts.usdc);
          }

          // All contract addresses should be valid format
          expect(networkInfo.contracts.lukasToken).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.stabilizerVault).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.latAmBasketIndex).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.lukasHook).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(networkInfo.contracts.usdc).toMatch(/^0x[a-fA-F0-9]{40}$/);
        }
      ),
      { numRuns: 100 }
    );

    // Test contract manager integration with custom contracts
    fc.assert(
      fc.property(
        customNetworkGen,
        completeContractAddressesGen,
        (network, contracts) => {
          // Ensure this is not a supported network
          if (NetworkManager.isNetworkSupported(network.chainId)) {
            return; // Skip supported networks for this test
          }

          const config: LukasSDKConfig = {
            network,
            contracts,
          };

          const sdk = new LukasSDK(config);

          // Contract manager should be available (even without provider for address validation)
          const contractManager = sdk.getContractManager();
          expect(contractManager).toBeDefined();

          // Contract addresses should match custom configuration
          const addresses = contractManager.getAddresses();
          expect(addresses.lukasToken).toBe(contracts.lukasToken);
          expect(addresses.stabilizerVault).toBe(contracts.stabilizerVault);
          expect(addresses.latAmBasketIndex).toBe(contracts.latAmBasketIndex);
          expect(addresses.lukasHook).toBe(contracts.lukasHook);
          expect(addresses.usdc).toBe(contracts.usdc);
        }
      ),
      { numRuns: 100 }
    );
  });
});