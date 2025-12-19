'use client';

import { useState, useEffect } from 'react';
import { useLukasSDK } from '@/app/providers/lukas-sdk-provider';
import { usePoolMetrics } from '../hooks/usePoolMetrics';
import { PoolMetricsPanel } from './PoolMetricsPanel';
import { PriceChart } from './PriceChart';

export interface MonitoringDashboardProps {
  /**
   * Optional callback when dashboard loads
   */
  onLoad?: () => void;
  /**
   * Optional callback on error
   */
  onError?: (error: Error) => void;
}

/**
 * Monitoring Dashboard Component
 * 
 * Displays real-time pool metrics, transaction history, and protocol activity.
 * Integrates with usePoolMetrics hook for real-time updates.
 * 
 * Requirements: 4.1, 5.1
 */
export function MonitoringDashboard(): JSX.Element {
  const { sdk } = useLukasSDK();
  const poolMetrics = usePoolMetrics(10000);
  
  const [activeTab, setActiveTab] = useState<'metrics' | 'transactions' | 'activity'>('metrics');
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle initialization - only call onLoad once when SDK is ready
  useEffect(() => {
    if (sdk && !isInitialized) {
      setIsInitialized(true);
    }
  }, [sdk, isInitialized]);

  // Handle errors - just log them
  useEffect(() => {
    if (poolMetrics.error) {
      console.error('Pool metrics error:', poolMetrics.error);
    }
  }, [poolMetrics.error]);

  if (!sdk) {
    return (
      <div className="w-full p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              SDK Not Initialized
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please connect your wallet to view pool metrics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (poolMetrics.error && !poolMetrics.state) {
    return (
      <div className="w-full p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Using Mock Pool Data
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
              Pool service is not yet available. Displaying simulated metrics for testing.
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Real metrics will be available once the full Uniswap V4 PoolManager is integrated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pool Monitoring Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time LUKAS/USDC pool metrics and activity
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Pool Metrics
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Activity Feed
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Pool Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <PoolMetricsPanel
              poolMetrics={poolMetrics}
              loading={poolMetrics.loading}
              error={poolMetrics.error}
            />
            <PriceChart
              loading={poolMetrics.loading}
              error={poolMetrics.error}
              height={400}
            />
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Transaction history coming soon...</p>
          </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'activity' && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Activity feed coming soon...</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {poolMetrics.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-40 rounded-lg">
          <div className="bg-white dark:bg-gray-700 px-6 py-4 rounded-lg shadow-lg">
            <p className="text-gray-700 dark:text-gray-300">Loading pool data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
