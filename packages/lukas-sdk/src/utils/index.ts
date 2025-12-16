/**
 * Utility functions for the Lukas SDK
 */

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format a BigNumber to a human-readable string
 */
export function formatUnits(value: unknown): string {
  // This will be implemented with proper BigNumber handling
  return String(value);
}

/**
 * Parse a human-readable string to BigNumber
 */
export function parseUnits(value: string): unknown {
  // This will be implemented with proper BigNumber handling
  return value;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }
    
    await sleep(delay);
    return retry(fn, attempts - 1, delay * 2);
  }
}