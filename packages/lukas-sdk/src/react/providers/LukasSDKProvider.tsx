import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { LukasSDK } from '../../core/LukasSDK';
import { LukasSDKContext } from '../context/LukasSDKContext';
import type { LukasSDKConfig } from '../../core/types';

export interface LukasSDKProviderProps {
  /** SDK configuration */
  config: LukasSDKConfig;
  /** Child components */
  children: ReactNode;
  /** Callback when SDK initialization completes */
  onInitialized?: (sdk: LukasSDK) => void;
  /** Callback when SDK initialization fails */
  onError?: (error: Error) => void;
}

/**
 * Provider component for LukasSDK React context
 * 
 * This component initializes the LukasSDK and provides it to child components
 * through React context.
 */
export function LukasSDKProvider({
  config,
  children,
  onInitialized,
  onError,
}: LukasSDKProviderProps) {
  const [sdk, setSdk] = useState<LukasSDK | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize SDK when config changes
  useEffect(() => {
    let mounted = true;

    const initializeSDK = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Create new SDK instance
        const newSDK = new LukasSDK(config);

        if (mounted) {
          setSdk(newSDK);
          setIsInitializing(false);
          onInitialized?.(newSDK);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize SDK');
        
        if (mounted) {
          setError(error);
          setSdk(null);
          setIsInitializing(false);
          onError?.(error);
        }
      }
    };

    initializeSDK();

    return () => {
      mounted = false;
      // Cleanup SDK if needed
      if (sdk) {
        sdk.disconnect();
      }
    };
  }, [config, onInitialized, onError]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    sdk,
    isInitializing,
    error,
  }), [sdk, isInitializing, error]);

  return (
    <LukasSDKContext.Provider value={contextValue}>
      {children}
    </LukasSDKContext.Provider>
  );
}

/**
 * Higher-order component for providing LukasSDK context
 * 
 * @param config - SDK configuration
 * @returns HOC function
 */
export function withLukasSDK(config: LukasSDKConfig) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    const WrappedComponent = (props: P) => (
      <LukasSDKProvider config={config}>
        <Component {...props} />
      </LukasSDKProvider>
    );

    WrappedComponent.displayName = `withLukasSDK(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
  };
}