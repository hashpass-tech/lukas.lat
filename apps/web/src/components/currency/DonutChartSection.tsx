"use client";

import { useRef, useEffect, useState } from "react";
import { DonutChart, DonutChartSegment } from "@/components/ui/donut-chart";
import { Trans } from "@/components/Trans";
import { useTranslation } from "@/lib/translator";
import { cn } from "@/lib/utils";

type Currency = {
  country: string;
  code: string;
  name: string;
  weight: number;
  color: string;
};

interface DonutChartSectionProps {
  currencies: Currency[];
  selectedCurrency: string | null;
  hoveredSegment: string | null;
  animationKey: number;
  onSegmentHover: (segment: DonutChartSegment | null) => void;
  onCurrencySelect: (currency: string | null) => void;
  onActiveCurrency: (currency: Currency) => void;
}

export function DonutChartSection({
  currencies,
  selectedCurrency,
  hoveredSegment,
  animationKey,
  onSegmentHover,
  onCurrencySelect,
  onActiveCurrency,
}: DonutChartSectionProps) {
  const { locale } = useTranslation(); // Ensure re-render on language change
  const [displayPercentage, setDisplayPercentage] = useState(100);

  // Animate center percentage when selection changes
  useEffect(() => {
    const targetPercentage = selectedCurrency 
      ? currencies.find(c => c.code === selectedCurrency)?.weight || 0
      : 100;
    
    // Reset to 0 and animate to target
    setDisplayPercentage(0);
    
    const timer = setTimeout(() => {
      const duration = 1200; // Slower frames
      const steps = 60; // More steps for smoother progression
      const increment = targetPercentage / steps;
      let currentStep = 0;
      
      const countInterval = setInterval(() => {
        currentStep++;
        const newPercentage = Math.min(Math.round(increment * currentStep), targetPercentage);
        setDisplayPercentage(newPercentage);
        
        if (currentStep >= steps) {
          clearInterval(countInterval);
        }
      }, duration / steps);
      
      return () => clearInterval(countInterval);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedCurrency, animationKey, currencies]);

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
      <div className="text-3xl font-black text-foreground drop-shadow-lg">
        {displayPercentage}%
      </div>
      <div className="text-sm uppercase tracking-[0.22em] font-semibold text-foreground drop-shadow-md">
        {selectedCurrency ? selectedCurrency : <Trans i18nKey="Currency Weights" fallback="Currency Weights" />}
      </div>
    </div>
  );


  return (
    <div className="relative">
      <div 
        data-no-orbit
        className="relative bg-card/95 backdrop-blur-xl border border-border shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Static background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse" />
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--accent) / 0.1) 25%, hsl(var(--destructive) / 0.1) 50%, hsl(var(--success) / 0.1) 75%, hsl(var(--primary) / 0.1) 100%)',
              animation: 'gradient-shift 8s ease infinite',
              backgroundSize: '200% 200%',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-spin-slow" />
        </div>
        
        {/* Card Content */}
        <div className="p-10 rounded-3xl bg-card/90 border border-border">
          <h2 className="text-4xl font-bold mb-8 text-foreground flex items-center justify-center gap-3">
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
            onSegmentHover={onSegmentHover}
          />

          {/* Currency Legend - Progress Card Style */}
          <CurrencyLegend
            currencies={currencies}
            selectedCurrency={selectedCurrency}
            hoveredSegment={hoveredSegment}
            onCurrencySelect={onCurrencySelect}
            onActiveCurrency={onActiveCurrency}
          />
        </div>
      </div>
    </div>
  );
}

