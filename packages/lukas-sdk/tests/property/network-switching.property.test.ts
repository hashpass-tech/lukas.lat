/**
 * **Feature: lukas-sdk, Property 25: Network switching consistency**
 * **Validates: Requirements 10.2**
 * 
 * Property-based test for network switching consistency.
 * For any network switch operation, the SDK should update all contract connections to the new network automatically.
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { LukasSDK } from '../../src/core/LukasSDK';
import { NetworkManager } from '../../src/core/NetworkManager';
import type { LukasSDKConfig, ContractAddresses } from '../../src/core/types';

describe('Property 25: Network switching consistency', () => {
  it('should update all contract connections when switching networks', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different supported network IDs
        fc.tuple(
          fc.constantFrom(...Object.keys(NetworkManager.getSupportedNetworksMap()).map(Number)),
          fc.constantFrom(...Object.keys(NetworkManager.getSupportedNetworksMap()).map(Number))
        ).filter(([first, second]) => first !== second),
        
        async ([initialNetworkId, targetNetworkId]) => {
          // Get initial network configuration
          const initialNetwork = NetworkManager.getDefaultNetworkConfig(initialNetworkId);
          
          const config: LukasSDKConfig = {
            network: {
              chainId: initialNetwork.chainId,
              name: initialNetwork.name,
              rpcUrl: initialNetwork.rpcUrl,
              blockExplorer: initialNetwork.blockExplorer,
            },
          };

          // Initialize SDK with initial network
          const sdk = new LukasSDK(config);
          
          // Get initial network info
          const initialNetworkInfo = sdk.getNetworkInfo();
          
          // Verify initial state
          expect(initialNetworkInfo.chainId).toBe(initialNetworkId);
          expect(initialNetworkInfo.contracts).toEqual(initialNetwork.contracts);
          
          // Switch to target network
          const newNetworkInfo = await sdk.switchNetwork(targetNetworkId);
          
          // Verify network switch was successful
          expect(newNetworkInfo.chainId).toBe(targetNetworkId);
          
          // Get expected target network configuration
          const expectedTargetNetwork = NetworkManager.getDefaultNetworkConfig(targetNetworkId);
          
          // Verify all contract addresses were updated
          expect(newNetworkInfo.contracts).toEqual(expectedTargetNetwork.contracts);
          expect(newNetworkInfo.contracts.lukasToken).toBe(expectedTargetNetwork.contracts.lukasToken);
          expect(newNetworkInfo.contracts.stabilizerVault).toBe(expectedTargetNetwork.contracts.stabilizerVault);
          expect(newNetworkInfo.contracts.latAmBasketIndex).toBe(expectedTargetNetwork.contracts.latAmBasketIndex);
          expect(newNetworkInfo.contracts.lukasHook).toBe(expectedTargetNetwork.contracts.lukasHook);
          expect(newNetworkInfo.contracts.usdc).toBe(expectedTargetNetwork.contracts.usdc);
          
          // Verify SDK's current network info matches the switched network
          const currentNetworkInfo = sdk.getNetworkInfo();
          expect(currentNetworkInfo.chainId).toBe(targetNetworkId);
          expect(currentNetworkInfo.contracts).toEqual(expectedTargetNetwork.contracts);
          
          // Verify network manager state is consistent
          const networkManager = sdk.getNetworkManager();
          const currentNetwork = networkManager.getCurrentNetwork();
          expect(currentNetwork).not.toBeNull();
          expect(currentNetwork!.chainId).toBe(targetNetworkId);
          expect(currentNetwork!.contracts).toEqual(expectedTargetNetwork.contracts);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle custom contract addresses during network switching', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate supported network ID and custom contract addresses
        fc.constantFrom(...Object.keys(NetworkManager.getSupportedNetworksMap()).map(Number)),
        fc.record({
          lukasToken: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          stabilizerVault: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          latAmBasketIndex: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          lukasHook: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          usdc: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
        }),
        
        async (networkId, customContracts) => {
          // Get initial network configuration (different from target)
          const supportedNetworks = Object.keys(NetworkManager.getSupportedNetworksMap()).map(Number);
          const initialNetworkId = supportedNetworks.find(id => id !== networkId) || supportedNetworks[0];
          const initialNetwork = NetworkManager.getDefaultNetworkConfig(initialNetworkId);
          
          const config: LukasSDKConfig = {
            network: {
              chainId: initialNetwork.chainId,
              name: initialNetwork.name,
              rpcUrl: initialNetwork.rpcUrl,
              blockExplorer: initialNetwork.blockExplorer,
            },
          };

          // Initialize SDK
          const sdk = new LukasSDK(config);
          
          // Switch to target network with custom contracts
          const newNetworkInfo = await sdk.switchNetwork(networkId, customContracts);
          
          // Verify network switch was successful
          expect(newNetworkInfo.chainId).toBe(networkId);
          
          // Verify custom contract addresses were applied
          expect(newNetworkInfo.contracts.lukasToken).toBe(customContracts.lukasToken);
          expect(newNetworkInfo.contracts.stabilizerVault).toBe(customContracts.stabilizerVault);
          expect(newNetworkInfo.contracts.latAmBasketIndex).toBe(customContracts.latAmBasketIndex);
          expect(newNetworkInfo.contracts.lukasHook).toBe(customContracts.lukasHook);
          expect(newNetworkInfo.contracts.usdc).toBe(customContracts.usdc);
          
          // Verify SDK's current network info reflects the custom contracts
          const currentNetworkInfo = sdk.getNetworkInfo();
          expect(currentNetworkInfo.contracts).toEqual(customContracts);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain network change event consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different supported network IDs
        fc.tuple(
          fc.constantFrom(...Object.keys(NetworkManager.getSupportedNetworksMap()).map(Number)),
          fc.constantFrom(...Object.keys(NetworkManager.getSupportedNetworksMap()).map(Number))
        ).filter(([first, second]) => first !== second),
        
        async ([initialNetworkId, targetNetworkId]) => {
          // Get initial network configuration
          const initialNetwork = NetworkManager.getDefaultNetworkConfig(initialNetworkId);
          
          const config: LukasSDKConfig = {
            network: {
              chainId: initialNetwork.chainId,
              name: initialNetwork.name,
              rpcUrl: initialNetwork.rpcUrl,
              blockExplorer: initialNetwork.blockExplorer,
            },
          };

          // Initialize SDK
          const sdk = new LukasSDK(config);
          
          // Set up network change listener
          let networkChangeEvents: any[] = [];
          const unsubscribe = sdk.onNetworkChange((networkInfo) => {
            networkChangeEvents.push(networkInfo);
          });
          
          // Switch network
          await sdk.switchNetwork(targetNetworkId);
          
          // Verify network change event was fired
          expect(networkChangeEvents.length).toBe(1);
          expect(networkChangeEvents[0].chainId).toBe(targetNetworkId);
          
          // Verify event data consistency
          const eventNetworkInfo = networkChangeEvents[0];
          const currentNetworkInfo = sdk.getNetworkInfo();
          expect(eventNetworkInfo.chainId).toBe(currentNetworkInfo.chainId);
          expect(eventNetworkInfo.contracts).toEqual(currentNetworkInfo.contracts);
          
          // Clean up
          unsubscribe();
        }
      ),
      { numRuns: 100 }
    );
  });
});