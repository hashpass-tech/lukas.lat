"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { MetamaskIcon, CoinbaseWalletIcon, WalletConnectIcon } from '@/components/ui/connect-wallet-modal';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  // Which wallet type is currently attempting to connect (e.g. 'metamask', 'walletconnect')
  connectingWalletId: string | null;
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
    connectingWalletId: null,
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
    if (typeof window === 'undefined') {
      throw new Error('WalletConnect is only available in the browser');
    }

    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

    // Debug: log the project ID being used (remove after debugging)
    console.log('[WalletConnect] Using projectId:', projectId, 'length:', projectId?.length);

    if (!projectId) {
      throw new Error('WalletConnect project ID is not configured');
    }

    const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

    const provider = await EthereumProvider.init({
      projectId,
      // Use Ethereum mainnet by default; extend this if you add more chains later
      chains: [1],
      showQrModal: true,
      ...(mainnetRpc
        ? { rpcMap: { 1: mainnetRpc } as Record<number, string> }
        : {}),
    });

    const accounts = await provider.enable();

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from WalletConnect');
    }

    return accounts[0] as string;
  };

  const connect = async (walletType?: string) => {
    const targetWallet = walletType || 'metamask';
    setWalletState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      connectingWalletId: targetWallet,
      error: null 
    }));

    try {
      let address: string | null = null;

      switch (targetWallet) {
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
        connectingWalletId: null,
        error: null,
      });
    } catch (error) {
      setWalletState({
        address: null,
        isConnected: false,
        isConnecting: false,
        connectingWalletId: null,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      });
    }
  };

  const disconnect = () => {
    // Clear wallet connection data from storage
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('walletconnected');
      localStorage.removeItem('walletType');
      localStorage.removeItem('walletAddress');
      
      // Clear sessionStorage
      sessionStorage.removeItem('walletconnected');
      sessionStorage.removeItem('walletType');
      sessionStorage.removeItem('walletAddress');
      
      // Clear any wallet-related cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : '';
        if (name.includes('wallet') || name.includes('connected')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    }

    // Reset wallet state
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      connectingWalletId: null,
      error: null,
    });

    // Trigger a custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }
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
            connectingWalletId: null,
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
