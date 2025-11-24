"use client";

import { Trans } from "@/components/Trans";
import { DitheringShader } from "@/components/DitheringShader";
import { WalletHeader } from "@/components/WalletHeader";

export function JoinMovementSection() {
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
      <div className="relative group">
        {/* Primary mark card with extended overlay */}
     
        
  
          <WalletHeader connectText="Join now!" />
       
 
      </div>
    </div>
  );
}
