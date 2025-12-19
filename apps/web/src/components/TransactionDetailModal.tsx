'use client';

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

export interface TransactionDetailModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Transaction to display
   */
  transaction?: Transaction | null;
  /**
   * Callback when modal closes
   */
  onClose: () => void;
}

/**
 * Transaction Detail Modal Component
 * 
 * Displays full transaction details including:
 * - Transaction hash
 * - Gas used
 * - Block number
 * - All transaction parameters
 * 
 * Requirements: 4.4
 */
export function TransactionDetailModal({
  isOpen,
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  // Format address
  const formatAddress = (address: string): string => {
    if (!address) return 'Unknown';
    return address;
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Status</span>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-gray-600 dark:text-gray-400 font-medium">Transaction Hash</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white break-all font-mono">
                {transaction.hash}
              </code>
              <a
                href={`https://amoy.polygonscan.com/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
              >
                View on Polygonscan
              </a>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Type</span>
            <span className="text-gray-900 dark:text-white">{getTypeLabel(transaction.type)}</span>
          </div>

          {/* From Address */}
          <div className="space-y-2">
            <label className="text-gray-600 dark:text-gray-400 font-medium">From Address</label>
            <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white break-all font-mono">
              {formatAddress(transaction.from)}
            </code>
          </div>

          {/* Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-600 dark:text-gray-400 font-medium">Input Token</label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                {transaction.tokenIn}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gray-600 dark:text-gray-400 font-medium">Output Token</label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                {transaction.tokenOut}
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-600 dark:text-gray-400 font-medium">Amount In</label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white font-mono">
                {formatAmount(transaction.amountIn)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gray-600 dark:text-gray-400 font-medium">Amount Out</label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white font-mono">
                {formatAmount(transaction.amountOut)}
              </div>
            </div>
          </div>

          {/* Price Impact */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Price Impact</span>
            <span className={`font-medium ${
              transaction.priceImpact > 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
            }`}>
              {transaction.priceImpact.toFixed(2)}%
            </span>
          </div>

          {/* Block Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Block Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium">Block Number</label>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white font-mono">
                  {transaction.blockNumber}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium">Gas Used</label>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white font-mono">
                  {transaction.gasUsed.toString()}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <label className="text-gray-600 dark:text-gray-400 font-medium">Timestamp</label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
              {formatDate(transaction.timestamp)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
