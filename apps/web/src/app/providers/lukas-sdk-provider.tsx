'use client';

import React, { ReactNode } from 'react';
import { LukasSDKProvider as SDKProvider, useLukasSDK as useSDK } from '@lukas-protocol/sdk/react';
import { LukasSDKConfig } from '@lukas-protocol/sdk';
import { useWallet } from './wallet-provider';

interface LukasSDKProviderProps {
  children: ReactNode;
}

/**
 * Web app wrapper around SDK provider
 * Handles wallet integration and config creation
 */
export function LukasSDKProvider({ children }: LukasSDKProviderProps) {
  const { chainId, isConnected } = useWallet();
  const [config, setConfig] = React.useState<LukasSDKConfig | null>(null);
  
  // Load config dynamically when chainId changes
  React.useEffect(() => {
    const loadConfig = async () => {
      const contracts = await loadContractsFromDeployments(chainId || 80002);
      const newConfig = createSDKConfig(chainId || 80002, isConnected);
      
      // Merge dynamically loaded contracts
      newConfig.contracts = {
        ...newConfig.contracts,
        ...contracts,
      };
      
      setConfig(newConfig);
    };

    loadConfig();
  }, [chainId, isConnected]);

  // Initialize with default config immediately to avoid context errors
  const activeConfig = config || createSDKConfig(chainId || 80002, isConnected);

  return (
    <SDKProvider config={activeConfig}>
      {children}
    </SDKProvider>
  );
}

/**
 * Re-export SDK hook for convenience
 */
export function useLukasSDK() {
  return useSDK();
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

  if (isConnected && typeof window !== 'undefined' && window.ethereum) {
    config.provider = window.ethereum as any;
  }

  return config;
}

/**
 * Load contracts dynamically from deployments.json
 */
async function loadContractsFromDeployments(chainId: number): Promise<Partial<ReturnType<typeof getContractAddresses>>> {
  try {
    const response = await fetch('/deployments.json');
    if (!response.ok) throw new Error('Failed to fetch deployments');
    
    const deployments = await response.json();
    const network = deployments?.networks?.[chainId.toString()];
    
    if (!network?.contracts?.stable) {
      return getContractAddresses(chainId);
    }

    const normalizeAddress = (address: string | null | undefined): string => {
      if (!address || address === '0x...' || address === 'null') {
        return '0x0000000000000000000000000000000000000000';
      }
      return address;
    };

    const contracts = network.contracts.stable;
    return {
      lukasToken: normalizeAddress(contracts.LukasToken?.address),
      stabilizerVault: normalizeAddress(contracts.StabilizerVault?.address),
      latAmBasketIndex: normalizeAddress(contracts.LatAmBasketIndex?.address),
      lukasHook: normalizeAddress(contracts.LukasHook?.address),
      usdc: normalizeAddress(contracts.USDC?.address),
    };
  } catch (e) {
    console.warn('Failed to load contracts from deployments.json, using defaults:', e);
    return getContractAddresses(chainId);
  }
}

function getContractAddresses(chainId: number) {
  try {
    const deployments = require('../../../../../packages/contracts/deployments.json');
    const network = deployments.networks[chainId.toString()];
    
    if (!network) {
      return getZeroAddresses();
    }

    const normalizeAddress = (address: string | null | undefined): string => {
      if (!address || address === '0x...' || address === 'null') {
        return '0x0000000000000000000000000000000000000000';
      }
      return address;
    };
    
    const useTestingContracts = process.env.NEXT_PUBLIC_USE_TESTING_CONTRACTS === 'true';
    const selectedContracts = network.contracts[useTestingContracts ? 'testing' : 'stable'] || network.contracts.stable;

    return {
      lukasToken: normalizeAddress(selectedContracts.LukasToken?.address),
      stabilizerVault: normalizeAddress(selectedContracts.StabilizerVault?.address),
      latAmBasketIndex: normalizeAddress(selectedContracts.LatAmBasketIndex?.address),
      lukasHook: normalizeAddress(selectedContracts.LukasHook?.address),
      usdc: normalizeAddress(selectedContracts.USDC?.address),
    };
  } catch {
    return getZeroAddresses();
  }
}

function getZeroAddresses() {
  return {
    lukasToken: '0x0000000000000000000000000000000000000000',
    stabilizerVault: '0x0000000000000000000000000000000000000000',
    latAmBasketIndex: '0x0000000000000000000000000000000000000000',
    lukasHook: '0x0000000000000000000000000000000000000000',
    usdc: '0x0000000000000000000000000000000000000000',
  };
}

function getNetworkName(chainId: number): string {
  const names: Record<number, string> = {
    1: 'Ethereum Mainnet',
    137: 'Polygon Mainnet',
    80002: 'Polygon Amoy Testnet',
    11155111: 'Sepolia Testnet',
  };
  return names[chainId] || `Chain ${chainId}`;
}

function getRpcUrl(chainId: number): string {
  const rpcUrls: Record<number, string> = {
    1: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
    137: 'https://polygon-rpc.com',
    80002: process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    11155111: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  };
  return rpcUrls[chainId] || '';
}

function getBlockExplorer(chainId: number): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    80002: 'https://amoy.polygonscan.com',
    11155111: 'https://sepolia.etherscan.io',
  };
  return explorers[chainId] || '';
}
