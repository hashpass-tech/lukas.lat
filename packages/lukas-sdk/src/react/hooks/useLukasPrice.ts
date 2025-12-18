import { useState, useEffect } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { BigNumber } from '../../types';

export interface UseLukasPriceOptions {
  /** Auto-refresh interval in ms */
  refreshInterval?: number;
}

export interface UseLukasPriceResult {
  /** Current LUKAS price in USDC */
  price: BigNumber | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Manually refresh price */
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current LUKAS price in USDC
 */
export function useLukasPrice(
  sdk: LukasSDK | null,
  options: UseLukasPriceOptions = {}
): UseLukasPriceResult {
  const { refreshInterval } = options;

  const [price, setPrice] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = async () => {
    if (!sdk) {
      setPrice(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement once SwapService is added to SDK
      // const swapService = sdk.getSwapService();
      // const lukasPrice = await swapService.getLukasPrice();
      
      // Placeholder - return null until pool is deployed
      setPrice(null);
      setError(new Error('Price feed not available. Pool deployment required.'));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch LUKAS price');
      setError(errorObj);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sdk) {
      setPrice(null);
      return;
    }

    let cancelled = false;
    let intervalId: NodeJS.Timeout | null = null;

    const fetch = async () => {
      if (cancelled) return;
      await fetchPrice();
    };

    fetch();

    // Set up refresh interval if specified
    if (refreshInterval && refreshInterval > 0) {
      intervalId = setInterval(fetch, refreshInterval);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sdk, refreshInterval]);

  return {
    price,
    loading,
    error,
    refetch: fetchPrice,
  };
}
