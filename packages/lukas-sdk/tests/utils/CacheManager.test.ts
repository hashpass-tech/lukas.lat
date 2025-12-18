import { describe, it, expect, beforeEach } from 'vitest';
import { CacheManager } from '../../src/utils/CacheManager';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(1000, 100);
  });

  it('should set and get values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for missing keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should respect TTL', async () => {
    cache.set('key1', 'value1', 100);
    expect(cache.get('key1')).toBe('value1');

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(cache.get('key1')).toBeNull();
  });

  it('should track cache hits and misses', () => {
    cache.set('key1', 'value1');
    cache.get('key1'); // hit
    cache.get('key1'); // hit
    cache.get('nonexistent'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it('should delete keys', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
  });

  it('should delete keys matching pattern', () => {
    cache.set('balance:0x123', 'value1');
    cache.set('balance:0x456', 'value2');
    cache.set('allowance:0x789', 'value3');

    const deleted = cache.deletePattern(/^balance:/);
    expect(deleted).toBe(2);
    expect(cache.has('balance:0x123')).toBe(false);
    expect(cache.has('allowance:0x789')).toBe(true);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('should warm cache with initial values', () => {
    cache.warm([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2', ttl: 5000 },
    ]);

    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe('value2');
    expect(cache.size()).toBe(2);
  });

  it('should generate cache keys', () => {
    const key1 = CacheManager.generateKey('balance', '0x123', '0x456');
    const key2 = CacheManager.generateKey('balance', '0x123', '0x456');
    expect(key1).toBe(key2);

    const key3 = CacheManager.generateKey('balance', '0x123', '0x789');
    expect(key1).not.toBe(key3);
  });

  it('should enforce max size', async () => {
    const smallCache = new CacheManager(1000, 3);
    smallCache.set('key1', 'value1');
    await new Promise(resolve => setTimeout(resolve, 10));
    smallCache.set('key2', 'value2');
    await new Promise(resolve => setTimeout(resolve, 10));
    smallCache.set('key3', 'value3');
    expect(smallCache.size()).toBe(3);

    // Adding a 4th entry should remove the oldest
    await new Promise(resolve => setTimeout(resolve, 10));
    smallCache.set('key4', 'value4');
    expect(smallCache.size()).toBeLessThanOrEqual(3);
    smallCache.destroy();
  });

  it('should reset statistics', () => {
    cache.set('key1', 'value1');
    cache.get('key1');
    cache.get('nonexistent');

    let stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);

    cache.resetStats();
    stats = cache.getStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
  });
});
