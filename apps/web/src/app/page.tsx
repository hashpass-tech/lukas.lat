"use client";

import LukasGravityCenter from "@/components/LukasGravityCenter";
import LukasHeroAnimation from "@/components/LukasHeroAnimation";
import TextCursorProximity from "@/components/ui/text-cursor-proximity";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [hasScrolled, setHasScrolled] = useState(false);
  // Set initial scroll state on mount
  useEffect(() => {
    setHasScrolled(window.scrollY > 100);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) { // Adjust scroll threshold as needed
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {!hasScrolled && <LukasGravityCenter />}
      {!hasScrolled && <LukasHeroAnimation />}
      <main ref={containerRef} className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mx-auto">
            <div className="bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-10 border border-slate-300/60 dark:border-slate-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
              <h2 className="text-3xl font-bold mb-8 text-slate-950 dark:text-slate-50 flex items-center gap-3">
                <span className="text-4xl">⚖️</span> Currency Weights
              </h2>
              <div className="space-y-5">
                {[
                  { country: "🇧🇷", code: "BRL", name: "Brazilian Real", weight: "40%", color: "bg-green-600" },
                  { country: "🇲🇽", code: "MXN", name: "Mexican Peso", weight: "30%", color: "bg-red-600" },
                  { country: "🇨🇴", code: "COP", name: "Colombian Peso", weight: "15%", color: "bg-yellow-500" },
                  { country: "🇨🇱", code: "CLP", name: "Chilean Peso", weight: "10%", color: "bg-blue-600" },
                  { country: "🇦🇷", code: "ARS", name: "Argentine Peso", weight: "5%", color: "bg-sky-500" },
                ].map((currency) => (
                  <div key={currency.code} className="group flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-slate-800/30 hover:bg-white/95 dark:hover:bg-slate-800/60 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-700/30">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl drop-shadow-sm">{currency.country}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-slate-950 dark:text-slate-100">{currency.code}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-400">{currency.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-1 max-w-xs ml-4">
                      <div className="relative w-full h-8 bg-slate-300/40 dark:bg-slate-700/40 rounded-full shadow-inner border border-slate-400/20 dark:border-slate-600/20">
                        <div
                          className={`h-full ${currency.color} opacity-60 group-hover:opacity-80 transition-all duration-500 rounded-full`}
                          style={{ width: currency.weight }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-slate-950 dark:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] tracking-wider pointer-events-none">
                          {currency.weight}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div data-no-orbit className="bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-10 border border-slate-300/60 dark:border-slate-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-8 text-slate-950 dark:text-slate-50 flex items-center gap-3">
                <span className="text-4xl">🚀</span> Join the Movement
              </h2>
              <p className="text-lg text-slate-800 dark:text-slate-200 mb-10 leading-relaxed font-medium">
                $LUKAS is the first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset.
              </p>
              <button className="w-full py-5 px-8 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
