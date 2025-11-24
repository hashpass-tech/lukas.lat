"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { MetamaskIcon, CoinbaseWalletIcon, WalletConnectIcon } from '@/components/ui/connect-wallet-modal';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  availableWallets: Array<{
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    onConnect: () => void;
  }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const connectMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length > 0) {
      return accounts[0];
    } else {
      throw new Error('No accounts found');
    }
  };

  const connectCoinbaseWallet = async () => {
    // Coinbase Wallet connection logic
    if (typeof window === 'undefined') {
      throw new Error('Coinbase Wallet is not available');
    }

    // Check if Coinbase Wallet extension is available
    if ((window as any).coinbaseWalletExtension) {
      const accounts = await (window as any).coinbaseWalletExtension.request({
        method: 'eth_requestAccounts',
      });
      return accounts[0];
    } else {
      throw new Error('Coinbase Wallet extension is not installed');
    }
  };

  const connectWalletConnect = async () => {
    // WalletConnect connection logic (simplified - would need full implementation)
    throw new Error('WalletConnect requires additional setup');
  };

  const connect = async (walletType?: string) => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      let address: string | null = null;

      switch (walletType) {
        case 'metamask':
          address = await connectMetaMask();
          break;
        case 'coinbase':
          address = await connectCoinbaseWallet();
          break;
        case 'walletconnect':
          address = await connectWalletConnect();
          break;
        default:
          // Try MetaMask as default
          address = await connectMetaMask();
          break;
      }

      setWalletState({
        address,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setWalletState({
        address: null,
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      });
    }
  };

  const disconnect = () => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  };

  const availableWallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: MetamaskIcon,
      onConnect: () => connect('metamask'),
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: CoinbaseWalletIcon,
      onConnect: () => connect('coinbase'),
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: WalletConnectIcon,
      onConnect: () => connect('walletconnect'),
    },
  ];

  // Check wallet connection on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum?.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          setWalletState({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }));
      }
    };

    if (window.ethereum?.on && window.ethereum?.removeListener) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return (
    <WalletContext.Provider value={{ ...walletState, connect, disconnect, availableWallets }}>
      {children}
    </WalletContext.Provider>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (accounts: string[]) => void) => void;
      removeListener: (event: string, handler: (accounts: string[]) => void) => void;
    };
    coinbaseWalletExtension?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
