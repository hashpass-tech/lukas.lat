import { Provider, Signer, JsonRpcProvider, BrowserProvider } from 'ethers';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Provider manager for handling wallet provider abstraction
 */
export class ProviderManager {
  private provider: Provider | null = null;
  private signer: Signer | null = null;
  private isReadOnly: boolean = false;

  constructor(provider?: Provider) {
    if (provider) {
      this.setProvider(provider);
    }
  }

  /**
   * Set the provider and detect signer
   */
  setProvider(provider: Provider): void {
    this.provider = provider;
    this.detectSigner();
  }

  /**
   * Get the current provider
   */
  getProvider(): Provider | null {
    return this.provider;
  }

  /**
   * Get the current signer
   */
  getSigner(): Signer | null {
    return this.signer;
  }

  /**
   * Check if SDK is in read-only mode
   */
  isInReadOnlyMode(): boolean {
    return this.isReadOnly || this.signer === null;
  }

  /**
   * Connect to a provider with optional signer
   */
  async connect(provider?: Provider): Promise<void> {
    if (provider) {
      this.setProvider(provider);
    }

    if (!this.provider) {
      throw new LukasSDKError(
        LukasSDKErrorCode.PROVIDER_NOT_AVAILABLE,
        'No provider available for connection'
      );
    }

    // Try to detect and connect signer
    await this.detectSigner();
  }

  /**
   * Disconnect from provider and signer
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.isReadOnly = false;
  }

  /**
   * Create a read-only provider from RPC URL
   */
  static createReadOnlyProvider(rpcUrl: string): JsonRpcProvider {
    try {
      return new JsonRpcProvider(rpcUrl);
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
        `Failed to create provider with RPC URL: ${rpcUrl}`,
        error
      );
    }
  }

  /**
   * Create provider from window.ethereum (MetaMask, etc.)
   */
  static createBrowserProvider(): BrowserProvider {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new LukasSDKError(
        LukasSDKErrorCode.PROVIDER_NOT_AVAILABLE,
        'Browser provider not available. Make sure you have MetaMask or another wallet installed.'
      );
    }

    try {
      return new BrowserProvider(window.ethereum);
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.PROVIDER_NOT_AVAILABLE,
        'Failed to create browser provider',
        error
      );
    }
  }

  /**
   * Detect and set signer from provider
   */
  private async detectSigner(): Promise<void> {
    if (!this.provider) {
      this.signer = null;
      this.isReadOnly = true;
      return;
    }

    try {
      // Check if provider supports signing (has getSigner method)
      if ('getSigner' in this.provider && typeof this.provider.getSigner === 'function') {
        const signer = await this.provider.getSigner();
        this.signer = signer;
        this.isReadOnly = false;
      } else {
        // Provider doesn't support signing - read-only mode
        this.signer = null;
        this.isReadOnly = true;
      }
    } catch (error) {
      // Failed to get signer - fall back to read-only mode
      this.signer = null;
      this.isReadOnly = true;
    }
  }

  /**
   * Ensure signer is available for write operations
   */
  requireSigner(): Signer {
    if (!this.signer) {
      throw new LukasSDKError(
        LukasSDKErrorCode.SIGNER_REQUIRED,
        'This operation requires a signer. Please connect a wallet or provide a signer.'
      );
    }
    return this.signer;
  }

  /**
   * Get network information from provider
   */
  async getNetworkInfo(): Promise<{ chainId: number; name: string } | null> {
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
        'Failed to get network information from provider',
        error
      );
    }
  }

  /**
   * Check if provider network matches expected network
   */
  async validateNetwork(expectedChainId: number): Promise<boolean> {
    const networkInfo = await this.getNetworkInfo();
    return networkInfo?.chainId === expectedChainId;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}