"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Network, 
  Shield, 
  Copy, 
  Check, 
  Wallet,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useWallet } from "@/app/providers/wallet-provider";
import { useLukasSDK } from "@/app/providers/lukas-sdk-provider";
import { WEB3_NETWORKS, getNetworkByChainId } from "@/lib/web3-config";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Network icons mapping
const NetworkIcon = ({ chainId, className }: { chainId: number; className?: string }) => {
  const icons: Record<number, string> = {
    1: "⟠",       // Ethereum
    10: "🔴",      // Optimism
    42161: "🔵",   // Arbitrum
    42220: "🟢",   // Celo
    137: "🟣",     // Polygon
    80002: "🟣",   // Polygon Amoy
    11155111: "🔵", // Sepolia
  };
  return <span className={className}>{icons[chainId] || "🌐"}</span>;
};

// Get human-readable chain name
const getChainName = (chainId: number | null): string => {
  if (!chainId) return 'Not Connected';
  
  const chainNames: Record<number, string> = {
    1: 'Ethereum Mainnet',
    10: 'Optimism',
    42161: 'Arbitrum One',
    42220: 'Celo',
    137: 'Polygon',
    80002: 'Polygon Amoy',
    11155111: 'Sepolia',
  };
  
  return chainNames[chainId] || `Chain ${chainId}`;
};

// Contract type with icon
type ContractInfo = {
  name: string;
  address: string;
  icon: string;
};

// Load contracts directly from deployments.json
async function getContractsForChain(chainId: number | null): Promise<ContractInfo[]> {
  if (!chainId) return [];
  
  try {
    // Fetch deployments from public path
    const response = await fetch('/deployments.json');
    if (!response.ok) throw new Error('Failed to fetch deployments');
    
    const deployments = await response.json();
    const network = deployments?.networks?.[chainId.toString()];
    
    if (!network?.contracts?.stable) return [];
    
    const contracts = network.contracts.stable;
    const zero = '0x0000000000000000000000000000000000000000';
    const list: ContractInfo[] = [];
    
    if (contracts.LukasToken?.address && contracts.LukasToken.address !== zero) {
      list.push({ name: 'LUKAS Token', address: contracts.LukasToken.address, icon: '🪙' });
    }
    if (contracts.StabilizerVault?.address && contracts.StabilizerVault.address !== zero) {
      list.push({ name: 'Stabilizer Vault', address: contracts.StabilizerVault.address, icon: '🏦' });
    }
    if (contracts.LatAmBasketIndex?.address && contracts.LatAmBasketIndex.address !== zero) {
      list.push({ name: 'LatAm Index', address: contracts.LatAmBasketIndex.address, icon: '📊' });
    }
    if (contracts.LukasHook?.address && contracts.LukasHook.address !== zero) {
      list.push({ name: 'Lukas Hook', address: contracts.LukasHook.address, icon: '🪝' });
    }
    if (contracts.USDC?.address && contracts.USDC.address !== zero) {
      list.push({ name: 'USDC', address: contracts.USDC.address, icon: '💵' });
    }
    
    return list;
  } catch (e) {
    console.error('Failed to load contracts:', e);
    return [];
  }
}

