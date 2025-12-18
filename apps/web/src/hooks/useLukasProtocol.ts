/**
 * Custom hook for interacting with Lukas Protocol via the SDK
 * 
 * This hook provides a convenient interface for components to interact
 * with the Lukas Protocol smart contracts through the SDK.
 */

import { useLukasSDK } from '@/app/providers/lukas-sdk-provider';
import { useCallback, useEffect, useState } from 'react';

// Re-export for convenience
export { useLukasSDK };

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  address: string;
}

export interface TokenBalance {
  balance: string;
  formatted: string;
}

export function useLukasProtocol() {
  const { sdk, isInitialized, networkInfo, error: sdkError } = useLukasSDK();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combine SDK error with local error
  const combinedError = sdkError || error;

  /**
   * Get token information
   */
  const getTokenInfo = useCallback(async (): Promise<TokenInfo | null> => {
    if (!sdk || !isInitialized) {
      setError('SDK not initialized');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // For now, return mock data since services aren't implemented yet
      // In the future, this would call: sdk.token.getTokenInfo()
      const mockInfo: TokenInfo = {
        name: 'Lukas Token',
        symbol: 'LUKAS',
        decimals: 18,
        totalSupply: '0',
        address: networkInfo?.contracts?.lukasToken || '0x0',
      };

      return mockInfo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token info';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isInitialized, networkInfo]);

  /**
   * Get token balance for an address
   */
  const getTokenBalance = useCallback(async (address: string): Promise<TokenBalance | null> => {
    if (!sdk || !isInitialized) {
      setError('SDK not initialized');
      return null;
    }

    if (!address) {
      setError('Address is required');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // For now, return mock data since services aren't implemented yet
      // In the future, this would call: sdk.token.getBalance(address)
      const mockBalance: TokenBalance = {
        balance: '0',
        formatted: '0.00',
      };

      return mockBalance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token balance';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isInitialized]);

  /**
   * Check if SDK is ready for use
   */
  const isReady = useCallback(() => {
    return sdk !== null && isInitialized && !combinedError;
  }, [sdk, isInitialized, combinedError]);

  /**
   * Get current network information
   */
  const getNetworkInfo = useCallback(() => {
    return networkInfo;
  }, [networkInfo]);

  /**
   * Check if SDK is in read-only mode
   */
  const isReadOnly = useCallback(() => {
    return sdk?.isReadOnly() ?? true;
  }, [sdk]);

  return {
    // SDK instance
    sdk,
    
    // State
    isInitialized,
    isLoading,
    error: combinedError,
    networkInfo,
    
    // Methods
    getTokenInfo,
    getTokenBalance,
    isReady,
    getNetworkInfo,
    isReadOnly,
  };
}
