import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { VaultServiceImpl } from '../../src/services/VaultServiceImpl';

/**
 * Mock contract factory for testing
 */
function createMockContract(overrides: any = {}): any {
  return {
    getVaultInfo: vi.fn().mockResolvedValue(overrides.getVaultInfo || {
      maxMintPerAction: '1000000000000000000000',
      maxBuybackPerAction: '500000000000000000000',
      deviationThreshold: 500,
      cooldownPeriod: 3600,
      lastStabilization: Math.floor(Date.now() / 1000),
      totalMinted: '0',
      totalBoughtBack: '0',
    }),
    getCollateralBalance: vi.fn().mockResolvedValue(overrides.getCollateralBalance || {
      usdc: '1000000000000',
      lukas: '500000000000000000000',
      totalValueUSD: '1500000000000',
    }),
    isAuthorized: vi.fn().mockResolvedValue(overrides.isAuthorized ?? false),
    shouldStabilize: vi.fn().mockResolvedValue(overrides.shouldStabilize || {
      shouldStabilize: false,
      isOverPeg: false,
      deviationBps: 0,
      recommendedAmount: '0',
      canExecute: false,
    }),
    stabilizeMint: vi.fn().mockResolvedValue({ hash: '0x123' }),
    stabilizeBuyback: vi.fn().mockResolvedValue({ hash: '0x123' }),
    filters: {
      StabilizationMint: vi.fn().mockReturnValue({}),
      StabilizationBuyback: vi.fn().mockReturnValue({}),
      VaultParameterUpdate: vi.fn().mockReturnValue({}),
    },
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  };
}

/**
 * Valid Ethereum address generator
 */
const validAddressGen = fc
  .hexaString({ minLength: 40, maxLength: 40 })
  .map(hex => `0x${hex}`);

/**
 * Valid amount generator (positive BigInt as string)
 */
const validAmountGen = fc
  .bigUintN(256)
  .map(n => n.toString());

