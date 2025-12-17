import { useState, useEffect, useCallback, useRef } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { TokenInfo } from '../../types';

export interface UseTokenInfoOptions {
  /** Polling interval in milliseconds (default: 60000) */
  pollingInterval?: number;
  /** Whether to enable automatic polling (default: true) */
  enabled?: boolean;
  /** Whether to refetch on window focus (default: false) */
  refetchOnWindowFocus?: boolean;
}

export interface UseTokenInfoResult {
  /** Token information */
  tokenInfo: TokenInfo | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
  /** Last update timestamp */
  lastUpdated: number | null;
}

/**
 * React hook for fetching LUKAS token information
 * 
 * @param sdk - LukasSDK instance
 * @param options - Hook configuration options
 * @returns Token info state and controls
 */
export function useTokenInfo(
  sdk: LukasSDK | null,
  options: UseTokenInfoOptions = {}
): UseTokenInfoResult {
  const {
    pollingInterval = 60000, // Token info changes less frequently
    enabled = true,
    refetchOnWindowFocus = false, // Token info is relatively static
  } = options;

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchTokenInfo = useCallback(async () => {
    if (!sdk || !enabled) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get token service from SDK (this will be available once services are implemented)
      // const contractManager = sdk.getContractManager();
      
      // For now, we'll simulate the token service call
      // This will be replaced with actual service calls once TokenService is implemented
      const provider = sdk.getProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }

      // Simulate token info fetch - this will be replaced with actual TokenService call
      // const tokenInfo = await sdk.token.getTokenInfo();
      
      // For now, return a placeholder
      const mockTokenInfo: TokenInfo = {
        name: 'Lukas Token',
        symbol: 'LUKAS',
        decimals: 18,
        totalSupply: '1000000000000000000000000', // 1M tokens
        address: sdk.getNetworkInfo().contracts.lukasToken,
      };
      
      if (mountedRef.current) {
        setTokenInfo(mockTokenInfo);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch token info'));
        setTokenInfo(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [sdk, enabled]);

  const refetch = useCallback(async () => {
    await fetchTokenInfo();
  }, [fetchTokenInfo]);

  // Initial fetch and setup polling
  useEffect(() => {
    if (!enabled || !sdk) {
      return;
    }

    // Initial fetch
    fetchTokenInfo();

    // Setup polling
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchTokenInfo, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchTokenInfo, pollingInterval, enabled, sdk]);

  // Handle window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) {
      return;
    }

    const handleFocus = () => {
      fetchTokenInfo();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchTokenInfo, refetchOnWindowFocus, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    tokenInfo,
    isLoading,
    error,
    refetch,
    lastUpdated,
  };
}