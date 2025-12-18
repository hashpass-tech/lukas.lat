'use client';

import { useState } from 'react';
import { useLukasProtocol } from '../hooks/useLukasProtocol';
// import { useSwap, useLukasPrice, useTokenBalance } from '@lukas-protocol/sdk/react';
import { useAccount } from 'wagmi';

export function SwapWidget() {
  const { sdk } = useLukasProtocol();
  const { address } = useAccount();
  
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [tokenIn, setTokenIn] = useState<'lukas' | 'usdc'>('usdc');
  const [tokenOut, setTokenOut] = useState<'lukas' | 'usdc'>('lukas');

  // TODO: Re-enable when SDK React hooks are fully integrated
  // const { quote, quoteLoading, quoteError, swapLoading, swapError, getQuote, executeSwap, reset } = useSwap(sdk, {
  //   defaultSlippage: slippage,
  // });

  // const { price, loading: priceLoading, error: priceError } = useLukasPrice(sdk, {
  //   refreshInterval: 10000, // Refresh every 10 seconds
  // });

  // const { balance: lukasBalance } = useTokenBalance(sdk, address, 'lukas');
  // const { balance: usdcBalance } = useTokenBalance(sdk, address, 'usdc');

  // Mock data for now
  const quote = null;
  const quoteLoading = false;
  const quoteError = null;
  const swapLoading = false;
  const swapError = null;
  const getQuote = async (tokenIn: string, tokenOut: string, amountIn: string, slippage: number) => {};
  const executeSwap = async (tokenIn: string, tokenOut: string, amountIn: string, minimumAmountOut: string) => {};
  const reset = () => {};
  const priceLoading = false;
  const priceError = null;
  const price = null;
  const lukasBalance = null;
  const usdcBalance = null;

  const handleGetQuote = async () => {
    if (!amountIn || !sdk) return;

    const networkInfo = sdk.getNetworkInfo();
    const tokenInAddress = tokenIn === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;
    const tokenOutAddress = tokenOut === 'lukas' 
      ? networkInfo.contracts.lukasToken 
      : networkInfo.contracts.usdc;

    // Convert amount to wei (assuming 18 decimals)
    const amountInWei = (parseFloat(amountIn) * 1e18).toString();

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

    await executeSwap(
      tokenInAddress,
      tokenOutAddress,
      amountIn,
      '0'
    );
  };

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn('');
    reset();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Swap Tokens</h2>

      {/* Price Display */}
      {priceLoading ? (
        <div className="mb-4 text-sm text-gray-500">Loading price...</div>
      ) : priceError ? (
        <div className="mb-4 text-sm text-yellow-600">
          ⚠️ Pool not deployed yet. Swap functionality coming soon!
        </div>
      ) : price ? (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          1 LUKAS = {(Number(price) / 1e6).toFixed(4)} USDC
        </div>
      ) : null}

      {/* Token Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">From</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={swapLoading || !sdk}
          />
          <select
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value as 'lukas' | 'usdc')}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={swapLoading}
          >
            <option value="lukas">LUKAS</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
        {address && (
          <div className="mt-1 text-xs text-gray-500">
            Balance: {tokenIn === 'lukas' 
              ? lukasBalance ? (Number(lukasBalance) / 1e18).toFixed(4) : '0.0000'
              : usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(4) : '0.0000'
            } {tokenIn.toUpperCase()}
          </div>
        )}
      </div>

      {/* Flip Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleFlipTokens}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={swapLoading}
        >
          ↕️
        </button>
      </div>

      {/* Token Output */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">To</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={'0.0'}
            placeholder="0.0"
            className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            disabled
            readOnly
          />
          <select
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value as 'lukas' | 'usdc')}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={swapLoading}
          >
            <option value="lukas">LUKAS</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
        {address && (
          <div className="mt-1 text-xs text-gray-500">
            Balance: {tokenOut === 'lukas' 
              ? lukasBalance ? (Number(lukasBalance) / 1e18).toFixed(4) : '0.0000'
              : usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(4) : '0.0000'
            } {tokenOut.toUpperCase()}
          </div>
        )}
      </div>

      {/* Slippage Settings */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Slippage Tolerance: {slippage}%
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          className="w-full"
          disabled={swapLoading}
        />
      </div>

      {/* Quote Info */}
      {quote && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
          <div className="flex justify-between mb-1">
            <span>Price Impact:</span>
            <span className="text-gray-500">
              0.00%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Minimum Received:</span>
            <span>
              0.0000 {tokenOut.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {quoteError && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
          Error getting quote
        </div>
      )}
      {swapError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
          Error executing swap
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleGetQuote}
          disabled={!amountIn || quoteLoading || swapLoading || !sdk || tokenIn === tokenOut}
          className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {quoteLoading ? 'Getting Quote...' : 'Get Quote'}
        </button>
        <button
          onClick={handleSwap}
          disabled={!quote || swapLoading || !address}
          className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {swapLoading ? 'Swapping...' : 'Swap'}
        </button>
      </div>

      {!address && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Connect your wallet to swap tokens
        </div>
      )}
    </div>
  );
}
