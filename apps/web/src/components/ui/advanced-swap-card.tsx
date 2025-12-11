'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  ArrowUpDown, 
  Settings, 
  ChevronDown, 
  Zap, 
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Shared types
export interface AdvancedSwapToken {
  symbol: string;
  name: string;
  icon: string; // emoji or short label
  balance: string;
  price: number;
  change24h: number;
  address: string;
}

interface AdvancedSwapState {
  fromToken: AdvancedSwapToken;
  toToken: AdvancedSwapToken;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isLoading: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

interface AdvancedSwapCardProps {
  tokens: AdvancedSwapToken[];
  initialFromToken?: AdvancedSwapToken;
  initialToToken?: AdvancedSwapToken;
}

// Hook for click outside functionality
function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      const target = event.target;

      if (!el || !target || el.contains(target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener(mouseEvent, listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, mouseEvent]);
}

export function AdvancedSwapCard({
  tokens,
  initialFromToken,
  initialToToken,
}: AdvancedSwapCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const defaultFrom = initialFromToken || tokens[0];
  const defaultTo = initialToToken || tokens[1] || tokens[0];

  const [swapState, setSwapState] = useState<AdvancedSwapState>({
    fromToken: defaultFrom,
    toToken: defaultTo,
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    isLoading: false,
    status: 'idle',
  });

  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tokenSelectorRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useClickOutside(tokenSelectorRef, () => setShowTokenSelector(null));
  useClickOutside(settingsRef, () => setShowSettings(false));

  // Mouse tracking for glow effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    if (isHovering && !shouldReduceMotion) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovering, shouldReduceMotion]);

  // Calculate exchange rate and amounts
  useEffect(() => {
    if (swapState.fromAmount && !isNaN(Number(swapState.fromAmount))) {
      const fromValue = Number(swapState.fromAmount) * swapState.fromToken.price;
      const toAmount = (fromValue / swapState.toToken.price).toFixed(6);
      setSwapState(prev => ({ ...prev, toAmount }));
    } else {
      setSwapState(prev => ({ ...prev, toAmount: '' }));
    }
  }, [swapState.fromAmount, swapState.fromToken.price, swapState.toToken.price]);

  const handleTokenSelect = (token: AdvancedSwapToken) => {
    if (showTokenSelector === 'from') {
      setSwapState(prev => ({ ...prev, fromToken: token }));
    } else if (showTokenSelector === 'to') {
      setSwapState(prev => ({ ...prev, toToken: token }));
    }
    setShowTokenSelector(null);
  };

  const handleSwapTokens = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setSwapState(prev => ({
        ...prev,
        fromToken: prev.toToken,
        toToken: prev.fromToken,
        fromAmount: prev.toAmount,
        toAmount: prev.fromAmount,
      }));
      setIsSwapping(false);
    }, 300);
  };

  const handleSwap = async () => {
    if (!swapState.fromAmount || Number(swapState.fromAmount) <= 0) return;

    setSwapState(prev => ({ ...prev, status: 'loading', isLoading: true }));

    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSwapState(prev => ({
        ...prev,
        status: 'success',
        isLoading: false,
        fromAmount: '',
        toAmount: '',
      }));

      setTimeout(() => {
        setSwapState(prev => ({ ...prev, status: 'idle' }));
      }, 1500);
    } catch (error) {
      setSwapState(prev => ({
        ...prev,
        status: 'error',
        isLoading: false,
        error: 'Swap failed. Please try again.',
      }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        stiffness: 260,
        damping: 26,
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        stiffness: 320,
        damping: 24,
        mass: 0.6,
      },
    },
  };

  const glowVariants = {
    idle: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: { duration: 0.25 },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full max-w-md mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/25 via-accent/25 to-purple-500/20 rounded-3xl blur-xl"
        variants={glowVariants}
        animate={isHovering && !shouldReduceMotion ? 'hover' : 'idle'}
        style={{
          background: isHovering && !shouldReduceMotion
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 70%)`
            : undefined,
        }}
      />

      {/* Main swap container */}
      <motion.div
        className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl"
        variants={itemVariants}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Swap</h2>
              <p className="text-sm text-muted-foreground">Trade tokens instantly</p>
            </div>
          </div>

          <motion.button
            className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </motion.div>

        {/* From Token */}
        <motion.div className="relative mb-2" variants={itemVariants}>
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-xs px-2 py-1 rounded-full bg-muted/60 text-muted-foreground">
                Demo mode
              </span>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                className="flex items-center gap-2 bg-background/50 rounded-xl px-3 py-2 hover:bg-background/80 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTokenSelector('from')}
              >
                <span className="text-2xl">{swapState.fromToken.icon}</span>
                <span className="font-semibold">{swapState.fromToken.symbol}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.button>

              <input
                type="number"
                placeholder="0.0"
                value={swapState.fromAmount}
                onChange={(e) =>
                  setSwapState(prev => ({ ...prev, fromAmount: e.target.value }))
                }
                className="flex-1 min-w-0 bg-transparent text-right text-xl sm:text-2xl font-semibold outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Keep footer area minimal to avoid fake pricing overload */}
            <div className="flex justify-between items-center mt-2 text-[11px] text-muted-foreground">
              <span>
                1 {swapState.fromToken.symbol} · demo rates
              </span>
              {swapState.fromAmount && (
                <span className="opacity-80">Preview only</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Swap Button */}
        <motion.div className="flex justify-center -my-1 relative z-10" variants={itemVariants}>
          <motion.button
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: isSwapping ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={handleSwapTokens}
          >
            <ArrowUpDown className="w-5 h-5 text-white" />
          </motion.button>
        </motion.div>

        {/* To Token */}
        <motion.div className="relative mb-6" variants={itemVariants}>
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-xs px-2 py-1 rounded-full bg-muted/60 text-muted-foreground">
                Demo mode
              </span>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                className="flex items-center gap-2 bg-background/50 rounded-xl px-3 py-2 hover:bg-background/80 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTokenSelector('to')}
              >
                <span className="text-2xl">{swapState.toToken.icon}</span>
                <span className="font-semibold">{swapState.toToken.symbol}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.button>

              <div className="flex-1 min-w-0 text-right text-xl sm:text-2xl font-semibold text-muted-foreground break-words">
                {swapState.toAmount || '0.0'}
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-[11px] text-muted-foreground">
              <span>
                {swapState.toToken.symbol} output estimate
              </span>
              {swapState.toAmount && (
                <span className="opacity-80">Not executed</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Swap Info */}
        {swapState.fromAmount && (
          <motion.div
            className="bg-muted/15 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-muted-foreground"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25 }}
          >
            <span>Simulated quote · UI preview only</span>
            <span className="hidden sm:inline">No real swap is executed</span>
          </motion.div>
        )}

        {/* Swap Button */}
        <motion.button
          className={cn(
            'w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300',
            swapState.status === 'success'
              ? 'bg-green-500 text-white'
              : swapState.status === 'error'
              ? 'bg-red-500 text-white'
              : swapState.isLoading
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : !swapState.fromAmount || Number(swapState.fromAmount) <= 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          )}
          whileHover={
            !swapState.isLoading && swapState.fromAmount
              ? { scale: 1.02 }
              : {}
          }
          whileTap={
            !swapState.isLoading && swapState.fromAmount
              ? { scale: 0.98 }
              : {}
          }
          disabled={
            swapState.isLoading ||
            !swapState.fromAmount ||
            Number(swapState.fromAmount) <= 0
          }
          onClick={handleSwap}
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-2">
            {swapState.isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Swapping...
              </>
            ) : swapState.status === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Swap Successful!
              </>
            ) : swapState.status === 'error' ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Swap Failed
              </>
            ) : !swapState.fromAmount || Number(swapState.fromAmount) <= 0 ? (
              'Enter an amount'
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Swap Tokens
              </>
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenSelector && (
          <motion.div
            className="absolute inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <motion.div
              ref={tokenSelectorRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl p-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h3 className="text-lg font-semibold mb-4">Select Token</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tokens.map((token, index) => (
                  <motion.button
                    key={token.address}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTokenSelect(token)}
                  >
                    <span className="text-2xl">{token.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{token.balance}</div>
                      <div
                        className={cn(
                          'text-sm',
                          token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {token.change24h >= 0 ? '+' : ''}
                        {token.change24h}%
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <motion.div
              ref={settingsRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl p-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h3 className="text-lg font-semibold mb-4">Swap Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Slippage Tolerance
                  </label>
                  <div className="flex gap-2">
                    {[0.1, 0.5, 1.0].map(value => (
                      <motion.button
                        key={value}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          swapState.slippage === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-muted hover:bg-muted/80'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setSwapState(prev => ({ ...prev, slippage: value }))
                        }
                      >
                        {value}%
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
