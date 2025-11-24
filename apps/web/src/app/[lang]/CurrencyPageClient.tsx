"use client";

import LukasGravityCenter from "@/components/LukasGravityCenter";
import LukasHeroAnimation from "@/components/LukasHeroAnimation";
import CyberneticGridShader from "@/components/CyberneticGridShader";
import OrbitingSkills from "@/components/OrbitingSkills";
import { Progress } from "@/components/ui/progress";
import { DonutChart, DonutChartSegment } from "@/components/ui/donut-chart";
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
  { country: "🇧🇷", code: "BRL", name: "currency.brazilian_real", weight: 40, color: "from-emerald-400/80 to-green-700/80" },
  { country: "🇲🇽", code: "MXN", name: "currency.mexican_peso", weight: 30, color: "from-rose-400/80 to-red-700/80" },
  { country: "🇨🇴", code: "COP", name: "currency.colombian_peso", weight: 15, color: "from-amber-300/80 to-yellow-600/80" },
  { country: "🇨🇱", code: "CLP", name: "currency.chilean_peso", weight: 10, color: "from-sky-300/80 to-blue-700/80" },
  { country: "🇦🇷", code: "ARS", name: "currency.argentine_peso", weight: 5, color: "from-cyan-300/80 to-sky-600/80" },
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
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [currency.weight]);

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={() => onOpen(currency)}
      className="relative aspect-[5/4] bg-slate-950/70 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden group max-w-72 w-full hover:-translate-y-0.5 transition-all duration-300 ease-out"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
           style={{ backgroundImage: `linear-gradient(135deg, ${currency.color.split(' ')[0].replace('from-', '')}20, ${currency.color.split(' ')[1].replace('to-', '')}20)` }} />
      
      <Progress
        value={fillValue}
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
              <Trans i18nKey="basket.title" fallback="Basket" />
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/15 shadow-sm text-sm font-semibold">
              <span className="text-xl drop-shadow-sm">{currency.country}</span>
              <span className="tracking-tight">{currency.code}</span>
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium opacity-85 leading-tight">
                <Trans i18nKey={currency.name} fallback={currency.name} />
              </span>
            </div>
          </div>
        </div>
      </Progress>
    </motion.button>
  );
}

