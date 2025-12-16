import { describe, it, expect } from 'vitest';
import { LukasSDK } from '../../src/core/LukasSDK';
import type { LukasSDKConfig } from '../../src/core/types';

describe('LukasSDK', () => {
  const mockConfig: LukasSDKConfig = {
    network: {
      chainId: 1,
      name: 'mainnet',
    },
  };

  it('should initialize with basic configuration', () => {
    const sdk = new LukasSDK(mockConfig);
    
    expect(sdk).toBeInstanceOf(LukasSDK);
    expect(sdk.getNetworkInfo().chainId).toBe(1);
    expect(sdk.getNetworkInfo().name).toBe('mainnet');
    expect(sdk.isReadOnly()).toBe(true);
  });

  it('should apply default options', () => {
    const sdk = new LukasSDK(mockConfig);
    const options = sdk.getOptions();
    
    expect(options.enableCaching).toBe(true);
    expect(options.cacheTimeout).toBe(30000);
    expect(options.retryAttempts).toBe(3);
    expect(options.retryDelay).toBe(1000);
    expect(options.enableEvents).toBe(true);
    expect(options.logLevel).toBe('info');
  });

  it('should override default options with custom options', () => {
    const customConfig: LukasSDKConfig = {
      ...mockConfig,
      options: {
        enableCaching: false,
        cacheTimeout: 60000,
        logLevel: 'debug',
      },
    };

    const sdk = new LukasSDK(customConfig);
    const options = sdk.getOptions();
    
    expect(options.enableCaching).toBe(false);
    expect(options.cacheTimeout).toBe(60000);
    expect(options.logLevel).toBe('debug');
    // Should still have defaults for unspecified options
    expect(options.retryAttempts).toBe(3);
  });
});