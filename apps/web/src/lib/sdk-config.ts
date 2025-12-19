import type { LukasSDKConfig } from '@lukas-protocol/sdk';

/**
 * Get SDK configuration for the current environment
 */
export function getSDKConfig(): LukasSDKConfig {
  const chainId = 80002; // Polygon Amoy Testnet
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

  // Add provider if available
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    config.provider = (window as any).ethereum;
  }

  return config;
}

/**
 * Get contract addresses from deployments for a given chain
 */
function getContractAddresses(chainId: number, environment: 'stable' | 'testing' = 'stable') {
  try {
    // Load from deployments.json
    const deployments = require('../../../../../packages/contracts/deployments.json');
    const network = deployments.networks[chainId.toString()];

    if (!network) {
      console.warn(`No contract deployments found for chain ID ${chainId}, using zero addresses`);
      return getZeroAddresses();
    }

    // Helper to validate and normalize addresses
    const normalizeAddress = (address: string | null | undefined): string => {
      if (!address || address === '0x...' || address === 'null') {
        return '0x0000000000000000000000000000000000000000';
      }
      return address;
    };

    // Use environment variable to override default
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
  } catch (err) {
    console.warn('Failed to load contract deployments:', err);
    return getZeroAddresses();
  }
}

/**
 * Get zero addresses as fallback
 */
function getZeroAddresses() {
  return {
    lukasToken: '0x0000000000000000000000000000000000000000',
    stabilizerVault: '0x0000000000000000000000000000000000000000',
    latAmBasketIndex: '0x0000000000000000000000000000000000000000',
    lukasHook: '0x0000000000000000000000000000000000000000',
    usdc: '0x0000000000000000000000000000000000000000',
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
