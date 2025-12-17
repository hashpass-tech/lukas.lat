import type { PublicClient, WalletClient, Chain } from 'viem';
import { LukasSDK } from '../../core/LukasSDK';
import type { LukasSDKConfig, NetworkConfig, ContractAddresses } from '../../core/types';

/**
 * Configuration for creating LukasSDK from viem clients
 */
export interface ViemAdapterConfig {
  /** Custom contract addresses (optional) */
  contracts?: Partial<ContractAddresses>;
  /** SDK options */
  options?: LukasSDKConfig['options'];
  /** Custom network configuration */
  networkConfig?: Partial<NetworkConfig>;
}

/**
 * Create a LukasSDK instance from viem clients
 * 
 * @param publicClient - Viem public client
 * @param walletClient - Viem wallet client (optional)
 * @param config - Additional configuration options
 * @returns LukasSDK instance
 */
export function createLukasSDKFromViem(
  publicClient: PublicClient,
  walletClient?: WalletClient,
  config: ViemAdapterConfig = {}
): LukasSDK {
  const chain = publicClient.chain;
  if (!chain) {
    throw new Error('Public client must have a chain configured');
  }

  // Extract network configuration from viem chain
  const networkConfig: NetworkConfig = {
    chainId: chain.id,
    name: chain.name,
    rpcUrl: (publicClient.transport as any).url || chain.rpcUrls.default.http[0],
    blockExplorer: chain.blockExplorers?.default?.url,
    ...config.networkConfig,
  };

  // Create ethers-compatible provider from viem clients
  const provider = createEthersProviderFromViem(publicClient, walletClient);

  // Create SDK configuration
  const sdkConfig: LukasSDKConfig = {
    network: networkConfig,
    provider,
    contracts: config.contracts,
    options: config.options,
  };

  return new LukasSDK(sdkConfig);
}

/**
 * Create an ethers-compatible provider from viem clients
 * 
 * @param publicClient - Viem public client
 * @param walletClient - Viem wallet client (optional)
 * @returns Ethers-compatible provider
 */
export function createEthersProviderFromViem(
  publicClient: PublicClient,
  walletClient?: WalletClient
) {
  const provider = {
    // Network information
    getNetwork: async () => ({
      chainId: publicClient.chain?.id || 1,
      name: publicClient.chain?.name || 'unknown',
    }),

    // Block and transaction methods
    getBlockNumber: async () => {
      const blockNumber = await publicClient.getBlockNumber();
      return Number(blockNumber);
    },

    getBlock: async (blockHashOrBlockTag: string | number) => {
      if (typeof blockHashOrBlockTag === 'number') {
        return publicClient.getBlock({
          blockNumber: BigInt(blockHashOrBlockTag),
        });
      } else if (typeof blockHashOrBlockTag === 'string') {
        return publicClient.getBlock({
          blockHash: blockHashOrBlockTag as `0x${string}`,
        });
      } else {
        return publicClient.getBlock();
      }
    },

    getTransaction: async (hash: string) => {
      return publicClient.getTransaction({ hash: hash as `0x${string}` });
    },

    getTransactionReceipt: async (hash: string) => {
      return publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });
    },

    // Balance and state methods
    getBalance: async (address: string, blockTag?: string | number) => {
      if (typeof blockTag === 'number') {
        return publicClient.getBalance({ 
          address: address as `0x${string}`,
          blockNumber: BigInt(blockTag),
        });
      } else {
        return publicClient.getBalance({ 
          address: address as `0x${string}`,
        });
      }
    },

    getCode: async (address: string, blockTag?: string | number) => {
      if (typeof blockTag === 'number') {
        return publicClient.getBytecode({ 
          address: address as `0x${string}`,
          blockNumber: BigInt(blockTag),
        });
      } else {
        return publicClient.getBytecode({ 
          address: address as `0x${string}`,
        });
      }
    },

    // Contract interaction methods
    call: async (transaction: any, blockTag?: string | number) => {
      return publicClient.call({
        ...transaction,
        blockNumber: typeof blockTag === 'number' ? BigInt(blockTag) : undefined,
      });
    },

    estimateGas: async (transaction: any) => {
      return publicClient.estimateGas(transaction);
    },

    // Gas price methods
    getGasPrice: async () => {
      return publicClient.getGasPrice();
    },

    getFeeData: async () => {
      const [gasPrice, block] = await Promise.all([
        publicClient.getGasPrice(),
        publicClient.getBlock({ blockTag: 'latest' }),
      ]);

      return {
        gasPrice,
        maxFeePerGas: block.baseFeePerGas ? block.baseFeePerGas * 2n : gasPrice,
        maxPriorityFeePerGas: block.baseFeePerGas ? gasPrice - block.baseFeePerGas : gasPrice,
      };
    },

    // Event methods (simplified)
    on: (_event: string, _listener: (...args: any[]) => void) => {
      console.warn('Event handling through viem adapter is limited. Use viem client directly for events.');
    },

    off: (_event: string, _listener?: (...args: any[]) => void) => {
      console.warn('Event handling through viem adapter is limited. Use viem client directly for events.');
    },

    // Signer methods (if wallet client is available)
    getSigner: () => {
      if (!walletClient || !walletClient.account) {
        return null;
      }

      return createEthersSigner(walletClient);
    },

    // Additional viem-specific methods
    _viemPublicClient: publicClient,
    _viemWalletClient: walletClient,
  };

  return provider;
}

