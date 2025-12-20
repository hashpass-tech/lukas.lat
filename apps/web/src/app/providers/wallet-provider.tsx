"use client";

import { ReactNode, createContext, useContext, useState, useEffect, useRef } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { MetamaskIcon, CoinbaseWalletIcon, WalletConnectIcon, AlchemyIcon } from '@/components/ui/connect-wallet-modal';
import { formatChainIdHex } from '@/lib/web3-config';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  // Which wallet type is currently attempting to connect (e.g. 'metamask', 'walletconnect', 'alchemy')
  connectingWalletId: string | null;
  error: string | null;
  walletType: 'traditional' | 'alchemy' | null; // Track which auth type
  connectedWalletId: string | null;
  chainId: number | null;
}

interface WalletContextType extends WalletState {
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
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
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    connectingWalletId: null,
    error: null,
    walletType: null,
    connectedWalletId: null,
    chainId: null,
  });

  const providerRef = useRef<any>(null);

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

    if (!projectId) {
      throw new Error('WalletConnect project ID is not configured');
    }

    const amoyRpc = process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
    const sepoliaRpc = 'https://rpc.sepolia.org';
    const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com';

    const rpcMap: Record<number, string> = {
      80002: amoyRpc,
      11155111: sepoliaRpc,
      1: mainnetRpc,
    };

    try {
      // Disconnect any existing session first
      if (providerRef.current?.disconnect) {
        try {
          await providerRef.current.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }

      const provider = await EthereumProvider.init({
        projectId,
        // Use Amoy as the primary chain (default), with Sepolia and mainnet available
        chains: [80002],
        optionalChains: [11155111, 1],
        showQrModal: true,
        rpcMap,
        // Mobile-friendly options
        metadata: {
          name: 'Lukas Protocol',
          description: 'LatAm Basket Stablecoin',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://lukas.lat',
          icons: ['https://lukas.lat/logo.png'],
        },
      });

      providerRef.current = provider;

      // Set up event listeners BEFORE enabling
      const setupProviderListeners = () => {
        provider.on('chainChanged', (chainIdHex: string | number) => {
          const nextChainId = typeof chainIdHex === 'string' 
            ? parseInt(chainIdHex, 16) 
            : typeof chainIdHex === 'number' 
              ? chainIdHex 
              : null;
          console.log('WalletConnect chainChanged event:', chainIdHex, '->', nextChainId);
          updateWalletState(prev => ({
            ...prev,
            chainId: nextChainId,
          }));
        });

        provider.on('accountsChanged', (accounts: string[]) => {
          console.log('WalletConnect accountsChanged event:', accounts);
          if (accounts.length === 0) {
            disconnect();
          } else {
            updateWalletState(prev => ({
              ...prev,
              address: accounts[0],
              isConnected: true,
            }));
          }
        });

        provider.on('disconnect', () => {
          console.log('WalletConnect disconnect event');
          disconnect();
        });

        // Additional events for mobile reliability
        provider.on('session_event', (event: any) => {
          console.log('WalletConnect session_event:', event);
          if (event?.params?.event?.name === 'chainChanged') {
            const chainId = event?.params?.event?.data;
            if (chainId) {
              updateWalletState(prev => ({
                ...prev,
                chainId: typeof chainId === 'number' ? chainId : parseInt(chainId, 16),
              }));
            }
          }
        });

        provider.on('session_update', (event: any) => {
          console.log('WalletConnect session_update:', event);
          // Re-read chain ID on session update
          readChainId().then(chainId => {
            if (chainId) {
              updateWalletState(prev => ({
                ...prev,
                chainId,
              }));
            }
          });
        });
      };

      setupProviderListeners();

      const accounts = await provider.enable();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from WalletConnect');
      }

      return accounts[0] as string;
    } catch (error: any) {
      // Handle user rejection or connection cancellation
      if (error?.message?.includes('User rejected') || 
          error?.message?.includes('User closed') ||
          error?.message?.includes('Connection request reset') ||
          error?.code === 4001) {
        throw new Error('Connection cancelled');
      }
      // Re-throw other errors
      throw error;
    }
  };

  const readChainId = async () => {
    try {
      const provider = providerRef.current ?? window.ethereum;
      if (!provider?.request) return null;
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      if (typeof chainIdHex !== 'string') return null;
      return parseInt(chainIdHex, 16);
    } catch {
      return null;
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    const provider = providerRef.current ?? (typeof window !== 'undefined' ? window.ethereum : null);
    if (!provider?.request) {
      throw new Error('No wallet provider available');
    }

    const isWalletConnect = providerRef.current && providerRef.current !== window.ethereum;
    console.log(`Switching network to ${targetChainId}, isWalletConnect: ${isWalletConnect}`);

    try {
      // First, try to switch the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: formatChainIdHex(targetChainId) }],
      });
    } catch (error: any) {
      console.log('Switch network error:', error);
      
      // Handle user rejection
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        throw new Error('Network switch cancelled by user');
      }
      // Handle chain not added to wallet - try to add it
      if (error?.code === 4902 || error?.message?.includes('Unrecognized chain') || error?.message?.includes('wallet_addEthereumChain')) {
        // Try to add the network
        try {
          const networkParams = getNetworkParams(targetChainId);
          if (networkParams) {
            console.log('Adding network:', networkParams);
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams],
            });
          } else {
            throw new Error('Network not configured in wallet. Please add it manually.');
          }
        } catch (addError: any) {
          console.log('Add network error:', addError);
          if (addError?.code === 4001) {
            throw new Error('Network add cancelled by user');
          }
          throw new Error('Failed to add network. Please add it manually.');
        }
      } else {
        throw error;
      }
    }

    // Wait for the chain to actually switch (WalletConnect/mobile needs more time)
    const waitTime = isWalletConnect ? 3000 : 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Verify the switch was successful by reading the chain ID multiple times
    let verifiedChainId: number | null = null;
    let attempts = 0;
    const maxAttempts = isWalletConnect ? 10 : 5;
    const retryDelay = isWalletConnect ? 800 : 500;

    while (attempts < maxAttempts) {
      verifiedChainId = await readChainId();
      console.log(`Chain verification attempt ${attempts + 1}/${maxAttempts}: got ${verifiedChainId}, expected ${targetChainId}`);
      
      if (verifiedChainId === targetChainId) {
        break;
      }
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // Update state with verified chain ID
    if (verifiedChainId === targetChainId) {
      console.log(`Network switch verified: ${targetChainId}`);
      updateWalletState(prev => ({
        ...prev,
        chainId: verifiedChainId,
      }));
    } else {
      // For WalletConnect/mobile, the chain might have switched but we couldn't verify
      // This is common on mobile where events are delayed
      if (isWalletConnect) {
        console.warn(`WalletConnect: Could not verify chain switch. Expected ${targetChainId}, got ${verifiedChainId}. Will poll for update.`);
        
        // Update to target chain optimistically
        updateWalletState(prev => ({
          ...prev,
          chainId: targetChainId,
        }));
        
        // Start polling to verify the actual chain
        let pollAttempts = 0;
        const maxPollAttempts = 5;
        const pollInterval = setInterval(async () => {
          pollAttempts++;
          const currentChainId = await readChainId();
          console.log(`Poll attempt ${pollAttempts}: chainId = ${currentChainId}`);
          
          if (currentChainId) {
            updateWalletState(prev => ({
              ...prev,
              chainId: currentChainId,
            }));
            
            if (currentChainId === targetChainId || pollAttempts >= maxPollAttempts) {
              clearInterval(pollInterval);
            }
          }
          
          if (pollAttempts >= maxPollAttempts) {
            clearInterval(pollInterval);
          }
        }, 2000);
      } else {
        throw new Error(`Network switch failed. Expected chain ${targetChainId}, got ${verifiedChainId}`);
      }
    }
  };

  // Get network parameters for adding to wallet
  const getNetworkParams = (chainId: number) => {
    const networks: Record<number, any> = {
      80002: {
        chainId: formatChainIdHex(80002),
        chainName: 'Polygon Amoy Testnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://rpc-amoy.polygon.technology'],
        blockExplorerUrls: ['https://amoy.polygonscan.com'],
      },
      11155111: {
        chainId: formatChainIdHex(11155111),
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      1: {
        chainId: formatChainIdHex(1),
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://eth.llamarpc.com'],
        blockExplorerUrls: ['https://etherscan.io'],
      },
    };
    return networks[chainId] || null;
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

  // Supported networks with contracts deployed
  const SUPPORTED_NETWORKS = [80002, 11155111]; // Polygon Amoy, Sepolia
  const DEFAULT_NETWORK = 80002; // Polygon Amoy as default

  // Try to switch to default network (Amoy) if on unsupported network
  const ensureSupportedNetwork = async (currentChainId: number | null) => {
    if (!currentChainId || SUPPORTED_NETWORKS.includes(currentChainId)) {
      return currentChainId;
    }

    // On unsupported network, try to switch to Amoy
    try {
      console.log(`Connected to unsupported network ${currentChainId}, switching to Polygon Amoy...`);
      await switchNetwork(DEFAULT_NETWORK);
      return DEFAULT_NETWORK;
    } catch (error) {
      console.warn('Failed to auto-switch to Polygon Amoy:', error);
      // Return current chain even if switch failed - user can manually switch
      return currentChainId;
    }
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

      providerRef.current = null;

      switch (targetWallet) {
        case 'metamask':
          address = await connectMetaMask();
          authType = 'traditional';
          providerRef.current = typeof window !== 'undefined' ? window.ethereum : null;
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

      let chainId = await readChainId();
      
      // Auto-switch to supported network if needed
      chainId = await ensureSupportedNetwork(chainId);

      updateWalletState({
        address,
        isConnected: true,
        isConnecting: false,
        connectingWalletId: null,
        error: null,
        walletType: authType,
        connectedWalletId: targetWallet,
        chainId,
      });
    } catch (error) {
      updateWalletState({
        address: null,
        isConnected: false,
        isConnecting: false,
        connectingWalletId: null,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        walletType: null,
        connectedWalletId: null,
        chainId: null,
      });
    }
  };

  const disconnect = () => {
    // Clear wallet connection data from storage
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('walletState');
      localStorage.removeItem('walletconnected');
      localStorage.removeItem('walletType');
      localStorage.removeItem('walletAddress');
      
      // Clear sessionStorage
      sessionStorage.removeItem('walletState');
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
      connectedWalletId: null,
      chainId: null,
    });

    try {
      if (providerRef.current?.disconnect) {
        providerRef.current.disconnect();
      }
    } catch {
      // noop
    }

    providerRef.current = null;

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

  // Check wallet connection on mount and set up event listeners
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
              providerRef.current = window.ethereum;
              const chainId = await readChainId();
              updateWalletState({
                ...savedState,
                connectedWalletId: savedState.connectedWalletId ?? 'metamask',
                chainId,
              });
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
              connectedWalletId: 'metamask',
              chainId: await readChainId(),
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

    const handleChainChanged = (chainIdHex: string) => {
      const nextChainId = typeof chainIdHex === 'string' ? parseInt(chainIdHex, 16) : null;
      console.log('Chain changed event:', chainIdHex, '->', nextChainId);
      updateWalletState(prev => ({
        ...prev,
        chainId: nextChainId,
      }));
    };

    // Set up listeners for window.ethereum (MetaMask, etc.)
    if (window.ethereum && typeof window.ethereum.on === 'function') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum && typeof window.ethereum.removeListener === 'function') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Separate effect to handle WalletConnect provider reconnection and session events
  useEffect(() => {
    const provider = providerRef.current;
    if (!provider || provider === window.ethereum) return;

    // Poll for chain ID changes as a fallback for mobile
    // This helps when events don't fire properly
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (walletState.isConnected && walletState.connectedWalletId === 'walletconnect') {
      pollInterval = setInterval(async () => {
        try {
          const currentChainId = await readChainId();
          if (currentChainId && currentChainId !== walletState.chainId) {
            console.log('Poll detected chain change:', walletState.chainId, '->', currentChainId);
            updateWalletState(prev => ({
              ...prev,
              chainId: currentChainId,
            }));
          }
        } catch (error) {
          // Ignore polling errors
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [walletState.isConnected, walletState.connectedWalletId, walletState.chainId]);

  return (
    <WalletContext.Provider value={{ ...walletState, connect, disconnect, switchNetwork, availableWallets }}>
      {children}
    </WalletContext.Provider>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
    coinbaseWalletExtension?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
