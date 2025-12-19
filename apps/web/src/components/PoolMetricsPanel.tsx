'use client';

// Type definitions for pool metrics (matching SDK types)
interface PoolState {
  price: number;
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
  volume24h: number;
  feeGrowthToken0: bigint;
  feeGrowthToken1: bigint;
}

interface UsePoolMetricsResult {
  price: number | null;
  poolState: PoolState | null;
  loading: boolean;
  error: Error | null;
  volume24h: bigint | number | null;
  priceDeviation: number | null;
  refresh: () => Promise<void>;
}

export interface PoolMetricsPanelProps {
  poolMetrics: UsePoolMetricsResult;
  loading?: boolean;
  error?: Error | null;
}

/**
 * Pool Metrics Panel Component
 * 
 * Displays key pool metrics with proper theme support using CSS variables.
 */
export function PoolMetricsPanel({
  poolMetrics,
  loading = false,
}: PoolMetricsPanelProps) {
  const formatNumber = (num: number | bigint | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    const n = typeof num === 'bigint' ? Number(num) : num;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  };

  const totalLiquidity = poolMetrics.poolState
    ? (Number(poolMetrics.poolState.liquidity) / 1e18) * (poolMetrics.price || 0)
    : null;

  const isSignificantDeviation = poolMetrics.priceDeviation
    ? Math.abs(poolMetrics.priceDeviation) > 2
    : false;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Current Price */}
        <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-muted-foreground">Current Price</h3>
            {loading && <span className="text-[8px] sm:text-[10px] text-muted-foreground">Updating...</span>}
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">{formatPrice(poolMetrics.price)}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">LUKAS per USDC</p>
        </div>

        {/* Total Liquidity */}
        <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-muted-foreground">Total Liquidity</h3>
            {loading && <span className="text-[8px] sm:text-[10px] text-muted-foreground">Updating...</span>}
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">${formatNumber(totalLiquidity)}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            {poolMetrics.poolState ? `${(Number(poolMetrics.poolState.liquidity) / 1e18).toFixed(2)} LUKAS` : 'N/A'}
          </p>
        </div>

        {/* 24h Volume */}
        <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-muted-foreground">24h Volume</h3>
            {loading && <span className="text-[8px] sm:text-[10px] text-muted-foreground">Updating...</span>}
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">${formatNumber(poolMetrics.volume24h)}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Trading volume</p>
        </div>

        {/* Fee Tier */}
        <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-muted-foreground">Fee Tier</h3>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">0.30%</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Pool fee percentage</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Pool State Details */}
        {poolMetrics.poolState && (
          <div className="p-3 sm:p-4 bg-card rounded-lg border border-border transition-colors duration-200">
            <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Pool State</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Current Tick:</span>
                <span className="font-mono text-foreground">{poolMetrics.poolState.tick}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">sqrtPriceX96:</span>
                <span className="font-mono text-foreground text-[10px] sm:text-xs">
                  {poolMetrics.poolState.sqrtPriceX96.toString().slice(0, 15)}...
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Liquidity:</span>
                <span className="font-mono text-foreground">
                  {(Number(poolMetrics.poolState.liquidity) / 1e18).toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Deviation Warning */}
        <div className={`p-3 sm:p-4 rounded-lg border transition-colors duration-200 ${
          isSignificantDeviation
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-green-500/10 border-green-500/30'
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl">{isSignificantDeviation ? '⚠️' : '✅'}</span>
            <div>
              <h3 className={`font-semibold mb-1 text-sm sm:text-base ${
                isSignificantDeviation ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
              }`}>
                Price Deviation
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {poolMetrics.priceDeviation !== null
                  ? `${poolMetrics.priceDeviation.toFixed(2)}% from fair value`
                  : 'Calculating...'}
              </p>
              {isSignificantDeviation && (
                <p className="text-[10px] sm:text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-2">
                  Price has deviated more than 2% from fair value. Monitor closely.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => poolMetrics.refresh()}
          disabled={loading}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>
    </div>
  );
}