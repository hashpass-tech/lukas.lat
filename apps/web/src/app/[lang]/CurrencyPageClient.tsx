"use client";

import LukasGravityCenter from "@/components/LukasGravityCenter";
import LukasHeroAnimation from "@/components/LukasHeroAnimation";
import CyberneticGridShader from "@/components/CyberneticGridShader";
import OrbitingSkills from "@/components/OrbitingSkills";
import { Progress } from "@/components/ui/progress";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Trans } from "@/components/Trans";

type Currency = {
  country: string;
  code: string;
  name: string;
  weight: number;
  color: string;
};

const currencies: Currency[] = [
  { country: "🇧🇷", code: "BRL", name: "Brazilian Real", weight: 40, color: "from-emerald-400/80 to-green-700/80" },
  { country: "🇲🇽", code: "MXN", name: "Mexican Peso", weight: 30, color: "from-rose-400/80 to-red-700/80" },
  { country: "🇨🇴", code: "COP", name: "Colombian Peso", weight: 15, color: "from-amber-300/80 to-yellow-600/80" },
  { country: "🇨🇱", code: "CLP", name: "Chilean Peso", weight: 10, color: "from-sky-300/80 to-blue-700/80" },
  { country: "🇦🇷", code: "ARS", name: "Argentine Peso", weight: 5, color: "from-cyan-300/80 to-sky-600/80" },
];

function CurrencyCard({ currency, onOpen }: { currency: Currency; onOpen: (c: Currency) => void }) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [fillValue, setFillValue] = useState(0);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFillValue(currency.weight);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [currency.weight]);

  const imageUrl = `/coins/${currency.code.toLowerCase()}-coin.svg`;

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={() => onOpen(currency)}
      className="group w-full text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Progress
        value={fillValue}
        max={100}
        variant="secondary"
        radius="default"
        className="aspect-[5/4] bg-slate-950/70 shadow-xl hover:shadow-2xl rounded-3xl"
        indicatorClassName={`bg-gradient-to-b ${currency.color}`}
        overlayClassName="p-5 sm:p-6"
        showText
      >
        <div className="flex flex-col justify-between h-full w-full text-white gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-black drop-shadow">{fillValue.toFixed(0)}%</span>
            <span className="text-[10px] uppercase tracking-[0.22em] font-semibold opacity-80">
              <Trans id="basket" message="Basket" />
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/15 shadow-sm text-sm font-semibold">
              <span className="text-xl drop-shadow-sm">{currency.country}</span>
              <span className="tracking-tight">{currency.code}</span>
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium opacity-85 leading-tight">{currency.name}</span>
            </div>
          </div>
        </div>
      </Progress>
    </motion.button>
  );
}

function CurrencyModal({ currency, onClose }: { currency: Currency; onClose: () => void }) {
  const imageUrl = `/coins/${currency.code.toLowerCase()}-coin.svg`;
  return (
    <AnimatePresence>
      {currency && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.4 }}
        >
            <div className="text-center mb-6 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sm font-semibold text-white/90">
                <span className="text-xl drop-shadow-sm">{currency.country}</span>
                <span>{currency.code}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{currency.name}</h3>
            </div>
            <div className="px-5 pb-5 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <img src={imageUrl} alt={`${currency.code} coin`} className="w-12 h-12 object-contain drop-shadow" />
                  </div>
                <div className="flex-1 text-white">
                  <div className="text-sm uppercase tracking-[0.18em] text-white/60">
                    <Trans id="basket.weight" message="Basket Weight" />
                  </div>
                  <div className="text-4xl font-black leading-tight">{currency.weight}%</div>
                </div>
              </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80 text-sm leading-relaxed">
                  {currency.name} contributes {currency.weight}% to the $LUKAS basket. The live fill animation mirrors its proportional share within the stabilized multi-coin mix.
                </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 transition-colors"
                >
                  <Trans id="close" message="Close" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CurrencyPageClient() {
  const [activeCurrency, setActiveCurrency] = useState<Currency | null>(null);

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
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mx-auto">
            <div className="bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-10 border border-slate-300/60 dark:border-slate-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
              <h2 className="text-3xl font-bold mb-8 text-slate-950 dark:text-slate-50 flex items-center gap-3">
                <span className="text-4xl">⚖️</span> <Trans id="Currency Weights" message="Currency Weights" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currencies.map((currency) => (
                  <CurrencyCard key={currency.code} currency={currency} onOpen={setActiveCurrency} />
                ))}
              </div>
            </div>

            <div data-no-orbit className="bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-10 border border-slate-300/60 dark:border-slate-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-8 text-slate-950 dark:text-slate-50 flex items-center gap-3">
                <span className="text-4xl">🚀</span> <Trans id="Join the Movement" message="Join the Movement" />
              </h2>
              <p className="text-lg text-slate-800 dark:text-slate-200 mb-10 leading-relaxed font-medium">
                <Trans
                  id="$LUKAS.description"
                  message="$LUKAS is the first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset."
                />
              </p>
              <button className="w-full py-5 px-8 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                <Trans id="connect.wallet" message="Connect Wallet" />
              </button>
            </div>
          </div>
        </div>
        </main>
      </section>
      {activeCurrency && (
        <CurrencyModal currency={activeCurrency} onClose={() => setActiveCurrency(null)} />
      )}
      <PWAInstallPrompt />
    </>
  );
}
