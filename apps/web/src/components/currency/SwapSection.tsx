"use client";

import { Trans } from "@/components/Trans";
import { AdvancedSwapCard, AdvancedSwapToken } from "@/components/ui/advanced-swap-card";

// Mock tokens for AdvancedSwapCard – using $LUKAS and common stables
const advancedTokens: AdvancedSwapToken[] = [
  {
    symbol: "LUKAS",
    name: "$LUKAS",
    icon: "🪙",
    balance: "1,000.00",
    price: 1.0,
    change24h: 0.0,
    address: "0x0000000000000000000000000000000000000001",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    balance: "5,000.00",
    price: 1.0,
    change24h: 0.0,
    address: "0x0000000000000000000000000000000000000002",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "💵",
    balance: "5,000.00",
    price: 1.0,
    change24h: 0.0,
    address: "0x0000000000000000000000000000000000000003",
  },
  {
    symbol: "DAI",
    name: "Dai",
    icon: "💰",
    balance: "5,000.00",
    price: 1.0,
    change24h: 0.0,
    address: "0x0000000000000000000000000000000000000004",
  },
];

export function SwapSection() {
  return (
    <div data-no-orbit className="bg-card/90 backdrop-blur-xl rounded-3xl p-10 border border-border shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex flex-col min-h-[420px]">
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
      
      {/* Advanced Swap Card */}
      <div className="w-full max-w-md mx-auto">
        <AdvancedSwapCard
          tokens={advancedTokens}
          initialFromToken={advancedTokens[0]} // LUKAS
          initialToToken={advancedTokens[1]}   // USDC
        />
      </div>
    </div>
  );
}
