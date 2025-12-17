/**
 * Adapters for integrating Lukas SDK with popular web3 libraries
 */

// Wagmi adapter exports
export {
  createLukasSDKFromWagmi,
  useLukasSDKWithWagmi,
  createProviderFromViemClients,
  extractChainConfig,
  validateWagmiCompatibility,
} from './wagmiAdapter';

export type { WagmiAdapterConfig } from './wagmiAdapter';

// Viem adapter exports
export {
  createLukasSDKFromViem,
  createEthersProviderFromViem,
  createEthersSigner,
  chainToNetworkConfig,
  validateViemClientCompatibility,
  createReadOnlyLukasSDKFromViem,
} from './viemAdapter';

export type { ViemAdapterConfig } from './viemAdapter';