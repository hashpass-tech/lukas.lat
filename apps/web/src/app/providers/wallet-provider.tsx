"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { MetamaskIcon, CoinbaseWalletIcon, WalletConnectIcon, AlchemyIcon } from '@/components/ui/connect-wallet-modal';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  // Which wallet type is currently attempting to connect (e.g. 'metamask', 'walletconnect', 'alchemy')
  connectingWalletId: string | null;
  error: string | null;
  walletType: 'traditional' | 'alchemy' | null; // Track which auth type
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

// Load wallet state from localStorage
const loadWalletState = (): WalletState | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('walletState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved wallet state:', error);
        localStorage.removeItem('walletState');
      }
    }
  }
  return null;
};

export function WalletProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or default values
  const [walletState, setWalletState] = useState<WalletState>(() => {
    const savedState = loadWalletState();
    return savedState || {
      address: null,
      isConnected: false,
      isConnecting: false,
      connectingWalletId: null,
      error: null,
      walletType: null,
    };
  });

  // Wrapper for setWalletState that also saves to localStorage
  const updateWalletState = (newState: WalletState | ((prev: WalletState) => WalletState)) => {
    setWalletState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : newState;
      // Save wallet state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletState', JSON.stringify(updatedState));
      }
      return updatedState;
    });
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

  const connectAlchemy = async () => {
    // For Alchemy, we'll trigger the modal from the AlchemyProvider
    // This function signals that Alchemy auth should be initiated
    if (typeof window === 'undefined') {
      throw new Error('Alchemy authentication is only available in the browser');
    }

    // Dispatch a custom event to trigger Alchemy modal
    window.dispatchEvent(new CustomEvent('triggerAlchemyAuth'));

    // Return a promise that will be resolved when Alchemy auth completes
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Alchemy authentication timeout'));
      }, 60000); // 60 second timeout

      const handleAlchemySuccess = (event: CustomEvent) => {
        clearTimeout(timeout);
        const address = event.detail?.address;
        if (address) {
          resolve(address);
        } else {
          reject(new Error('No address returned from Alchemy'));
        }
      };

      const handleAlchemyError = (event: CustomEvent) => {
        clearTimeout(timeout);
        reject(new Error(event.detail?.error || 'Alchemy authentication failed'));
      };

      window.addEventListener('alchemyAuthSuccess', handleAlchemySuccess as EventListener);
      window.addEventListener('alchemyAuthError', handleAlchemyError as EventListener);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('alchemyAuthSuccess', handleAlchemySuccess as EventListener);
        window.removeEventListener('alchemyAuthError', handleAlchemyError as EventListener);
      };
    });
  };

  const connect = async (walletType?: string) => {
    const targetWallet = walletType || 'metamask';
    updateWalletState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      connectingWalletId: targetWallet,
      error: null 
    }));

    try {
      let address: string | null = null;
      let authType: 'traditional' | 'alchemy' = 'traditional';

      switch (targetWallet) {
        case 'metamask':
          address = await connectMetaMask();
          authType = 'traditional';
          break;
        case 'coinbase':
          address = await connectCoinbaseWallet();
          authType = 'traditional';
          break;
        case 'walletconnect':
          address = await connectWalletConnect();
          authType = 'traditional';
          break;
        case 'alchemy':
          address = await connectAlchemy();
          authType = 'alchemy';
          break;
        default:
          // Try MetaMask as default
          address = await connectMetaMask();
          authType = 'traditional';
          break;
      }

      updateWalletState({
        address,
        isConnected: true,
        isConnecting: false,
        connectingWalletId: null,
        error: null,
        walletType: authType,
      });
    } catch (error) {
      updateWalletState({
        address: null,
        isConnected: false,
        isConnecting: false,
        connectingWalletId: null,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        walletType: null,
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
    updateWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      connectingWalletId: null,
      error: null,
      walletType: null,
    });

    // Trigger a custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }
  };

  const availableWallets = [
    {
      id: 'alchemy',
      name: 'Alchemy',
      icon: AlchemyIcon,
      onConnect: () => connect('alchemy'),
    },
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
    if (typeof window === 'undefined') return;

    const checkConnection = async () => {
      try {
        // First, try to load saved state from localStorage
        const savedState = loadWalletState();
        
        if (savedState && savedState.isConnected && savedState.address) {
          // Verify the saved connection is still valid
          if (window.ethereum) {
            const accounts = await window.ethereum?.request({
              method: 'eth_accounts',
            });

            if (accounts.length > 0 && accounts[0] === savedState.address) {
              // Connection is still valid, restore the state
              updateWalletState(savedState);
              return;
            } else {
              // Connection is no longer valid, clear it
              disconnect();
              return;
            }
          } else {
            // No ethereum provider available, clear connection
            disconnect();
            return;
          }
        }

        // If no saved state or invalid connection, check for existing connection
        if (window.ethereum) {
          const accounts = await window.ethereum?.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            updateWalletState({
              address: accounts[0],
              isConnected: true,
              isConnecting: false,
              connectingWalletId: null,
              error: null,
              walletType: 'traditional',
            });
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
        // Clear any potentially invalid saved state
        disconnect();
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        updateWalletState(prev => ({
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
