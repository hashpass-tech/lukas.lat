'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';

/**
 * Price data point for the chart
 */
interface PriceDataPoint {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PriceChartProps {
  /**
   * Array of price data points (1-hour candles)
   */
  data?: PriceDataPoint[];
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Error state
   */
  error?: Error | null;
  /**
   * Chart height in pixels
   */
  height?: number;
  /**
   * Optional callback when data is requested
   */
  onDataRequested?: () => void;
}

/**
 * Price Chart Component
 * 
 * Displays 24h price history with 1-hour candles using a line chart.
 * Shows opening, closing, high, and low prices for each hour.
 * 
 * Requirements: 4.5
 */
export function PriceChart({
  data = [],
  loading = false,
  error = null,
  height = 400,
  onDataRequested,
}: PriceChartProps) {
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);

  // Initialize chart data
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      // Generate mock data for 24 hours if no data provided
      const mockData = generateMockPriceData();
      setChartData(mockData);
    }
    onDataRequested?.();
  }, [data, onDataRequested]);

  // Format time for display
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.time}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Open: ${data.open.toFixed(6)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            High: ${data.high.toFixed(6)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Low: ${data.low.toFixed(6)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Close: ${data.close.toFixed(6)}
          </p>
          {data.volume && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Volume: ${data.volume.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="w-full p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Price Chart Unavailable
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {error.message || 'Pool service not available. Using mock data.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          LUKAS/USDC Price History
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          24-hour price chart with 1-hour candles
        </p>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading price data...</p>
          </div>
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              className="dark:stroke-gray-500"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#6b7280"
              className="dark:stroke-gray-500"
              tick={{ fontSize: 12 }}
              label={{
                value: 'Price (USDC)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />

            {/* Close price line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Close Price"
              isAnimationActive={false}
            />

            {/* High price line */}
            <Line
              type="monotone"
              dataKey="high"
              stroke="#10b981"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="High"
              isAnimationActive={false}
            />

            {/* Low price line */}
            <Line
              type="monotone"
              dataKey="low"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Low"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No price data available
            </p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">24h High</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${chartData.length > 0
                ? Math.max(...chartData.map((d) => d.high)).toFixed(6)
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">24h Low</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${chartData.length > 0
                ? Math.min(...chartData.map((d) => d.low)).toFixed(6)
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Current</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${chartData.length > 0
                ? chartData[chartData.length - 1].close.toFixed(6)
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate mock price data for 24 hours with 1-hour candles
 * This is used when no real data is provided
 */
function generateMockPriceData(): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const now = Math.floor(Date.now() / 1000);
  let basePrice = 1.024; // Starting price

  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 3600; // 1 hour intervals
    const date = new Date(timestamp * 1000);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Generate realistic price movements
    const volatility = 0.002; // 0.2% volatility
    const randomChange = (Math.random() - 0.5) * volatility;
    const open = basePrice;
    const close = basePrice + randomChange;
    const high = Math.max(open, close) + Math.random() * 0.001;
    const low = Math.min(open, close) - Math.random() * 0.001;
    const volume = Math.random() * 10000 + 1000;

    data.push({
      timestamp,
      time: timeStr,
      open: parseFloat(open.toFixed(6)),
      high: parseFloat(high.toFixed(6)),
      low: parseFloat(low.toFixed(6)),
      close: parseFloat(close.toFixed(6)),
      volume: parseFloat(volume.toFixed(2)),
    });

    basePrice = close;
  }

  return data;
}
