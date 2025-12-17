import { useState, useEffect, useCallback, useRef } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { PegStatus } from '../../types';

export interface UsePegStatusOptions {
  /** Polling interval in milliseconds (default: 15000) */
  pollingInterval?: number;
  /** Whether to enable automatic polling (default: true) */
  enabled?: boolean;
  /** Whether to refetch on window focus (default: true) */
  refetchOnWindowFocus?: boolean;
}

export interface UsePegStatusResult {
  /** Current peg status */
  pegStatus: PegStatus | null;
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
 * React hook for fetching and monitoring LUKAS peg status
 * 
 * @param sdk - LukasSDK instance
 * @param options - Hook configuration options
 * @returns Peg status state and controls
 */
export function usePegStatus(
  sdk: LukasSDK | null,
  options: UsePegStatusOptions = {}
): UsePegStatusResult {
  const {
    pollingInterval = 15000, // Peg status changes frequently
    enabled = true,
    refetchOnWindowFocus = true,
  } = options;

  const [pegStatus, setPegStatus] = useState<PegStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchPegStatus = useCallback(async () => {
    if (!sdk || !enabled) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get oracle service from SDK (this will be available once services are implemented)
      // const contractManager = sdk.getContractManager();
      
      // For now, we'll simulate the oracle service call
      // This will be replaced with actual service calls once OracleService is implemented
      const provider = sdk.getProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }

      // Simulate peg status fetch - this will be replaced with actual OracleService call
      // const pegStatus = await sdk.oracle.getPegStatus();
      
      // For now, return a placeholder
      const mockPegStatus: PegStatus = {
        poolPrice: '1000000000000000000', // 1.0 USD
        fairPrice: '1010000000000000000', // 1.01 USD
        deviation: 100, // 1% deviation (100 basis points)
        isOverPeg: false,
        shouldStabilize: true,
      };
      
      if (mountedRef.current) {
        setPegStatus(mockPegStatus);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch peg status'));
        setPegStatus(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [sdk, enabled]);

  const refetch = useCallback(async () => {
    await fetchPegStatus();
  }, [fetchPegStatus]);

  // Initial fetch and setup polling
  useEffect(() => {
    if (!enabled || !sdk) {
      return;
    }

    // Initial fetch
    fetchPegStatus();

    // Setup polling
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchPegStatus, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchPegStatus, pollingInterval, enabled, sdk]);

  // Handle window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) {
      return;
    }

    const handleFocus = () => {
      fetchPegStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchPegStatus, refetchOnWindowFocus, enabled]);

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
    pegStatus,
    isLoading,
    error,
    refetch,
    lastUpdated,
  };
}