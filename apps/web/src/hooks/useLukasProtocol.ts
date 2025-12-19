/**
 * Custom hook for interacting with Lukas Protocol via the SDK
 * 
 * This hook provides a convenient interface for components to interact
 * with the Lukas Protocol smart contracts through the SDK.
 */

import { useLukasSDK } from '@/app/providers/lukas-sdk-provider';
import { useEffect, useRef, useState } from 'react';

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
  const [error, setError] = useState<Error | null>(null);

  // Combine SDK error with local error
  const combinedError = sdkError || error;

  // Use refs to store SDK and networkInfo for stable callbacks
  const sdkRef = useRef(sdk);
  const isInitializedRef = useRef(isInitialized);
  const networkInfoRef = useRef(networkInfo);

  // Update refs when values change
  useEffect(() => {
    sdkRef.current = sdk;
    isInitializedRef.current = isInitialized;
    networkInfoRef.current = networkInfo;
  }, [sdk, isInitialized, networkInfo]);

  /**
   * Get token information - stable callback
   */
  const getTokenInfo = useRef(async (): Promise<TokenInfo | null> => {
    if (!sdkRef.current || !isInitializedRef.current) {
      setError(new Error('SDK not initialized'));
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
        address: networkInfoRef.current?.contracts?.lukasToken || '0x0',
      };

      return mockInfo;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get token info');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }).current;

  /**
   * Get token balance for an address - stable callback
   */
  const getTokenBalance = useRef(async (address: string): Promise<TokenBalance | null> => {
    if (!sdkRef.current || !isInitializedRef.current) {
      setError(new Error('SDK not initialized'));
      return null;
    }

    if (!address) {
      setError(new Error('Address is required'));
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
      const error = err instanceof Error ? err : new Error('Failed to get token balance');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }).current;

  /**
   * Check if SDK is ready for use
   */
  const isReady = isInitialized && !combinedError;

  /**
   * Get current network information - stable callback
   */
  const getNetworkInfo = useRef(() => {
    return networkInfoRef.current;
  }).current;

  /**
   * Check if SDK is in read-only mode - stable callback
   */
  const isReadOnly = useRef(() => {
    return sdkRef.current?.isReadOnly() ?? true;
  }).current;

  return {
    // SDK instance
    sdk,
    
    // State
    isInitialized,
    isLoading,
    error: combinedError,
    networkInfo,
    isReady,
    
    // Methods
    getTokenInfo,
    getTokenBalance,
    getNetworkInfo,
    isReadOnly,
  };
}
