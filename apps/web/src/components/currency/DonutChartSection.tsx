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
      <div className="text-3xl font-black text-gray-900 dark:text-gray-100 drop-shadow-lg">
        {selectedCurrency ? `${currencies.find(c => c.code === selectedCurrency)?.weight}%` : '100%'}
      </div>
      <div className="text-sm uppercase tracking-[0.22em] font-semibold text-gray-800 dark:text-gray-200 drop-shadow-md">
        {selectedCurrency ? selectedCurrency : <Trans i18nKey="Currency Weights" fallback="Currency Weights" />}
      </div>
    </div>
  );


  return (
    <div className="relative">
      <div 
        data-no-orbit
        className="relative backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 shadow-lg rounded-3xl"
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
        <div className="p-10 rounded-3xl">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100 flex items-center justify-center gap-3">
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
  return (
    <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto mt-8">
      {/* LUKAS Reset Card */}
      <div 
        className={`relative aspect-[5/4] w-32 cursor-pointer transition-all duration-300 ${
          !selectedCurrency
            ? 'scale-105 shadow-2xl' 
            : 'hover:scale-105 hover:shadow-xl'
        }`}
        onClick={() => onCurrencySelect(null)}
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
                    onActiveCurrency({
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
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">LUKAS</div>
              <div className="text-xs opacity-80 text-gray-700 dark:text-gray-300">
                <Trans i18nKey="all" fallback="All" />
              </div>
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
  return (
    <div 
      className={`relative aspect-[5/4] w-32 cursor-pointer transition-all duration-300 ${
        selectedCurrency === currency.code
          ? 'scale-105 shadow-2xl' 
          : hoveredSegment === currency.code 
          ? 'scale-105 shadow-xl' 
          : hoveredSegment && hoveredSegment !== currency.code
          ? 'opacity-50'
          : 'hover:scale-105 hover:shadow-xl'
      }`}
      onClick={() => onCurrencySelect(selectedCurrency === currency.code ? null : currency.code)}
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
        <div className="relative h-full p-3 flex flex-col justify-between text-gray-900 dark:text-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-lg">{currency.country}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActiveCurrency(currency);
              }}
              className="w-5 h-5 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-200 group/info"
            >
              <svg className="w-3 h-3 text-gray-700 dark:text-gray-300 group-hover/info:text-gray-900 dark:group-hover/info:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12 a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  );
}
