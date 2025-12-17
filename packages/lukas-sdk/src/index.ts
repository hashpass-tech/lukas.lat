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
export type { VaultService } from './services/VaultService';
export type { OracleService } from './services/OracleService';
export type { LiquidityService } from './services/LiquidityService';

// Type exports
export type * from './types';

// Error exports
export { LukasSDKError, LukasSDKErrorCode } from './errors/LukasSDKError';

// Utility exports
export * from './utils';

// React hooks (optional, only if React is available)
// Commented out for now to avoid build issues when React types are not available
// export * from './react';

// Version
export const VERSION = '0.1.0';