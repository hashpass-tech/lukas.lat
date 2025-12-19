import type { Provider } from 'ethers';

/**
 * Main configuration interface for the Lukas SDK
 */
export interface LukasSDKConfig {
  /** Network configuration */
  network: NetworkConfig;
  /** Optional provider for blockchain interactions */
  provider?: Provider;
  /** Optional custom contract addresses */
  contracts?: Partial<ContractAddresses>;
  /** Optional SDK configuration options */
  options?: SDKOptions;
}

/**
 * Network configuration interface
 */
export interface NetworkConfig {
  /** Chain ID for the network */
  chainId: number;
  /** Human-readable network name */
  name: string;
  /** Optional RPC URL override */
  rpcUrl?: string;
  /** Optional block explorer URL */
  blockExplorer?: string;
}

/**
 * Contract addresses for all Lukas Protocol contracts
 */
export interface ContractAddresses {
  /** LUKAS token contract address */
  lukasToken: string;
  /** Stabilizer vault contract address */
  stabilizerVault: string;
  /** LatAm basket index oracle contract address */
  latAmBasketIndex: string;
  /** Lukas hook contract address */
  lukasHook: string;
  /** USDC token contract address */
  usdc: string;
  /** Uniswap V4 PoolManager contract address */
  poolManager: string;
}

/**
 * SDK configuration options
 */
export interface SDKOptions {
  /** Enable caching for read operations */
  enableCaching?: boolean;
  /** Cache timeout in milliseconds */
  cacheTimeout?: number;
  /** Number of retry attempts for failed operations */
  retryAttempts?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
  /** Enable event subscriptions */
  enableEvents?: boolean;
  /** Logging level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Network information interface
 */
export interface NetworkInfo {
  /** Chain ID */
  chainId: number;
  /** Network name */
  name: string;
  /** RPC URL */
  rpcUrl: string;
  /** Block explorer URL */
  blockExplorer?: string | undefined;
  /** Contract addresses for this network */
  contracts: ContractAddresses;
}