export function Web3SettingsDialog({ open, onOpenChange }: Props) {
  const { address, chainId, switchNetwork } = useWallet();
  const { networkInfo, isInitialized } = useLukasSDK();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [networkSyncError, setNetworkSyncError] = useState<string | null>(null);
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [loadingEns, setLoadingEns] = useState(false);
  const prevChainIdRef = useRef<number | null>(null);

  // Generate avatar from address (MetaMask style)
  const generateAvatar = (addr: string): string => {
    // Use a simple hash-based color generation similar to MetaMask
    const hash = addr.slice(2).toLowerCase();
    const hue = parseInt(hash.slice(0, 6), 16) % 360;
    const saturation = 70 + (parseInt(hash.slice(6, 12), 16) % 30);
    const lightness = 50 + (parseInt(hash.slice(12, 18), 16) % 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Resolve ENS name for mainnet addresses only (ENS is mainnet-only)
  const resolveEns = useCallback(async (addr: string) => {
    if (!addr || chainId !== 1) {
      setEnsName(null);
      setEnsAvatar(null);
      return;
    }
    
    setLoadingEns(true);
    try {
      // Try multiple ENS resolvers for better reliability
      let ensData = null;
      
      // Try primary resolver
      try {
        const response = await Promise.race<Response>([
          fetch(`https://api.ensideas.com/ens/resolve/${addr}`),
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]);
        if (response.ok) {
          ensData = await response.json();
        }
      } catch (e) {
        console.warn('Primary ENS resolver failed, trying fallback:', e);
      }
      
      // Fallback to ensdata.net resolver
      if (!ensData) {
        try {
          const response = await Promise.race<Response>([
            fetch(`https://ensdata.net/${addr}`),
            new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
          ]);
          if (response.ok) {
            ensData = await response.json();
          }
        } catch (e) {
          console.warn('Fallback ENS resolver failed:', e);
        }
      }
      
      if (ensData?.name) {
        setEnsName(ensData.name);
        setEnsAvatar(ensData.avatar || null);
      } else {
        setEnsName(null);
        setEnsAvatar(null);
      }
    } catch (e) {
      console.error('ENS resolution error:', e);
      setEnsName(null);
      setEnsAvatar(null);
    } finally {
      setLoadingEns(false);
    }
  }, [chainId]);

  // Resolve ENS when address changes (mainnet only)
  useEffect(() => {
    if (address && chainId === 1) {
      resolveEns(address);
    } else {
      setEnsName(null);
      setEnsAvatar(null);
    }
  }, [address, chainId, resolveEns]);

  // Track network changes and clear errors
  useEffect(() => {
    if (chainId !== prevChainIdRef.current) {
      prevChainIdRef.current = chainId;
      setNetworkSyncError(null);
      setSwitchingTo(null);
    }
  }, [chainId]);

  const network = useMemo(() => getNetworkByChainId(chainId), [chainId]);
  
  // Get contracts - try SDK first, then fallback to direct load
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  useEffect(() => {
    const loadContracts = async () => {
      setLoadingContracts(true);
      try {
        // First try SDK
        if (isInitialized && networkInfo?.contracts) {
          const { contracts: c } = networkInfo;
          const zero = '0x0000000000000000000000000000000000000000';
          const list: ContractInfo[] = [];
          
          if (c.lukasToken && c.lukasToken !== zero) list.push({ name: 'LUKAS Token', address: c.lukasToken, icon: '🪙' });
          if (c.stabilizerVault && c.stabilizerVault !== zero) list.push({ name: 'Stabilizer Vault', address: c.stabilizerVault, icon: '🏦' });
          if (c.latAmBasketIndex && c.latAmBasketIndex !== zero) list.push({ name: 'LatAm Index', address: c.latAmBasketIndex, icon: '📊' });
          if (c.lukasHook && c.lukasHook !== zero) list.push({ name: 'Lukas Hook', address: c.lukasHook, icon: '🪝' });
          if (c.usdc && c.usdc !== zero) list.push({ name: 'USDC', address: c.usdc, icon: '💵' });
          
          if (list.length > 0) {
            setContracts(list);
            setLoadingContracts(false);
            return;
          }
        }
        
        // Fallback to direct load from deployments.json
        const loaded = await getContractsForChain(chainId);
        setContracts(loaded);
      } finally {
        setLoadingContracts(false);
      }
    };

    loadContracts();
  }, [isInitialized, networkInfo, chainId]);

  const onCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedAddress(value);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleNetworkSwitch = async (targetChainId: number) => {
    if (targetChainId === chainId || switchingTo) return;
    
    setSwitchingTo(targetChainId);
    setNetworkSyncError(null);
    
    try {
      await switchNetwork(targetChainId);
      // Success - state will update via chainId change
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to switch network';
      setNetworkSyncError(message);
    } finally {
      setSwitchingTo(null);
    }
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  // Display name: ENS name or shortened address
  const displayName = ensName || (address ? shortenAddress(address) : '—');

  const explorerAccountUrl = network?.explorerBaseUrl && address 
    ? `${network.explorerBaseUrl}/address/${address}` 
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-1.5rem)] sm:w-full bg-white dark:bg-slate-900 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 dark:from-emerald-500/5 dark:to-blue-500/5 pointer-events-none" />
          <DialogHeader className="relative">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-white">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 dark:from-emerald-500/30 dark:to-emerald-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Web3 Settings
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Error Alert */}
          <AnimatePresence>
            {networkSyncError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">{networkSyncError}</p>
                  </div>
                  <button 
                    onClick={() => setNetworkSyncError(null)}
                    className="text-red-500 hover:text-red-600 p-0.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connected Account Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800/40 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                {ensAvatar ? (
                  <img 
                    src={ensAvatar} 
                    alt="ENS Avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    onError={() => setEnsAvatar(null)}
                  />
                ) : (
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: address ? generateAvatar(address) : '#94a3b8' }}
                  >
                    {address ? address.slice(2, 4).toUpperCase() : '?'}
                  </div>
                )}
                {address && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                )}
              </div>
              
              {/* Address Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                  {address ? 'Connected' : 'Not Connected'}
                </p>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-sm sm:text-base font-semibold truncate text-slate-900 dark:text-white",
                    ensName ? "" : "font-mono"
                  )}>
                    {loadingEns ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="font-mono">{address ? shortenAddress(address) : '—'}</span>
                      </span>
                    ) : displayName}
                  </p>
                </div>
                {/* Show address below ENS name */}
                {ensName && address && (
                  <p className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 truncate">
                    {shortenAddress(address)}
                  </p>
                )}
              </div>

              {/* Copy Button */}
              {address && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(address)}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg hover:bg-emerald-500/10"
                >
                  {copiedAddress === address ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  )}
                </Button>
              )}
            </div>

            {/* Network Badge & Explorer Link */}
            {address && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/40 flex flex-wrap items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="text-[10px] sm:text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-0"
                >
                  <NetworkIcon chainId={chainId || 0} className="mr-1" />
                  {getChainName(chainId)}
                </Badge>
                {explorerAccountUrl && (
                  <a
                    href={explorerAccountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Network Selection */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Network className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Select Network</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {WEB3_NETWORKS.map((n) => {
                const isActive = n.chainId === chainId;
                const isSwitching = switchingTo === n.chainId;
                
                return (
                  <motion.button
                    key={n.chainId}
                    onClick={() => handleNetworkSwitch(n.chainId)}
                    disabled={!address || isSwitching}
                    whileHover={{ scale: address && !isActive ? 1.01 : 1 }}
                    whileTap={{ scale: address && !isActive ? 0.99 : 1 }}
                    className={cn(
                      "relative flex items-center gap-3 w-full p-3 sm:p-3.5 rounded-xl border transition-all duration-200",
                      isActive 
                        ? "border-emerald-400 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm shadow-emerald-500/10" 
                        : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80",
                      !address && "opacity-50 cursor-not-allowed",
                      isSwitching && "opacity-70"
                    )}
                  >
                    {/* Network Icon */}
                    <div className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl",
                      isActive 
                        ? "bg-emerald-100 dark:bg-emerald-500/20" 
                        : "bg-slate-100 dark:bg-slate-700/50"
                    )}>
                      <NetworkIcon chainId={n.chainId} />
                    </div>

                    {/* Network Info */}
                    <div className="flex-1 text-left">
                      <p className={cn(
                        "text-sm sm:text-base font-medium",
                        isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                      )}>
                        {n.shortName}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                        {n.name}
                      </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {n.nativeCurrencySymbol}
                      </span>
                      {isSwitching ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                      ) : isActive ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : null}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {!address && (
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center py-1">
                Connect wallet to switch networks
              </p>
            )}
          </div>

          {/* Contracts Section */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Protocol Contracts</span>
              </div>
              {contracts.length > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-slate-300 dark:border-slate-600">
                  {contracts.length}
                </Badge>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/30 overflow-hidden">
              {contracts.length > 0 ? (
                <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                    <AnimatePresence>
                      {contracts.map((c, idx) => {
                        const url = network ? `${network.explorerBaseUrl}/address/${c.address}` : undefined;
                        return (
                          <motion.div
                            key={c.address}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                          >
                            <span className="text-base sm:text-lg flex-shrink-0">{c.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate text-slate-900 dark:text-white">{c.name}</p>
                              <p className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                                {shortenAddress(c.address)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onCopy(c.address)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-emerald-500/10 transition-colors"
                              >
                                {copiedAddress === c.address ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                )}
                              </Button>
                              {url && (
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                </a>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 text-center"
                >
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {loadingContracts ? 'Loading contracts...' : chainId ? 'No contracts deployed on this network' : 'Connect wallet to view contracts'}
                  </p>
                </motion.div>
              )}
            </div>

            {/* SDK Status */}
            {contracts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>Network {chainId} • {contracts.length} contracts</span>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
