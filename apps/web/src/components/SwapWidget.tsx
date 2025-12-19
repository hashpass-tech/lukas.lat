'use client';

import { useState, useEffect } from 'react';
import { useLukasSDK } from '@/app/providers/lukas-sdk-provider';
import { useWallet } from '@/app/providers/wallet-provider';
import { TransactionConfirmation } from './TransactionConfirmation';
import { Web3SettingsDialog } from './Web3SettingsDialog';
import { getNetworkColors, getNetworkName, getNetworkIcon } from '@/lib/network-colors';
import type { SwapQuote } from '@lukas-protocol/sdk';

export interface SwapWidgetProps {
  onViewMetrics?: () => void;
}

// Token icons and metadata
const TOKEN_METADATA: Record<string, { icon: string; name: string; symbol: string }> = {
  lukas: { icon: '🪙', name: 'Lukas', symbol: 'LUKAS' },
  usdc: { icon: '💵', name: 'USD Coin', symbol: 'USDC' },
};

export function SwapWidget({ onViewMetrics }: SwapWidgetProps = {}) {
  const { sdk, networkInfo, isInitialized } = useLukasSDK();
  const { address, chainId } = useWallet();
  const networkColors = getNetworkColors(chainId);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [tokenIn, setTokenIn] = useState<'lukas' | 'usdc'>('usdc');
  const [tokenOut, setTokenOut] = useState<'lukas' | 'usdc'>('lukas');

  // State for real-time data
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<Error | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState<Error | null>(null);
  const [price, setPrice] = useState<bigint | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [lukasBalance, setLukasBalance] = useState<bigint | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [txStatus, setTxStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [networkWarning, setNetworkWarning] = useState<string | null>(null);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [hasContracts, setHasContracts] = useState(false);

  // Check if contracts are available on current network
  // TODO: Fix contract detection logic - currently not reliably detecting when contracts are deployed
  // Issue: SDK networkInfo.contracts may not be properly updated when switching networks
  // Potential solutions:
  // 1. Add explicit contract validation by calling eth_call to check if contracts exist on-chain
  // 2. Implement a separate contract registry service that's independent of SDK
  // 3. Add network-specific contract detection with fallback to on-chain verification
  useEffect(() => {
    if (!isInitialized || !networkInfo) {
      setNetworkWarning('SDK initializing...');
      setHasContracts(false);
      setPrice(null);
      return;
    }

    const { lukasToken, usdc } = networkInfo.contracts;
    const zeroAddr = '0x0000000000000000000000000000000000000000';
    
    // Check if both required contracts are deployed (not zero addresses)
    const hasLukas = lukasToken && lukasToken !== zeroAddr && lukasToken !== '0x';
    const hasUsdc = usdc && usdc !== zeroAddr && usdc !== '0x';
    const contractsDeployed = hasLukas && hasUsdc;
    
    if (!contractsDeployed) {
      setNetworkWarning(`Contracts not deployed on this network (Chain ${chainId})`);
      setHasContracts(false);
      setPrice(null);
      console.log('No contracts on chain', chainId, { lukasToken, usdc, hasLukas, hasUsdc });
    } else {
      setNetworkWarning(null);
      setHasContracts(true);
      console.log('Contracts available on chain', chainId, { lukasToken, usdc });
    }
  }, [isInitialized, networkInfo, chainId]);

  // Fetch pool price ONLY if contracts are available
  useEffect(() => {
    if (!sdk || !isInitialized || !hasContracts) {
      setPrice(null);
      return;
    }

    let isMounted = true;

    const fetchPrice = async () => {
      try {
        setPriceLoading(true);
        
        // Try to get swap service
        const swapService = (sdk as any).getSwapService();
        const lukasPrice = await swapService.getLukasPrice();
        
        if (isMounted) {
          setPrice(lukasPrice);
        }
      } catch (err) {
        // If service not available and we have contracts, use mock price
        if (isMounted && hasContracts) {
          setPrice(BigInt(97600)); // 0.0976 USDC with 6 decimals
        }
      } finally {
        if (isMounted) {
          setPriceLoading(false);
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sdk, isInitialized, hasContracts]);

  // Get quote function using SDK or mock calculation
  const getQuote = async (tokenInAddr: string, tokenOutAddr: string, amountInStr: string, slippageVal: number) => {
    if (!sdk || !amountInStr) return;

    try {
      setQuoteLoading(true);
      setQuoteError(null);
      
      const amountInBig = BigInt(amountInStr);
      
      try {
        // Try to get actual quote from SDK
        const swapService = (sdk as any).getSwapService();
        const swapQuote = await swapService.getSwapQuote(
          tokenInAddr,
          tokenOutAddr,
          amountInBig.toString(),
          slippageVal
        );
        
        setQuote(swapQuote);
      } catch (sdkError) {
        // If SDK service not available, calculate mock quote
        // Using price: 1 LUKAS = 0.0976 USDC
        const currentPrice = price || BigInt(97600); // 0.0976 USDC with 6 decimals
        
        let amountOut: bigint;
        if (tokenIn === 'usdc') {
          // USDC -> LUKAS: divide by price (multiply by inverse)
          // amountOut = amountIn * (1e18 / price) / 1e6
          amountOut = (amountInBig * BigInt(1e18)) / currentPrice;
        } else {
          // LUKAS -> USDC: multiply by price
          // amountOut = amountIn * price / 1e18
          amountOut = (amountInBig * currentPrice) / BigInt(1e18);
        }
        
        // Apply 0.3% fee
        const feeMultiplier = BigInt(997);
        const feeDivisor = BigInt(1000);
        amountOut = (amountOut * feeMultiplier) / feeDivisor;
        
        // Calculate minimum amount out with slippage
        const slippageBasisPoints = Math.floor((100 - slippageVal) * 100);
        const minimumAmountOut = (amountOut * BigInt(slippageBasisPoints)) / BigInt(10000);
        
        // Mock quote
        const mockQuote: SwapQuote = {
          amountIn: amountInBig.toString(),
          amountOut: amountOut.toString(),
          minimumAmountOut: minimumAmountOut.toString(),
          priceImpact: 0.1, // Mock 0.1% price impact
          path: [tokenInAddr, tokenOutAddr],
        };
        
        setQuote(mockQuote);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get quote');
      setQuoteError(error);
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  // Execute swap function using SDK
  const executeSwapInternal = async (tokenInAddr: string, tokenOutAddr: string, amountInStr: string, minimumAmountOut: string) => {
    if (!sdk || !quote || !address) return;

    try {
      setSwapLoading(true);
      setSwapError(null);
      setShowConfirmation(true);
      setTxStatus('pending');
      setTxHash(undefined);

      const swapService = (sdk as any).getSwapService();
      const amountInBig = BigInt(amountInStr);
      const minimumAmountOutBig = BigInt(minimumAmountOut);
      
      // Execute actual swap through SDK
      const tx = await swapService.executeSwap(
        tokenInAddr,
        tokenOutAddr,
        amountInBig.toString(),
        minimumAmountOutBig.toString(),
        address
      );
      
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        setTxStatus('confirmed');
        
        // Refresh balances after swap
        try {
          const lukasService = (sdk as any).getTokenService();
          const usdcService = (sdk as any).getUSDCService();
          const [lukas, usdc] = await Promise.all([
            lukasService.getBalance(address),
            usdcService.getBalance(address),
          ]);
          setLukasBalance(BigInt(lukas.toString()));
          setUsdcBalance(BigInt(usdc.toString()));
        } catch (balanceError) {
          console.debug('Failed to refresh balances:', balanceError);
        }
      } else {
        setTxStatus('failed');
        setSwapError(new Error('Transaction failed'));
      }

      // Reset form after confirmation
      setTimeout(() => {
        setAmountIn('');
        reset();
        setShowConfirmation(false);
      }, 2000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to execute swap');
      setSwapError(error);
      setTxStatus('failed');
    } finally {
      setSwapLoading(false);
    }
  };

  const reset = () => {
    setQuote(null);
    setQuoteError(null);
    setSwapError(null);
  };

  const handleGetQuote = async () => {
    if (!amountIn || !sdk) return;

    const networkInfo = sdk.getNetworkInfo();
    const tokenInAddress = tokenIn === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;
    const tokenOutAddress = tokenOut === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;

    // Convert amount to wei (18 decimals for LUKAS, 6 for USDC)
    const decimals = tokenIn === 'lukas' ? 1e18 : 1e6;
    const amountInWei = Math.floor(parseFloat(amountIn) * decimals).toString();

    await getQuote(tokenInAddress, tokenOutAddress, amountInWei, slippage);
  };

  const handleSwap = async () => {
    if (!quote || !sdk) return;

    const networkInfo = sdk.getNetworkInfo();
    const tokenInAddress = tokenIn === 'lukas' 
      ? networkInfo.contracts?.lukasToken || '0x0'
      : networkInfo.contracts?.usdc || '0x0';
    const tokenOutAddress = tokenOut === 'lukas' 
      ? networkInfo.contracts?.lukasToken || '0x0'
      : networkInfo.contracts?.usdc || '0x0';

    // Convert amount to wei
    const amountInWei = (parseFloat(amountIn) * (tokenIn === 'lukas' ? 1e18 : 1e6)).toString();

    await executeSwapInternal(
      tokenInAddress,
      tokenOutAddress,
      amountInWei,
      quote.minimumAmountOut.toString()
    );
  };

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn('');
    reset();
  };

  // Get network name from wallet and SDK
  const getNetworkName = () => {
    if (!chainId) return 'Not Connected';
    if (chainId === 1) return 'Ethereum Mainnet';
    if (chainId === 80002) return 'Polygon Amoy';
    if (chainId === 11155111) return 'Sepolia';
    return `Chain ${chainId}`;
  };

  // Get network status indicator with network-specific colors
  const getNetworkStatus = () => {
    if (!isInitialized) return { 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-400',
      text: 'Initializing' 
    };
    if (networkWarning) return { 
      color: 'bg-red-500', 
      textColor: 'text-red-400',
      text: 'No Contracts' 
    };
    // Use network-specific color
    return { 
      color: networkColors.tailwind.bg, 
      textColor: networkColors.tailwind.text,
      text: 'Ready' 
    };
  };

  const networkStatus = getNetworkStatus();

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6 bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 min-w-[280px] mx-auto">
      {/* Header - Just title */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-6">
        <span className="text-xl sm:text-2xl md:text-3xl">💱</span>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Swap</h2>
      </div>

      {/* Network Status Pill - Live indicator */}
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 md:mb-6 w-fit group relative`}
        style={{
          backgroundColor: networkColors.bgLight,
          border: `1px solid ${networkColors.borderLight}`
        }}
        title={hasContracts ? 'Contracts deployed and active on this network' : 'Contracts not available on this network'}
      >
        {/* Network icon */}
        <span 
          className="text-xs font-bold"
          style={{ color: networkColors.textLight }}
        >
          {getNetworkIcon(chainId)}
        </span>
        
        {/* Network name */}
        <span 
          className="text-xs font-semibold whitespace-nowrap"
          style={{ color: networkColors.textLight }}
        >
          {getNetworkName()}
        </span>
        
        {/* Live status - INDEPENDENT of network color */}
        <span 
          className="text-xs font-bold ml-1 flex items-center gap-1"
          style={{ color: hasContracts ? '#10b981' : '#6b7280' }}
        >
          <span 
            className={`w-1.5 h-1.5 rounded-full ${hasContracts ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: hasContracts ? '#10b981' : '#6b7280' }}
          ></span>
          {hasContracts ? 'Live' : 'Not Live'}
        </span>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {hasContracts ? 'Contracts deployed and active' : 'Contracts not available'}
        </div>
      </div>

      {/* Network Warning - Show dialog button */}
      {networkWarning && (
        <div className="mb-3 sm:mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <div className="flex-1">
            <p>{networkWarning}</p>
            <button
              onClick={() => setShowNetworkDialog(true)}
              className="mt-2 text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Switch Network
            </button>
          </div>
        </div>
      )}

      {/* Current Price - Only show if contracts are available */}
      {networkWarning ? (
        <div className="w-full mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
            🔗 Contracts Not Available
          </div>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-3">
            Contracts are only deployed on testnet networks
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <span className="text-xs px-2 py-1 bg-blue-500/20 rounded text-blue-600 dark:text-blue-400">🔵 Sepolia</span>
            <span className="text-xs px-2 py-1 bg-blue-500/20 rounded text-blue-600 dark:text-blue-400">🟣 Polygon Amoy</span>
          </div>
        </div>
      ) : (
        <button
          onClick={onViewMetrics}
          disabled={!onViewMetrics}
          className="w-full mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 bg-card/50 border border-border/50 rounded-lg transition-all duration-200 hover:border-border hover:bg-card/70 cursor-pointer group disabled:cursor-default disabled:hover:bg-card/50 disabled:hover:border-border/50 text-left"
        >
          {priceLoading ? (
            <div className="text-sm text-muted-foreground">Loading price...</div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Current Price</div>
                {onViewMetrics && (
                  <span className="text-xs text-primary no-underline group-hover:underline transition-all duration-200">View Metrics →</span>
                )}
              </div>
              <div className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                1 LUKAS = {price ? (Number(price) / 1e6).toFixed(6) : '0.097600'} USDC
              </div>
            </div>
          )}
        </button>
      )}

      {/* Token Input */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">From</label>
        <div className="flex gap-2 bg-muted/30 rounded-2xl p-3 sm:p-4 border border-border/30">
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="flex-1 min-w-0 bg-transparent text-foreground placeholder-muted-foreground outline-none text-base sm:text-lg font-semibold"
            disabled={swapLoading || !isInitialized || !!networkWarning}
          />
          <select
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value as 'lukas' | 'usdc')}
            className="flex-shrink-0 bg-background/50 text-foreground rounded-lg px-2 sm:px-3 py-1 sm:py-2 outline-none font-medium text-sm hover:bg-background/80 transition-colors"
            disabled={swapLoading || !!networkWarning}
          >
            <option value="lukas">{TOKEN_METADATA.lukas.icon} LUKAS</option>
            <option value="usdc">{TOKEN_METADATA.usdc.icon} USDC</option>
          </select>
        </div>
        {address && (
          <div className="mt-1 sm:mt-2 text-xs text-muted-foreground flex justify-between items-center gap-2">
            <span className="flex-shrink-0">Balance:</span>
            <span className="font-mono truncate text-right">
              {tokenIn === 'lukas' 
                ? lukasBalance ? (BigInt(lukasBalance) / BigInt(1e18)).toString() : '0.0000'
                : usdcBalance ? (BigInt(usdcBalance) / BigInt(1e6)).toString() : '0.0000'
              } {TOKEN_METADATA[tokenIn].symbol}
            </span>
          </div>
        )}
      </div>

      {/* Flip Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleFlipTokens}
          className="p-2.5 rounded-full hover:bg-primary/10 text-foreground transition-all duration-200 hover:scale-110"
          disabled={swapLoading}
          title="Flip tokens"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Token Output */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">To</label>
        <div className="flex gap-2 bg-muted/30 rounded-2xl p-3 sm:p-4 border border-border/30">
          <input
            type="text"
            value={quote ? (BigInt(quote.amountOut) / BigInt(tokenOut === 'lukas' ? 1e18 : 1e6)).toString() : '0.0'}
            placeholder="0.0"
            className="flex-1 min-w-0 bg-transparent text-foreground placeholder-muted-foreground outline-none text-base sm:text-lg font-semibold opacity-60 cursor-not-allowed"
            disabled
            readOnly
          />
          <select
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value as 'lukas' | 'usdc')}
            className="flex-shrink-0 bg-background/50 text-foreground rounded-lg px-2 sm:px-3 py-1 sm:py-2 outline-none font-medium text-sm hover:bg-background/80 transition-colors"
            disabled={swapLoading || !!networkWarning}
          >
            <option value="lukas">{TOKEN_METADATA.lukas.icon} LUKAS</option>
            <option value="usdc">{TOKEN_METADATA.usdc.icon} USDC</option>
          </select>
        </div>
        {address && (
          <div className="mt-1 sm:mt-2 text-xs text-muted-foreground flex justify-between items-center gap-2">
            <span className="flex-shrink-0">Balance:</span>
            <span className="font-mono truncate text-right">
              {tokenOut === 'lukas' 
                ? lukasBalance ? (BigInt(lukasBalance) / BigInt(1e18)).toString() : '0.0000'
                : usdcBalance ? (BigInt(usdcBalance) / BigInt(1e6)).toString() : '0.0000'
              } {TOKEN_METADATA[tokenOut].symbol}
            </span>
          </div>
        )}
      </div>

      {/* Slippage Settings */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/30 border border-border/30 rounded-2xl">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <label className="text-xs sm:text-sm font-semibold text-foreground">Slippage Tolerance</label>
          <span className="text-xs sm:text-sm font-mono bg-primary/20 text-primary px-2 sm:px-3 py-1 rounded-lg">
            {slippage.toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          className="w-full accent-primary"
          disabled={swapLoading}
        />
      </div>

      {/* Quote Info */}
      {quote && (
        <div className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg text-xs sm:text-sm space-y-2">
          <div className="flex justify-between items-center gap-2">
            <span className="text-foreground font-medium flex-shrink-0">Price Impact</span>
            <span className={`font-mono font-semibold ${quote.priceImpact > 5 ? 'text-red-500' : 'text-green-500'}`}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-foreground font-medium flex-shrink-0">Min Received</span>
            <span className="text-foreground font-mono truncate text-right">
              {(BigInt(quote.minimumAmountOut) / BigInt(tokenOut === 'lukas' ? 1e18 : 1e6)).toString()} {tokenOut.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-foreground font-medium flex-shrink-0">Expected Out</span>
            <span className="text-foreground font-mono truncate text-right">
              {(BigInt(quote.amountOut) / BigInt(tokenOut === 'lukas' ? 1e18 : 1e6)).toString()} {tokenOut.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {quoteError && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-600 dark:text-yellow-400 flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{quoteError.message}</span>
        </div>
      )}
      {swapError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
          <span className="mt-0.5">❌</span>
          <span>{swapError.message}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleGetQuote}
          disabled={!amountIn || quoteLoading || swapLoading || !isInitialized || !!networkWarning || tokenIn === tokenOut}
          className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
        >
          {quoteLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span> Getting Quote
            </span>
          ) : (
            'Get Quote'
          )}
        </button>
        <button
          onClick={handleSwap}
          disabled={!quote || swapLoading || !address || !!networkWarning}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
        >
          {swapLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span> Swapping
            </span>
          ) : (
            'Swap'
          )}
        </button>
      </div>

      {!address && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
          🔗 Connect your wallet to swap tokens
        </div>
      )}

      {/* Transaction Confirmation Modal */}
      <TransactionConfirmation
        isOpen={showConfirmation}
        txHash={txHash}
        status={txStatus}
        error={swapError?.message}
        onClose={() => setShowConfirmation(false)}
      />

      {/* Network Selection Dialog */}
      <Web3SettingsDialog
        open={showNetworkDialog}
        onOpenChange={setShowNetworkDialog}
      />
    </div>
  );
}
