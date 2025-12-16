import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';
import type { NetworkConfig, ContractAddresses } from './types';

/**
 * Supported networks with their default configurations
 */
export const SUPPORTED_NETWORKS: Record<number, NetworkConfig & { contracts: ContractAddresses }> = {
  // Ethereum Mainnet
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0xA0b86a33E6441b8C4505B8C4505B8C4505B8C45050', // USDC on mainnet
    },
  },
  // Sepolia Testnet
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    blockExplorer: 'https://sepolia.etherscan.io',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0x0000000000000000000000000000000000000000', // Test USDC
    },
  },
  // Base Mainnet
  8453: {
    chainId: 8453,
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    },
  },
};

/**
 * Network manager for handling network configurations and validation
 */
export class NetworkManager {
  /**
   * Validate network configuration
   */
  static validateNetworkConfig(config: NetworkConfig): void {
    if (!config.chainId || typeof config.chainId !== 'number') {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_NETWORK_CONFIG,
        'Network configuration must include a valid chainId'
      );
    }

    if (!config.name || typeof config.name !== 'string') {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_NETWORK_CONFIG,
        'Network configuration must include a valid name'
      );
    }

    if (config.rpcUrl && typeof config.rpcUrl !== 'string') {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_NETWORK_CONFIG,
        'Network rpcUrl must be a string if provided'
      );
    }

    if (config.blockExplorer && typeof config.blockExplorer !== 'string') {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_NETWORK_CONFIG,
        'Network blockExplorer must be a string if provided'
      );
    }
  }

  /**
   * Check if a network is supported
   */
  static isNetworkSupported(chainId: number): boolean {
    return chainId in SUPPORTED_NETWORKS;
  }

  /**
   * Get default network configuration for a supported network
   */
  static getDefaultNetworkConfig(chainId: number): NetworkConfig & { contracts: ContractAddresses } {
    if (!this.isNetworkSupported(chainId)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
        `Network with chainId ${chainId} is not supported. Supported networks: ${Object.keys(SUPPORTED_NETWORKS).join(', ')}`
      );
    }

    const config = SUPPORTED_NETWORKS[chainId];
    if (!config) {
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
        `Network configuration not found for chainId ${chainId}`
      );
    }

    return config;
  }

  /**
   * Merge user network config with defaults
   */
  static mergeNetworkConfig(
    userConfig: NetworkConfig,
    customContracts?: Partial<ContractAddresses>
  ): NetworkConfig & { contracts: ContractAddresses } {
    this.validateNetworkConfig(userConfig);

    let baseConfig: NetworkConfig & { contracts: ContractAddresses };

    if (this.isNetworkSupported(userConfig.chainId)) {
      // Use supported network as base
      baseConfig = this.getDefaultNetworkConfig(userConfig.chainId);
    } else {
      // Custom network - require all contract addresses
      if (!customContracts || !this.isCompleteContractAddresses(customContracts)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.MISSING_CONTRACT_ADDRESS,
          'Custom networks require all contract addresses to be provided'
        );
      }

      baseConfig = {
        ...userConfig,
        contracts: customContracts as ContractAddresses,
      };
    }

    // Merge user config with base config
    const mergedConfig = {
      ...baseConfig,
      ...userConfig,
      contracts: {
        ...baseConfig.contracts,
        ...customContracts,
      },
    };

    return mergedConfig;
  }

  /**
   * Check if contract addresses object is complete
   */
  private static isCompleteContractAddresses(contracts: Partial<ContractAddresses>): contracts is ContractAddresses {
    const requiredFields: (keyof ContractAddresses)[] = [
      'lukasToken',
      'stabilizerVault',
      'latAmBasketIndex',
      'lukasHook',
      'usdc',
    ];

    return requiredFields.every(field => 
      contracts[field] && 
      typeof contracts[field] === 'string' && 
      contracts[field]!.length > 0
    );
  }

  /**
   * Validate contract addresses
   */
  static validateContractAddresses(contracts: Partial<ContractAddresses>): void {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;

    Object.entries(contracts).forEach(([key, address]) => {
      if (address && !addressRegex.test(address)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_ADDRESS,
          `Invalid contract address for ${key}: ${address}`
        );
      }
    });
  }
}