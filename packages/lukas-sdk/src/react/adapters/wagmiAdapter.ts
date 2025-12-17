import type { Config } from 'wagmi';
import type { PublicClient, WalletClient } from 'viem';
import { LukasSDK } from '../../core/LukasSDK';
import type { LukasSDKConfig, NetworkConfig, ContractAddresses } from '../../core/types';

/**
 * Configuration for creating LukasSDK from wagmi config
 */
export interface WagmiAdapterConfig {
  /** Custom contract addresses (optional) */
  contracts?: Partial<ContractAddresses>;
  /** SDK options */
  options?: LukasSDKConfig['options'];
  /** Custom network configuration */
  networkConfig?: Partial<NetworkConfig>;
}

/**
 * Create a LukasSDK instance from wagmi configuration
 * 
 * @param wagmiConfig - Wagmi configuration object
 * @param chainId - Target chain ID
 * @param config - Additional configuration options
 * @returns LukasSDK instance
 */
export function createLukasSDKFromWagmi(
  wagmiConfig: Config,
  chainId: number,
  config: WagmiAdapterConfig = {}
): LukasSDK {
  // Get the chain configuration from wagmi
  const chain = wagmiConfig.chains?.find(c => c.id === chainId);
  if (!chain) {
    throw new Error(`Chain ${chainId} not found in wagmi configuration`);
  }

  // Extract network configuration
  const networkConfig: NetworkConfig = {
    chainId: chain.id,
    name: chain.name,
    ...(chain.rpcUrls.default.http[0] ? { rpcUrl: chain.rpcUrls.default.http[0] } : {}),
    ...(chain.blockExplorers?.default?.url ? { blockExplorer: chain.blockExplorers.default.url } : {}),
    ...config.networkConfig,
  };

  // Create SDK configuration
  const sdkConfig: LukasSDKConfig = {
    network: networkConfig,
    ...(config.contracts ? { contracts: config.contracts } : {}),
    ...(config.options ? { options: config.options } : {}),
  };

  return new LukasSDK(sdkConfig);
}

/**
 * Hook to create LukasSDK instance with wagmi integration
 * This hook should be used within a wagmi context
 */
export function useLukasSDKWithWagmi(
  _chainId: number,
  _config: WagmiAdapterConfig = {}
): LukasSDK | null {
  // This would typically use wagmi hooks, but since we're not importing React hooks directly,
  // we'll provide a factory function that can be used with wagmi hooks
  
  // The actual implementation would look like:
  // const wagmiConfig = useConfig();
  // const { data: publicClient } = usePublicClient({ chainId });
  // const { data: walletClient } = useWalletClient({ chainId });
  
  // For now, we return null and expect the consumer to use createLukasSDKFromWagmi
  return null;
}

/**
 * Create a provider-compatible object from viem clients
 * 
 * @param publicClient - Viem public client
 * @param walletClient - Viem wallet client (optional)
 * @returns Provider-like object compatible with ethers
 */
export function createProviderFromViemClients(
  publicClient: PublicClient,
  walletClient?: WalletClient
) {
  // Create a provider-like object that bridges viem clients to ethers-compatible interface
  const provider = {
    // Basic provider methods
    getNetwork: async () => ({
      chainId: publicClient.chain?.id || 1,
      name: publicClient.chain?.name || 'unknown',
    }),
    
    getBlockNumber: () => publicClient.getBlockNumber(),
    
    getBalance: (address: string) => publicClient.getBalance({ address: address as `0x${string}` }),
    
    call: (transaction: any) => publicClient.call(transaction),
    
    estimateGas: (transaction: any) => publicClient.estimateGas(transaction),
    
    // Transaction methods (require wallet client)
    sendTransaction: walletClient ? (transaction: any) => {
      if (!walletClient.account) {
        throw new Error('Wallet client account not available');
      }
      return walletClient.sendTransaction({
        ...transaction,
        account: walletClient.account,
      });
    } : undefined,
    
    // Event methods
    on: (_event: string, _listener: (...args: any[]) => void) => {
      // Viem uses different event handling, this would need proper implementation
      console.warn('Event handling not fully implemented in viem adapter');
    },
    
    off: (_event: string, _listener?: (...args: any[]) => void) => {
      console.warn('Event handling not fully implemented in viem adapter');
    },
    
    // Signer methods (if wallet client is available)
    getSigner: () => {
      if (!walletClient || !walletClient.account) {
        return null;
      }
      
      return {
        getAddress: () => Promise.resolve(walletClient.account!.address),
        signMessage: (message: string) => walletClient.signMessage({
          account: walletClient.account!,
          message,
        }),
        sendTransaction: (transaction: any) => walletClient.sendTransaction({
          ...transaction,
          account: walletClient.account!,
        }),
      };
    },
  };

  return provider;
}

/**
 * Utility to extract chain configuration from wagmi config
 * 
 * @param wagmiConfig - Wagmi configuration
 * @param chainId - Target chain ID
 * @returns Chain configuration
 */
export function extractChainConfig(wagmiConfig: Config, chainId: number) {
  const chain = wagmiConfig.chains?.find(c => c.id === chainId);
  if (!chain) {
    throw new Error(`Chain ${chainId} not found in wagmi configuration`);
  }

  return {
    id: chain.id,
    name: chain.name,
    rpcUrl: chain.rpcUrls.default.http[0],
    blockExplorer: chain.blockExplorers?.default?.url,
    nativeCurrency: chain.nativeCurrency,
  };
}

/**
 * Helper to validate wagmi configuration compatibility
 * 
 * @param wagmiConfig - Wagmi configuration to validate
 * @param requiredChainIds - Chain IDs that must be supported
 * @returns Validation result
 */
export function validateWagmiCompatibility(
  wagmiConfig: Config,
  requiredChainIds: number[]
): { isValid: boolean; missingChains: number[]; supportedChains: number[] } {
  const supportedChains = wagmiConfig.chains?.map(c => c.id) || [];
  const missingChains = requiredChainIds.filter(id => !supportedChains.includes(id));
  
  return {
    isValid: missingChains.length === 0,
    missingChains,
    supportedChains,
  };
}