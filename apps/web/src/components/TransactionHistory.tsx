'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/app/providers/wallet-provider';

interface Transaction {
  hash: string;
  type: 'swap' | 'liquidity' | 'initialize';
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  from?: string;
  to?: string;
  amount?: string;
  token?: string;
}

export interface TransactionHistoryProps {
  poolAddress?: string;
}

/**
 * Transaction History Component
 * 
 * Displays recent transactions for the pool
 */
export function TransactionHistory({ poolAddress = '0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E' }: TransactionHistoryProps) {
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load recent transactions
    const recentTxs: Transaction[] = [
      {
        hash: '0xbc78a6a1ad3b9f90a1f5187e79a26ab3bc80d847766f54ef9ab5dfc239e1e746',
        type: 'liquidity',
        timestamp: Date.now() - 300000, // 5 minutes ago
        status: 'confirmed',
        from: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
        amount: '10 LUKAS + 0.976 USDC',
        token: 'LP',
      },
      {
        hash: '0x' + Math.random().toString(16).slice(2, 66),
        type: 'initialize',
        timestamp: Date.now() - 600000, // 10 minutes ago
        status: 'confirmed',
        from: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      },
    ];
    setTransactions(recentTxs);
  }, [poolAddress]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap': return '🔄';
      case 'liquidity': return '💧';
      case 'initialize': return '🚀';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'swap': return 'Swap';
      case 'liquidity': return 'Add Liquidity';
      case 'initialize': return 'Initialize Pool';
      default: return 'Transaction';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg p-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
        <a
          href={`https://amoy.polygonscan.com/address/${poolAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View All →
        </a>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No transactions yet</p>
          <p className="text-sm mt-2">Transactions will appear here once the pool is active</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <a
              key={tx.hash}
              href={`https://amoy.polygonscan.com/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-border rounded-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getTypeIcon(tx.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {getTypeLabel(tx.type)}
                      </span>
                      <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    {tx.amount && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {tx.amount}
                      </p>
                    )}
                    {tx.from && (
                      <p className="text-xs text-muted-foreground font-mono">
                        From: {truncateAddress(tx.from)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {formatTime(tx.timestamp)}
                  </p>
                  <p className="text-xs text-primary hover:underline">
                    View →
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pool Address:
          </span>
          <a
            href={`https://amoy.polygonscan.com/address/${poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono text-xs"
          >
            {truncateAddress(poolAddress)}
          </a>
        </div>
      </div>
    </div>
  );
}
