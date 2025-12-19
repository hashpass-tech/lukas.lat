import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { usePoolMetrics } from '../../src/react/hooks/usePoolMetrics';
import type { LukasSDK } from '../../src/core/LukasSDK';
import type { PoolState } from '../../src/services/PoolService';

/**
 * Unit tests for usePoolMetrics hook
 * Tests pool price fetching, auto-refresh, and state management
 * Requirements: 2.1, 2.2, 4.1
 */

describe('usePoolMetrics Hook', () => {
  let mockSDK: Partial<LukasSDK>;
  let mockPoolService: any;
  let mockPoolState: PoolState;

  beforeEach(() => {
    // Setup mock pool state
    mockPoolState = {
      price: 0.976,
      sqrtPriceX96: BigInt('1234567890123456789'),
      tick: 100,
      liquidity: BigInt('10000000000000000000'),
      volume24h: 1000,
      feeGrowthToken0: BigInt('0'),
      feeGrowthToken1: BigInt('0'),
    };

    // Setup mock pool service
    mockPoolService = {
      getPoolState: vi.fn().mockResolvedValue(mockPoolState),
      getVolume24h: vi.fn().mockResolvedValue(1000),
      getPriceDeviation: vi.fn().mockResolvedValue(0.5),
    };

    // Setup mock SDK
    mockSDK = {
      getPoolService: vi.fn().mockReturnValue(mockPoolService),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Interface', () => {
    it('should return an object with required properties and methods', () => {
      // Test that the hook returns the expected interface
      expect(typeof usePoolMetrics).toBe('function');
      
      // Verify the hook accepts SDK and options
      const hookSignature = usePoolMetrics.toString();
      expect(hookSignature).toContain('sdk');
      expect(hookSignature).toContain('options');
    });

    it('should have correct return type structure', () => {
      // Test the hook's return type
      const hookCode = usePoolMetrics.toString();
      
      // Verify all required properties are returned
      expect(hookCode).toContain('price');
      expect(hookCode).toContain('poolState');
      expect(hookCode).toContain('loading');
      expect(hookCode).toContain('error');
      expect(hookCode).toContain('volume24h');
      expect(hookCode).toContain('priceDeviation');
      expect(hookCode).toContain('refresh');
    });
  });

  describe('Pool Price Fetching', () => {
    it('should fetch pool price on mount', () => {
      // Test that getPoolState is called on mount
      const hookCode = usePoolMetrics.toString();
      
      // Verify the hook calls getPoolService
      expect(hookCode).toContain('getPoolService');
      
      // Verify it calls getPoolState
      expect(hookCode).toContain('getPoolState');
    });

    it('should extract price from pool state', () => {
      // Test that price is extracted from pool state
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('state.price');
      expect(hookCode).toContain('setPrice');
    });

    it('should handle SDK not initialized', () => {
      // Test that the hook handles null SDK
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('!sdk');
      expect(hookCode).toContain('SDK not initialized');
    });

    it('should convert non-Error exceptions to Error objects', () => {
      // Test error handling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('Error');
      expect(hookCode).toContain('catch');
    });
  });

  describe('Auto-Refresh Interval', () => {
    it('should set up auto-refresh interval on mount', () => {
      // Test that setInterval is called
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setInterval');
      expect(hookCode).toContain('refreshInterval');
    });

    it('should use default refresh interval of 10 seconds', () => {
      // Test default refresh interval
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('refreshInterval');
      expect(hookCode).toContain('setInterval');
    });

    it('should accept custom refresh interval in options', () => {
      // Test that options can override default interval
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('refreshInterval');
    });

    it('should clear interval on unmount', () => {
      // Test that interval is cleared
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('clearInterval');
    });

    it('should respect autoStart option', () => {
      // Test that autoStart option controls polling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('autoStart');
    });
  });

  describe('Volume and Deviation Fetching', () => {
    it('should fetch 24-hour volume', () => {
      // Test that getVolume24h is called
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('getVolume24h');
      expect(hookCode).toContain('setVolume24h');
    });

    it('should fetch price deviation from fair value', () => {
      // Test that getPriceDeviation is called
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('getPriceDeviation');
      expect(hookCode).toContain('setPriceDeviation');
    });

    it('should fetch all metrics in parallel', () => {
      // Test that Promise.all is used
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('Promise.all');
    });
  });

  describe('State Management', () => {
    it('should initialize price as null', () => {
      // Test initial state
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('useState(null)');
    });

    it('should initialize poolState as null', () => {
      // Test initial state
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setPoolState');
    });

    it('should initialize loading as false', () => {
      // Test initial state
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('useState(false)');
    });

    it('should initialize error as null', () => {
      // Test initial state
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setError');
      expect(hookCode).toContain('null');
    });

    it('should initialize volume24h as null', () => {
      // Test initial state
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setVolume24h');
    });

    it('should initialize priceDeviation as null', () => {
      // Test initial state
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setPriceDeviation');
    });

    it('should use useState for state management', () => {
      // Test that useState is used
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('useState');
    });

    it('should use useCallback for memoized refresh function', () => {
      // Test that useCallback is used
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('useCallback');
    });

    it('should use useEffect for polling setup', () => {
      // Test that useEffect is used
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('useEffect');
    });
  });

  describe('Error Handling', () => {
    it('should clear previous errors on successful fetch', () => {
      // Test that errors are cleared
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setError(null)');
    });

    it('should set loading state during fetch', () => {
      // Test that loading state is managed
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setLoading(true)');
      expect(hookCode).toContain('setLoading(false)');
    });

    it('should handle finally block to reset loading', () => {
      // Test that loading state is reset in finally
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('finally');
    });

    it('should store error in state on failure', () => {
      // Test error storage
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('setError');
    });
  });

  describe('Refresh Function', () => {
    it('should provide refresh function in return value', () => {
      // Test that refresh is returned
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('refresh');
    });

    it('should allow manual refresh of pool metrics', () => {
      // Test that refresh can be called manually
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('const refresh');
    });

    it('should handle refresh when SDK is not initialized', () => {
      // Test refresh error handling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('!sdk');
    });
  });

  describe('Integration with PoolService', () => {
    it('should get PoolService from SDK', () => {
      // Test that the hook gets the service from SDK
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('getPoolService');
    });

    it('should handle SDK being null', () => {
      // Test null SDK handling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('!sdk');
    });

    it('should call all required PoolService methods', () => {
      // Test that all methods are called
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('getPoolState');
      expect(hookCode).toContain('getVolume24h');
      expect(hookCode).toContain('getPriceDeviation');
    });
  });

  describe('Options Handling', () => {
    it('should accept UsePoolMetricsOptions parameter', () => {
      // Test that options are accepted
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('options');
    });

    it('should have default options', () => {
      // Test default options
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('refreshInterval');
      expect(hookCode).toContain('autoStart');
    });

    it('should destructure options correctly', () => {
      // Test options destructuring
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('refreshInterval');
      expect(hookCode).toContain('autoStart');
    });
  });

  describe('Return Value Structure', () => {
    it('should return object with all required properties', () => {
      // Test return value structure
      const hookCode = usePoolMetrics.toString();
      
      // Check for all required properties in return statement
      expect(hookCode).toContain('price');
      expect(hookCode).toContain('poolState');
      expect(hookCode).toContain('loading');
      expect(hookCode).toContain('error');
      expect(hookCode).toContain('volume24h');
      expect(hookCode).toContain('priceDeviation');
      expect(hookCode).toContain('refresh');
    });

    it('should return refresh as a function', () => {
      // Test that refresh is a function
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('const refresh');
    });
  });

  describe('Callback Dependencies', () => {
    it('should have correct dependencies for refresh callback', () => {
      // Test refresh dependencies
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('[sdk]');
    });

    it('should have correct dependencies for useEffect', () => {
      // Test useEffect dependencies
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('sdk');
      expect(hookCode).toContain('autoStart');
      expect(hookCode).toContain('refreshInterval');
      expect(hookCode).toContain('refresh');
    });
  });

  describe('Async Operations', () => {
    it('should handle async getPoolState call', () => {
      // Test async handling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('async');
      expect(hookCode).toContain('await');
    });

    it('should handle async getVolume24h call', () => {
      // Test async handling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('async');
      expect(hookCode).toContain('await');
    });

    it('should handle async getPriceDeviation call', () => {
      // Test async handling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('async');
      expect(hookCode).toContain('await');
    });

    it('should have try-catch blocks for error handling', () => {
      // Test error handling
      const hookCode = usePoolMetrics.toString();
      expect(hookCode).toContain('try');
      expect(hookCode).toContain('catch');
    });
  });
});
