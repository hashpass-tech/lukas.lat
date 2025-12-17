import { createContext, useContext } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';

/**
 * Context for providing LukasSDK instance to React components
 */
export interface LukasSDKContextValue {
  /** LukasSDK instance */
  sdk: LukasSDK | null;
  /** Whether SDK is initializing */
  isInitializing: boolean;
  /** Initialization error */
  error: Error | null;
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