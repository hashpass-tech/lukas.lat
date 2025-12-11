"use client";

import { Trans } from "@/components/Trans";
import { DitheringShader } from "@/components/DitheringShader";
import { WalletHeader } from "@/components/WalletHeader";
import { useState, useEffect, useRef } from "react";

export function JoinMovementSection() {
  const [isClient, setIsClient] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced 3D mouse tracking effect with more dynamic movement
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Enhanced rotation with more dynamic movement
      const rotateY = (x - centerX) / centerX * 15; // Increased from 10 to 15
      const rotateX = (y - centerY) / centerY * -15; // Increased from 10 to 15
      
      // Add subtle scale effect based on mouse position
      const scale = 1 + (Math.abs(rotateX) + Math.abs(rotateY)) * 0.01;

      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
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
            <span className="text-sm truncate">Connect Wallet</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className="relative bg-card/95 backdrop-blur-xl border border-border shadow-2xl hover:shadow-3xl rounded-3xl p-10 flex flex-col justify-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out'
      }}
    >
      {/* Enhanced dynamic glare effect */}
      <div 
        className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-opacity duration-200 pointer-events-none"
        style={{
          background: `radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.3) 0%, transparent 40%)`
        }}
      />
      
      {/* Enhanced animated background movement effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/15 to-destructive/15 animate-pulse" />
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: 'linear-gradient(45deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--accent) / 0.15) 25%, hsl(var(--destructive) / 0.15) 50%, hsl(var(--success) / 0.15) 75%, hsl(var(--primary) / 0.15) 100%)',
            animation: 'gradient-shift 6s ease infinite',
            backgroundSize: '300% 300%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-spin-slow" />
        {/* Additional floating particles effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-pink-400/40 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        </div>
      </div>
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
        <WalletHeader connectText="Connect Wallet" />
      </div>
    </div>
  );
}
