'use client';

import { useState } from 'react';

export interface TransactionFilterOptions {
  /**
   * Start date for filtering (Unix timestamp)
   */
  startDate?: number;
  /**
   * End date for filtering (Unix timestamp)
   */
  endDate?: number;
  /**
   * Transaction types to filter by
   */
  types?: ('swap' | 'add_liquidity' | 'remove_liquidity')[];
}

export interface TransactionFilterProps {
  /**
   * Current filter options
   */
  filters: TransactionFilterOptions;
  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: TransactionFilterOptions) => void;
  /**
   * Callback to reset filters
   */
  onReset?: () => void;
}

/**
 * Transaction Filter Component
 * 
 * Provides filtering options for transaction history:
 * - Filter by date range
 * - Filter by transaction type
 * 
 * Requirements: 4.7, 4.8
 */
export function TransactionFilter({
  filters,
  onFiltersChange,
  onReset,
}: TransactionFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Format date for input
  const formatDateForInput = (timestamp?: number): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0];
  };

  // Parse date from input
  const parseDateFromInput = (dateStr: string): number | undefined => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    return Math.floor(date.getTime() / 1000);
  };

  // Handle date range change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = parseDateFromInput(e.target.value);
    onFiltersChange({
      ...filters,
      startDate,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = parseDateFromInput(e.target.value);
    onFiltersChange({
      ...filters,
      endDate,
    });
  };

  // Handle type filter change
  const handleTypeChange = (type: 'swap' | 'add_liquidity' | 'remove_liquidity') => {
    const types = filters.types || [];
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    
    onFiltersChange({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.startDate || filters.endDate || (filters.types && filters.types.length > 0);

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
      >
        <span>🔍</span>
        <span>{showAdvanced ? 'Hide Filters' : 'Show Filters'}</span>
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
            Active
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 space-y-4">
          {/* Date Range */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Date Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formatDateForInput(filters.startDate)}
                  onChange={handleStartDateChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  End Date
                </label>
                <input
                  type="date"
                  value={formatDateForInput(filters.endDate)}
                  onChange={handleEndDateChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Transaction Type</h3>
            <div className="space-y-2">
              {[
                { value: 'swap', label: 'Swaps' },
                { value: 'add_liquidity', label: 'Add Liquidity' },
                { value: 'remove_liquidity', label: 'Remove Liquidity' },
              ].map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.types?.includes(type.value as any) || false}
                    onChange={() => handleTypeChange(type.value as any)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            {hasActiveFilters && onReset && (
              <button
                onClick={onReset}
                className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(false)}
              className="flex-1 px-3 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
