import { useState, useEffect, useCallback } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { Transaction } from '../../services/PoolService';

export interface TransactionFilter {
  /** Filter by transaction type */
  type?: 'swap' | 'add_liquidity' | 'remove_liquidity';
  /** Start timestamp */
  startTime?: number;
  /** End timestamp */
  endTime?: number;
}

export interface UseTransactionHistoryOptions {
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Auto-start polling */
  autoStart?: boolean;
  /** Initial filter */
  filter?: TransactionFilter;
  /** Number of transactions to fetch */
  limit?: number;
}

export interface UseTransactionHistoryResult {
  /** Transaction history */
  transactions: Transaction[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filter */
  filter: TransactionFilter;
  /** Set filter */
  setFilter: (filter: TransactionFilter) => void;
  /** Refresh transaction history */
  refresh: () => Promise<void>;
  /** Total transaction count */
  total: number;
}

/**
 * Hook for transaction history
 */
export function useTransactionHistory(
  sdk: LukasSDK | null,
  options: UseTransactionHistoryOptions = {}
): UseTransactionHistoryResult {
  const { 
    refreshInterval = 5000, 
    autoStart = true,
    filter: initialFilter = {},
    limit = 50,
  } = options;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    if (!sdk) {
      setError(new Error('SDK not initialized'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const poolService = sdk.getPoolService();
      
      // Fetch transaction history
      const history = await poolService.getTransactionHistory(limit, 0);
      
      // Apply filters
      let filtered = history;
      
      if (filter.type) {
        filtered = filtered.filter(tx => tx.type === filter.type);
      }
      
      if (filter.startTime) {
        filtered = filtered.filter(tx => tx.timestamp >= filter.startTime!);
      }
      
      if (filter.endTime) {
        filtered = filtered.filter(tx => tx.timestamp <= filter.endTime!);
      }

      setTransactions(filtered);
      setTotal(filtered.length);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch transaction history');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [sdk, filter, limit]);

  // Set up polling
  useEffect(() => {
    if (!autoStart || !sdk) return;

    // Initial fetch
    refresh();

    // Set up interval
    const interval = setInterval(refresh, refreshInterval);

    return () => clearInterval(interval);
  }, [sdk, autoStart, refreshInterval, refresh]);

  return {
    transactions,
    loading,
    error,
    filter,
    setFilter,
    refresh,
    total,
  };
}
