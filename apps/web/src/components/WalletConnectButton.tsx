"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/app/providers/wallet-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Wallet, ArrowRight } from 'lucide-react';
import { getNetworkColors } from '@/lib/network-colors';

export function WalletConnectButton() {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    availableWallets,
    chainId,
    error 
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [networkColors, setNetworkColors] = useState(getNetworkColors(chainId));
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update network colors when chainId changes - with immediate update
  useEffect(() => {
    const newColors = getNetworkColors(chainId);
    setNetworkColors(newColors);
    console.log('Network colors updated:', { chainId, colors: newColors });
  }, [chainId]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsModalOpen(false);

    try {
      await connect(walletId);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setSelectedWallet(null);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Reset loading state when modal is closed
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      // Reset selected wallet when modal is closed without connecting
      setSelectedWallet(null);
    }
    setIsModalOpen(open);
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div 
          className="flex items-center gap-2 px-4 py-2 border rounded-full transition-all duration-300"
          style={{
            backgroundColor: networkColors.bgLight,
            borderColor: networkColors.borderLight,
            color: networkColors.textLight
          }}
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: networkColors.primary }}
          ></div>
          <span className="text-sm font-medium">
            {formatAddress(address)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  const walletOptions = availableWallets.filter(wallet => {
    if (wallet.id === 'metamask') {
      // Only show MetaMask if it's available
      return typeof window !== 'undefined' && window.ethereum;
    }
    if (wallet.id === 'alchemy' || wallet.id === 'walletconnect' || wallet.id === 'coinbase') {
      // Always show Alchemy, WalletConnect, and Coinbase
      return true;
    }
    return false;
  }).map(wallet => ({
    ...wallet,
    disabled: wallet.id === 'metamask' && (!window.ethereum || typeof window.ethereum === 'undefined')
  }));

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
      <DialogTrigger asChild>
        <button 
          key={`wallet-btn-${chainId}`}
          className="relative group w-full px-6 py-3 text-white font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 overflow-hidden"
          style={{
            backgroundColor: networkColors.primary,
          }}
        >
          {/* Animated shimmer background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer opacity-60" />
          
          {/* Glassmorphic base */}
          <div 
            className="absolute inset-0 backdrop-blur-md border"
            style={{
              backgroundColor: `${networkColors.primary}dd`,
              borderColor: networkColors.primaryLight
            }}
          />
          
          {/* Button content */}
          <Wallet className="w-4 h-4 relative z-10" />
          {isConnecting && selectedWallet ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
              <span className="relative z-10">
                Connecting to {selectedWallet === 'metamask' ? 'MetaMask' : selectedWallet === 'alchemy' ? 'Alchemy' : selectedWallet === 'coinbase' ? 'Coinbase' : 'WalletConnect'}...
              </span>
            </>
          ) : (
            <>
              <span className="relative z-10">Connect Wallet</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-md mx-4 border border-border shadow-2xl">
        {/* Visually hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          Connect Wallet
        </DialogTitle>
        
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl">🔗</span>
            Connect Wallet
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">
              {typeof error === 'string' ? error : (error as any)?.message || 'Connection failed'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => !wallet.disabled && handleWalletConnect(wallet.id)}
              disabled={isConnecting || wallet.disabled}
              className={`group flex items-center justify-between w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-foreground font-medium rounded-xl sm:rounded-2xl border border-border bg-background/20 hover:bg-background/30 backdrop-blur-md transition-all duration-300 ${
                wallet.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <wallet.icon className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm sm:text-base lg:text-lg">{wallet.name}</div>
                  <div className="text-xs sm:text-xs lg:text-sm text-muted-foreground">
                    {wallet.id === 'metamask' && wallet.disabled 
                      ? 'MetaMask not detected - install extension' 
                      : wallet.id === 'alchemy'
                      ? 'Email & Passkey Login'
                      : wallet.id === 'metamask' 
                      ? 'Most popular wallet' 
                      : wallet.id === 'coinbase'
                      ? 'Coinbase Smart Wallet'
                      : 'Connect mobile wallets'
                    }
                  </div>
                </div>
              </div>
              {isConnecting && selectedWallet === wallet.id ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
              ) : wallet.disabled ? (
                <div className="h-5 w-5 text-muted-foreground opacity-50">
                  ⚠️
                </div>
              ) : (
                 <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By connecting your wallet, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:text-primary/80 underline transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:text-primary/80 underline transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);
