"use client";

import React, { useEffect, useState } from 'react';
import { useLukasProtocol } from '@/hooks/useLukasProtocol';
import { useWallet } from '@/app/providers/wallet-provider';

/**
 * Demo component showing SDK integration
 * This replaces direct contract calls with SDK methods
 */
export function LukasSDKDemo() {
  const { address, isConnected } = useWallet();
  const { isInitialized, error: sdkError, getTokenInfo, getTokenBalance, isReady, isReadOnly, networkInfo } = useLukasProtocol();
  
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;

      setLoading(true);
      try {
        // Get token info using SDK
        const info = await getTokenInfo();
        setTokenInfo(info);

        // Get balance if wallet is connected
        if (address) {
          const bal = await getTokenBalance(address);
          setBalance(bal);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isReady, address]);

  if (!isInitialized) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Initializing Lukas SDK...</p>
      </div>
    );
  }

  if (sdkError) {
    const errorMessage = typeof sdkError === 'string' ? sdkError : sdkError?.message || 'Unknown error';
    return (
      <div className="p-4 border border-red-500 rounded-lg">
        <p className="text-sm text-red-500">SDK Error: {errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lukas SDK Integration</h3>
        <p className="text-sm text-muted-foreground">
          SDK Status: {isInitialized ? '✓ Initialized' : '✗ Not Initialized'}
        </p>
        <p className="text-sm text-muted-foreground">
          Mode: {isReadOnly() ? 'Read-Only' : 'Read-Write'}
        </p>
      </div>

      {networkInfo && (
        <div>
          <h4 className="text-sm font-medium mb-1">Network Info</h4>
          <div className="text-xs space-y-1">
            <p>Chain ID: {networkInfo.chainId}</p>
            <p>Name: {networkInfo.name}</p>
            {networkInfo.contracts && (
              <div className="mt-2">
                <p className="font-medium">Contracts:</p>
                <p className="truncate">Token: {networkInfo.contracts.lukasToken}</p>
                <p className="truncate">Vault: {networkInfo.contracts.stabilizerVault}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">Loading token data...</p>
      )}

      {tokenInfo && (
        <div>
          <h4 className="text-sm font-medium mb-1">Token Info</h4>
          <div className="text-xs space-y-1">
            <p>Name: {tokenInfo.name}</p>
            <p>Symbol: {tokenInfo.symbol}</p>
            <p>Decimals: {tokenInfo.decimals}</p>
          </div>
        </div>
      )}

      {isConnected && address && balance && (
        <div>
          <h4 className="text-sm font-medium mb-1">Your Balance</h4>
          <div className="text-xs space-y-1">
            <p>Address: {address.slice(0, 6)}...{address.slice(-4)}</p>
            <p>Balance: {balance.formatted} LUKAS</p>
          </div>
        </div>
      )}

      {!isConnected && (
        <p className="text-sm text-muted-foreground">
          Connect your wallet to see your balance
        </p>
      )}
    </div>
  );
}
