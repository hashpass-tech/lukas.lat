/**
 * React integration example for the Lukas SDK
 * 
 * This example demonstrates:
 * - Setting up SDK context provider
 * - Using SDK in React components
 * - Handling wallet connections
 * - Managing network changes
 * - Real-time data updates
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LukasSDK, NetworkInfo, LukasSDKError } from '../src/index';
import { BrowserProvider } from 'ethers';

// ===== SDK Context =====

interface LukasSDKContextValue {
  sdk: LukasSDK | null;
  isConnected: boolean;
  network: NetworkInfo | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const LukasSDKContext = createContext<LukasSDKContextValue | undefined>(undefined);

// ===== SDK Provider Component =====

interface LukasSDKProviderProps {
  children: React.ReactNode;
  defaultNetwork?: {
    chainId: number;
    name: string;
  };
}

export function LukasSDKProvider({ 
  children, 
  defaultNetwork = { chainId: 80002, name: 'amoy' } 
}: LukasSDKProviderProps) {
  const [sdk, setSdk] = useState<LukasSDK | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    try {
      const lukasSDK = new LukasSDK({
        network: defaultNetwork,
        options: {
          enableCaching: true,
          logLevel: 'info',
        },
      });

      setSdk(lukasSDK);
      setNetwork(lukasSDK.getNetworkInfo());
      setIsConnected(!lukasSDK.isReadOnly());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
    }
  }, [defaultNetwork.chainId, defaultNetwork.name]);

  // Monitor network changes
  useEffect(() => {
    if (!sdk) return;

    const unsubscribe = sdk.onNetworkChange((networkInfo) => {
      setNetwork(networkInfo);
    });

    sdk.startNetworkMonitoring();

    return () => {
      unsubscribe();
      sdk.stopNetworkMonitoring();
    };
  }, [sdk]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!sdk) {
      setError('SDK not initialized');
      return;
    }

    try {
      setError(null);
      
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and connect
      const provider = new BrowserProvider(window.ethereum);
      await sdk.connect(provider);

      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Connection error:', err);
    }
  }, [sdk]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    if (!sdk) return;

    sdk.disconnect();
    setIsConnected(false);
  }, [sdk]);

  const value: LukasSDKContextValue = {
    sdk,
    isConnected,
    network,
    connect,
    disconnect,
    error,
  };

  return (
    <LukasSDKContext.Provider value={value}>
      {children}
    </LukasSDKContext.Provider>
  );
}

// ===== Custom Hook =====

export function useLukasSDK() {
  const context = useContext(LukasSDKContext);
  if (context === undefined) {
    throw new Error('useLukasSDK must be used within a LukasSDKProvider');
  }
  return context;
}

// ===== Example Components =====

// Network Display Component
export function NetworkDisplay() {
  const { network, sdk } = useLukasSDK();

  if (!network) {
    return <div>Loading network...</div>;
  }

  return (
    <div className="network-display">
      <h3>Network Information</h3>
      <p>Name: {network.name}</p>
      <p>Chain ID: {network.chainId}</p>
      <p>Type: {sdk?.getCurrentNetworkType()}</p>
      <p>Testnet: {sdk?.isTestnet() ? 'Yes' : 'No'}</p>
    </div>
  );
}

// Wallet Connection Component
export function WalletConnection() {
  const { isConnected, connect, disconnect, error } = useLukasSDK();

  return (
    <div className="wallet-connection">
      <h3>Wallet</h3>
      {error && <p className="error">{error}</p>}
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}

// Token Balance Component
export function TokenBalance({ address }: { address: string }) {
  const { sdk } = useLukasSDK();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!sdk || !address) return;

    setLoading(true);
    setError(null);

    try {
      const contractManager = sdk.getContractManager();
      const balanceValue = await contractManager.getBalance(address);
      setBalance(balanceValue.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [sdk, address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className="token-balance">
      <h3>Token Balance</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {balance && <p>Balance: {balance}</p>}
      <button onClick={fetchBalance} disabled={loading}>
        Refresh
      </button>
    </div>
  );
}

// Token Info Component
export function TokenInfo() {
  const { sdk } = useLukasSDK();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sdk) return;

    async function fetchTokenInfo() {
      try {
        const contractManager = sdk.getContractManager();
        const info = await contractManager.getTokenInfo();
        setTokenInfo(info);
      } catch (error) {
        console.error('Failed to fetch token info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTokenInfo();
  }, [sdk]);

  if (loading) return <div>Loading token info...</div>;
  if (!tokenInfo) return <div>Failed to load token info</div>;

  return (
    <div className="token-info">
      <h3>Token Information</h3>
      <p>Name: {tokenInfo.name}</p>
      <p>Symbol: {tokenInfo.symbol}</p>
      <p>Decimals: {tokenInfo.decimals}</p>
      <p>Total Supply: {tokenInfo.totalSupply.toString()}</p>
    </div>
  );
}

// Oracle Price Component
export function OraclePrice() {
  const { sdk } = useLukasSDK();
  const [fairPrice, setFairPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrice = useCallback(async () => {
    if (!sdk) return;

    setLoading(true);
    try {
      const contractManager = sdk.getContractManager();
      const price = await contractManager.getFairPrice();
      setFairPrice(price.toString());
    } catch (error) {
      console.error('Failed to fetch price:', error);
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  useEffect(() => {
    fetchPrice();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return (
    <div className="oracle-price">
      <h3>Fair Price</h3>
      {loading && <p>Loading...</p>}
      {fairPrice && <p>Price: ${fairPrice}</p>}
      <button onClick={fetchPrice} disabled={loading}>
        Refresh
      </button>
    </div>
  );
}

// Transfer Component
export function TransferTokens() {
  const { sdk, isConnected } = useLukasSDK();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sdk || !isConnected) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const contractManager = sdk.getContractManager();
      const { parseUnits } = await import('ethers');
      const amountWei = parseUnits(amount, 18);

      const tx = await contractManager.transfer(recipient, amountWei);
      await tx.wait();

      setSuccess(true);
      setRecipient('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-tokens">
      <h3>Transfer Tokens</h3>
      {!isConnected && <p className="warning">Please connect your wallet</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Transfer successful!</p>}
      
      <form onSubmit={handleTransfer}>
        <input
          type="text"
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={!isConnected || loading}
        />
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!isConnected || loading}
        />
        <button type="submit" disabled={!isConnected || loading}>
          {loading ? 'Transferring...' : 'Transfer'}
        </button>
      </form>
    </div>
  );
}

// ===== Main App Example =====

export function App() {
  return (
    <LukasSDKProvider>
      <div className="app">
        <h1>Lukas SDK React Example</h1>
        
        <div className="grid">
          <WalletConnection />
          <NetworkDisplay />
          <TokenInfo />
          <OraclePrice />
          <TokenBalance address="0x1234567890123456789012345678901234567890" />
          <TransferTokens />
        </div>
      </div>
    </LukasSDKProvider>
  );
}

// ===== Usage Instructions =====

/*
To use this in your React app:

1. Install dependencies:
   npm install @lukas/sdk ethers react

2. Wrap your app with the provider:
   import { LukasSDKProvider } from './path/to/react-integration';
   
   function Root() {
     return (
       <LukasSDKProvider>
         <App />
       </LukasSDKProvider>
     );
   }

3. Use the hook in your components:
   import { useLukasSDK } from './path/to/react-integration';
   
   function MyComponent() {
     const { sdk, isConnected, connect } = useLukasSDK();
     
     // Use SDK methods
     const handleClick = async () => {
       if (!isConnected) {
         await connect();
       }
       
       const contractManager = sdk.getContractManager();
       const balance = await contractManager.getBalance(address);
     };
     
     return <button onClick={handleClick}>Get Balance</button>;
   }

4. Add TypeScript declarations for window.ethereum:
   declare global {
     interface Window {
       ethereum?: any;
     }
   }
*/
