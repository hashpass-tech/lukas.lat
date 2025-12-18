/**
 * Lukas SDK - TypeScript SDK for interacting with the Lukas Protocol
 * 
 * This is the main entry point for the Lukas SDK, providing a comprehensive
 * interface for interacting with the Lukas Protocol smart contracts.
 */

// Core SDK exports
export { LukasSDK } from './core/LukasSDK';
export { NetworkManager } from './core/NetworkManager';
export { ProviderManager } from './core/ProviderManager';
export { ContractManager } from './core/ContractManager';
export type { LukasSDKConfig, SDKOptions, NetworkConfig, ContractAddresses, NetworkInfo } from './core/types';

// Service exports
export type { TokenService } from './services/TokenService';
export type { SwapService } from './services/SwapService';
export type { VaultService } from './services/VaultService';
export type { OracleService } from './services/OracleService';
export type { LiquidityService } from './services/LiquidityService';
export { TokenServiceImpl } from './services/TokenServiceImpl';
export { SwapServiceImpl } from './services/SwapServiceImpl';

// Type exports
export type * from './types';

// Error exports
export { LukasSDKError, LukasSDKErrorCode } from './errors/LukasSDKError';

// Utility exports
export * from './utils';

// React hooks and providers are exported separately via the './react' export path
// Import from '@lukas-protocol/sdk/react' to use React-specific features
// This prevents React from being bundled when only using the core SDK

// Version - dynamically imported from package.json
import packageJson from '../package.json';
export const VERSION = packageJson.version;