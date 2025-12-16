import type { Provider, Signer } from 'ethers';
import type { LukasSDKConfig, NetworkInfo, SDKOptions, ContractAddresses, NetworkConfig } from './types';
import { NetworkManager } from './NetworkManager';
import { ProviderManager } from './ProviderManager';
import { ContractManager } from './ContractManager';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Main Lukas SDK client class
 * 
 * This is the primary interface for interacting with the Lukas Protocol.
 * It orchestrates all operations and provides access to individual services.
 */
export class LukasSDK {
  private config: LukasSDKConfig;
  private providerManager: ProviderManager;
  private contractManager: ContractManager | null = null;
  private networkConfig: NetworkConfig & { contracts: ContractAddresses };
  private initialized: boolean = false;

  constructor(config: LukasSDKConfig) {
    // Validate and merge network configuration
    this.networkConfig = NetworkManager.mergeNetworkConfig(config.network, config.contracts);
    
    // Validate contract addresses if provided
    if (config.contracts) {
      NetworkManager.validateContractAddresses(config.contracts);
    }

    // Initialize configuration with defaults
    this.config = {
      ...config,
      network: this.networkConfig,
      contracts: this.networkConfig.contracts,
      options: {
        enableCaching: true,
        cacheTimeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
        enableEvents: true,
        logLevel: 'info',
        ...config.options,
      },
    };

    // Initialize provider manager
    this.providerManager = new ProviderManager(config.provider);
    
    // Initialize the SDK
    this.initialize();
  }

  /**
   * Initialize the SDK
   */
  private async initialize(): Promise<void> {
    try {
      // If no provider was provided, create a read-only provider
      if (!this.providerManager.getProvider() && this.networkConfig.rpcUrl) {
        const readOnlyProvider = ProviderManager.createReadOnlyProvider(this.networkConfig.rpcUrl);
        this.providerManager.setProvider(readOnlyProvider);
      }

      // Validate network if provider is available
      if (this.providerManager.getProvider()) {
        const isValidNetwork = await this.providerManager.validateNetwork(this.networkConfig.chainId);
        if (!isValidNetwork) {
          const networkInfo = await this.providerManager.getNetworkInfo();
          throw new LukasSDKError(
            LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
            `Provider network (${networkInfo?.chainId}) does not match configured network (${this.networkConfig.chainId})`
          );
        }
      }

      // Initialize contract manager
      this.initializeContractManager();

      this.initialized = true;
    } catch (error) {
      if (error instanceof LukasSDKError) {
        throw error;
      }
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
        'Failed to initialize Lukas SDK',
        error
      );
    }
  }

  /**
   * Get the current network information
   */
  getNetworkInfo(): NetworkInfo {
    return {
      chainId: this.networkConfig.chainId,
      name: this.networkConfig.name,
      rpcUrl: this.networkConfig.rpcUrl || '',
      blockExplorer: this.networkConfig.blockExplorer,
      contracts: this.networkConfig.contracts,
    };
  }

  /**
   * Get the current provider
   */
  getProvider(): Provider | null {
    return this.providerManager.getProvider();
  }

  /**
   * Get the current signer
   */
  getSigner(): Signer | null {
    return this.providerManager.getSigner();
  }

  /**
   * Check if the SDK is in read-only mode
   */
  isReadOnly(): boolean {
    return this.providerManager.isInReadOnlyMode();
  }

  /**
   * Get SDK configuration options
   */
  getOptions(): SDKOptions {
    return this.config.options || {};
  }

  /**
   * Connect to a provider
   */
  async connect(provider?: Provider): Promise<void> {
    await this.providerManager.connect(provider);
    
    // Re-validate network after connecting
    if (this.providerManager.getProvider()) {
      const isValidNetwork = await this.providerManager.validateNetwork(this.networkConfig.chainId);
      if (!isValidNetwork) {
        const networkInfo = await this.providerManager.getNetworkInfo();
        throw new LukasSDKError(
          LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
          `Connected provider network (${networkInfo?.chainId}) does not match configured network (${this.networkConfig.chainId})`
        );
      }
    }

    // Update contract manager with new provider/signer
    this.updateContractManager();
  }

  /**
   * Disconnect from provider
   */
  disconnect(): void {
    this.providerManager.disconnect();
    this.contractManager = null;
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(networkId: number): Promise<void> {
    if (!NetworkManager.isNetworkSupported(networkId)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
        `Network with chainId ${networkId} is not supported`
      );
    }

    // Update network configuration
    const newNetworkConfig = NetworkManager.getDefaultNetworkConfig(networkId);
    this.networkConfig = newNetworkConfig;
    this.config.network = newNetworkConfig;
    this.config.contracts = newNetworkConfig.contracts;

    // If we have a provider, validate the network
    if (this.providerManager.getProvider()) {
      const isValidNetwork = await this.providerManager.validateNetwork(networkId);
      if (!isValidNetwork) {
        throw new LukasSDKError(
          LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
          `Provider is not connected to network ${networkId}. Please switch your wallet to the correct network.`
        );
      }
    }

    // Update contract manager with new addresses
    if (this.contractManager) {
      this.contractManager.updateAddresses(newNetworkConfig.contracts);
    }
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Require signer for write operations
   */
  requireSigner(): Signer {
    return this.providerManager.requireSigner();
  }

  /**
   * Get contract manager
   */
  getContractManager(): ContractManager {
    if (!this.contractManager) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        'Contract manager not initialized. Make sure SDK is properly initialized.'
      );
    }
    return this.contractManager;
  }

  /**
   * Initialize contract manager
   */
  private initializeContractManager(): void {
    const provider = this.providerManager.getProvider();
    const signer = this.providerManager.getSigner();

    if (provider) {
      this.contractManager = new ContractManager(
        this.networkConfig.contracts,
        provider,
        signer || undefined
      );
    }
  }

  /**
   * Update contract manager when provider or signer changes
   */
  private updateContractManager(): void {
    if (this.contractManager) {
      const provider = this.providerManager.getProvider();
      const signer = this.providerManager.getSigner();

      if (provider) {
        this.contractManager.updateProvider(provider, signer || undefined);
      }
    } else {
      this.initializeContractManager();
    }
  }
}