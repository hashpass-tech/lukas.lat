import { createContext, useContext } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { NetworkInfo } from '../../core/types';

/**
 * Context for providing LukasSDK instance to React components
 */
export interface LukasSDKContextValue {
  /** LukasSDK instance */
  sdk: LukasSDK | null;
  /** Whether SDK is initializing */
  isInitializing: boolean;
  /** Whether SDK is fully initialized and ready */
  isInitialized: boolean;
  /** Initialization error */
  error: Error | null;
  /** Current network information */
  networkInfo: NetworkInfo | null;
}

/**
 * React context for LukasSDK
 */
export const LukasSDKContext = createContext<LukasSDKContextValue | null>(null);

/**
 * Hook to access LukasSDK from context
 * 
 * @returns LukasSDK context value
 * @throws Error if used outside of LukasSDKProvider
 */
export function useLukasSDK(): LukasSDKContextValue {
  const context = useContext(LukasSDKContext);
  
  if (!context) {
    throw new Error('useLukasSDK must be used within a LukasSDKProvider');
  }
  
  return context;
}

/**
 * Hook to get the LukasSDK instance directly
 * 
 * @returns LukasSDK instance or null
 * @throws Error if used outside of LukasSDKProvider
 */
export function useLukasSDKInstance(): LukasSDK | null {
  const { sdk } = useLukasSDK();
  return sdk;
}

/**
 * Hook to get network information
 * 
 * @returns Network info or null
 */
export function useNetworkInfo(): NetworkInfo | null {
  const { networkInfo } = useLukasSDK();
  return networkInfo;
}

/**
 * Hook to check if SDK is ready for use
 * 
 * @returns boolean indicating if SDK is ready
 */
export function useIsSDKReady(): boolean {
  const { isInitialized, error } = useLukasSDK();
  return isInitialized && !error;
}