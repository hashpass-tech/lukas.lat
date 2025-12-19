import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';
import type { NetworkConfig, ContractAddresses, NetworkInfo } from './types';
import type { Provider } from 'ethers';

/**
 * Supported networks with their default configurations
 */
const SUPPORTED_NETWORKS: Record<number, NetworkConfig & { contracts: ContractAddresses }> = {
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
      usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on mainnet
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
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
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
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
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  },
  // Base Sepolia Testnet
  84532: {
    chainId: 84532,
    name: 'Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia-explorer.base.org',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0x0000000000000000000000000000000000000000', // Test USDC
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  },
  // Polygon Mainnet
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  },
  // Polygon Mumbai Testnet
  80001: {
    chainId: 80001,
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0x0000000000000000000000000000000000000000', // Test USDC
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  },
  // Arbitrum One
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  },
  // Arbitrum Sepolia Testnet
  421614: {
    chainId: 421614,
    name: 'Arbitrum Sepolia Testnet',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia-explorer.arbitrum.io',
    contracts: {
      lukasToken: '0x0000000000000000000000000000000000000000', // Placeholder
      stabilizerVault: '0x0000000000000000000000000000000000000000', // Placeholder
      latAmBasketIndex: '0x0000000000000000000000000000000000000000', // Placeholder
      lukasHook: '0x0000000000000000000000000000000000000000', // Placeholder
      usdc: '0x0000000000000000000000000000000000000000', // Test USDC
      poolManager: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  },
  // Polygon Amoy Testnet
  80002: {
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
    contracts: {
      lukasToken: '0x63524b53983960231b7b86CDEdDf050Ceb9263Cb',
      stabilizerVault: '0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3',
      latAmBasketIndex: '0x1Dccf1fB82946a293E03036e85edc2139cba1541',
      lukasHook: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519',
      usdc: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
      poolManager: '0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E',
    },
  },
};

/**
 * Network manager for handling network configurations and validation
 */
export class NetworkManager {
  private currentNetwork: NetworkConfig & { contracts: ContractAddresses } | null = null;
  private provider: Provider | null = null;
  private networkChangeListeners: Array<(networkInfo: NetworkInfo) => void> = [];
  private networkMismatchListeners: Array<(expected: number, actual: number) => void> = [];
  private isMonitoringNetwork: boolean = false;
  private networkMonitorInterval: NodeJS.Timeout | null = null;

  constructor(initialNetwork?: NetworkConfig & { contracts: ContractAddresses }, provider?: Provider) {
    this.currentNetwork = initialNetwork || null;
    this.provider = provider || null;
    
    // Start network monitoring if provider is available
    if (this.provider) {
      this.startNetworkMonitoring();
    }
  }
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
    // Filter out undefined values from customContracts to preserve defaults
    const filteredCustomContracts = customContracts 
      ? Object.fromEntries(
          Object.entries(customContracts).filter(([_, value]) => value !== undefined)
        )
      : {};