describe('Vault Event Subscription Property Tests', () => {
  const validContractAddress = '0x' + 'a'.repeat(40);

  /**
   * **Feature: lukas-sdk, Property 16: Event subscription functionality**
   * **Validates: Requirements 5.1, 5.5**
   * 
   * For any event subscription, the SDK should provide real-time notifications
   * when the subscribed events occur
   */
  it('Property 16: Event subscription functionality - StabilizationMint', async () => {
    // Generator for stabilization mint events
    const stabilizationMintEventGen = fc.record({
      amount: validAmountGen,
      poolPrice: validAmountGen,
      fairPrice: validAmountGen,
      recipient: validAddressGen,
    });

    await fc.assert(
      fc.asyncProperty(stabilizationMintEventGen, async (eventData) => {
        let callbackCalled = false;
        let receivedEvent: any = null;

        // Create mock contract with listener
        const mockContractWithListener = createMockContract({
          filters: {
            StabilizationMint: vi.fn().mockReturnValue({}),
          },
          on: vi.fn((_filter, listener) => {
            // Simulate event emission
            listener(
              eventData.amount,
              eventData.poolPrice,
              eventData.fairPrice,
              eventData.recipient,
              {
                blockNumber: 12345,
                transactionHash: '0x' + 'b'.repeat(64),
              }
            );
          }),
          off: vi.fn(),
        });

        const service = new VaultServiceImpl(mockContractWithListener, validContractAddress);
        service.onStabilizationMint((event) => {
          callbackCalled = true;
          receivedEvent = event;
        });

        // Verify callback was called
        expect(callbackCalled).toBe(true);

        // Verify event data is correct
        if (receivedEvent) {
          expect(receivedEvent.amount).toBe(eventData.amount);
          expect(receivedEvent.poolPrice).toBe(eventData.poolPrice);
          expect(receivedEvent.fairPrice).toBe(eventData.fairPrice);
          expect(receivedEvent.recipient).toBe(eventData.recipient);
          expect(receivedEvent.blockNumber).toBe(12345);
          expect(receivedEvent.transactionHash).toBe('0x' + 'b'.repeat(64));
          expect(typeof receivedEvent.timestamp).toBe('number');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 16: Event subscription functionality**
   * **Validates: Requirements 5.1, 5.5**
   * 
   * For any event subscription, the unsubscribe function should properly
   * clean up the listener
   */
  it('Property 16: Event subscription functionality - unsubscribe cleanup', async () => {
    await fc.assert(
      fc.asyncProperty(validAmountGen, async (_amount) => {
        // Create a mock contract that tracks listener calls
        const mockContractWithTracking = createMockContract({
          filters: {
            StabilizationMint: vi.fn().mockReturnValue({}),
          },
          on: vi.fn(),
          off: vi.fn(),
        });

        const service = new VaultServiceImpl(mockContractWithTracking, validContractAddress);

        // Subscribe to event
        const unsubscribe = service.onStabilizationMint(() => {
          // callback
        });

        // Verify subscription was set up
        expect(mockContractWithTracking.on).toHaveBeenCalled();

        // Unsubscribe
        unsubscribe();

        // Verify unsubscribe was called
        expect(mockContractWithTracking.off).toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 16: Event subscription functionality**
   * **Validates: Requirements 5.1, 5.5**
   * 
   * For any event subscription, multiple subscriptions should not interfere
   * with each other
   */
  it('Property 16: Event subscription functionality - multiple subscriptions', async () => {
    // Generator for multiple events
    const multipleEventsGen = fc.tuple(
      fc.record({
        amount: validAmountGen,
        poolPrice: validAmountGen,
        fairPrice: validAmountGen,
        recipient: validAddressGen,
      }),
      fc.record({
        amount: validAmountGen,
        poolPrice: validAmountGen,
        fairPrice: validAmountGen,
        recipient: validAddressGen,
      })
    );

    await fc.assert(
      fc.asyncProperty(multipleEventsGen, async (_events) => {
        // Create mock contract that supports multiple listeners
        const listeners: any[] = [];
        const mockContractWithMultiple = createMockContract({
          filters: {
            StabilizationMint: vi.fn().mockReturnValue({}),
          },
          on: vi.fn((_filter, listener) => {
            listeners.push(listener);
          }),
          off: vi.fn((_filter, listener) => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }),
        });

        const service = new VaultServiceImpl(mockContractWithMultiple, validContractAddress);

        // Subscribe to event twice
        const unsubscribe1 = service.onStabilizationMint(() => {
          // callback 1
        });

        const unsubscribe2 = service.onStabilizationMint(() => {
          // callback 2
        });

        // Verify both subscriptions were set up
        expect(mockContractWithMultiple.on).toHaveBeenCalledTimes(2);

        // Unsubscribe first listener
        unsubscribe1();

        // Verify first unsubscribe was called
        expect(mockContractWithMultiple.off).toHaveBeenCalledTimes(1);

        // Unsubscribe second listener
        unsubscribe2();

        // Verify second unsubscribe was called
        expect(mockContractWithMultiple.off).toHaveBeenCalledTimes(2);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: lukas-sdk, Property 16: Event subscription functionality**
   * **Validates: Requirements 5.1, 5.5**
   * 
   * For any StabilizationBuyback event subscription, the SDK should provide
   * real-time notifications when the event occurs
   */
  it('Property 16: Event subscription functionality - StabilizationBuyback', async () => {
    // Generator for stabilization buyback events
    const stabilizationBuybackEventGen = fc.record({
      amount: validAmountGen,
      poolPrice: validAmountGen,
      fairPrice: validAmountGen,
    });

    await fc.assert(
      fc.asyncProperty(stabilizationBuybackEventGen, async (eventData) => {
        let callbackCalled = false;
        let receivedEvent: any = null;

        // Create mock contract with buyback listener
        const mockContractWithListener = createMockContract({
          filters: {
            StabilizationBuyback: vi.fn().mockReturnValue({}),
          },
          on: vi.fn((_filter, listener) => {
            // Simulate event emission
            listener(
              eventData.amount,
              eventData.poolPrice,
              eventData.fairPrice,
              {
                blockNumber: 12345,
                transactionHash: '0x' + 'c'.repeat(64),
              }
            );
          }),
          off: vi.fn(),
        });

        const service = new VaultServiceImpl(mockContractWithListener, validContractAddress);
        service.onStabilizationBuyback((event) => {
          callbackCalled = true;
          receivedEvent = event;
        });

        // Verify callback was called
        expect(callbackCalled).toBe(true);

        // Verify event data is correct
        if (receivedEvent) {
          expect(receivedEvent.amount).toBe(eventData.amount);
          expect(receivedEvent.poolPrice).toBe(eventData.poolPrice);
          expect(receivedEvent.fairPrice).toBe(eventData.fairPrice);
          expect(receivedEvent.blockNumber).toBe(12345);
          expect(receivedEvent.transactionHash).toBe('0x' + 'c'.repeat(64));
          expect(typeof receivedEvent.timestamp).toBe('number');
        }
      }),
      { numRuns: 100 }
    );
  });
});
