'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

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
  data?: PriceDataPoint[];
  loading?: boolean;
  error?: Error | null;
  height?: number;
  onDataRequested?: () => void;
}

type TimeFrame = '1H' | '4H' | '1D' | '1W';

/**
 * Trading View Style Candlestick Chart
 * Japanese candlestick chart with volume bars
 */
export function PriceChart({
  data = [],
  loading = false,
  error = null,
  height = 500,
  onDataRequested,
}: PriceChartProps) {
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1H');
  const [hoveredCandle, setHoveredCandle] = useState<PriceDataPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const volumeCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize chart data once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (data && data.length > 0) {
      setChartData(data);
    } else {
      const mockData = generateMockPriceData(48);
      setChartData(mockData);
    }
  }, [data]);

  // Calculate chart metrics
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const volumes = chartData.map(d => d.volume || 0);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxVolume = Math.max(...volumes);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;
    
    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const change = current && previous ? current.close - previous.close : 0;
    const changePercent = previous ? (change / previous.close) * 100 : 0;
    
    return {
      minPrice: minPrice - padding,
      maxPrice: maxPrice + padding,
      maxVolume,
      priceRange: priceRange + padding * 2,
      current,
      change,
      changePercent,
      high24h: Math.max(...chartData.map(d => d.high)),
      low24h: Math.min(...chartData.map(d => d.low)),
    };
  }, [chartData]);

  // Draw candlestick chart
  useEffect(() => {
    const canvas = canvasRef.current;
    const volumeCanvas = volumeCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !volumeCanvas || !container || !metrics || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const volumeCtx = volumeCanvas.getContext('2d');
    if (!ctx || !volumeCtx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const mainHeight = height * 0.75;
    const volumeHeight = height * 0.2;

    // Set canvas dimensions
    canvas.width = width * dpr;
    canvas.height = mainHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${mainHeight}px`;
    ctx.scale(dpr, dpr);

    volumeCanvas.width = width * dpr;
    volumeCanvas.height = volumeHeight * dpr;
    volumeCanvas.style.width = `${width}px`;
    volumeCanvas.style.height = `${volumeHeight}px`;
    volumeCtx.scale(dpr, dpr);

    // Clear canvases
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, mainHeight);
    volumeCtx.fillStyle = '#0f172a';
    volumeCtx.fillRect(0, 0, width, volumeHeight);

    const padding = { left: 60, right: 20, top: 20, bottom: 30 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = mainHeight - padding.top - padding.bottom;
    const candleWidth = Math.max(4, (chartWidth / chartData.length) * 0.7);
    const candleGap = chartWidth / chartData.length;

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Price labels
      const price = metrics.maxPrice - (metrics.priceRange / 5) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(4)}`, padding.left - 5, y + 4);
    }

    // Draw candlesticks
    chartData.forEach((candle, i) => {
      const x = padding.left + i * candleGap + candleGap / 2;
      const isGreen = candle.close >= candle.open;
      
      // Calculate Y positions
      const highY = padding.top + ((metrics.maxPrice - candle.high) / metrics.priceRange) * chartHeight;
      const lowY = padding.top + ((metrics.maxPrice - candle.low) / metrics.priceRange) * chartHeight;
      const openY = padding.top + ((metrics.maxPrice - candle.open) / metrics.priceRange) * chartHeight;
      const closeY = padding.top + ((metrics.maxPrice - candle.close) / metrics.priceRange) * chartHeight;
      
      // Wick
      ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Body
      ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444';
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      
      // Volume bar
      const volumeBarHeight = ((candle.volume || 0) / metrics.maxVolume) * (volumeHeight - 10);
      volumeCtx.fillStyle = isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
      volumeCtx.fillRect(
        x - candleWidth / 2,
        volumeHeight - volumeBarHeight - 5,
        candleWidth,
        volumeBarHeight
      );
    });

    // Time labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    const labelInterval = Math.ceil(chartData.length / 8);
    chartData.forEach((candle, i) => {
      if (i % labelInterval === 0) {
        const x = padding.left + i * candleGap + candleGap / 2;
        ctx.fillText(candle.time, x, mainHeight - 10);
      }
    });

  }, [chartData, metrics, height]);

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !metrics || chartData.length === 0) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 60, right: 20 };
    const chartWidth = rect.width - padding.left - padding.right;
    const candleGap = chartWidth / chartData.length;
    
    const index = Math.floor((x - padding.left) / candleGap);
    if (index >= 0 && index < chartData.length) {
      setHoveredCandle(chartData[index]);
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setHoveredCandle(null);
    }
  }, [chartData, metrics]);

  // Note: We always generate mock data if no real data is available
  // So we don't need to show error state - chart will always have data to display

  return (
    <div className="w-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">LUKAS/USDC</h2>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                DEMO
              </span>
            </div>
            {metrics && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-white">
                  ${metrics.current?.close.toFixed(4)}
                </span>
                <span className={`text-sm font-medium ${metrics.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.change >= 0 ? '+' : ''}{metrics.change.toFixed(4)} ({metrics.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(['1H', '4H', '1D', '1W'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                timeFrame === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {metrics && (
        <div className="flex items-center gap-6 px-4 py-2 bg-slate-800/50 text-xs">
          <div>
            <span className="text-slate-400">24h High: </span>
            <span className="text-green-400 font-medium">${metrics.high24h.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-slate-400">24h Low: </span>
            <span className="text-red-400 font-medium">${metrics.low24h.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-slate-400">Open: </span>
            <span className="text-white font-medium">${chartData[0]?.open.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Chart area */}
      <div 
        ref={containerRef}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCandle(null)}
      >
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-slate-400">Loading price data...</p>
            </div>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full" />
            <canvas ref={volumeCanvasRef} className="w-full" />
            
            {/* Tooltip */}
            {hoveredCandle && (
              <div 
                className="absolute z-10 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl pointer-events-none"
                style={{ 
                  left: Math.min(mousePos.x + 10, (containerRef.current?.clientWidth || 0) - 180),
                  top: mousePos.y + 10 
                }}
              >
                <p className="text-xs text-slate-400 mb-2">{hoveredCandle.time}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-slate-400">Open:</span>
                  <span className="text-white font-mono">${hoveredCandle.open.toFixed(4)}</span>
                  <span className="text-slate-400">High:</span>
                  <span className="text-green-400 font-mono">${hoveredCandle.high.toFixed(4)}</span>
                  <span className="text-slate-400">Low:</span>
                  <span className="text-red-400 font-mono">${hoveredCandle.low.toFixed(4)}</span>
                  <span className="text-slate-400">Close:</span>
                  <span className={`font-mono ${hoveredCandle.close >= hoveredCandle.open ? 'text-green-400' : 'text-red-400'}`}>
                    ${hoveredCandle.close.toFixed(4)}
                  </span>
                  {hoveredCandle.volume && (
                    <>
                      <span className="text-slate-400">Volume:</span>
                      <span className="text-white font-mono">${hoveredCandle.volume.toFixed(0)}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Generate mock price data
 */
function generateMockPriceData(hours: number = 48): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const now = Math.floor(Date.now() / 1000);
  let basePrice = 1.0 + Math.random() * 0.05;

  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = now - i * 3600;
    const date = new Date(timestamp * 1000);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const volatility = 0.003;
    const trend = Math.sin(i / 10) * 0.001;
    const randomChange = (Math.random() - 0.5) * volatility + trend;
    
    const open = basePrice;
    const close = basePrice + randomChange;
    const high = Math.max(open, close) + Math.random() * 0.002;
    const low = Math.min(open, close) - Math.random() * 0.002;
    const volume = Math.random() * 50000 + 10000;

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
