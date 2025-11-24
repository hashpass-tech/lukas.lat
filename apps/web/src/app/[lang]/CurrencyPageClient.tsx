"use client";

import LukasGravityCenter from "@/components/LukasGravityCenter";
import LukasHeroAnimation from "@/components/LukasHeroAnimation";
import CyberneticGridShader from "@/components/CyberneticGridShader";
import OrbitingSkills from "@/components/OrbitingSkills";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useEffect, useState } from "react";
import { DonutChartSection, CurrencyModal, JoinMovementSectionStatic } from "@/components/currency";
import { SwapSection } from "@/components/currency/SwapSection";

type Currency = {
  country: string;
  code: string;
  name: string;
  weight: number;
  color: string;
};

const currencies: Currency[] = [
  { country: "🇧🇷", code: "BRL", name: "currency.brazilian_real", weight: 40, color: "from-emerald-400/80 to-green-700/80" },
  { country: "🇲🇽", code: "MXN", name: "currency.mexican_peso", weight: 30, color: "from-rose-400/80 to-red-700/80" },
  { country: "🇨🇴", code: "COP", name: "currency.colombian_peso", weight: 15, color: "from-amber-300/80 to-yellow-600/80" },
  { country: "🇨🇱", code: "CLP", name: "currency.chilean_peso", weight: 10, color: "from-sky-300/80 to-blue-700/80" },
  { country: "🇦🇷", code: "ARS", name: "currency.argentine_peso", weight: 5, color: "from-cyan-300/80 to-sky-600/80" },
];

function CurrencyPageContent() {
  const [activeCurrency, setActiveCurrency] = useState<Currency | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle wallet connection state
  useEffect(() => {
    setMounted(true);
    
    // Check wallet connection only on client side
    const checkWalletConnection = () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
            setIsConnected(accounts.length > 0);
          }).catch(() => {
            setIsConnected(false);
          });
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setIsConnected(accounts.length > 0);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  // Reset donut chart animation on scroll
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Set a new timeout to reset animation after scroll stops
      scrollTimeout = setTimeout(() => {
        setAnimationKey(prev => prev + 1);
      }, 150); // Reset after 150ms of no scroll
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
      <>
        <section id="hero" className="relative min-h-screen">
          <LukasGravityCenter /> 
          <LukasHeroAnimation /> 
          <div className="absolute inset-0 pointer-events-none">
            <OrbitingSkills />
          </div>
        </section>

        <section id="content" className="relative overflow-hidden bg-slate-950">
          <CyberneticGridShader />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-slate-950/80 z-0" />
          <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 relative overflow-x-hidden z-10">
          <div className="z-10 max-w-4xl w-full items-center justify-center font-mono text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mx-auto">
              <DonutChartSection
                currencies={currencies}
                selectedCurrency={selectedCurrency}
                hoveredSegment={hoveredSegment}
                animationKey={animationKey}
                onSegmentHover={(segment) => setHoveredSegment(segment?.label || null)}
                onCurrencySelect={setSelectedCurrency}
                onActiveCurrency={setActiveCurrency}
              />
              
              {mounted && isConnected ? <SwapSection /> : <JoinMovementSectionStatic />}
            </div>
          </div>
          </main>
        </section>

        {activeCurrency && (
          <CurrencyModal
            currency={activeCurrency}
            onClose={() => setActiveCurrency(null)}
            currencies={currencies}
          />
        )}

        <PWAInstallPrompt />
      </>
  );
}

export default function CurrencyPageClient() {
  return (
      <CurrencyPageContent />
  );
}
