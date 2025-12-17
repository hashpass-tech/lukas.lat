import { useState, useEffect, useCallback, useRef } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import { useEventSubscription } from './useEventSubscription';
import type { EventType } from './useEventSubscription';

/**
 * Configuration for real-time data updates
 */
export interface UseRealTimeDataOptions<T> {
  /** Initial data fetcher function */
  fetcher: () => Promise<T>;
  /** Event types that should trigger data refresh */
  refreshEvents?: EventType[];
  /** Polling interval in milliseconds (0 to disable polling) */
  pollingInterval?: number;
  /** Whether to enable real-time updates (default: true) */
  enabled?: boolean;
  /** Whether to refetch on window focus (default: true) */
  refetchOnWindowFocus?: boolean;
  /** Comparison function to determine if data has changed */
  isEqual?: (a: T, b: T) => boolean;
}

/**
 * Real-time data result
 */
export interface UseRealTimeDataResult<T> {
  /** Current data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
  /** Last update timestamp */
  lastUpdated: number | null;
  /** Whether data is stale */
  isStale: boolean;
}

/**
 * React hook for real-time data with event-driven updates
 * 
 * This hook combines polling, event subscriptions, and manual fetching
 * to provide real-time data updates with optimal performance.
 * 
 * @param sdk - LukasSDK instance
 * @param options - Configuration options
 * @returns Real-time data state and controls
 */
export function useRealTimeData<T>(
  sdk: LukasSDK | null,
  options: UseRealTimeDataOptions<T>
): UseRealTimeDataResult<T> {
  const {
    fetcher,
    refreshEvents = [],
    pollingInterval = 30000,
    enabled = true,
    refetchOnWindowFocus = true,
    isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b),
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);

  // Subscribe to events that should trigger data refresh
  const { latestEvent } = useEventSubscription(
    sdk,
    refreshEvents[0] || 'Transfer', // Default to Transfer if no events specified
    { 
      enabled: enabled && refreshEvents.length > 0,
    }
  );

  const fetchData = useCallback(async (force = false) => {
    if (!sdk || !enabled) {
      return;
    }

    // Prevent duplicate fetches within a short time window
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      setIsLoading(true);
      setError(null);
      setIsStale(false);

      const newData = await fetcher();

      if (mountedRef.current) {
        // Only update if data has actually changed
        setData(prevData => {
          if (prevData === null || !isEqual(prevData, newData)) {
            setLastUpdated(now);
            return newData;
          }
          return prevData;
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        setIsStale(true);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [sdk, enabled, fetcher, isEqual]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial fetch and setup polling
  useEffect(() => {
    if (!enabled || !sdk) {
      return;
    }

    // Initial fetch
    fetchData();

    // Setup polling if interval is specified
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(() => fetchData(), pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchData, pollingInterval, enabled, sdk]);

  // Refetch when relevant events occur
  useEffect(() => {
    if (latestEvent && refreshEvents.length > 0) {
      // Add a small delay to allow blockchain state to settle
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
    // No cleanup needed if no event
    return undefined;
  }, [latestEvent, refreshEvents.length, fetchData]);

  // Handle window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) {
      return;
    }

    const handleFocus = () => {
      // Mark data as potentially stale and refetch
      setIsStale(true);
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus, enabled]);

  // Mark data as stale after a certain time
  useEffect(() => {
    if (!lastUpdated || pollingInterval <= 0) {
      return;
    }

    const staleTimeout = setTimeout(() => {
      if (mountedRef.current) {
        setIsStale(true);
      }
    }, pollingInterval * 2); // Mark as stale after 2x polling interval

    return () => clearTimeout(staleTimeout);
  }, [lastUpdated, pollingInterval]);

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
    data,
    isLoading,
    error,
    refetch,
    lastUpdated,
    isStale,
  };
}

/**
 * Specialized hook for real-time price data
 */
export function useRealTimePriceData(sdk: LukasSDK | null) {
  return useRealTimeData(sdk, {
    fetcher: async () => {
      if (!sdk) throw new Error('SDK not available');
      
      // This would use the actual oracle service once implemented
      // return sdk.oracle.getPegStatus();
      
      // Placeholder implementation
      return {
        poolPrice: '1000000000000000000',
        fairPrice: '1010000000000000000',
        deviation: 100,
        isOverPeg: false,
        shouldStabilize: true,
      };
    },
    refreshEvents: ['IndexUpdate', 'PegDeviation'],
    pollingInterval: 15000, // 15 seconds for price data
  });
}

/**
 * Specialized hook for real-time balance data
 */
export function useRealTimeBalanceData(sdk: LukasSDK | null, address: string | null) {
  return useRealTimeData(sdk, {
    fetcher: async () => {
      if (!sdk || !address) throw new Error('SDK or address not available');
      
      // This would use the actual token service once implemented
      // return sdk.token.getBalance(address);
      
      // Placeholder implementation
      return '1000000000000000000000'; // 1000 tokens
    },
    refreshEvents: ['Transfer', 'Approval'],
    pollingInterval: 30000, // 30 seconds for balance data
    enabled: !!address,
  });
}