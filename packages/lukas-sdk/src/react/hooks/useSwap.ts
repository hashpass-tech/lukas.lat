import { useState, useCallback, useRef, useEffect } from 'react';
import type { LukasSDK } from '../../core/LukasSDK';
import type { BigNumber, SwapQuote } from '../../types';
import type { TransactionResponse } from 'ethers';

export interface UseSwapOptions {
  /** Default slippage tolerance (percentage) */
  defaultSlippage?: number;
  /** Default LUKAS price in USDC (for mock quotes) */
  defaultPrice?: number;
}

export interface UseSwapResult {
  /** Current swap quote */
  quote: SwapQuote | null;
  /** Loading state for quote */
  quoteLoading: boolean;
  /** Error from quote fetching */
  quoteError: Error | null;
  /** Loading state for swap execution */
  swapLoading: boolean;
  /** Error from swap execution */
  swapError: Error | null;
  /** Transaction response from swap */
  transaction: TransactionResponse | null;
  /** Whether using mock quote */
  isMockQuote: boolean;
  /** Get a swap quote */
  getQuote: (tokenIn: string, tokenOut: string, amountIn: BigNumber, slippage?: number) => Promise<SwapQuote | null>;
  /** Execute a swap */
  executeSwap: (tokenIn: string, tokenOut: string, amountIn: BigNumber, minimumAmountOut: BigNumber, recipient?: string) => Promise<void>;
  /** Reset swap state */
  reset: () => void;
}

/**
 * Hook for token swapping operations
 * 
 * Provides swap functionality with automatic fallback to mock quotes
 * when the swap service is not available.
 */
export function useSwap(
  sdk: LukasSDK | null,
  options: UseSwapOptions = {}
): UseSwapResult {
  const { defaultSlippage = 0.5, defaultPrice = 0.0976 } = options;

  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<Error | null>(null);
  const [isMockQuote, setIsMockQuote] = useState(false);

  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState<Error | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  
  // Use ref to store SDK to avoid dependency issues
  const sdkRef = useRef(sdk);
  
  useEffect(() => {
    sdkRef.current = sdk;
  }, [sdk]);

  /**
   * Calculate a mock quote when swap service is unavailable
   */
  const calculateMockQuote = useCallback((
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber,
    slippage: number
  ): SwapQuote => {
    const amountInBig = BigInt(amountIn.toString());
    const priceInUsdc = BigInt(Math.floor(defaultPrice * 1e6)); // Price with 6 decimals
    
    // Determine if swapping USDC -> LUKAS or LUKAS -> USDC
    const isUsdcToLukas = tokenIn.toLowerCase().includes('usdc') || 
                          tokenOut.toLowerCase().includes('lukas');
    
    let amountOut: bigint;
    if (isUsdcToLukas) {
      // USDC -> LUKAS: amountOut = amountIn * (1e18 / price)
      amountOut = (amountInBig * BigInt(1e18)) / priceInUsdc;
    } else {
      // LUKAS -> USDC: amountOut = amountIn * price / 1e18
      amountOut = (amountInBig * priceInUsdc) / BigInt(1e18);
    }
    
    // Apply 0.3% fee
    amountOut = (amountOut * BigInt(997)) / BigInt(1000);
    
    // Calculate minimum with slippage
    const slippageBasisPoints = Math.floor((100 - slippage) * 100);
    const minimumAmountOut = (amountOut * BigInt(slippageBasisPoints)) / BigInt(10000);
    
    return {
      amountIn: amountInBig.toString(),
      amountOut: amountOut.toString(),
      minimumAmountOut: minimumAmountOut.toString(),
      priceImpact: 0.1, // Mock 0.1% price impact
      path: [tokenIn, tokenOut],
    };
  }, [defaultPrice]);

  const getQuote = useCallback(
    async (
      tokenIn: string,
      tokenOut: string,
      amountIn: BigNumber,
      slippage: number = defaultSlippage
    ): Promise<SwapQuote | null> => {
      const currentSdk = sdkRef.current;
      
      try {
        setQuoteLoading(true);
        setQuoteError(null);

        // Try to get quote from SDK
        if (currentSdk && typeof (currentSdk as any).getSwapService === 'function') {
          try {
            const swapService = (currentSdk as any).getSwapService();
            const swapQuote = await swapService.getSwapQuote(tokenIn, tokenOut, amountIn, slippage);
            setQuote(swapQuote);
            setIsMockQuote(false);
            return swapQuote;
          } catch (sdkError) {
            // Fall through to mock quote
            console.debug('Swap service unavailable, using mock quote:', sdkError);
          }
        }

        // Calculate mock quote
        const mockQuote = calculateMockQuote(tokenIn, tokenOut, amountIn, slippage);
        setQuote(mockQuote);
        setIsMockQuote(true);
        return mockQuote;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get swap quote');
        setQuoteError(error);
        setQuote(null);
        return null;
      } finally {
        setQuoteLoading(false);
      }
    },
    [defaultSlippage, calculateMockQuote]
  );

  const executeSwap = useCallback(
    async (
      tokenIn: string,
      tokenOut: string,
      amountIn: BigNumber,
      minimumAmountOut: BigNumber,
      recipient?: string
    ) => {
      const currentSdk = sdkRef.current;
      if (!currentSdk) {
        setSwapError(new Error('SDK not initialized'));
        return;
      }

      try {
        setSwapLoading(true);
        setSwapError(null);
        setTransaction(null);

        if (typeof (currentSdk as any).getSwapService !== 'function') {
          throw new Error('Swap service not available');
        }

        const swapService = (currentSdk as any).getSwapService();
        const tx = await swapService.executeSwap(tokenIn, tokenOut, amountIn, minimumAmountOut, recipient);
        
        setTransaction(tx);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to execute swap');
        setSwapError(error);
      } finally {
        setSwapLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setQuote(null);
    setQuoteError(null);
    setSwapError(null);
    setTransaction(null);
    setIsMockQuote(false);
  }, []);

  return {
    quote,
    quoteLoading,
    quoteError,
    swapLoading,
    swapError,
    transaction,
    isMockQuote,
    getQuote,
    executeSwap,
    reset,
  };
}
