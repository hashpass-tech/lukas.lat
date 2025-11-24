"use client";

import { Trans } from "@/components/Trans";
import { SwapCard } from "@/components/ui/swap-card";

// Mock token icons for the swap card
const EthereumIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="#627EEA"/>
    <path d="M12 4L8 12L12 20L16 12L12 4Z" fill="white"/>
  </svg>
);

const AaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="#B6509E"/>
    <path d="M8 8L12 16L16 8L12 12L8 8Z" fill="white"/>
  </svg>
);

// Mock tokens
const tokens = [
  { symbol: "ETH", name: "Ethereum" as const, icon: EthereumIcon },
  { symbol: "AAVE", name: "Aave" as const, icon: AaveIcon },
];

export function SwapSection() {
  return (
    <div data-no-orbit className="bg-card/90 backdrop-blur-xl rounded-3xl p-10 border border-border shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
        <span className="text-4xl">💱</span> 
        <Trans i18nKey="Swap Tokens" fallback="Swap Tokens" />
      </h2>
      <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-medium">
        <Trans
          i18nKey="swap.description"
          fallback="Trade your tokens instantly with our secure decentralized swap interface."
        />
      </p>
      
      {/* Swap Card */}
      <div className="w-full max-w-md mx-auto">
        <SwapCard
          tokens={tokens}
          initialSellToken={tokens[0]} // ETH
          initialBuyToken={tokens[1]}   // AAVE
          onSwap={(data) => {
            console.log("Swap executed:", data);
          }}
        />
      </div>
    </div>
  );
}