    const mergedConfig = {
      ...baseConfig,
      ...userConfig,
      contracts: {
        ...baseConfig.contracts,
        ...filteredCustomContracts,
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

  /**
   * Set the provider for network operations
   */
  setProvider(provider: Provider): void {
    this.provider = provider;
  }

  /**
   * Get current network configuration
   */
  getCurrentNetwork(): NetworkConfig & { contracts: ContractAddresses } | null {
    return this.currentNetwork;
  }

  /**
   * Get current network info
   */
  getCurrentNetworkInfo(): NetworkInfo | null {
    if (!this.currentNetwork) {
      return null;
    }

    return {
      chainId: this.currentNetwork.chainId,
      name: this.currentNetwork.name,
      rpcUrl: this.currentNetwork.rpcUrl || '',
      blockExplorer: this.currentNetwork.blockExplorer,
      contracts: this.currentNetwork.contracts,
    };
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(
    chainId: number, 
    customContracts?: Partial<ContractAddresses>,
    networkOptions?: { name?: string; rpcUrl?: string; blockExplorer?: string }
  ): Promise<NetworkInfo> {
    // Validate the target network
    if (!NetworkManager.isNetworkSupported(chainId) && !customContracts) {
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
        `Network with chainId ${chainId} is not supported. Supported networks: ${Object.keys(NetworkManager.getSupportedNetworksMap()).join(', ')}`
      );
    }

    let newNetworkConfig: NetworkConfig & { contracts: ContractAddresses };

    if (NetworkManager.isNetworkSupported(chainId)) {
      // Use supported network configuration
      newNetworkConfig = NetworkManager.getDefaultNetworkConfig(chainId);
      
      // Override with custom contracts if provided
      if (customContracts) {
        NetworkManager.validateContractAddresses(customContracts);
        newNetworkConfig = {
          ...newNetworkConfig,
          contracts: {
            ...newNetworkConfig.contracts,
            ...customContracts,
          },
        };
      }

      // Override network options if provided
      if (networkOptions) {
        newNetworkConfig = {
          ...newNetworkConfig,
          name: networkOptions.name || newNetworkConfig.name,
          ...(networkOptions.rpcUrl && { rpcUrl: networkOptions.rpcUrl }),
          ...(networkOptions.blockExplorer && { blockExplorer: networkOptions.blockExplorer }),
        };
      }
    } else {
      // Custom network - require all contract addresses
      if (!customContracts || !NetworkManager.isCompleteContractAddresses(customContracts)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.MISSING_CONTRACT_ADDRESS,
          'Custom networks require all contract addresses to be provided'
        );
      }

      NetworkManager.validateContractAddresses(customContracts);
      
      newNetworkConfig = {
        chainId,
        name: networkOptions?.name || `Custom Network ${chainId}`,
        ...(networkOptions?.rpcUrl && { rpcUrl: networkOptions.rpcUrl }),
        ...(networkOptions?.blockExplorer && { blockExplorer: networkOptions.blockExplorer }),
        contracts: customContracts as ContractAddresses,
      };
    }

    // Validate provider network if available
    if (this.provider) {
      const providerNetwork = await this.detectProviderNetwork();
      if (providerNetwork && providerNetwork.chainId !== chainId) {
        throw new LukasSDKError(
          LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
          `Provider is connected to network ${providerNetwork.chainId} but trying to switch to ${chainId}. Please switch your wallet to the correct network.`
        );
      }
    }

    // Update current network
    const previousNetwork = this.currentNetwork;
    this.currentNetwork = newNetworkConfig;

    // Create network info
    const networkInfo: NetworkInfo = {
      chainId: newNetworkConfig.chainId,
      name: newNetworkConfig.name,
      rpcUrl: newNetworkConfig.rpcUrl || '',
      blockExplorer: newNetworkConfig.blockExplorer,
      contracts: newNetworkConfig.contracts,
    };

    // Notify listeners if network actually changed
    if (!previousNetwork || previousNetwork.chainId !== chainId) {
      this.notifyNetworkChange(networkInfo);
    }

    return networkInfo;
  }

  /**
   * Add and switch to a custom network
   */
  async addAndSwitchToCustomNetwork(
    config: NetworkConfig & { contracts: ContractAddresses }
  ): Promise<NetworkInfo> {
    // Validate the custom network configuration
    const validation = NetworkManager.validateCustomNetworkConfig(config);
    if (!validation.isValid) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_NETWORK_CONFIG,
        `Invalid custom network configuration: ${validation.errors.join(', ')}`
      );
    }

    // Add the custom network
    NetworkManager.addCustomNetwork(config.chainId, config);

