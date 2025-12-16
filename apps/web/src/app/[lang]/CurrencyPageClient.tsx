"use client";

import LukasGravityCenter from "@/components/LukasGravityCenter";
import LukasHeroAnimation from "@/components/LukasHeroAnimation";
import CyberneticGridShader from "@/components/CyberneticGridShader";
import OrbitingSkills from "@/components/OrbitingSkills";
import Footer from "@/components/Footer";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useEffect, useState } from "react";
import { DonutChartSection, CurrencyModal, JoinMovementSection } from "@/components/currency";

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
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Listen for wallet disconnect events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWalletDisconnected = () => {
      // Force re-render to show JoinMovementSection
      setMounted(false);
      setTimeout(() => setMounted(true), 100);
    };

    window.addEventListener('walletDisconnected', handleWalletDisconnected);
    
    return () => {
      window.removeEventListener('walletDisconnected', handleWalletDisconnected);
    };
  }, []);

  // Donut chart animation is now independent from scroll; no scroll listener

  return (
      <>
        <section id="hero" className="relative min-h-screen">
          <LukasGravityCenter /> 
          <LukasHeroAnimation /> 
          <div className="absolute inset-0 pointer-events-none">
            <OrbitingSkills />
          </div>
        </section>

        <section id="content" className="relative overflow-hidden bg-slate-950" data-no-orbit>
          <CyberneticGridShader />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-slate-950/80 z-0" />
          <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 pb-20 sm:pb-24 relative overflow-x-hidden z-10">
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
              
              <JoinMovementSection />
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

        <Footer />
      </>
  );
}

export default function CurrencyPageClient() {
  return (
      <CurrencyPageContent />
  );
}
