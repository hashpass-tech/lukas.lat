import { useState, useEffect } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { TokenInfo } from '../../types';

/**
 * Hook to get token information (name, symbol, decimals)
 */
export function useTokenInfo(
  sdk: LukasSDK | null,
  tokenType: 'lukas' | 'usdc' = 'lukas'
) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sdk) {
      setTokenInfo(null);
      return;
    }

    let cancelled = false;

    const fetchTokenInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tokenService = tokenType === 'lukas' 
          ? sdk.getTokenService() 
          : sdk.getUSDCService();
        
        const info = await tokenService.getTokenInfo();
        
        if (!cancelled) {
          setTokenInfo(info);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch token info'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTokenInfo();

    return () => {
      cancelled = true;
    };
  }, [sdk, tokenType]);

  return { tokenInfo, loading, error };
}
