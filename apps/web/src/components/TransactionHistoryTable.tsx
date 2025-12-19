'use client';

import { useState, useMemo } from 'react';

// Type definitions for transaction data
interface Transaction {
  hash: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity';
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number;
  timestamp: number;
  blockNumber: number;
  gasUsed: bigint;
  from: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TransactionHistoryTableProps {
  /**
   * Array of transactions to display
   */
  transactions: Transaction[];
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Error state
   */
  error?: Error | null;
  /**
   * Items per page for pagination
   */
  itemsPerPage?: number;
  /**
   * Callback when transaction is clicked
   */
  onTransactionClick?: (transaction: Transaction) => void;
}

/**
 * Transaction History Table Component
 * 
 * Displays a paginated table of pool transactions with:
 * - Last 50 swaps
 * - Timestamp, trader, tokens, amounts, price impact
 * - Pagination controls
 * 
 * Requirements: 4.2, 4.3
 */
export function TransactionHistoryTable({
  transactions,
  loading = false,
  error = null,
  itemsPerPage = 10,
  onTransactionClick,
}: TransactionHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  // Format address to short form
  const formatAddress = (address: string): string => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format amount
  const formatAmount = (amount: bigint, decimals: number = 18): string => {
    const num = Number(amount) / Math.pow(10, decimals);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  // Get transaction type label
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'swap':
        return 'Swap';
      case 'add_liquidity':
        return 'Add Liquidity';
      case 'remove_liquidity':
        return 'Remove Liquidity';
      default:
        return type;
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
              Error Loading Transactions
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Trader
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                From
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                To
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Amount In
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Amount Out
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Price Impact
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((tx, index) => (
              <tr
                key={`${tx.hash}-${index}`}
                onClick={() => onTransactionClick?.(tx)}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {formatDate(tx.timestamp)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {getTypeLabel(tx.type)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {formatAddress(tx.from)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {tx.tokenIn.slice(0, 6).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {tx.tokenOut.slice(0, 6).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                  {formatAmount(tx.amountIn)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                  {formatAmount(tx.amountOut)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  tx.priceImpact > 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {tx.priceImpact.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} transactions
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>Loading more transactions...</p>
        </div>
      )}
    </div>
  );
}
