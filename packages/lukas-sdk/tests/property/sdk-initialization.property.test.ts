import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { LukasSDK } from '../../src/core/LukasSDK';
import { NetworkManager } from '../../src/core/NetworkManager';
import type { LukasSDKConfig, NetworkConfig } from '../../src/core/types';

/**
 * **Feature: lukas-sdk, Property 1: Network initialization consistency**
 * **Validates: Requirements 1.3, 10.1**
 * 
 * For any valid network configuration, initializing the SDK should result in 
 * connections to the correct contract addresses for that network
 */
describe('SDK Initialization Property Tests', () => {
  it('Property 1: Network initialization consistency', () => {
    // Get supported networks using the public API
    const supportedNetworks = NetworkManager.getSupportedNetworks();
    
    // Generator for supported network configurations
    const supportedNetworkConfigGen = fc.constantFrom(...supportedNetworks)
      .map((networkConfig): NetworkConfig => ({
        chainId: networkConfig.chainId,
        name: networkConfig.name,
        rpcUrl: networkConfig.rpcUrl,
        blockExplorer: networkConfig.blockExplorer,
      }));

    // Generator for custom valid network configurations
    const customNetworkConfigGen = fc.record({
      chainId: fc.integer({ min: 1, max: 999999 }).filter(id => !NetworkManager.isNetworkSupported(id)),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      rpcUrl: fc.option(fc.webUrl(), { nil: undefined }),
      blockExplorer: fc.option(fc.webUrl(), { nil: undefined }),
    });

    // Generator for complete contract addresses (required for custom networks)
    const contractAddressesGen = fc.record({
      lukasToken: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      stabilizerVault: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      latAmBasketIndex: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      lukasHook: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      usdc: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
    });

    // Generator for SDK configurations with supported networks
    const supportedNetworkSDKConfigGen = supportedNetworkConfigGen.map((network): LukasSDKConfig => ({
      network,
    }));

    // Generator for SDK configurations with custom networks
    const customNetworkSDKConfigGen = fc.tuple(customNetworkConfigGen, contractAddressesGen)
      .map(([network, contracts]): LukasSDKConfig => ({
        network,
        contracts,
      }));

    // Combine both generators
    const validSDKConfigGen = fc.oneof(supportedNetworkSDKConfigGen, customNetworkSDKConfigGen);

    fc.assert(
      fc.property(validSDKConfigGen, (config) => {
        // Initialize SDK with valid configuration
        const sdk = new LukasSDK(config);

        // Verify SDK is properly initialized
        const networkInfo = sdk.getNetworkInfo();

        // Network information should match the configuration
        expect(networkInfo.chainId).toBe(config.network.chainId);
        expect(networkInfo.name).toBe(config.network.name);

        // Contract addresses should be properly set
        expect(networkInfo.contracts).toBeDefined();
        expect(networkInfo.contracts.lukasToken).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(networkInfo.contracts.stabilizerVault).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(networkInfo.contracts.latAmBasketIndex).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(networkInfo.contracts.lukasHook).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(networkInfo.contracts.usdc).toMatch(/^0x[a-fA-F0-9]{40}$/);

        // For supported networks, should use default contract addresses
        if (NetworkManager.isNetworkSupported(config.network.chainId)) {
          const defaultConfig = NetworkManager.getDefaultNetworkConfig(config.network.chainId);
          expect(networkInfo.contracts).toEqual(defaultConfig.contracts);
        }

        // For custom networks, should use provided contract addresses
        if (!NetworkManager.isNetworkSupported(config.network.chainId) && config.contracts) {
          expect(networkInfo.contracts.lukasToken).toBe(config.contracts.lukasToken);
          expect(networkInfo.contracts.stabilizerVault).toBe(config.contracts.stabilizerVault);
          expect(networkInfo.contracts.latAmBasketIndex).toBe(config.contracts.latAmBasketIndex);
          expect(networkInfo.contracts.lukasHook).toBe(config.contracts.lukasHook);
          expect(networkInfo.contracts.usdc).toBe(config.contracts.usdc);
        }

        // SDK should be in read-only mode by default (no provider)
        expect(sdk.isReadOnly()).toBe(true);
        expect(sdk.getSigner()).toBeNull();

        // Options should have defaults applied
        const options = sdk.getOptions();
        expect(options.enableCaching).toBe(true);
        expect(options.retryAttempts).toBe(3);
        expect(options.logLevel).toBe('info');
      }),
      { numRuns: 100 }
    );
  });
});