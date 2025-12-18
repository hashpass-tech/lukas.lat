import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventManager } from '../../src/core/EventManager';
import type { TransferEvent } from '../../src/types';

describe('EventManager', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager(100);
  });

  afterEach(() => {
    eventManager.cleanup();
  });

  it('should create an EventManager instance', () => {
    expect(eventManager).toBeDefined();
    expect(eventManager.getSubscriptionCount()).toBe(0);
    expect(eventManager.getHistorySize()).toBe(0);
  });

  it('should subscribe to events', () => {
    const callback = vi.fn();
    const subscriptionId = eventManager.subscribe(callback);

    expect(subscriptionId).toBeDefined();
    expect(eventManager.getSubscriptionCount()).toBe(1);
  });

  it('should emit events to subscribers', () => {
    const callback = vi.fn();
    eventManager.subscribe(callback);

    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    eventManager.emit(event);

    expect(callback).toHaveBeenCalledWith(event);
    expect(eventManager.getHistorySize()).toBe(1);
  });

  it('should unsubscribe from events', () => {
    const callback = vi.fn();
    const subscriptionId = eventManager.subscribe(callback);

    expect(eventManager.getSubscriptionCount()).toBe(1);

    const unsubscribed = eventManager.unsubscribe(subscriptionId);
    expect(unsubscribed).toBe(true);
    expect(eventManager.getSubscriptionCount()).toBe(0);
  });

  it('should filter events by address', () => {
    const callback = vi.fn();
    const address = '0x1234567890123456789012345678901234567890';

    eventManager.subscribe(callback, {
      filter: {
        address,
      },
    });

    const matchingEvent: TransferEvent = {
      from: address,
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const nonMatchingEvent: TransferEvent = {
      from: '0x0987654321098765432109876543210987654321',
      to: '0x1111111111111111111111111111111111111111',
      amount: '1000000000000000000',
      blockNumber: 101,
      transactionHash: '0xabcdef2',
      timestamp: Date.now(),
    };

    eventManager.emit(matchingEvent);
    eventManager.emit(nonMatchingEvent);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(matchingEvent);
  });

  it('should maintain event history', () => {
    const event1: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const event2: TransferEvent = {
      from: '0x0987654321098765432109876543210987654321',
      to: '0x1111111111111111111111111111111111111111',
      amount: '2000000000000000000',
      blockNumber: 101,
      transactionHash: '0xabcdef2',
      timestamp: Date.now(),
    };

    eventManager.emit(event1);
    eventManager.emit(event2);

    const history = eventManager.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual(event1);
    expect(history[1]).toEqual(event2);
  });

  it('should clear history', () => {
    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    eventManager.emit(event);
    expect(eventManager.getHistorySize()).toBe(1);

    eventManager.clearHistory();
    expect(eventManager.getHistorySize()).toBe(0);
  });

  it('should include historical events on subscription', () => {
    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    eventManager.emit(event);

    const callback = vi.fn();
    eventManager.subscribe(callback, {
      includeHistory: true,
    });

    expect(callback).toHaveBeenCalledWith(event);
  });

  it('should batch events', async () => {
    const callback = vi.fn();
    eventManager.subscribe(callback, {
      batchEvents: true,
      batchSize: 2,
      batchTimeout: 100,
    });

    const event1: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const event2: TransferEvent = {
      from: '0x0987654321098765432109876543210987654321',
      to: '0x1111111111111111111111111111111111111111',
      amount: '2000000000000000000',
      blockNumber: 101,
      transactionHash: '0xabcdef2',
      timestamp: Date.now(),
    };

    eventManager.emit(event1);
    expect(callback).not.toHaveBeenCalled();

    eventManager.emit(event2);
    expect(callback).toHaveBeenCalledWith(event2);
  });

  it('should cleanup resources', () => {
    const callback = vi.fn();
    eventManager.subscribe(callback);

    expect(eventManager.getSubscriptionCount()).toBe(1);

    eventManager.cleanup();

    expect(eventManager.getSubscriptionCount()).toBe(0);
    expect(eventManager.getHistorySize()).toBe(0);
  });
});
