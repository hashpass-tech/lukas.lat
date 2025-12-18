"use client";

import React, { ReactNode, createContext, useContext, useEffect, useState, useMemo } from 'react';
import { LukasSDK, LukasSDKConfig, NetworkInfo, VERSION } from '@lukas-protocol/sdk';
import { useWallet } from './wallet-provider';

interface LukasSDKContextType {
  sdk: LukasSDK | null;
  isInitialized: boolean;
  networkInfo: NetworkInfo | null;
  error: string | null;
}

const LukasSDKContext = createContext<LukasSDKContextType | undefined>(undefined);

/**
 * Hook to access the Lukas SDK from context
 */
export function useLukasSDK() {
  const context = useContext(LukasSDKContext);
  if (!context) {
    throw new Error('useLukasSDK must be used within LukasSDKProvider');
  }
  return context;
}

interface LukasSDKProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages the Lukas SDK instance
 * Automatically syncs with wallet network changes
 */
export function LukasSDKProvider({ children }: LukasSDKProviderProps) {
  const { chainId, isConnected } = useWallet();
  const [sdk, setSdk] = useState<LukasSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track network info separately to force updates
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  // Update network info when SDK changes
  useEffect(() => {
    if (sdk && isInitialized) {
      setNetworkInfo(sdk.getNetworkInfo());
    } else {
      setNetworkInfo(null);
    }
  }, [sdk, isInitialized]);

  // Initialize SDK when component mounts or wallet connects
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setError(null);
        
        // Use chainId from wallet if available, otherwise default to Amoy
        const targetChainId = chainId || 80002;
        const config = createSDKConfig(targetChainId, isConnected);

        console.log(`Initializing Lukas SDK v${VERSION} for chain ${targetChainId}...`);
        
        const lukasSDK = new LukasSDK(config);
        
        setSdk(lukasSDK);
        setIsInitialized(true);
        
        console.log(`Lukas SDK v${VERSION} initialized successfully:`, lukasSDK.getNetworkInfo());
      } catch (err) {
        console.error('Failed to initialize Lukas SDK:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
        setIsInitialized(false);
        
        // Try to initialize with minimal config as fallback
        try {
          console.log('Attempting fallback initialization...');
          const fallbackConfig = createSDKConfig(80002, false); // Amoy without provider
          const fallbackSDK = new LukasSDK(fallbackConfig);
          setSdk(fallbackSDK);
          setIsInitialized(true);
          console.log('Fallback SDK initialized successfully');
        } catch (fallbackErr) {
          console.error('Fallback initialization also failed:', fallbackErr);
        }
      }
    };

    // Only initialize if we don't have an SDK yet, or if the chain changed
    if (!sdk || (chainId && sdk.getNetworkInfo().chainId !== chainId)) {
      initializeSDK();
    }

    return () => {
      // Don't disconnect on every unmount, only when component is truly destroyed
      // This prevents issues with React strict mode and hot reloading
    };
  }, [chainId]); // Only depend on chainId, not isConnected

  // Handle network changes
  useEffect(() => {
    if (!sdk || !chainId || !isInitialized) return;

    const syncNetwork = async () => {
      try {
        const currentNetwork = sdk.getNetworkInfo();
        
        // Only switch if network is different
        if (currentNetwork.chainId !== chainId) {
          console.log(`Switching SDK from chain ${currentNetwork.chainId} to ${chainId}`);
          
          const contractAddresses = getContractAddresses(chainId);
          
          try {
            await sdk.switchNetwork(chainId, contractAddresses, {
              name: getNetworkName(chainId),
              rpcUrl: getRpcUrl(chainId),
              blockExplorer: getBlockExplorer(chainId),
            });
            
            console.log('SDK network switched successfully to:', chainId, sdk.getNetworkInfo());
            
            // Update network info after switching
            setNetworkInfo(sdk.getNetworkInfo());
          } catch (switchError) {
            // If switching fails, reinitialize the SDK with the new network
            console.warn('Network switch failed, reinitializing SDK:', switchError);
            
            const config = createSDKConfig(chainId, isConnected);
            const newSDK = new LukasSDK(config);
            setSdk(newSDK);
            setNetworkInfo(newSDK.getNetworkInfo());
            
            console.log('SDK reinitialized with new network:', chainId);
          }
        }
      } catch (err) {
        console.error('Failed to sync SDK network:', err);
        setError(err instanceof Error ? err.message : 'Failed to switch network');
      }
    };

    syncNetwork();
  }, [chainId, sdk, isInitialized, isConnected]);

  const contextValue = useMemo(() => ({
    sdk,
    isInitialized,
    networkInfo,
    error,
  }), [sdk, isInitialized, networkInfo, error]);

  return (
    <LukasSDKContext.Provider value={contextValue}>
      {children}
    </LukasSDKContext.Provider>
  );
}

