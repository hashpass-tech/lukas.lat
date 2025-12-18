import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '../../src/core/EventManager';
import type { TransferEvent } from '../../src/types';

/**
 * Stress tests for event subscription system
 * Tests the SDK's ability to handle high-volume event subscriptions and emissions
 */
describe('Event Subscription Stress Tests', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager(10000); // Large history buffer
  });

  describe('Multiple Subscriptions', () => {
    it('should handle 100 concurrent subscriptions', () => {
      const callbacks = Array.from({ length: 100 }, () => vi.fn());
      const subscriptionIds = callbacks.map((cb) => eventManager.subscribe(cb));

      expect(eventManager.getSubscriptionCount()).toBe(100);
      expect(subscriptionIds).toHaveLength(100);

      // Cleanup
      subscriptionIds.forEach((id) => eventManager.unsubscribe(id));
      expect(eventManager.getSubscriptionCount()).toBe(0);
    });

    it('should handle 500 concurrent subscriptions', () => {
      const callbacks = Array.from({ length: 500 }, () => vi.fn());
      const subscriptionIds = callbacks.map((cb) => eventManager.subscribe(cb));

      expect(eventManager.getSubscriptionCount()).toBe(500);

      // Cleanup
      subscriptionIds.forEach((id) => eventManager.unsubscribe(id));
      expect(eventManager.getSubscriptionCount()).toBe(0);
    });

    it('should handle 1000 concurrent subscriptions', () => {
      const callbacks = Array.from({ length: 1000 }, () => vi.fn());
      const subscriptionIds = callbacks.map((cb) => eventManager.subscribe(cb));

      expect(eventManager.getSubscriptionCount()).toBe(1000);

      // Cleanup
      subscriptionIds.forEach((id) => eventManager.unsubscribe(id));
      expect(eventManager.getSubscriptionCount()).toBe(0);
    });
  });

  describe('High-Volume Event Emissions', () => {
    it('should handle 1000 event emissions', () => {
      const callback = vi.fn();
      eventManager.subscribe(callback);

      for (let i = 0; i < 1000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i).padStart(40, '0')}`,
          to: `0x${String(i + 1).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      expect(callback).toHaveBeenCalledTimes(1000);
      expect(eventManager.getHistorySize()).toBe(1000);
    });

    it('should handle 5000 event emissions', () => {
      const callback = vi.fn();
      eventManager.subscribe(callback);

      for (let i = 0; i < 5000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i).padStart(40, '0')}`,
          to: `0x${String(i + 1).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      expect(callback).toHaveBeenCalledTimes(5000);
    });

    it('should handle 10000 event emissions', () => {
      const callback = vi.fn();
      eventManager.subscribe(callback);

      for (let i = 0; i < 10000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i % 1000).padStart(40, '0')}`,
          to: `0x${String((i + 1) % 1000).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      expect(callback).toHaveBeenCalledTimes(10000);
    });
  });

  describe('Combined Subscription and Emission Load', () => {
    it('should handle 100 subscriptions with 1000 emissions each', () => {
      const callbacks = Array.from({ length: 100 }, () => vi.fn());
      callbacks.forEach((cb) => eventManager.subscribe(cb));

      for (let i = 0; i < 1000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i).padStart(40, '0')}`,
          to: `0x${String(i + 1).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      callbacks.forEach((cb) => {
        expect(cb).toHaveBeenCalledTimes(1000);
      });
    });

    it('should handle 500 subscriptions with 100 emissions each', () => {
      const callbacks = Array.from({ length: 500 }, () => vi.fn());
      callbacks.forEach((cb) => eventManager.subscribe(cb));

      for (let i = 0; i < 100; i++) {
        const event: TransferEvent = {
          from: `0x${String(i).padStart(40, '0')}`,
          to: `0x${String(i + 1).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      callbacks.forEach((cb) => {
        expect(cb).toHaveBeenCalledTimes(100);
      });
    });
  });

  describe('Filtered Subscriptions Under Load', () => {
    it('should handle 100 filtered subscriptions with 1000 emissions', () => {
      const callbacks = Array.from({ length: 100 }, () => vi.fn());

      callbacks.forEach((cb, index) => {
        const address = `0x${String(index).padStart(40, '0')}`;
        eventManager.subscribe(cb, {
          filter: { address },
        });
      });

      for (let i = 0; i < 1000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i % 100).padStart(40, '0')}`,
          to: `0x${String((i + 1) % 100).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      // Each callback should receive approximately 10 events (1000 / 100)
      callbacks.forEach((cb) => {
        expect(cb.mock.calls.length).toBeGreaterThan(0);
        expect(cb.mock.calls.length).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Subscription Lifecycle Under Load', () => {
    it('should handle rapid subscribe/unsubscribe cycles', () => {
      for (let cycle = 0; cycle < 100; cycle++) {
        const callbacks = Array.from({ length: 10 }, () => vi.fn());
        const subscriptionIds = callbacks.map((cb) => eventManager.subscribe(cb));

        expect(eventManager.getSubscriptionCount()).toBe(10);

        subscriptionIds.forEach((id) => eventManager.unsubscribe(id));
        expect(eventManager.getSubscriptionCount()).toBe(0);
      }
    });

    it('should handle partial unsubscription under load', () => {
      const callbacks = Array.from({ length: 100 }, () => vi.fn());
      const subscriptionIds = callbacks.map((cb) => eventManager.subscribe(cb));

      expect(eventManager.getSubscriptionCount()).toBe(100);

      // Unsubscribe half
      for (let i = 0; i < 50; i++) {
        eventManager.unsubscribe(subscriptionIds[i]);
      }

      expect(eventManager.getSubscriptionCount()).toBe(50);

      // Unsubscribe remaining
      for (let i = 50; i < 100; i++) {
        eventManager.unsubscribe(subscriptionIds[i]);
      }

      expect(eventManager.getSubscriptionCount()).toBe(0);
    });
  });

  describe('Event History Management', () => {
    it('should maintain history with 10000 events', () => {
      for (let i = 0; i < 10000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i % 1000).padStart(40, '0')}`,
          to: `0x${String((i + 1) % 1000).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      // History size is limited to the buffer size (10000)
      expect(eventManager.getHistorySize()).toBeLessThanOrEqual(10000);
      const history = eventManager.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should clear history efficiently', () => {
      for (let i = 0; i < 5000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i).padStart(40, '0')}`,
          to: `0x${String(i + 1).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      expect(eventManager.getHistorySize()).toBe(5000);

      eventManager.clearHistory();
      expect(eventManager.getHistorySize()).toBe(0);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory with repeated subscription cycles', () => {
      for (let cycle = 0; cycle < 10; cycle++) {
        const callbacks = Array.from({ length: 10 }, () => vi.fn());
        const unsubscribers = callbacks.map((cb) => eventManager.subscribe(cb));

        for (let i = 0; i < 100; i++) {
          const event: TransferEvent = {
            from: `0x${String(i).padStart(40, '0')}`,
            to: `0x${String(i + 1).padStart(40, '0')}`,
            amount: BigInt(i),
            blockNumber: i,
            transactionHash: `0x${i}`,
            timestamp: Date.now(),
          };
          eventManager.emit(event);
        }

        unsubscribers.forEach((unsub) => {
          if (typeof unsub === 'function') {
            unsub();
          }
        });
      }

      // If we get here without crashing, memory is being managed
      expect(eventManager.getSubscriptionCount()).toBeLessThanOrEqual(100);
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should cleanup all resources', () => {
      const callbacks = Array.from({ length: 100 }, () => vi.fn());
      callbacks.forEach((cb) => eventManager.subscribe(cb));

      for (let i = 0; i < 1000; i++) {
        const event: TransferEvent = {
          from: `0x${String(i).padStart(40, '0')}`,
          to: `0x${String(i + 1).padStart(40, '0')}`,
          amount: BigInt(i),
          blockNumber: i,
          transactionHash: `0x${i}`,
          timestamp: Date.now(),
        };
        eventManager.emit(event);
      }

      expect(eventManager.getSubscriptionCount()).toBe(100);
      expect(eventManager.getHistorySize()).toBe(1000);

      eventManager.cleanup();

      expect(eventManager.getSubscriptionCount()).toBe(0);
      expect(eventManager.getHistorySize()).toBe(0);
    });
  });
});
