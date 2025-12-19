'use client';

import { useState, useEffect } from 'react';
import { useLukasSDK } from '@/app/providers/lukas-sdk-provider';
import { usePoolMetrics } from '../hooks/usePoolMetrics';
import { PriceChart } from './PriceChart';

interface Transaction {
  hash: string;
  type: 'swap' | 'liquidity' | 'initialize';
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  from?: string;
  amount?: string;
}

export interface MonitoringDashboardProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Unified Pool Monitoring Dashboard
 * 
 * Combines metrics, transactions, and activity in one responsive component
 * with proper dark/light theme support using CSS variables.
 */
export function MonitoringDashboard(): JSX.Element {
  const { sdk } = useLukasSDK();
  const poolMetrics = usePoolMetrics(10000);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'activity'>('overview');
  const [isInitialized, setIsInitialized] = useState(false);
  const [transactions] = useState<Transaction[]>([
    {
      hash: '0xbc78a6a1ad3b9f90a1f5187e79a26ab3bc80d847766f54ef9ab5dfc239e1e746',
      type: 'liquidity',
      timestamp: Date.now() - 300000,
      status: 'confirmed',
      from: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      amount: '10 LUKAS + 0.976 USDC',
    },
    {
      hash: '0x' + Math.random().toString(16).slice(2, 66),
      type: 'initialize',
      timestamp: Date.now() - 600000,
      status: 'confirmed',
      from: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
    },
  ]);

  const poolAddress = '0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E';

  useEffect(() => {
    if (sdk && !isInitialized) setIsInitialized(true);
  }, [sdk, isInitialized]);

  useEffect(() => {
    if (poolMetrics.error) console.error('Pool metrics error:', poolMetrics.error);
  }, [poolMetrics.error]);

  const formatNumber = (num: number | bigint | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    const n = typeof num === 'bigint' ? Number(num) : num;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap': return '🔄';
      case 'liquidity': return '💧';
      case 'initialize': return '🚀';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'swap': return 'Swap';
      case 'liquidity': return 'Add Liquidity';
      case 'initialize': return 'Initialize Pool';
      default: return 'Transaction';
    }
  };

  const totalLiquidity = poolMetrics.poolState
    ? (Number(poolMetrics.poolState.liquidity) / 1e18) * (poolMetrics.price || 0)
    : null;

  const isSignificantDeviation = poolMetrics.priceDeviation
    ? Math.abs(poolMetrics.priceDeviation) > 2
    : false;

  if (!sdk) {
    return (
      <div className="w-full p-4 sm:p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg transition-colors duration-200">
        <div className="flex items-start gap-3">
          <span className="text-xl sm:text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">SDK Not Initialized</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Connect your wallet to view pool metrics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card/50 backdrop-blur border border-border rounded-lg overflow-hidden transition-colors duration-200 relative">
      {/* Header */}
      <div className="border-b border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Pool Monitoring</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Real-time LUKAS/USDC metrics</p>
          </div>
          <span className="self-start px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">
            DEMO DATA
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border px-2 sm:px-6 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max sm:min-w-0">
          {(['overview', 'chart', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'chart' ? 'Price Chart' : 'Transactions'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
                <p className="text-muted-foreground text-[10px] sm:text-xs mb-1">Current Price</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{formatPrice(poolMetrics.price)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">LUKAS/USDC</p>
              </div>
              <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
                <p className="text-muted-foreground text-[10px] sm:text-xs mb-1">Total Liquidity</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">${formatNumber(totalLiquidity)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {poolMetrics.poolState ? `${(Number(poolMetrics.poolState.liquidity) / 1e18).toFixed(2)} LUKAS` : 'N/A'}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
                <p className="text-muted-foreground text-[10px] sm:text-xs mb-1">24h Volume</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">${formatNumber(poolMetrics.volume24h)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Trading volume</p>
              </div>
              <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
                <p className="text-muted-foreground text-[10px] sm:text-xs mb-1">Fee Tier</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">0.30%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Pool fee</p>
              </div>
            </div>

            {/* Pool State + Price Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Pool State */}
              {poolMetrics.poolState && (
                <div className="bg-card rounded-lg border border-border p-3 sm:p-4 transition-colors duration-200">
                  <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Pool State</h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Current Tick</span>
                      <span className="font-mono text-foreground">{poolMetrics.poolState.tick}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">sqrtPriceX96</span>
                      <span className="font-mono text-foreground text-[10px] sm:text-xs">{poolMetrics.poolState.sqrtPriceX96.toString().slice(0, 12)}...</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Liquidity</span>
                      <span className="font-mono text-foreground">{(Number(poolMetrics.poolState.liquidity) / 1e18).toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Status */}
              <div className={`p-3 sm:p-4 rounded-lg border transition-colors duration-200 ${
                isSignificantDeviation
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl">{isSignificantDeviation ? '⚠️' : '✅'}</span>
                  <div>
                    <p className={`font-medium text-sm sm:text-base ${isSignificantDeviation ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                      Price Deviation: {poolMetrics.priceDeviation !== null ? `${poolMetrics.priceDeviation.toFixed(2)}%` : 'Calculating...'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {isSignificantDeviation ? 'Price deviated >2% from fair value' : 'Within normal range'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Tab */}
        {activeTab === 'chart' && (
          <PriceChart loading={poolMetrics.loading} error={poolMetrics.error} height={280} />
        )}

        {/* Transactions Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Recent Transactions</h3>
              <a
                href={`https://amoy.polygonscan.com/address/${poolAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View All →
              </a>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No transactions yet</div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <a
                    key={tx.hash}
                    href={`https://amoy.polygonscan.com/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 sm:p-4 bg-card hover:bg-accent/50 border border-border rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-lg sm:text-xl">{getTypeIcon(tx.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{getTypeLabel(tx.type)}</span>
                            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">{tx.status}</span>
                          </div>
                          {tx.amount && <p className="text-xs text-muted-foreground truncate">{tx.amount}</p>}
                          {tx.from && <p className="text-[10px] text-muted-foreground font-mono">From: {truncateAddress(tx.from)}</p>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{formatTime(tx.timestamp)}</p>
                        <p className="text-[10px] text-primary">View →</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Pool Address Footer */}
            <div className="pt-3 border-t border-border mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pool Address:</span>
                <a
                  href={`https://amoy.polygonscan.com/address/${poolAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono"
                >
                  {truncateAddress(poolAddress)}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-end mt-4 sm:mt-6">
          <button
            onClick={() => poolMetrics.refresh()}
            disabled={poolMetrics.loading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {poolMetrics.loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {poolMetrics.loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="bg-card px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border border-border">
            <p className="text-foreground text-sm">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}