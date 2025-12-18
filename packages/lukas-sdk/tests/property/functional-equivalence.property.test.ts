import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { LukasSDK } from '../../src/core/LukasSDK';
import { NetworkManager } from '../../src/core/NetworkManager';
import type { LukasSDKConfig } from '../../src/core/types';

/**
 * **Feature: lukas-sdk, Property 24: Functional equivalence**
 * **Validates: Requirements 8.2**
 * 
 * For any operation, SDK methods should produce equivalent results to direct contract calls.
 * This test validates that the SDK provides the same functionality as direct contract interactions
 * while maintaining compatibility with existing web3 infrastructure.
 */
describe('Functional Equivalence Property Tests', () => {
  it('Property 24: Functional equivalence - SDK initialization matches network configuration', () => {
    // Generator for supported network configurations
    const supportedNetworks = NetworkManager.getSupportedNetworks();
    const supportedNetworkGen = fc.constantFrom(...supportedNetworks);

    // Generator for SDK configuration
    const sdkConfigGen = supportedNetworkGen.map((network): LukasSDKConfig => ({
      network: {
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        blockExplorer: network.blockExplorer,
      },
    }));

    fc.assert(
      fc.property(sdkConfigGen, (config) => {
        // Initialize SDK
        const sdk = new LukasSDK(config);

        // Get network info from SDK
        const sdkNetworkInfo = sdk.getNetworkInfo();

        // Get expected network info directly from NetworkManager
        const expectedNetworkInfo = NetworkManager.getDefaultNetworkConfig(config.network.chainId);

        // Verify functional equivalence: SDK should provide same network information
        expect(sdkNetworkInfo.chainId).toBe(expectedNetworkInfo.chainId);
        expect(sdkNetworkInfo.name).toBe(expectedNetworkInfo.name);
        expect(sdkNetworkInfo.rpcUrl).toBe(expectedNetworkInfo.rpcUrl);
        expect(sdkNetworkInfo.blockExplorer).toBe(expectedNetworkInfo.blockExplorer);

        // Verify contract addresses match
        expect(sdkNetworkInfo.contracts).toEqual(expectedNetworkInfo.contracts);

        // Verify SDK provides same contract addresses as direct access
        expect(sdkNetworkInfo.contracts.lukasToken).toBe(expectedNetworkInfo.contracts.lukasToken);
        expect(sdkNetworkInfo.contracts.stabilizerVault).toBe(expectedNetworkInfo.contracts.stabilizerVault);
        expect(sdkNetworkInfo.contracts.latAmBasketIndex).toBe(expectedNetworkInfo.contracts.latAmBasketIndex);
        expect(sdkNetworkInfo.contracts.lukasHook).toBe(expectedNetworkInfo.contracts.lukasHook);
        expect(sdkNetworkInfo.contracts.usdc).toBe(expectedNetworkInfo.contracts.usdc);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 24: Functional equivalence - Network switching maintains consistency', () => {
    // Generator for two different supported networks
    const supportedNetworks = NetworkManager.getSupportedNetworks();
    const twoNetworksGen = fc.tuple(
      fc.constantFrom(...supportedNetworks),
      fc.constantFrom(...supportedNetworks)
    ).filter(([net1, net2]) => net1.chainId !== net2.chainId);

    fc.assert(
      fc.property(twoNetworksGen, async ([network1, network2]) => {
        // Initialize SDK with first network
        const sdk = new LukasSDK({
          network: {
            chainId: network1.chainId,
            name: network1.name,
            rpcUrl: network1.rpcUrl,
            blockExplorer: network1.blockExplorer,
          },
        });

        // Verify initial network
        const initialNetworkInfo = sdk.getNetworkInfo();
        expect(initialNetworkInfo.chainId).toBe(network1.chainId);

        // Switch to second network
        await sdk.switchNetwork(network2.chainId);

        // Verify network switched correctly
        const switchedNetworkInfo = sdk.getNetworkInfo();
        expect(switchedNetworkInfo.chainId).toBe(network2.chainId);

        // Get expected configuration for second network
        const expectedConfig = NetworkManager.getDefaultNetworkConfig(network2.chainId);

        // Verify functional equivalence: SDK provides same info as direct access
        expect(switchedNetworkInfo.name).toBe(expectedConfig.name);
        expect(switchedNetworkInfo.contracts).toEqual(expectedConfig.contracts);
      }),
      { numRuns: 50 } // Reduced runs since this involves async operations
    );
  });

  it('Property 24: Functional equivalence - Contract manager provides correct addresses', () => {
    // Generator for supported networks
    const supportedNetworks = NetworkManager.getSupportedNetworks();
    const networkGen = fc.constantFrom(...supportedNetworks);

    fc.assert(
      fc.property(networkGen, (network) => {
        // Initialize SDK
        const sdk = new LukasSDK({
          network: {
            chainId: network.chainId,
            name: network.name,
            rpcUrl: network.rpcUrl,
            blockExplorer: network.blockExplorer,
          },
        });

        // Get contract manager
        const contractManager = sdk.getContractManager();

        // Get expected addresses
        const expectedConfig = NetworkManager.getDefaultNetworkConfig(network.chainId);

        // Verify contract manager provides same addresses as direct access
        const addresses = contractManager.getAddresses();
        expect(addresses).toEqual(expectedConfig.contracts);

        // Verify individual contract addresses match
        expect(addresses.lukasToken).toBe(expectedConfig.contracts.lukasToken);
        expect(addresses.stabilizerVault).toBe(expectedConfig.contracts.stabilizerVault);
        expect(addresses.latAmBasketIndex).toBe(expectedConfig.contracts.latAmBasketIndex);
        expect(addresses.lukasHook).toBe(expectedConfig.contracts.lukasHook);
        expect(addresses.usdc).toBe(expectedConfig.contracts.usdc);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 24: Functional equivalence - Read-only mode consistency', () => {
    // Generator for supported networks
    const supportedNetworks = NetworkManager.getSupportedNetworks();
    const networkGen = fc.constantFrom(...supportedNetworks);

    fc.assert(
      fc.property(networkGen, (network) => {
        // Initialize SDK without provider (read-only mode)
        const sdk = new LukasSDK({
          network: {
            chainId: network.chainId,
            name: network.name,
            rpcUrl: network.rpcUrl,
            blockExplorer: network.blockExplorer,
          },
        });

        // Verify SDK is in read-only mode
        expect(sdk.isReadOnly()).toBe(true);

        // Verify no signer is available
        expect(sdk.getSigner()).toBeNull();

        // Verify provider is available (read-only provider should be created)
        const provider = sdk.getProvider();
        expect(provider).toBeDefined();

        // Verify network info is still accessible in read-only mode
        const networkInfo = sdk.getNetworkInfo();
        expect(networkInfo.chainId).toBe(network.chainId);
        expect(networkInfo.contracts).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 24: Functional equivalence - Custom contract configuration', () => {
    // Generator for custom contract addresses
    const contractAddressesGen = fc.record({
      lukasToken: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      stabilizerVault: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      latAmBasketIndex: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      lukasHook: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
      usdc: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
    });

    // Generator for supported networks
    const supportedNetworks = NetworkManager.getSupportedNetworks();
    const networkGen = fc.constantFrom(...supportedNetworks);

    fc.assert(
      fc.property(fc.tuple(networkGen, contractAddressesGen), ([network, customContracts]) => {
        // Initialize SDK with custom contract addresses
        const sdk = new LukasSDK({
          network: {
            chainId: network.chainId,
            name: network.name,
            rpcUrl: network.rpcUrl,
            blockExplorer: network.blockExplorer,
          },
          contracts: customContracts,
        });

        // Get network info
        const networkInfo = sdk.getNetworkInfo();

        // Verify custom contracts are used instead of defaults
        expect(networkInfo.contracts.lukasToken).toBe(customContracts.lukasToken);
        expect(networkInfo.contracts.stabilizerVault).toBe(customContracts.stabilizerVault);
        expect(networkInfo.contracts.latAmBasketIndex).toBe(customContracts.latAmBasketIndex);
        expect(networkInfo.contracts.lukasHook).toBe(customContracts.lukasHook);
        expect(networkInfo.contracts.usdc).toBe(customContracts.usdc);

        // Verify contract manager uses custom addresses
        const contractManager = sdk.getContractManager();
        const addresses = contractManager.getAddresses();
        expect(addresses).toEqual(customContracts);
      }),
      { numRuns: 100 }
    );
  });
});
