import { useState, useEffect, useMemo, useRef, ReactNode, useContext, createContext, Context } from 'react';
import { LukasSDK } from '../../core/LukasSDK';
import type { LukasSDKConfig, NetworkInfo } from '../../core/types';

interface LukasSDKContextType {
  sdk: LukasSDK | null;
  isInitializing: boolean;
  isInitialized: boolean;
  error: Error | null;
  networkInfo: NetworkInfo | null;
}

// Lazy context creation - only created when provider is first rendered
let LukasSDKContext: Context<LukasSDKContextType | undefined> | null = null;

function getLukasSDKContext(): Context<LukasSDKContextType | undefined> {
  if (!LukasSDKContext) {
    LukasSDKContext = createContext<LukasSDKContextType | undefined>(undefined);
  }
  return LukasSDKContext;
}

export interface LukasSDKProviderProps {
  config: LukasSDKConfig;
  children: ReactNode;
}

/**
 * Simple, stable SDK provider for React
 * Initializes SDK once and provides it via context
 */
export function LukasSDKProvider({ config, children }: LukasSDKProviderProps) {
  const [sdk, setSdk] = useState<LukasSDK | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  
  const initializedRef = useRef(false);

  // Initialize SDK once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    let mounted = true;

    (async () => {
      try {
        const newSDK = new LukasSDK(config);
        if (mounted) {
          setSdk(newSDK);
          setNetworkInfo(newSDK.getNetworkInfo());
          setIsInitialized(true);
          setIsInitializing(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('SDK init failed'));
          setIsInitialized(false);
          setIsInitializing(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [config]);

  const value = useMemo(() => ({
    sdk,
    isInitializing,
    isInitialized,
    error,
    networkInfo,
  }), [sdk, isInitializing, isInitialized, error, networkInfo]);

  const Context = getLukasSDKContext();
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

/**
 * Hook to use SDK from context
 */
export function useLukasSDK() {
  const Context = getLukasSDKContext();
  const context = useContext(Context);
  if (!context) {
    throw new Error('useLukasSDK must be used within LukasSDKProvider');
  }
  return context;
}