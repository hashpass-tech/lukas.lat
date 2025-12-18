import { useState, useEffect } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { BigNumber } from '../../types';

/**
 * Hook to get token balance for an address
 */
export function useTokenBalance(
  sdk: LukasSDK | null,
  address: string | null | undefined,
  tokenType: 'lukas' | 'usdc' = 'lukas',
  refreshInterval?: number
) {
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sdk || !address) {
      setBalance(null);
      return;
    }

    let cancelled = false;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchBalance = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const tokenService = tokenType === 'lukas' 
          ? sdk.getTokenService() 
          : sdk.getUSDCService();
        
        const bal = await tokenService.getBalance(address);
        
        if (!cancelled) {
          setBalance(bal);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBalance();

    // Set up refresh interval if specified
    if (refreshInterval && refreshInterval > 0) {
      intervalId = setInterval(fetchBalance, refreshInterval);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sdk, address, tokenType, refreshInterval]);

  return { balance, loading, error, refetch: () => {} };
}