/**
 * Create SDK configuration for a given network
 */
function createSDKConfig(chainId: number, isConnected: boolean): LukasSDKConfig {
  const contractAddresses = getContractAddresses(chainId);
  
  const config: LukasSDKConfig = {
    network: {
      chainId,
      name: getNetworkName(chainId),
      rpcUrl: getRpcUrl(chainId),
      blockExplorer: getBlockExplorer(chainId),
    },
    contracts: contractAddresses,
    options: {
      enableCaching: true,
      cacheTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableEvents: true,
      logLevel: 'info',
    },
  };

  // Add provider if wallet is connected
  if (isConnected && typeof window !== 'undefined' && window.ethereum) {
    config.provider = window.ethereum as any;
  }

  return config;
}

/**
 * Get contract addresses from deployments for a given chain
 * @param chainId - The chain ID to get contracts for
 * @param environment - 'stable' for production contracts, 'testing' for test contracts
 */
function getContractAddresses(chainId: number, environment: 'stable' | 'testing' = 'stable') {
  // Load from deployments.json
  const deployments = require('../../../../../packages/contracts/deployments.json');
  const network = deployments.networks[chainId.toString()];
  
  if (!network) {
    console.warn(`No contract deployments found for chain ID ${chainId}, using zero addresses`);
    return {
      lukasToken: '0x0000000000000000000000000000000000000000',
      stabilizerVault: '0x0000000000000000000000000000000000000000',
      latAmBasketIndex: '0x0000000000000000000000000000000000000000',
      lukasHook: '0x0000000000000000000000000000000000000000',
      usdc: '0x0000000000000000000000000000000000000000',
    };
  }

  // Helper to validate and normalize addresses
  const normalizeAddress = (address: string | null | undefined): string => {
    if (!address || address === '0x...' || address === 'null') {
      return '0x0000000000000000000000000000000000000000';
    }
    return address;
  };
  
  // Use environment variable to override default (useful for development)
  const useTestingContracts = process.env.NEXT_PUBLIC_USE_TESTING_CONTRACTS === 'true';
  const selectedEnvironment = useTestingContracts ? 'testing' : environment;
  const selectedContracts = network.contracts[selectedEnvironment] || network.contracts.stable;

  console.log(`Loading ${selectedEnvironment} contracts for chain ${chainId}`);

  return {
    lukasToken: normalizeAddress(selectedContracts.LukasToken?.address),
    stabilizerVault: normalizeAddress(selectedContracts.StabilizerVault?.address),
    latAmBasketIndex: normalizeAddress(selectedContracts.LatAmBasketIndex?.address),
    lukasHook: normalizeAddress(selectedContracts.LukasHook?.address),
    usdc: normalizeAddress(selectedContracts.USDC?.address),
  };
}

/**
 * Get network name for a given chain ID
 */
function getNetworkName(chainId: number): string {
  const names: Record<number, string> = {
    1: 'Ethereum Mainnet',
    137: 'Polygon Mainnet',
    80002: 'Polygon Amoy Testnet',
    11155111: 'Sepolia Testnet',
  };
  return names[chainId] || `Chain ${chainId}`;
}

/**
 * Get RPC URL for a given chain ID
 */
function getRpcUrl(chainId: number): string {
  const rpcUrls: Record<number, string> = {
    1: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
    137: 'https://polygon-rpc.com',
    80002: process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    11155111: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  };
  return rpcUrls[chainId] || '';
}

/**
 * Get block explorer URL for a given chain ID
 */
function getBlockExplorer(chainId: number): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    80002: 'https://amoy.polygonscan.com',
    11155111: 'https://sepolia.etherscan.io',
  };
  return explorers[chainId] || '';
}
