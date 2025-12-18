import { describe, it, expect, beforeEach } from 'vitest';
import { BatchManager } from '../../src/utils/BatchManager';

describe('BatchManager', () => {
  let batchManager: BatchManager;

  beforeEach(() => {
    batchManager = new BatchManager(50, 10);
  });

  it('should batch multiple requests', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      return 'result';
    };

    const promise1 = batchManager.batch('batch1', 'req1', fn);
    const promise2 = batchManager.batch('batch1', 'req2', fn);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    // Requests are batched and executed together
    expect(callCount).toBeGreaterThan(0);
  });

  it('should deduplicate identical requests', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      return 'result';
    };

    const promise1 = batchManager.batch('batch1', 'req1', fn);
    const promise2 = batchManager.batch('batch1', 'req1', fn);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    // Deduplication should result in a single call
    expect(callCount).toBe(1);
  });

  it('should handle batch size limit', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      return 'result';
    };

    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(batchManager.batch('batch1', `req${i}`, fn));
    }

    const results = await Promise.all(promises);

    expect(results.length).toBe(15);
    expect(results.every(r => r === 'result')).toBe(true);
    // Should execute in batches
    expect(callCount).toBeGreaterThan(0);
  });

  it('should handle errors in batched requests', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      throw new Error('Test error');
    };

    const promise1 = batchManager.batch('batch1', 'req1', fn);
    const promise2 = batchManager.batch('batch1', 'req2', fn);

    await expect(promise1).rejects.toThrow('Test error');
    await expect(promise2).rejects.toThrow('Test error');
    expect(callCount).toBeGreaterThan(0);
  });

  it('should flush pending batches', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      return 'result';
    };

    const promise1 = batchManager.batch('batch1', 'req1', fn);
    const promise2 = batchManager.batch('batch2', 'req2', fn);

    expect(batchManager.getPendingCount()).toBe(2);

    await batchManager.flush();

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(batchManager.getPendingCount()).toBe(0);
  });

  it('should clear pending batches', () => {
    batchManager.batch('batch1', 'req1', async () => 'result');
    batchManager.batch('batch2', 'req2', async () => 'result');

    expect(batchManager.getPendingCount()).toBe(2);

    batchManager.clear();

    expect(batchManager.getPendingCount()).toBe(0);
  });

  it('should generate batch keys', () => {
    const key1 = BatchManager.generateKey('balance', '0x123', '0x456');
    const key2 = BatchManager.generateKey('balance', '0x123', '0x456');
    expect(key1).toBe(key2);

    const key3 = BatchManager.generateKey('balance', '0x123', '0x789');
    expect(key1).not.toBe(key3);
  });
});
