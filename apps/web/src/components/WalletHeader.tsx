"use client";

import { useState } from 'react';
import { useWallet } from '@/app/providers/wallet-provider';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogTitle,
  DialogHeader 
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Wallet, 
  ArrowRight, 
  Copy, 
  ExternalLink, 
  LogOut,
  ChevronDown,
  Check
} from 'lucide-react';
import { DitheringShader } from '@/components/ui/dithering-shader';

interface WalletHeaderProps {
  connectText?: string;
}

export function WalletHeader({ connectText = "Connect Wallet" }: WalletHeaderProps) {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    availableWallets,
    error 
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
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

  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
    }
  };

  // Reset loading state when modal is closed
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedWallet(null);
    }
    setIsModalOpen(open);
  };

  const walletOptions = availableWallets.filter(wallet => {
    if (wallet.id === 'metamask') {
      return typeof window !== 'undefined' && window.ethereum;
    }
    if (wallet.id === 'walletconnect') {
      return true;
    }
    return false;
  }).map(wallet => ({
    ...wallet,
    disabled: wallet.id === 'metamask' && (!window.ethereum || typeof window.ethereum === 'undefined')
  }));

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative group cursor-pointer">
            {/* Dithering shader background for connected state */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <DitheringShader
                width={140}
                height={32}
                colorBack="#064e3b"
                colorFront="#10b981"
                shape="ripple"
                type="4x4"
                pxSize={2}
                speed={0.3}
                className="w-full h-full"
              />
            </div>
            
            {/* Button content overlay */}
            <div className="relative px-3 py-1.5 flex items-center gap-2 text-white font-medium transition-all duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-sm font-semibold">{formatAddress(address)}</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="bg-card/95 dark:bg-card/95 backdrop-blur-xl border-border shadow-xl rounded-xl"
        >
          <div className="px-3 py-2">
            <div className="text-xs text-muted-foreground mb-1">Connected Wallet</div>
            <div className="text-sm font-mono text-foreground">{formatAddress(address)}</div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer rounded-lg">
            <div className="flex items-center gap-2">
              {copiedAddress ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={openEtherscan} className="cursor-pointer rounded-lg">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>View on Etherscan</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDisconnect} 
            className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer w-full max-w-[280px]">
          {/* Animated background with shader - responsive */}
          <div className="absolute inset-0 opacity-90 rounded-2xl overflow-hidden">
            <DitheringShader
              shape="swirl"
              type="8x8"
              colorBack="#1e293b"
              colorFront="#3b82f6"
              pxSize={1}
              speed={1.2}
              width={280}
              height={40}
              className="w-full h-full"
            />
          </div>
          
          {/* Button content overlay */}
          <div className="relative z-10 px-3 py-2 flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 w-full">
            <Wallet className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
            {isConnecting && selectedWallet ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span className="text-sm truncate">Connecting...</span>
              </>
            ) : (
              <>
                <span className="text-sm truncate">{connectText}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0" />
              </>
            )}
          </div>
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </DialogTrigger>
      
      <DialogContent className="bg-card/95 dark:bg-card/95 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Connect Wallet</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">
              {typeof error === 'string' ? error : (error as any)?.message || 'Connection failed'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => !wallet.disabled && handleWalletConnect(wallet.id)}
              disabled={isConnecting || wallet.disabled}
              className={`group flex items-center justify-between w-full px-4 py-3 text-left rounded-xl border transition-all duration-200 ${
                wallet.disabled 
                  ? 'opacity-50 cursor-not-allowed border-border/50' 
                  : 'border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <wallet.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {wallet.id === 'metamask' && wallet.disabled 
                      ? 'MetaMask not detected' 
                      : wallet.id === 'metamask' 
                      ? 'Popular wallet' 
                      : 'Connect mobile wallets'
                    }
                  </div>
                </div>
              </div>
              {isConnecting && selectedWallet === wallet.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : wallet.disabled ? (
                <div className="h-4 w-4 text-muted-foreground opacity-50">
                  ⚠️
                </div>
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By connecting your wallet, you agree to our{" "}
            <a href="#" className="text-primary hover:text-primary/80 underline transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:text-primary/80 underline transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
