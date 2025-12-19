import { useState, useEffect, useCallback } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { BigNumber } from '../../types';

export interface UseTokenBalanceOptions {
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Auto-start polling */
  autoStart?: boolean;
  /** Token type: 'lukas' or 'usdc' */
  tokenType?: 'lukas' | 'usdc';
}

export interface UseTokenBalanceResult {
  /** Token balance */
  balance: BigNumber | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh balance */
  refresh: () => Promise<void>;
}

/**
 * Hook for user token balance
 */
export function useTokenBalance(
  sdk: LukasSDK | null,
  address: string | null | undefined,
  tokenType: 'lukas' | 'usdc' = 'lukas',
  options: UseTokenBalanceOptions = {}
): UseTokenBalanceResult {
  const { refreshInterval = 5000, autoStart = true } = options;

  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!sdk || !address) {
      setError(new Error('SDK or address not initialized'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tokenService = tokenType === 'lukas' 
        ? sdk.getTokenService()
        : sdk.getUSDCService();
      
      const tokenBalance = await tokenService.getBalance(address);
      setBalance(tokenBalance);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch token balance');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [sdk, address, tokenType]);

  // Set up polling
  useEffect(() => {
    if (!autoStart || !sdk || !address) return;

    // Initial fetch
    refresh();

    // Set up interval
    const interval = setInterval(refresh, refreshInterval);

    return () => clearInterval(interval);
  }, [sdk, address, autoStart, refreshInterval, refresh]);

  return {
    balance,
    loading,
    error,
    refresh,
  };
}
