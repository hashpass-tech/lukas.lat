/**
 * React hooks and utilities for the Lukas SDK
 * 
 * These exports are optional and only available when React is installed
 */

// Re-export everything, but make it conditional
const reactHooks: Record<string, unknown> = {};

try {
  // Only load React hooks if React is available
  if (typeof window !== 'undefined' || typeof global !== 'undefined') {
    // This will be implemented in later tasks
    // reactHooks = require('./hooks');
  }
} catch (error) {
  // React not available, hooks will be empty
}

export const {
  useTokenBalance,
  useTokenInfo,
  usePegStatus,
  useVaultStatus,
  useLiquidityPosition,
  useEventSubscription,
} = reactHooks;