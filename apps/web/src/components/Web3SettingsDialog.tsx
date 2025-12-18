"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Network, Shield, Copy, Check } from "lucide-react";
import { useWallet } from "@/app/providers/wallet-provider";
import { useLukasSDK } from "@/app/providers/lukas-sdk-provider";
import { WEB3_NETWORKS, getNetworkByChainId } from "@/lib/web3-config";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function Web3SettingsDialog({ open, onOpenChange }: Props) {
  const { address, chainId, switchNetwork } = useWallet();
  const { networkInfo, isInitialized } = useLukasSDK();
  const [copyOk, setCopyOk] = useState(false);

  const network = useMemo(() => getNetworkByChainId(chainId), [chainId]);
  
  // Get contracts from SDK network info
  const contracts = useMemo(() => {
    if (!isInitialized || !networkInfo?.contracts) {
      return [];
    }
    
    const contractsList = [];
    const { contracts: sdkContracts } = networkInfo;
    
    if (sdkContracts.lukasToken && sdkContracts.lukasToken !== '0x0000000000000000000000000000000000000000') {
      contractsList.push({ name: 'LukasToken', address: sdkContracts.lukasToken });
    }
    if (sdkContracts.stabilizerVault && sdkContracts.stabilizerVault !== '0x0000000000000000000000000000000000000000') {
      contractsList.push({ name: 'StabilizerVault', address: sdkContracts.stabilizerVault });
    }
    if (sdkContracts.latAmBasketIndex && sdkContracts.latAmBasketIndex !== '0x0000000000000000000000000000000000000000') {
      contractsList.push({ name: 'LatAmBasketIndex', address: sdkContracts.latAmBasketIndex });
    }
    if (sdkContracts.lukasHook && sdkContracts.lukasHook !== '0x0000000000000000000000000000000000000000') {
      contractsList.push({ name: 'LukasHook', address: sdkContracts.lukasHook });
    }
    if (sdkContracts.usdc && sdkContracts.usdc !== '0x0000000000000000000000000000000000000000') {
      contractsList.push({ name: 'USDC', address: sdkContracts.usdc });
    }
    
    return contractsList;
  }, [isInitialized, networkInfo]);

  const onCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyOk(true);
    window.setTimeout(() => setCopyOk(false), 1500);
  };

  const explorerAccountUrl = network?.explorerBaseUrl && address ? `${network.explorerBaseUrl}/address/${address}` : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] sm:w-full bg-card/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Network className="w-5 h-5" />
            Web3 Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-background/30 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Connected address</div>
                <div className="mt-1 font-mono text-sm text-foreground break-all">{address ?? "Not connected"}</div>
              </div>
              {address && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(address)}
                  className="shrink-0"
                >
                  {copyOk ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Network: {network?.shortName ?? (chainId ? `Chain ${chainId}` : "Unknown")}
              </Badge>
              {explorerAccountUrl && (
                <a
                  href={explorerAccountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline"
                >
                  View on Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-4 h-4" />
              <div className="font-medium">Network</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WEB3_NETWORKS.map((n) => (
                <Button
                  key={n.chainId}
                  type="button"
                  variant={n.chainId === chainId ? "default" : "outline"}
                  onClick={() => switchNetwork(n.chainId)}
                  disabled={!address}
                  className="justify-between"
                >
                  <span>{n.shortName}</span>
                  <span className="text-xs opacity-80">{n.nativeCurrencySymbol}</span>
                </Button>
              ))}
            </div>

            {!address && <div className="mt-2 text-xs text-muted-foreground">Connect a wallet to switch networks.</div>}
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" />
              <div className="font-medium">Verified contracts</div>
            </div>

            {!isInitialized ? (
              <div className="text-xs text-muted-foreground">Loading SDK contracts...</div>
            ) : chainId ? (
              contracts.length > 0 ? (
                <div className="space-y-2">
                  {contracts.map((c) => {
                    const url = network ? `${network.explorerBaseUrl}/address/${c.address}` : undefined;
                    return (
                      <div key={c.address} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs font-mono text-muted-foreground break-all">{c.address}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button type="button" variant="outline" size="sm" onClick={() => onCopy(c.address)}>
                            {copyOk ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          {url && (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border/60 hover:bg-accent hover:text-accent-foreground transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Lukas SDK - Contracts loaded from network {networkInfo?.chainId}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No contracts deployed on this network yet.</div>
              )
            ) : (
              <div className="text-xs text-muted-foreground">Connect wallet to view contracts.</div>
            )}
          </div>

          {/* Legal links removed from this dialog per design - keep modal focused on wallet/network settings */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
