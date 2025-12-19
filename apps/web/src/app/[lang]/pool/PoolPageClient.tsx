'use client';

import { useState } from 'react';
import { MonitoringDashboard } from '@/components/MonitoringDashboard';
import { SwapWidget } from '@/components/SwapWidget';
import { TransactionHistory } from '@/components/TransactionHistory';
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
  const [activeView, setActiveView] = useState<'swap' | 'metrics' | 'detailed'>('swap');

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 transition-colors duration-300">
      {/* Navigation Header */}
      <div className="sticky top-20 z-40 bg-card/80 backdrop-blur-md border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-foreground">LUKAS/USDC Pool</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium transition-colors duration-200">
                Live
              </span>
              {/* Explorer Links */}
              <a
                href="https://polygonscan.com/address/0x0000000000000000000000000000000000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:bg-primary/5"
                title="View on Polygonscan"
              >
                🔍 Polygonscan
              </a>
              <a
                href="https://app.uniswap.org/explore/pools/polygon/0x0000000000000000000000000000000000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:bg-primary/5"
                title="View on Uniswap"
              >
                🦄 Uniswap
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex gap-4 mb-8 border-b border-border transition-colors duration-200">
          <button
            onClick={() => setActiveView('swap')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 ${
              activeView === 'swap'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveView('metrics')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 ${
              activeView === 'metrics'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pool Metrics
          </button>
          <button
            onClick={() => setActiveView('detailed')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 ${
              activeView === 'detailed'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Detailed View
          </button>
        </div>

        {/* Swap View */}
        {activeView === 'swap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Swap Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <SwapWidget />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction History */}
              <TransactionHistory />
              
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-6 transition-colors duration-200">
                <h2 className="text-xl font-bold text-foreground mb-4">Quick Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                    <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                    <p className="text-2xl font-bold text-foreground">1.024</p>
                    <p className="text-xs text-muted-foreground mt-1">LUKAS/USDC</p>
                  </div>
                  <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                    <p className="text-muted-foreground text-sm mb-1">24h Volume</p>
                    <p className="text-2xl font-bold text-foreground">$12.5K</p>
                    <p className="text-xs text-green-400 mt-1">↑ 5.2%</p>
                  </div>
                  <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                    <p className="text-muted-foreground text-sm mb-1">Total Liquidity</p>
                    <p className="text-2xl font-bold text-foreground">$10.2K</p>
                    <p className="text-xs text-muted-foreground mt-1">10 LUKAS</p>
                  </div>
                  <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                    <p className="text-muted-foreground text-sm mb-1">Fee Tier</p>
                    <p className="text-2xl font-bold text-foreground">0.30%</p>
                    <p className="text-xs text-muted-foreground mt-1">Pool fee</p>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card/80 border border-border/50 rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-border">
                  <h3 className="text-primary font-semibold mb-2">📊 Pool Status</h3>
                  <p className="text-foreground text-sm">
                    The LUKAS/USDC pool is active and accepting trades. Liquidity is stable.
                  </p>
                </div>
                <div className="bg-card/80 border border-border/50 rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-border">
                  <h3 className="text-primary font-semibold mb-2">✅ Fair Price</h3>
                  <p className="text-foreground text-sm">
                    Price deviation from fair value is within acceptable range (&lt;2%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics View */}
        {activeView === 'metrics' && (
          <div className="space-y-6">
            {/* Transaction History */}
            <TransactionHistory />
            
            <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-6 transition-colors duration-200">
              <h2 className="text-xl font-bold text-foreground mb-4">Pool Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                  <p className="text-muted-foreground text-sm mb-2">Current Price</p>
                  <p className="text-3xl font-bold text-foreground">1.024</p>
                  <p className="text-xs text-muted-foreground mt-2">LUKAS per USDC</p>
                </div>
                <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                  <p className="text-muted-foreground text-sm mb-2">24h High</p>
                  <p className="text-3xl font-bold text-green-400">1.032</p>
                  <p className="text-xs text-muted-foreground mt-2">Peak price</p>
                </div>
                <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                  <p className="text-muted-foreground text-sm mb-2">24h Low</p>
                  <p className="text-3xl font-bold text-red-400">1.018</p>
                  <p className="text-xs text-muted-foreground mt-2">Low price</p>
                </div>
                <div className="bg-card/80 rounded-lg p-4 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
                  <p className="text-muted-foreground text-sm mb-2">24h Change</p>
                  <p className="text-3xl font-bold text-blue-400">+0.39%</p>
                  <p className="text-xs text-muted-foreground mt-2">Price change</p>
                </div>
              </div>
            </div>

            {/* Monitoring Dashboard */}
            <MonitoringDashboard />
          </div>
        )}

        {/* Detailed View */}
        {activeView === 'detailed' && (
          <div className="space-y-6">
            {/* Explorer Links Card */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-foreground mb-4">Explore Pool</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://polygonscan.com/address/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-card/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:shadow-md group"
                >
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Polygonscan</p>
                    <p className="text-xs text-muted-foreground">View on block explorer</p>
                  </div>
                </a>
                <a
                  href="https://app.uniswap.org/explore/pools/polygon/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-card/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:shadow-md group"
                >
                  <span className="text-2xl">🦄</span>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Uniswap</p>
                    <p className="text-xs text-muted-foreground">Trade on Uniswap</p>
                  </div>
                </a>
                <a
                  href="https://dexscreener.com/polygon/0x0000000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-card/80 border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:shadow-md group"
                >
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">DexScreener</p>
                    <p className="text-xs text-muted-foreground">View analytics</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-6 transition-colors duration-200">
              <h2 className="text-xl font-bold text-foreground mb-6">Detailed Pool Analysis</h2>

              {/* Pool Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Pool Configuration</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">Token 0</span>
                      <span className="text-foreground font-mono">LUKAS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">Token 1</span>
                      <span className="text-foreground font-mono">USDC</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">Fee Tier</span>
                      <span className="text-foreground font-mono">0.30%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Liquidity Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">Total Liquidity</span>
                      <span className="text-foreground font-mono">$10.2K</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">LUKAS Locked</span>
                      <span className="text-foreground font-mono">10.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">USDC Locked</span>
                      <span className="text-foreground font-mono">0.976</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">Liquidity Providers</span>
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Trading Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">Total Swaps</span>
                      <span className="text-foreground font-mono">42</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">24h Swaps</span>
                      <span className="text-foreground font-mono">8</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Price Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="text-foreground font-mono">1.024</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
                      <span className="text-muted-foreground">24h High</span>
                      <span className="text-foreground font-mono">1.032</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 transition-colors duration-200">
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
    </div>
  );
}
