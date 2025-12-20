'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MonitoringDashboard } from '@/components/MonitoringDashboard';
import { SwapWidget } from '@/components/SwapWidget';
import Footer from '@/components/Footer';
import Link from 'next/link';

/**
 * Pool Page Client Component
 * 
 * Displays a comprehensive pool view with:
 * - Swap widget for trading
 * - Detailed pool metrics and monitoring dashboard
 * - Navigation between different views
 */
export default function PoolPageClient() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'swap' | 'metrics' | 'detailed' | null;
  const [activeView, setActiveView] = useState<'swap' | 'metrics' | 'detailed'>(initialTab || 'metrics');

  return (
    <div className="min-h-screen bg-background text-foreground pt-16 sm:pt-20 pb-20 sm:pb-16 transition-colors duration-300">
      {/* Navigation Header - Sticky below main header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-card/95 backdrop-blur-md border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base shrink-0"
              >
                ← Back
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">LUKAS/USDC</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Explorer Links - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:flex items-center gap-2">
                <a
                  href="https://polygonscan.com/address/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:bg-primary/5"
                >
                  🔍 Polygonscan
                </a>
                <a
                  href="https://app.uniswap.org/explore/pools/polygon/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:bg-primary/5"
                >
                  🦄 Uniswap
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs - Fixed, no horizontal scroll */}
      <div className="sticky top-[120px] sm:top-[136px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-center sm:justify-start">
            <div className="inline-flex">
              <button
                onClick={() => setActiveView('swap')}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeView === 'swap'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Swap
              </button>
              <button
                onClick={() => setActiveView('metrics')}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeView === 'metrics'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Metrics
              </button>
              <button
                onClick={() => setActiveView('detailed')}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeView === 'detailed'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        {/* Swap View */}
        {activeView === 'swap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Swap Widget - Full width on mobile, sticky on desktop */}
            <div className="lg:col-span-1 order-1">
              <div className="lg:sticky lg:top-48">
                <SwapWidget />
              </div>
            </div>

            {/* Quick Stats - Below swap on mobile */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2">
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4 sm:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Quick Stats</h2>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-500 rounded-full">
                    DEMO DATA
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-card/80 rounded-lg p-3 sm:p-4 border border-border/50 hover:border-border transition-all duration-200">
                    <p className="text-muted-foreground text-xs sm:text-sm mb-1">Current Price</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">~1.00</p>
                    <p className="text-xs text-muted-foreground mt-1">LUKAS/USDC</p>
                  </div>
                  <div className="bg-card/80 rounded-lg p-3 sm:p-4 border border-border/50 hover:border-border transition-all duration-200">
                    <p className="text-muted-foreground text-xs sm:text-sm mb-1">24h Volume</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">--</p>
                    <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                  </div>
                  <div className="bg-card/80 rounded-lg p-3 sm:p-4 border border-border/50 hover:border-border transition-all duration-200">
                    <p className="text-muted-foreground text-xs sm:text-sm mb-1">Liquidity</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">--</p>
                    <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                  </div>
                  <div className="bg-card/80 rounded-lg p-3 sm:p-4 border border-border/50 hover:border-border transition-all duration-200">
                    <p className="text-muted-foreground text-xs sm:text-sm mb-1">Fee Tier</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">0.30%</p>
                    <p className="text-xs text-muted-foreground mt-1">Pool fee</p>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-card/80 border border-border/50 rounded-lg p-4 transition-all duration-200">
                  <h3 className="text-primary font-semibold mb-2 text-sm sm:text-base">📊 Pool Status</h3>
                  <p className="text-foreground text-xs sm:text-sm">
                    The LUKAS/USDC pool is active and accepting trades.
                  </p>
                </div>
                <div className="bg-card/80 border border-border/50 rounded-lg p-4 transition-all duration-200">
                  <h3 className="text-primary font-semibold mb-2 text-sm sm:text-base">✅ Fair Price</h3>
                  <p className="text-foreground text-xs sm:text-sm">
                    Price deviation from fair value is within range (&lt;2%).
                  </p>
                </div>
              </div>

              {/* Mobile Explorer Links */}
              <div className="flex gap-2 md:hidden">
                <a
                  href="https://polygonscan.com/address/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-primary border border-border/50 rounded-lg"
                >
                  🔍 Polygonscan
                </a>
                <a
                  href="https://app.uniswap.org/explore/pools/polygon/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-primary border border-border/50 rounded-lg"
                >
                  🦄 Uniswap
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Metrics View */}
        {activeView === 'metrics' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Unified Monitoring Dashboard with metrics, chart, and transactions */}
            <MonitoringDashboard />
          </div>
        )}

        {/* Detailed View */}
        {activeView === 'detailed' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Explorer Links Card */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Explore Pool</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <a
                  href="https://polygonscan.com/address/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 sm:p-4 bg-card/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 group"
                >
                  <span className="text-xl sm:text-2xl">🔍</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate">Polygonscan</p>
                    <p className="text-xs text-muted-foreground truncate">View on explorer</p>
                  </div>
                </a>
                <a
                  href="https://app.uniswap.org/explore/pools/polygon/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 sm:p-4 bg-card/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 group"
                >
                  <span className="text-xl sm:text-2xl">🦄</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate">Uniswap</p>
                    <p className="text-xs text-muted-foreground truncate">Trade on Uniswap</p>
                  </div>
                </a>
                <a
                  href="https://dexscreener.com/polygon/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 sm:p-4 bg-card/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 group"
                >
                  <span className="text-xl sm:text-2xl">📊</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate">DexScreener</p>
                    <p className="text-xs text-muted-foreground truncate">View analytics</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Detailed Pool Analysis</h2>

              {/* Pool Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Pool Configuration</h3>
                  <div className="space-y-2 sm:space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Token 0</span>
                      <span className="text-foreground font-mono">LUKAS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Token 1</span>
                      <span className="text-foreground font-mono">USDC</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Fee Tier</span>
                      <span className="text-foreground font-mono">0.30%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Tick Spacing</span>
                      <span className="text-foreground font-mono">60</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Current Tick</span>
                      <span className="text-foreground font-mono">-276</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Liquidity Details</h3>
                  <div className="space-y-2 sm:space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Total Liquidity</span>
                      <span className="text-foreground font-mono">$10.2K</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">LUKAS Locked</span>
                      <span className="text-foreground font-mono">10.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">USDC Locked</span>
                      <span className="text-foreground font-mono">0.976</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">LP Count</span>
                      <span className="text-foreground font-mono">1</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Unclaimed Fees</span>
                      <span className="text-foreground font-mono">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Trading Statistics</h3>
                  <div className="space-y-2 sm:space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Total Swaps</span>
                      <span className="text-foreground font-mono">42</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">24h Swaps</span>
                      <span className="text-foreground font-mono">8</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Total Volume</span>
                      <span className="text-foreground font-mono">$156.3K</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">24h Volume</span>
                      <span className="text-foreground font-mono">$12.5K</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Price Information</h3>
                  <div className="space-y-2 sm:space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="text-foreground font-mono">1.024</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">24h High</span>
                      <span className="text-foreground font-mono">1.032</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">24h Low</span>
                      <span className="text-foreground font-mono">1.018</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Price Deviation</span>
                      <span className="text-green-400 font-mono">+0.12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
