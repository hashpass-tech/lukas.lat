import { useState, useEffect, useCallback, useRef } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { PoolState } from '../../services/PoolService';

export interface UsePoolMetricsOptions {
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Auto-start polling */
  autoStart?: boolean;
  /** Use mock data when pool service is unavailable */
  useMockData?: boolean;
}

export interface UsePoolMetricsResult {
  /** Current pool price */
  price: number | null;
  /** Pool state */
  poolState: PoolState | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** 24-hour volume */
  volume24h: number | null;
  /** Price deviation from fair value */
  priceDeviation: number | null;
  /** Whether using mock data */
  isMockData: boolean;
  /** Refresh pool metrics */
  refresh: () => Promise<void>;
}

// Default mock data for when pool service is unavailable
const MOCK_POOL_STATE = {
  price: 0.0976,
  sqrtPriceX96: BigInt('62135896541'),
  tick: -276,
  liquidity: BigInt('10000000000000000000'),
  volume24h: 12500,
  feeGrowthToken0: BigInt(0),
  feeGrowthToken1: BigInt(0),
} as PoolState;

/**
 * Hook for real-time pool metrics
 * 
 * Provides pool metrics with automatic fallback to mock data
 * when the pool service is not available.
 */
export function usePoolMetrics(
  sdk: LukasSDK | null,
  options: UsePoolMetricsOptions = {}
): UsePoolMetricsResult {
  const { refreshInterval = 10000, autoStart = true, useMockData = true } = options;

  const [price, setPrice] = useState<number | null>(useMockData ? 0.0976 : null);
  const [poolState, setPoolState] = useState<PoolState | null>(useMockData ? MOCK_POOL_STATE : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [volume24h, setVolume24h] = useState<number | null>(useMockData ? 12500 : null);
  const [priceDeviation, setPriceDeviation] = useState<number | null>(useMockData ? 0.12 : null);
  const [isMockData, setIsMockData] = useState(useMockData);
  
  // Use refs to track initialization and prevent infinite loops
  const initializedRef = useRef(false);
  const sdkRef = useRef(sdk);
  const refreshFnRef = useRef<() => Promise<void>>();
  
  // Update SDK ref when it changes
  useEffect(() => {
    sdkRef.current = sdk;
  }, [sdk]);

  // Create refresh function without adding it to dependencies
  refreshFnRef.current = useCallback(async () => {
    const currentSdk = sdkRef.current;
    if (!currentSdk) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if pool service is available
      if (typeof (currentSdk as any).getPoolService !== 'function') {
        // Use mock data
        if (useMockData) {
          setPoolState(MOCK_POOL_STATE);
          setPrice(0.0976);
          setVolume24h(12500);
          setPriceDeviation(0.12);
          setIsMockData(true);
        }
        return;
      }

      const poolService = (currentSdk as any).getPoolService();
      
      // Fetch all metrics in parallel
      const [state, volume, deviation] = await Promise.all([
        poolService.getPoolState(),
        poolService.getVolume24h(),
        poolService.getPriceDeviation(),
      ]);

      setPoolState(state);
      setPrice(state.price);
      setVolume24h(volume);
      setPriceDeviation(deviation);
      setIsMockData(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch pool metrics');
      setError(error);
      
      // Fall back to mock data on error
      if (useMockData) {
        setPoolState(MOCK_POOL_STATE);
        setPrice(0.0976);
        setVolume24h(12500);
        setPriceDeviation(0.12);
        setIsMockData(true);
      }
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Set up polling - only run once on mount
  useEffect(() => {
    if (!autoStart || initializedRef.current) return;
    initializedRef.current = true;

    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;

    const fetchMetrics = async () => {
      if (!isMounted) return;
      await refreshFnRef.current?.();
    };

    // Delay initial fetch to let SDK initialize
    const timeout = setTimeout(() => {
      fetchMetrics();
      // Set up interval for polling
      interval = setInterval(fetchMetrics, refreshInterval);
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []); // Empty dependency array - only run once

  return {
    price,
    poolState,
    loading,
    error,
    volume24h,
    priceDeviation,
    isMockData,
    refresh: refreshFnRef.current || (async () => {}),
  };
}
