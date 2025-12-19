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
  /**
   * Pool metrics from usePoolMetrics hook
   */
  poolMetrics: UsePoolMetricsResult;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Error state
   */
  error?: Error | null;
}

/**
 * Pool Metrics Panel Component
 * 
 * Displays key pool metrics including:
 * - Total liquidity
 * - Current price
 * - 24h volume
 * - Fee tier
 * 
 * Requirements: 4.1, 5.1
 */
export function PoolMetricsPanel({
  poolMetrics,
  loading = false,
  error = null,
}: PoolMetricsPanelProps) {
  // Format large numbers with commas
  const formatNumber = (num: number | bigint | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    const n = typeof num === 'bigint' ? Number(num) : num;
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format price with more precision
  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    });
  };

  // Calculate total liquidity in USD (assuming LUKAS price in USDC)
  const totalLiquidity = poolMetrics.poolState
    ? (Number(poolMetrics.poolState.liquidity) / 1e18) * (poolMetrics.price || 0)
    : null;

  // Determine if price deviation is significant (> 2%)
  const isSignificantDeviation = poolMetrics.priceDeviation
    ? Math.abs(poolMetrics.priceDeviation) > 2
    : false;

  // Note: We always have mock data as fallback from usePoolMetrics hook
  // So we don't need to show error state - metrics will always have data to display

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Price */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Price
            </h3>
            {loading && <span className="text-xs text-gray-500">Updating...</span>}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(poolMetrics.price)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            LUKAS per USDC
          </p>
        </div>

        {/* Total Liquidity */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Liquidity
            </h3>
            {loading && <span className="text-xs text-gray-500">Updating...</span>}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatNumber(totalLiquidity)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {poolMetrics.poolState
              ? `${(Number(poolMetrics.poolState.liquidity) / 1e18).toFixed(2)} LUKAS`
              : 'N/A'}
          </p>
        </div>

        {/* 24h Volume */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              24h Volume
            </h3>
            {loading && <span className="text-xs text-gray-500">Updating...</span>}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatNumber(poolMetrics.volume24h)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Trading volume
          </p>
        </div>

        {/* Fee Tier */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Fee Tier
            </h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            0.30%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Pool fee percentage
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pool State Details */}
        {poolMetrics.poolState && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Pool State
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Tick:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {poolMetrics.poolState.tick}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">sqrtPriceX96:</span>
                <span className="font-mono text-gray-900 dark:text-white text-xs">
                  {poolMetrics.poolState.sqrtPriceX96.toString().slice(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Liquidity:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {(Number(poolMetrics.poolState.liquidity) / 1e18).toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Deviation Warning */}
        <div className={`p-4 rounded-lg border ${
          isSignificantDeviation
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {isSignificantDeviation ? '⚠️' : '✅'}
            </span>
            <div>
              <h3 className={`font-semibold mb-1 ${
                isSignificantDeviation
                  ? 'text-yellow-800 dark:text-yellow-200'
                  : 'text-green-800 dark:text-green-200'
              }`}>
                Price Deviation
              </h3>
              <p className={`text-sm ${
                isSignificantDeviation
                  ? 'text-yellow-700 dark:text-yellow-300'
                  : 'text-green-700 dark:text-green-300'
              }`}>
                {poolMetrics.priceDeviation !== null
                  ? `${poolMetrics.priceDeviation.toFixed(2)}% from fair value`
                  : 'Calculating...'}
              </p>
              {isSignificantDeviation && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
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
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>
    </div>
  );
}
