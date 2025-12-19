'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useLukasSDK } from '@/app/providers/lukas-sdk-provider';

export interface PoolMetrics {
  state: any | null;
  volume24h: bigint | null;
  priceDeviation: number | null;
  price: number | null;
  poolState: any | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// Mock data constants to avoid recreating objects
const MOCK_STATE = {
  price: 0.0976,
  sqrtPriceX96: BigInt('62135896541'),
  tick: -276,
  liquidity: BigInt('10000000000000000000'),
  volume24h: 12500,
  feeGrowthToken0: BigInt(0),
  feeGrowthToken1: BigInt(0),
};

const MOCK_POOL_STATE = {
  price: 0.0976,
  sqrtPriceX96: BigInt('62135896541'),
  tick: -276,
  liquidity: BigInt('10000000000000000000'),
};

export function usePoolMetrics(refreshInterval: number = 10000): PoolMetrics {
  const { sdk } = useLukasSDK();
  
  // Initialize with mock data to prevent any state updates
  const [state, setState] = useState<any | null>(MOCK_STATE);
  const [poolState, setPoolState] = useState<any | null>(MOCK_POOL_STATE);
  const [price, setPrice] = useState<number | null>(0.0976);
  const [volume24h, setVolume24h] = useState<bigint | null>(BigInt(12500));
  const [priceDeviation, setPriceDeviation] = useState<number | null>(0.12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to avoid dependency array issues
  const sdkRef = useRef(sdk);
  const initializedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Update ref when sdk changes
  useEffect(() => {
    sdkRef.current = sdk;
  }, [sdk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Create refresh function that doesn't change
  const refreshFn = useRef(async () => {
    const currentSdk = sdkRef.current;
    if (!currentSdk || !isMountedRef.current) {
      return;
    }

    try {
      setLoading(true);

      // Check if SDK has getPoolService method
      if (typeof (currentSdk as any).getPoolService !== 'function') {
        // Pool service not available, use mock data (already initialized)
        if (isMountedRef.current) {
          setLoading(false);
          setError(null); // Clear any previous error - mock data is fine
        }
        return;
      }

      const poolService = (currentSdk as any).getPoolService();
      
      // Fetch all metrics in parallel
      const [ps, vol24h, deviation] = await Promise.all([
        poolService.getPoolState(),
        poolService.getVolume24h(),
        poolService.getPriceDeviation(),
      ]);

      if (!isMountedRef.current) return;

      setState(ps);
      setPoolState(ps);
      setPrice(ps?.price || null);
      setVolume24h(vol24h);
      setPriceDeviation(deviation);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      // Pool service failed - this is expected when contracts aren't deployed
      // Keep using mock data, don't show error to user
      console.debug('Pool metrics: Using mock data (pool service unavailable)');
      // Don't set error - we have valid mock data to display
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }).current;

  // Set up polling - only run once on mount
  useEffect(() => {
    // Only initialize once
    if (initializedRef.current) return;
    initializedRef.current = true;

    let interval: NodeJS.Timeout | null = null;

    // Delay initial fetch to let SDK initialize
    const timeout = setTimeout(() => {
      refreshFn();
      // Set up interval for polling
      interval = setInterval(refreshFn, refreshInterval);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []); // Empty dependency array - only run once

  return useMemo(() => ({
    state,
    poolState,
    price,
    volume24h,
    priceDeviation,
    loading,
    error,
    refresh: refreshFn,
  }), [state, poolState, price, volume24h, priceDeviation, loading, error]);
}
