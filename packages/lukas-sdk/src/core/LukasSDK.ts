import type { Provider, Signer } from 'ethers';
import type { LukasSDKConfig, NetworkInfo, SDKOptions, ContractAddresses, NetworkConfig } from './types';
import { NetworkManager } from './NetworkManager';
import { ProviderManager } from './ProviderManager';
import { ContractManager } from './ContractManager';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';
import { TokenServiceImpl } from '../services/TokenServiceImpl';
import { CachedTokenService } from '../services/CachedTokenService';
import { CachedOracleService } from '../services/CachedOracleService';
import { CacheManager, BatchManager, BackgroundSyncManager } from '../utils';

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
  private networkManager: NetworkManager;
  private networkConfig: NetworkConfig & { contracts: ContractAddresses };
  private initialized: boolean = false;
  private cacheManager: CacheManager;
  private batchManager: BatchManager;
  private backgroundSyncManager: BackgroundSyncManager;

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
    
    // Initialize network manager
    this.networkManager = new NetworkManager(this.networkConfig, config.provider);
    
    // Initialize caching managers
    const cacheTimeout = this.config.options?.cacheTimeout || 30000;
    this.cacheManager = new CacheManager(cacheTimeout, 1000);
    this.batchManager = new BatchManager(100, 50);
    this.backgroundSyncManager = new BackgroundSyncManager(this.cacheManager);
    
    // Initialize contract manager synchronously
    this.initializeContractManager();
    
    // Mark as initialized (async validation will happen separately)
    this.initialized = true;
    
    // Perform async initialization in background (network validation, etc.)
    this.initializeAsync().catch((error) => {
      // Log initialization errors but don't throw - SDK is still usable in read-only mode
      if (this.config.options?.logLevel === 'debug') {
        console.warn('Async SDK initialization failed:', error);
      }
    });
  }

  /**
   * Async initialization - performs network validation and provider setup
   * This runs in the background after the constructor completes
   */
  private async initializeAsync(): Promise<void> {
    try {
      // If no provider was provided, create a read-only provider
      if (!this.providerManager.getProvider() && this.networkConfig.rpcUrl) {
        const readOnlyProvider = ProviderManager.createReadOnlyProvider(this.networkConfig.rpcUrl);
        this.providerManager.setProvider(readOnlyProvider);
        
        // Update contract manager with the new provider
        this.updateContractManager();
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
    const networkInfo = this.networkManager.getCurrentNetworkInfo();
    if (networkInfo) {
      return networkInfo;
    }

    return {
      chainId: this.networkConfig.chainId,
      name: this.networkConfig.name,
      rpcUrl: this.networkConfig.rpcUrl || '',
      blockExplorer: this.networkConfig.blockExplorer,
      contracts: this.networkConfig.contracts,
    };
  }

  /**
   * Get the network manager instance
   */
  getNetworkManager(): NetworkManager {
    return this.networkManager;
  }

  /**
   * Detect the current provider network
   */
  async detectProviderNetwork(): Promise<{ chainId: number; name: string } | null> {
    return this.networkManager.detectProviderNetwork();
  }

  /**
   * Add network change listener
   */
  onNetworkChange(listener: (networkInfo: NetworkInfo) => void): () => void {
    return this.networkManager.onNetworkChange(listener);
  }

  /**
   * Add network mismatch listener
   */
  onNetworkMismatch(listener: (expected: number, actual: number) => void): () => void {
    return this.networkManager.onNetworkMismatch(listener);
  }

  /**
   * Start automatic network monitoring
   */
  startNetworkMonitoring(intervalMs?: number): void {
    this.networkManager.startNetworkMonitoring(intervalMs);
  }

  /**
   * Stop automatic network monitoring
   */
  stopNetworkMonitoring(): void {
    this.networkManager.stopNetworkMonitoring();
  }

  /**
   * Auto-detect and switch to provider network
   */
  async autoDetectNetwork(): Promise<NetworkInfo | null> {
    const networkInfo = await this.networkManager.autoDetectAndSwitchNetwork();
    
    if (networkInfo) {
      // Update internal configuration
      this.networkConfig = this.networkManager.getCurrentNetwork()!;
      this.config.network = this.networkConfig;
      this.config.contracts = this.networkConfig.contracts;

      // Update contract manager with new addresses
      if (this.contractManager) {
        this.contractManager.updateAddresses(this.networkConfig.contracts);
      }
    }

    return networkInfo;
  }

  /**
   * Validate current network against provider
   */
  async validateNetwork(): Promise<{ isValid: boolean; expected?: number; actual?: number }> {
    return this.networkManager.validateCurrentNetwork();
  }

  /**
   * Check if network monitoring is active
   */
  isNetworkMonitoringActive(): boolean {
    return this.networkManager.isNetworkMonitoringActive();
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
    
    // Update network manager with new provider
    const connectedProvider = this.providerManager.getProvider();
    if (connectedProvider) {
      this.networkManager.setProvider(connectedProvider);
      
      // Validate network compatibility
      const isValidNetwork = await this.networkManager.validateProviderNetwork(this.networkConfig.chainId);
      if (!isValidNetwork) {
        const providerNetwork = await this.networkManager.detectProviderNetwork();
        throw new LukasSDKError(
          LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
          `Connected provider network (${providerNetwork?.chainId}) does not match configured network (${this.networkConfig.chainId})`
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
    this.networkManager.stopNetworkMonitoring();
    this.backgroundSyncManager.stop();
    this.contractManager = null;
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(
    networkId: number, 
    customContracts?: Partial<ContractAddresses>,
    networkOptions?: { name?: string; rpcUrl?: string; blockExplorer?: string }
  ): Promise<NetworkInfo> {
    // Use network manager to switch networks
    const networkInfo = await this.networkManager.switchNetwork(networkId, customContracts, networkOptions);
    
    // Update internal configuration
    this.networkConfig = this.networkManager.getCurrentNetwork()!;
    this.config.network = this.networkConfig;
    this.config.contracts = this.networkConfig.contracts;

    // Update contract manager with new addresses
    if (this.contractManager) {
      this.contractManager.updateAddresses(this.networkConfig.contracts);
    }

    return networkInfo;
  }

  /**
   * Add and switch to a custom network
   */
  async addCustomNetwork(
    config: NetworkConfig & { contracts: ContractAddresses }
  ): Promise<NetworkInfo> {
    const networkInfo = await this.networkManager.addAndSwitchToCustomNetwork(config);
    
    // Update internal configuration
    this.networkConfig = this.networkManager.getCurrentNetwork()!;
    this.config.network = this.networkConfig;
    this.config.contracts = this.networkConfig.contracts;

    // Update contract manager with new addresses
    if (this.contractManager) {
      this.contractManager.updateAddresses(this.networkConfig.contracts);
    }

    return networkInfo;
  }

  /**
   * Get current network type
   */
  getCurrentNetworkType(): 'mainnet' | 'testnet' | 'custom' | 'unknown' {
    return this.networkManager.getCurrentNetworkType();
  }

  /**
   * Check if current network is a testnet
   */
  isTestnet(): boolean {
    return this.networkManager.isCurrentNetworkTestnet();
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

  /**
   * Get Cache Manager for managing cached data
   */
  getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * Get Batch Manager for request batching
   */
  getBatchManager(): BatchManager {
    return this.batchManager;
  }

  /**
   * Get Background Sync Manager for periodic data refresh
   */
  getBackgroundSyncManager(): BackgroundSyncManager {
    return this.backgroundSyncManager;
  }

  /**
   * Get Token Service for LUKAS token operations
   */
  getTokenService(): CachedTokenService {
    const contractManager = this.getContractManager();
    const lukasTokenContract = contractManager.getLukasTokenContract();
    return new CachedTokenService(
      lukasTokenContract,
      this.networkConfig.contracts.lukasToken,
      this.cacheManager,
      this.batchManager
    );
  }

  /**
   * Get USDC Token Service
   */
  getUSDCService(): CachedTokenService {
    const contractManager = this.getContractManager();
    const usdcContract = contractManager.getUSDCContract();
    return new CachedTokenService(
      usdcContract,
      this.networkConfig.contracts.usdc,
      this.cacheManager,
      this.batchManager
    );
  }

  /**
   * Get Oracle Service for price and index data
   */
  getOracleService(): CachedOracleService {
    const contractManager = this.getContractManager();
    const oracleContract = contractManager.getLatAmBasketIndexContract();
    return new CachedOracleService(
      oracleContract,
      this.networkConfig.contracts.latAmBasketIndex,
      this.cacheManager,
      this.batchManager
    );
  }
}