    // Switch to the new network
    return this.switchNetwork(config.chainId);
  }

  /**
   * Get network type for current network
   */
  getCurrentNetworkType(): 'mainnet' | 'testnet' | 'custom' | 'unknown' {
    if (!this.currentNetwork) {
      return 'unknown';
    }
    return NetworkManager.getNetworkType(this.currentNetwork.chainId);
  }

  /**
   * Detect the current network from the provider
   */
  async detectProviderNetwork(): Promise<{ chainId: number; name: string } | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name,
      };
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
        'Failed to detect provider network',
        error
      );
    }
  }

  /**
   * Check if provider network matches expected network
   */
  async validateProviderNetwork(expectedChainId: number): Promise<boolean> {
    const providerNetwork = await this.detectProviderNetwork();
    return providerNetwork ? providerNetwork.chainId === expectedChainId : false;
  }

  /**
   * Add network change listener
   */
  onNetworkChange(listener: (networkInfo: NetworkInfo) => void): () => void {
    this.networkChangeListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.networkChangeListeners.indexOf(listener);
      if (index > -1) {
        this.networkChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of network change
   */
  private notifyNetworkChange(networkInfo: NetworkInfo): void {
    this.networkChangeListeners.forEach(listener => {
      try {
        listener(networkInfo);
      } catch (error) {
        console.error('Error in network change listener:', error);
      }
    });
  }

  /**
   * Get list of all supported networks
   */
  static getSupportedNetworks(): Array<NetworkConfig & { contracts: ContractAddresses }> {
    return Object.values(SUPPORTED_NETWORKS);
  }

  /**
   * Get supported networks mapping
   */
  static getSupportedNetworksMap(): Record<number, NetworkConfig & { contracts: ContractAddresses }> {
    return { ...SUPPORTED_NETWORKS };
  }

  /**
   * Add custom network configuration
   */
  static addCustomNetwork(
    chainId: number, 
    config: NetworkConfig & { contracts: ContractAddresses }
  ): void {
    NetworkManager.validateNetworkConfig(config);
    NetworkManager.validateContractAddresses(config.contracts);
    
    if (config.chainId !== chainId) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_NETWORK_CONFIG,
        'Network configuration chainId must match the provided chainId'
      );
    }

    SUPPORTED_NETWORKS[chainId] = config;
  }

  /**
   * Check if a network is a testnet
   */
  static isTestnet(chainId: number): boolean {
    const testnetChainIds = [11155111, 84532, 80001, 421614]; // Sepolia, Base Sepolia, Mumbai, Arbitrum Sepolia
    return testnetChainIds.includes(chainId);
  }

  /**
   * Get all testnet configurations
   */
  static getTestnetNetworks(): Array<NetworkConfig & { contracts: ContractAddresses }> {
    return Object.values(SUPPORTED_NETWORKS).filter(network => 
      NetworkManager.isTestnet(network.chainId)
    );
  }

  /**
   * Get all mainnet configurations
   */
  static getMainnetNetworks(): Array<NetworkConfig & { contracts: ContractAddresses }> {
    return Object.values(SUPPORTED_NETWORKS).filter(network => 
      !NetworkManager.isTestnet(network.chainId)
    );
  }

  /**
   * Create custom network configuration with validation
   */
  static createCustomNetworkConfig(
    chainId: number,
    name: string,
    contracts: ContractAddresses,
    options?: {
      rpcUrl?: string;
      blockExplorer?: string;
    }
  ): NetworkConfig & { contracts: ContractAddresses } {
    const networkConfig: NetworkConfig = {
      chainId,
      name,
      ...(options?.rpcUrl && { rpcUrl: options.rpcUrl }),
      ...(options?.blockExplorer && { blockExplorer: options.blockExplorer }),
    };

    NetworkManager.validateNetworkConfig(networkConfig);
    NetworkManager.validateContractAddresses(contracts);

    return {
      ...networkConfig,
      contracts,
    };
  }

  /**
   * Validate custom network configuration before adding
   */
  static validateCustomNetworkConfig(
    config: NetworkConfig & { contracts: ContractAddresses }
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      NetworkManager.validateNetworkConfig(config);
    } catch (error) {
      if (error instanceof LukasSDKError) {
        errors.push(error.message);
      }
    }

    try {
      NetworkManager.validateContractAddresses(config.contracts);
    } catch (error) {
      if (error instanceof LukasSDKError) {
        errors.push(error.message);
      }
    }

    // Check if network already exists
    if (NetworkManager.isNetworkSupported(config.chainId)) {
      errors.push(`Network with chainId ${config.chainId} already exists`);
    }

    // Validate required contract addresses
    const requiredContracts: (keyof ContractAddresses)[] = [
      'lukasToken',
      'stabilizerVault',
      'latAmBasketIndex',
      'lukasHook',
      'usdc',
    ];

    requiredContracts.forEach(contractName => {
      if (!config.contracts[contractName]) {
        errors.push(`Missing required contract address: ${contractName}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Remove custom network configuration
   */
  static removeCustomNetwork(chainId: number): boolean {
    if (!NetworkManager.isNetworkSupported(chainId)) {
      return false;
    }

    delete SUPPORTED_NETWORKS[chainId];
    return true;
  }

  /**
   * Get network type (mainnet/testnet/custom)
   */
  static getNetworkType(chainId: number): 'mainnet' | 'testnet' | 'custom' | 'unknown' {
    if (!NetworkManager.isNetworkSupported(chainId)) {
      return 'unknown';
    }

    if (NetworkManager.isTestnet(chainId)) {
      return 'testnet';
    }

    // Well-known mainnet chain IDs
    const mainnetChainIds = [1, 8453, 137, 42161];
    if (mainnetChainIds.includes(chainId)) {
      return 'mainnet';
    }

    return 'custom';
  }

  /**
   * Check if current network is a testnet
   */
  isCurrentNetworkTestnet(): boolean {
    return this.getCurrentNetworkType() === 'testnet';
  }

  /**
   * Start automatic network monitoring
   */
  startNetworkMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoringNetwork || !this.provider) {
      return;
    }

    this.isMonitoringNetwork = true;
    
    // Set up periodic network checking
    this.networkMonitorInterval = setInterval(async () => {
      try {
        await this.checkNetworkMismatch();
      } catch (error) {
        console.warn('Network monitoring error:', error);
      }
    }, intervalMs);

    // Set up provider event listeners if available
    this.setupProviderEventListeners();
  }

  /**
   * Stop automatic network monitoring
   */
  stopNetworkMonitoring(): void {
    if (!this.isMonitoringNetwork) {
      return;
    }

    this.isMonitoringNetwork = false;
    
    if (this.networkMonitorInterval) {
      clearInterval(this.networkMonitorInterval);
      this.networkMonitorInterval = null;
    }

    // Remove provider event listeners
    this.removeProviderEventListeners();
  }

  /**
   * Set up provider event listeners for network changes
   */
  private setupProviderEventListeners(): void {
    if (!this.provider) {
      return;
    }

    // Listen for network changes (if provider supports it)
    try {
      // Some providers emit 'network' events
      if ('on' in this.provider && typeof this.provider.on === 'function') {
        this.provider.on('network', this.handleProviderNetworkChange.bind(this));
      }
    } catch (error) {
      console.warn('Failed to set up provider event listeners:', error);
    }
  }

  /**
   * Remove provider event listeners
   */
  private removeProviderEventListeners(): void {
    if (!this.provider) {
      return;
    }

    try {
      if ('off' in this.provider && typeof this.provider.off === 'function') {
        this.provider.off('network', this.handleProviderNetworkChange.bind(this));
      }
    } catch (error) {
      console.warn('Failed to remove provider event listeners:', error);
    }
  }

  /**
   * Handle provider network change events
   */
  private async handleProviderNetworkChange(newNetwork: any, _oldNetwork?: any): Promise<void> {
    try {
      const newChainId = Number(newNetwork.chainId);
      
      if (this.currentNetwork && this.currentNetwork.chainId !== newChainId) {
        // Network changed - check if we should auto-switch
        await this.handleAutoNetworkSwitch(newChainId);
      }
    } catch (error) {
      console.warn('Error handling provider network change:', error);
    }
  }

  /**
   * Check for network mismatch between provider and current configuration
   */
  async checkNetworkMismatch(): Promise<void> {
    if (!this.provider || !this.currentNetwork) {
      return;
    }

    try {
      const providerNetwork = await this.detectProviderNetwork();
      
      if (providerNetwork && providerNetwork.chainId !== this.currentNetwork.chainId) {
        // Network mismatch detected
        this.notifyNetworkMismatch(this.currentNetwork.chainId, providerNetwork.chainId);
      }
    } catch (error) {
      // Ignore network detection errors during monitoring
    }
  }

  /**
   * Handle automatic network switching when provider network changes
   */
  private async handleAutoNetworkSwitch(newChainId: number): Promise<void> {
    try {
      // Check if the new network is supported
      if (NetworkManager.isNetworkSupported(newChainId)) {
        // Auto-switch to the new network
        await this.switchNetwork(newChainId);
      } else {
        // Notify about unsupported network
        this.notifyNetworkMismatch(this.currentNetwork?.chainId || 0, newChainId);
      }
    } catch (error) {
      console.warn('Failed to auto-switch network:', error);
      this.notifyNetworkMismatch(this.currentNetwork?.chainId || 0, newChainId);
    }
  }

  /**
   * Auto-detect and switch to provider network
   */
  async autoDetectAndSwitchNetwork(): Promise<NetworkInfo | null> {
    if (!this.provider) {
      throw new LukasSDKError(
        LukasSDKErrorCode.PROVIDER_NOT_AVAILABLE,
        'Provider not available for network detection'
      );
    }

    try {
      const providerNetwork = await this.detectProviderNetwork();
      
      if (!providerNetwork) {
        throw new LukasSDKError(
          LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
          'Failed to detect provider network'
        );
      }

      // Check if the detected network is supported
      if (!NetworkManager.isNetworkSupported(providerNetwork.chainId)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
          `Detected network ${providerNetwork.chainId} (${providerNetwork.name}) is not supported`
        );
      }

      // Switch to the detected network
      return await this.switchNetwork(providerNetwork.chainId);
    } catch (error) {
      if (error instanceof LukasSDKError) {
        throw error;
      }
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
        'Failed to auto-detect and switch network',
        error
      );
    }
  }

  /**
   * Add network mismatch listener
   */
  onNetworkMismatch(listener: (expected: number, actual: number) => void): () => void {
    this.networkMismatchListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.networkMismatchListeners.indexOf(listener);
      if (index > -1) {
        this.networkMismatchListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of network mismatch
   */
  private notifyNetworkMismatch(expectedChainId: number, actualChainId: number): void {
    this.networkMismatchListeners.forEach(listener => {
      try {
        listener(expectedChainId, actualChainId);
      } catch (error) {
        console.error('Error in network mismatch listener:', error);
      }
    });
  }

  /**
   * Get network monitoring status
   */
  isNetworkMonitoringActive(): boolean {
    return this.isMonitoringNetwork;
  }

  /**
   * Force network detection and validation
   */
  async validateCurrentNetwork(): Promise<{ isValid: boolean; expected?: number; actual?: number }> {
    if (!this.provider || !this.currentNetwork) {
      return { isValid: false };
    }

    try {
      const providerNetwork = await this.detectProviderNetwork();
      
      if (!providerNetwork) {
        return { isValid: false };
      }

      const isValid = providerNetwork.chainId === this.currentNetwork.chainId;
      
      return {
        isValid,
        expected: this.currentNetwork.chainId,
        actual: providerNetwork.chainId,
      };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopNetworkMonitoring();
    this.networkChangeListeners = [];
    this.networkMismatchListeners = [];
  }
}