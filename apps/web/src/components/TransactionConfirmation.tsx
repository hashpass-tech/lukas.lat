'use client';

interface TransactionConfirmationProps {
  isOpen: boolean;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
  onClose: () => void;
}

export function TransactionConfirmation({
  isOpen,
  txHash,
  status,
  error,
  onClose,
}: TransactionConfirmationProps) {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'failed':
        return '❌';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'confirmed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'confirmed':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${getBackgroundColor()} rounded-lg p-6 max-w-md w-full mx-4 border-2 ${
        status === 'pending' ? 'border-yellow-200 dark:border-yellow-800' :
        status === 'confirmed' ? 'border-green-200 dark:border-green-800' :
        'border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-2xl ${getStatusColor()}`}>{getStatusIcon()}</span>
          <h3 className={`text-lg font-bold ${getStatusColor()}`}>
            {status === 'pending' && 'Transaction Pending'}
            {status === 'confirmed' && 'Transaction Confirmed'}
            {status === 'failed' && 'Transaction Failed'}
          </h3>
        </div>

        {txHash && (
          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Transaction Hash:</p>
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all font-mono hover:underline"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-10)}
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Click to view on Polygonscan
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-sm text-red-800 dark:text-red-200">
            <p className="font-semibold mb-1">Error:</p>
            {error}
          </div>
        )}

        {status === 'pending' && (
          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while your transaction is being processed...
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          disabled={status === 'pending'}
          className={`w-full px-4 py-2 rounded font-medium transition-colors ${
            status === 'pending'
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
          }`}
        >
          {status === 'pending' ? 'Processing...' : 'Close'}
        </button>
      </div>
    </div>
  );
}