function CurrencyModal({ currency, onClose }: { currency: Currency; onClose: () => void }) {
  // Special handling for LUKAS token
  if (currency.code === 'LUKAS') {
    return (
      <AnimatePresence>
        {currency && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-2xl w-full border border-slate-300/60 dark:border-slate-700/40 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🌟</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      <Trans i18nKey="lukas.token.title" fallback="LUKAS Token" />
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      <Trans i18nKey="lukas.token.subtitle" fallback="Regional Stable-Basket Meme Coin" />
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 text-slate-700 dark:text-slate-300">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
                    <Trans i18nKey="lukas.what_is_title" fallback="What is LUKAS?" />
                  </h4>
                  <p className="leading-relaxed">
                    <Trans
                      i18nKey="lukas.description"
                      fallback="$LUKAS is the first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset. It combines the stability of a basket of major Latin American currencies with the community-driven nature of meme coins."
                    />
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
                    <Trans i18nKey="lukas.key_features" fallback="Key Features" />
                  </h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong><Trans i18nKey="lukas.regional_focus" fallback="Regional Focus:" /></strong> <Trans i18nKey="lukas.regional_focus_desc" fallback="Optimized for Latin American markets" /></li>
                    <li><strong><Trans i18nKey="lukas.stable_basket" fallback="Stable Basket:" /></strong> <Trans i18nKey="lukas.stable_basket_desc" fallback="Backed by BRL, MXN, COP, CLP, and ARS" /></li>
                    <li><strong><Trans i18nKey="lukas.gravity_centered" fallback="Gravity-Centered:" /></strong> <Trans i18nKey="lukas.gravity_centered_desc" fallback="Algorithmically balanced for stability" /></li>
                    <li><strong><Trans i18nKey="lukas.community_driven" fallback="Community Driven:" /></strong> <Trans i18nKey="lukas.community_driven_desc" fallback="Meme coin culture with real utility" /></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
                    <Trans i18nKey="lukas.currency_basket" fallback="Currency Basket" />
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {currencies.map((c) => (
                      <div key={c.code} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-lg">{c.country}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{c.code}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{c.weight}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Regular currency modal
  const imageUrl = `/coins/${currency.code.toLowerCase()}-coin.svg`;
  return (
    <AnimatePresence>
      {currency && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-slate-300/60 dark:border-slate-700/40 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">{currency.country}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{currency.code}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    <Trans i18nKey={currency.name} fallback={currency.name} />
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-2xl">
                <img
                  src={imageUrl}
                  alt={`${currency.code} coin`}
                  className="w-full h-full object-contain p-4 dark:invert"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center">
                  <span className="text-6xl dark:invert">{currency.country}</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  {currency.weight}%
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  <Trans i18nKey="currency.weight" fallback="Currency Weight" />
                </p>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <Trans
                  i18nKey={`currency.${currency.code.toLowerCase()}.description`}
                  fallback={`${currency.code} represents ${(currency.weight / 100).toFixed(2)} of the LUKAS stable basket, providing stability and liquidity for the Latin American market.`}
                />
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
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Create donut chart data - either all currencies or just selected one
  const donutData: DonutChartSegment[] = selectedCurrency 
    ? [
        {
          value: currencies.find(c => c.code === selectedCurrency)?.weight || 0,
          color: currencies.find(c => c.code === selectedCurrency)?.color.includes('emerald') ? '#10b981' : 
                  currencies.find(c => c.code === selectedCurrency)?.color.includes('rose') ? '#f43f5e' :
                  currencies.find(c => c.code === selectedCurrency)?.color.includes('amber') ? '#f59e0b' :
                  currencies.find(c => c.code === selectedCurrency)?.color.includes('sky') ? '#0ea5e9' :
                  currencies.find(c => c.code === selectedCurrency)?.color.includes('cyan') ? '#06b6d4' : '#64748b',
          label: selectedCurrency,
        },
        {
          value: 100 - (currencies.find(c => c.code === selectedCurrency)?.weight || 0),
          color: 'hsl(var(--border) / 0.3)',
          label: 'remaining',
        },
      ]
    : currencies.map((c) => ({
        value: c.weight,
        color: c.color.includes('emerald') ? '#10b981' : 
                c.color.includes('rose') ? '#f43f5e' :
                c.color.includes('amber') ? '#f59e0b' :
                c.color.includes('sky') ? '#0ea5e9' :
                c.color.includes('cyan') ? '#06b6d4' : '#64748b',
        label: c.code,
      }));

  // Center content for the donut chart
  const centerContent = (
    <div className="text-center">
      <div className="text-3xl font-black text-slate-950 dark:text-white drop-shadow-lg">
        {selectedCurrency ? `${currencies.find(c => c.code === selectedCurrency)?.weight}%` : '100%'}
      </div>
      <div className="text-sm uppercase tracking-[0.22em] font-semibold text-slate-900/90 dark:text-white/90 drop-shadow-md">
        {selectedCurrency ? selectedCurrency : <Trans i18nKey="Currency Weights" fallback="Currency Weights" />}
      </div>
    </div>
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = (x - centerX) / centerX * 10;
      const rotateX = (y - centerY) / centerY * -10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
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
            <div className="relative">
              <div 
                ref={cardRef}
                className="relative bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.2s ease-out'
                }}
              >
                {/* Dynamic glare effect */}
                <div 
                  className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.15) 0%, transparent 50%)`
                  }}
                />
                
                {/* Card Content */}
                <div className="p-10 border border-slate-300/60 dark:border-slate-700/40 rounded-3xl">
                  <h2 className="text-4xl font-bold mb-8 text-slate-950 dark:text-slate-50 flex items-center justify-center gap-3">
                    <span className="text-5xl">⚖️</span> 
                    <Trans i18nKey="Currency Weights" fallback="Currency Weights" />
                  </h2>
                  <DonutChart
                    key={animationKey}
                    data={donutData}
                    size={250}
                    strokeWidth={30}
                    animationDuration={2}
                    animationDelayPerSegment={0.2}
                    highlightOnHover={true}
                    centerContent={centerContent}
                    className="mx-auto"
                    onSegmentHover={(segment) => setHoveredSegment(segment?.label || null)}
                  />

                  {/* Currency Legend - Progress Card Style */}
                  <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto mt-8">
                    {/* LUKAS Reset Card */}
                    <div 
                      className={`relative aspect-[5/4] w-32 cursor-pointer transition-all duration-300 ${
                        !selectedCurrency
                          ? 'scale-105 shadow-2xl' 
                          : 'hover:scale-105 hover:shadow-xl'
                      }`}
                      onClick={() => setSelectedCurrency(null)}
                    >
                      <div className={`relative aspect-[5/4] rounded-2xl overflow-hidden ${
                        !selectedCurrency
                          ? 'bg-gradient-to-br from-emerald-500/90 to-green-600/90' 
                          : 'bg-slate-950/70'
                      }`}>
                        {/* Progress Indicator */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        
                        {/* Content */}
                        <div className="relative h-full p-3 flex flex-col justify-between text-white">
                          <div className="flex items-center justify-between">
                            <span className="text-lg">🌟</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black">100%</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCurrency({
                                    code: 'LUKAS',
                                    name: 'LUKAS Token',
                                    country: '🌟',
                                    weight: 100,
                                    color: 'from-emerald-400/80 to-green-700/80'
                                  });
                                }}
                                className="w-5 h-5 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-200 group/info"
                              >
                                <svg className="w-3 h-3 text-white/80 group-hover/info:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold">LUKAS</div>
                            <div className="text-xs opacity-80">
                              <Trans i18nKey="all" fallback="All" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Regular Currency Cards */}
                    {currencies.map((currency) => (
                      <div 
                        key={currency.code}
                        className={`relative aspect-[5/4] w-32 cursor-pointer transition-all duration-300 ${
                          selectedCurrency === currency.code
                            ? 'scale-105 shadow-2xl' 
                            : hoveredSegment === currency.code 
                            ? 'scale-105 shadow-xl' 
                            : hoveredSegment && hoveredSegment !== currency.code
                            ? 'opacity-50'
                            : 'hover:scale-105 hover:shadow-xl'
                        }`}
                        onClick={() => setSelectedCurrency(selectedCurrency === currency.code ? null : currency.code)}
                      >
                        <div className="relative aspect-[5/4] bg-slate-950/70 rounded-2xl overflow-hidden group">
                          {/* Progress Bar Background */}
                          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                               style={{ backgroundImage: `linear-gradient(135deg, ${currency.color.split(' ')[0].replace('from-', '')}20, ${currency.color.split(' ')[1].replace('to-', '')}20)` }} />
                          
                          {/* Progress Fill - Fixed with Fluid Animation */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out overflow-hidden"
                            style={{ 
                              height: `${currency.weight}%`,
                              background: `linear-gradient(to top, ${currency.color.includes('emerald') ? '#10b981' : currency.color.includes('rose') ? '#f43f5e' : currency.color.includes('amber') ? '#f59e0b' : currency.color.includes('sky') ? '#0ea5e9' : currency.color.includes('cyan') ? '#06b6d4' : '#64748b'}, ${currency.color.includes('emerald') ? '#34d399' : currency.color.includes('rose') ? '#fb7185' : currency.color.includes('amber') ? '#fbbf24' : currency.color.includes('sky') ? '#38bdf8' : currency.color.includes('cyan') ? '#22d3ee' : '#94a3b8'})`
                            }}
                          >
                            {/* Fluid Loading Animation */}
                            <div className="absolute inset-0 opacity-30">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                              <div 
                                className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
                                style={{
                                  animation: 'fluid 3s ease-in-out infinite',
                                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)'
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="relative h-full p-3 flex flex-col justify-between text-white">
                            <div className="flex items-center justify-between">
                              <span className="text-lg">{currency.country}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCurrency(currency);
                                }}
                                className="w-5 h-5 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-200 group/info"
                              >
                                <svg className="w-3 h-3 text-white/80 group-hover/info:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold">{currency.code}</div>
                              <div className="text-xs opacity-80">{currency.weight}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div data-no-orbit className="bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-10 border border-slate-300/60 dark:border-slate-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-8 text-slate-950 dark:text-slate-50 flex items-center gap-3">
                <span className="text-4xl">🚀</span> <Trans i18nKey="Join the Movement" fallback="Join the Movement" />
              </h2>
              <p className="text-lg text-slate-800 dark:text-slate-200 mb-10 leading-relaxed font-medium">
                <Trans
                  i18nKey="intro.description"
                  fallback="$LUKAS is the first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset."
                />
              </p>
              <button className="w-full py-5 px-8 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                <Trans i18nKey="connect.wallet" fallback="Connect Wallet" />
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
