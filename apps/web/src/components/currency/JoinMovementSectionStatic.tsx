"use client";

import { Trans } from "@/components/Trans";

export function JoinMovementSectionStatic() {
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
      
      {/* Static button that looks like WalletHeader for build */}
      <div className="relative group cursor-pointer w-full max-w-[280px]">
        {/* Animated background with shader - static version */}
        <div className="absolute inset-0 opacity-90 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          {/* Static shader effect */}
          <div className="w-full h-full bg-blue-500/20 animate-pulse" />
        </div>
        
        {/* Button content overlay */}
        <div className="relative z-10 px-3 py-2 flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 w-full">
          <div className="w-4 h-4" /> {/* Placeholder for wallet icon */}
          <span className="text-sm truncate">Join now!</span>
          <div className="w-4 h-4" /> {/* Placeholder for arrow icon */}
        </div>
        
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}