function CurrencyLegend({
  currencies,
  selectedCurrency,
  hoveredSegment,
  onCurrencySelect,
  onActiveCurrency,
}: {
  currencies: Currency[];
  selectedCurrency: string | null;
  hoveredSegment: string | null;
  onCurrencySelect: (currency: string | null) => void;
  onActiveCurrency: (currency: Currency) => void;
}) {
  const [lukasFillHeight, setLukasFillHeight] = useState(100);
  const [lukasDisplayWeight, setLukasDisplayWeight] = useState(100);
  const [lukasAnimationKey, setLukasAnimationKey] = useState(0);

  // Initial fill animation for LUKAS card
  useEffect(() => {
    const timer = setTimeout(() => {
      setLukasFillHeight(100);
      // Animate weight counting from 0 to 100
      const duration = 1200; // Slower frames
      const steps = 60; // More steps for smoother progression
      const increment = 100 / steps;
      let currentStep = 0;
      
      const countInterval = setInterval(() => {
        currentStep++;
        const newWeight = Math.min(Math.round(increment * currentStep), 100);
        setLukasDisplayWeight(newWeight);
        
        if (currentStep >= steps) {
          clearInterval(countInterval);
        }
      }, duration / steps);
      
      return () => clearInterval(countInterval);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Restart LUKAS animation when clicked
  const handleLukasClick = () => {
    setLukasFillHeight(0);
    setLukasDisplayWeight(0);
    setLukasAnimationKey(prev => prev + 1);
    setTimeout(() => {
      setLukasFillHeight(100);
      // Animate weight counting from 0 to 100
      const duration = 1200; // Slower frames
      const steps = 60; // More steps for smoother progression
      const increment = 100 / steps;
      let currentStep = 0;
      
      const countInterval = setInterval(() => {
        currentStep++;
        const newWeight = Math.min(Math.round(increment * currentStep), 100);
        setLukasDisplayWeight(newWeight);
        
        if (currentStep >= steps) {
          clearInterval(countInterval);
        }
      }, duration / steps);
      
      onCurrencySelect(null);
    }, 100);
  };
  return (
    <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto mt-8">
      {/* LUKAS Reset Card */}
      <div 
        className={`relative aspect-[5/4] w-32 cursor-pointer transition-all duration-300 rounded-2xl ${
          !selectedCurrency
            ? 'scale-105 shadow-2xl' 
            : 'hover:scale-105 hover:shadow-xl'
        }`}
        onClick={handleLukasClick}
      >
        <div className="relative aspect-[5/4] bg-card rounded-2xl overflow-hidden group border border-border">
          {/* Progress Fill - LUKAS Card */}
          <div 
            key={lukasAnimationKey}
            className="absolute bottom-0 left-0 right-0 transition-all duration-1500 ease-out overflow-hidden"
            style={{ 
              height: `${lukasFillHeight}%`,
              background: 'linear-gradient(to top, #10b981, #34d399)'
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
          <div className="relative h-full p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-lg">🌟</span>
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-80 text-foreground">
                <Trans i18nKey="all" fallback="All" />
              </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onActiveCurrency({
                      code: 'LUKAS',
                      name: 'LUKAS Token',
                      country: '🌟',
                      weight: 100,
                      color: 'from-emerald-400/80 to-green-700/80'
                    });
                  }}
                  className="w-5 h-5 rounded-full bg-card/10 flex items-center justify-center hover:bg-card/20 transition-all duration-200 group/info border border-border"
                >
                  <svg className="w-3 h-3 text-foreground/60 group-hover/info:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">$LUKAS</div>
              <div className="text-xs font-black text-foreground">{lukasDisplayWeight}%</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Regular Currency Cards */}
      {currencies.map((currency) => (
        <CurrencyCard
          key={currency.code}
          currency={currency}
          selectedCurrency={selectedCurrency}
          hoveredSegment={hoveredSegment}
          onCurrencySelect={onCurrencySelect}
          onActiveCurrency={onActiveCurrency}
        />
      ))}
    </div>
  );
}

function CurrencyCard({
  currency,
  selectedCurrency,
  hoveredSegment,
  onCurrencySelect,
  onActiveCurrency,
}: {
  currency: Currency;
  selectedCurrency: string | null;
  hoveredSegment: string | null;
  onCurrencySelect: (currency: string | null) => void;
  onActiveCurrency: (currency: Currency) => void;
}) {
  const [fillHeight, setFillHeight] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [displayWeight, setDisplayWeight] = useState(0);

  // Initial fill animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setFillHeight(currency.weight);
      // Animate weight counting from 0 to target weight
      const duration = 1200; // Slower frames
      const steps = 60; // More steps for smoother progression
      const increment = currency.weight / steps;
      let currentStep = 0;
      
      const countInterval = setInterval(() => {
        currentStep++;
        const newWeight = Math.min(Math.round(increment * currentStep), currency.weight);
        setDisplayWeight(newWeight);
        
        if (currentStep >= steps) {
          clearInterval(countInterval);
        }
      }, duration / steps);
      
      return () => clearInterval(countInterval);
    }, 100);
    return () => clearTimeout(timer);
  }, [currency.weight]);

  // Restart animation when clicked
  const handleClick = () => {
    setFillHeight(0);
    setDisplayWeight(0);
    setAnimationKey(prev => prev + 1);
    setTimeout(() => {
      setFillHeight(currency.weight);
      // Animate weight counting from 0 to target weight
      const duration = 1200; // Slower frames
      const steps = 60; // More steps for smoother progression
      const increment = currency.weight / steps;
      let currentStep = 0;
      
      const countInterval = setInterval(() => {
        currentStep++;
        const newWeight = Math.min(Math.round(increment * currentStep), currency.weight);
        setDisplayWeight(newWeight);
        
        if (currentStep >= steps) {
          clearInterval(countInterval);
        }
      }, duration / steps);
      
      onCurrencySelect(selectedCurrency === currency.code ? null : currency.code);
    }, 100);
  };
  return (
    <div 
      className={`relative aspect-[5/4] w-32 cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden ${
        selectedCurrency === currency.code
          ? 'scale-105 shadow-2xl' 
          : hoveredSegment === currency.code 
          ? 'scale-105 shadow-xl' 
          : hoveredSegment && hoveredSegment !== currency.code
          ? 'opacity-50'
          : 'hover:scale-105 hover:shadow-xl'
      }`}
      onClick={handleClick}
    >
      <div className="relative aspect-[5/4] bg-card rounded-2xl overflow-hidden group border border-border hover:scale-105 hover:shadow-xl selected:scale-105 selected:shadow-2xl">
        {/* Progress Fill - Fixed with Fluid Animation */}
        <div 
          key={animationKey}
          className="absolute bottom-0 left-0 right-0 transition-all duration-1500 ease-out overflow-hidden"
          style={{ 
            height: `${fillHeight}%`,
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
        <div className="relative h-full p-3 flex flex-col justify-between text-foreground">
          <div className="flex items-center justify-between">
            <span className="text-lg">{currency.country}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActiveCurrency(currency);
              }}
              className="w-5 h-5 rounded-full bg-card/10 flex items-center justify-center hover:bg-card/20 transition-all duration-200 group/info border border-border"
            >
              <svg className="w-3 h-3 text-foreground/60 group-hover/info:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12 a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold">${currency.code}</div>
            <div className="text-xs opacity-80">{displayWeight}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
