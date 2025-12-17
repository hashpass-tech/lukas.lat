import { useState, useEffect, useCallback, useRef } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { VaultInfo, CollateralBalance } from '../../types';

export interface UseVaultStatusOptions {
  /** Polling interval in milliseconds (default: 30000) */
  pollingInterval?: number;
  /** Whether to enable automatic polling (default: true) */
  enabled?: boolean;
  /** Whether to refetch on window focus (default: true) */
  refetchOnWindowFocus?: boolean;
}

export interface UseVaultStatusResult {
  /** Vault information */
  vaultInfo: VaultInfo | null;
  /** Collateral balance information */
  collateralBalance: CollateralBalance | null;
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
 * React hook for fetching and monitoring vault status
 * 
 * @param sdk - LukasSDK instance
 * @param options - Hook configuration options
 * @returns Vault status state and controls
 */
export function useVaultStatus(
  sdk: LukasSDK | null,
  options: UseVaultStatusOptions = {}
): UseVaultStatusResult {
  const {
    pollingInterval = 30000,
    enabled = true,
    refetchOnWindowFocus = true,
  } = options;

  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [collateralBalance, setCollateralBalance] = useState<CollateralBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchVaultStatus = useCallback(async () => {
    if (!sdk || !enabled) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get vault service from SDK (this will be available once services are implemented)
      // const contractManager = sdk.getContractManager();
      
      // For now, we'll simulate the vault service call
      // This will be replaced with actual service calls once VaultService is implemented
      const provider = sdk.getProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }

      // Simulate vault status fetch - this will be replaced with actual VaultService calls
      // const [vaultInfo, collateralBalance] = await Promise.all([
      //   sdk.vault.getVaultInfo(),
      //   sdk.vault.getCollateralBalance()
      // ]);
      
      // For now, return placeholders
      const mockVaultInfo: VaultInfo = {
        maxMintPerAction: '100000000000000000000000', // 100k tokens
        maxBuybackPerAction: '50000000000000000000000', // 50k tokens
        deviationThreshold: 500, // 5% (500 basis points)
        cooldownPeriod: 3600, // 1 hour
        lastStabilization: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
        totalMinted: '1000000000000000000000000', // 1M tokens
        totalBoughtBack: '500000000000000000000000', // 500k tokens
      };

      const mockCollateralBalance: CollateralBalance = {
        usdc: '1000000000000', // 1M USDC (6 decimals)
        lukas: '500000000000000000000000', // 500k LUKAS
        totalValueUSD: '1500000000000000000000000', // $1.5M USD
      };
      
      if (mountedRef.current) {
        setVaultInfo(mockVaultInfo);
        setCollateralBalance(mockCollateralBalance);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch vault status'));
        setVaultInfo(null);
        setCollateralBalance(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [sdk, enabled]);

  const refetch = useCallback(async () => {
    await fetchVaultStatus();
  }, [fetchVaultStatus]);

  // Initial fetch and setup polling
  useEffect(() => {
    if (!enabled || !sdk) {
      return;
    }

    // Initial fetch
    fetchVaultStatus();

    // Setup polling
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchVaultStatus, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchVaultStatus, pollingInterval, enabled, sdk]);

  // Handle window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) {
      return;
    }

    const handleFocus = () => {
      fetchVaultStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchVaultStatus, refetchOnWindowFocus, enabled]);

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
    vaultInfo,
    collateralBalance,
    isLoading,
    error,
    refetch,
    lastUpdated,
  };
}