/**
 * Create an ethers-compatible signer from viem wallet client
 * 
 * @param walletClient - Viem wallet client
 * @returns Ethers-compatible signer
 */
export function createEthersSigner(walletClient: WalletClient) {
  if (!walletClient.account) {
    throw new Error('Wallet client must have an account');
  }

  const signer = {
    // Address methods
    getAddress: async () => walletClient.account!.address,

    // Signing methods
    signMessage: async (message: string | Uint8Array) => {
      return walletClient.signMessage({
        account: walletClient.account!,
        message: typeof message === 'string' ? message : { raw: message },
      });
    },

    signTypedData: async (domain: any, types: any, value: any) => {
      return walletClient.signTypedData({
        account: walletClient.account!,
        domain,
        types,
        primaryType: Object.keys(types).find(key => key !== 'EIP712Domain') || '',
        message: value,
      });
    },

    // Transaction methods
    sendTransaction: async (transaction: any) => {
      return walletClient.sendTransaction({
        ...transaction,
        account: walletClient.account!,
      });
    },

    // Provider access
    provider: createEthersProviderFromViem(walletClient as any, walletClient),

    // Additional viem-specific methods
    _viemWalletClient: walletClient,
  };

  return signer;
}

/**
 * Utility to convert viem chain to network config
 * 
 * @param chain - Viem chain object
 * @param rpcUrl - Optional custom RPC URL
 * @returns Network configuration
 */
export function chainToNetworkConfig(chain: Chain, rpcUrl?: string): NetworkConfig {
  return {
    chainId: chain.id,
    name: chain.name,
    ...(rpcUrl || chain.rpcUrls.default.http[0] ? { rpcUrl: rpcUrl || chain.rpcUrls.default.http[0] } : {}),
    ...(chain.blockExplorers?.default?.url ? { blockExplorer: chain.blockExplorers.default.url } : {}),
  };
}

/**
 * Helper to validate viem client compatibility
 * 
 * @param publicClient - Viem public client
 * @param requiredChainId - Required chain ID
 * @returns Validation result
 */
export function validateViemClientCompatibility(
  publicClient: PublicClient,
  requiredChainId: number
): { isValid: boolean; clientChainId?: number; error?: string } {
  if (!publicClient.chain) {
    return {
      isValid: false,
      error: 'Public client must have a chain configured',
    };
  }

  const clientChainId = publicClient.chain.id;
  
  if (clientChainId !== requiredChainId) {
    return {
      isValid: false,
      clientChainId,
      error: `Client chain ID (${clientChainId}) does not match required chain ID (${requiredChainId})`,
    };
  }

  return { isValid: true, clientChainId };
}

/**
 * Create a read-only LukasSDK instance from a viem public client
 * 
 * @param publicClient - Viem public client
 * @param config - Additional configuration options
 * @returns Read-only LukasSDK instance
 */
export function createReadOnlyLukasSDKFromViem(
  publicClient: PublicClient,
  config: ViemAdapterConfig = {}
): LukasSDK {
  return createLukasSDKFromViem(publicClient, undefined, config);
}