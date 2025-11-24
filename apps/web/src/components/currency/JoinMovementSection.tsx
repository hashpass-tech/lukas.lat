"use client";

import { Trans } from "@/components/Trans";
import { DitheringShader } from "@/components/DitheringShader";
import { WalletHeader } from "@/components/WalletHeader";
import { useState, useEffect } from "react";

export function JoinMovementSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a static version during SSR
    return (
      <div data-no-orbit className="bg-card/90 backdrop-blur-xl rounded-3xl p-10 border border-border shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
          <span className="text-4xl">🚀</span> 
          <Trans i18nKey="Join the Movement" fallback="Join the Movement" />
        </h2>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-medium">
          <Trans
            i18nKey="intro.description"
            fallback="$LUKAS is the first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset."
          />
        </p>
        
        {/* Static button for SSR */}
        <div className="relative group cursor-pointer w-full max-w-[280px]">
          <div className="absolute inset-0 opacity-90 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="w-full h-full bg-blue-500/20 animate-pulse" />
          </div>
          <div className="relative z-10 px-3 py-2 flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 w-full">
            <span className="text-sm truncate">Join now!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-no-orbit className="bg-card/90 backdrop-blur-xl rounded-3xl p-10 border border-border shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center">
      <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
        <span className="text-4xl">🚀</span> 
        <Trans i18nKey="Join the Movement" fallback="Join the Movement" />
      </h2>
      <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-medium">
        <Trans
          i18nKey="intro.description"
          fallback="$LUKAS is the first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset."
        />
      </p>
      
      {/* Enhanced Wallet Connect Button - Using WalletHeader for functionality */}
      <div className="relative">
        <WalletHeader connectText="Join now!" />
      </div>
    </div>
  );
}
