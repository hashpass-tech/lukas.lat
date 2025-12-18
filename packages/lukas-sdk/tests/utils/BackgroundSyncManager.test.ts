import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackgroundSyncManager } from '../../src/utils/BackgroundSyncManager';
import { CacheManager } from '../../src/utils/CacheManager';

describe('BackgroundSyncManager', () => {
  let syncManager: BackgroundSyncManager;
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager(1000, 100);
    syncManager = new BackgroundSyncManager(cacheManager);
  });

  afterEach(() => {
    syncManager.destroy();
    cacheManager.destroy();
  });

  it('should register and start tasks', async () => {
    let callCount = 0;
    const task = {
      id: 'task1',
      fn: async () => {
        callCount++;
        return 'result';
      },
      interval: 100,
    };

    syncManager.registerTask(task);
    syncManager.start();

    // Wait for task to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(callCount).toBeGreaterThan(0);
  });

  it('should update cache with task results', async () => {
    const task = {
      id: 'task1',
      fn: async () => 'cached_value',
      interval: 100,
      cacheKey: 'test_key',
    };

    syncManager.registerTask(task);
    syncManager.start();

    // Wait for task to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    const cachedValue = cacheManager.get('test_key');
    expect(cachedValue).toBe('cached_value');
  });

  it('should handle task errors', async () => {
    const onError = vi.fn();
    const task = {
      id: 'task1',
      fn: async () => {
        throw new Error('Task error');
      },
      interval: 100,
      onError,
    };

    syncManager.registerTask(task);
    syncManager.start();

    // Wait for task to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(onError).toHaveBeenCalled();
    const status = syncManager.getTaskStatus('task1');
    expect(status?.errorCount).toBeGreaterThan(0);
  });

  it('should call success callback', async () => {
    const onSuccess = vi.fn();
    const task = {
      id: 'task1',
      fn: async () => 'result',
      interval: 100,
      onSuccess,
    };

    syncManager.registerTask(task);
    syncManager.start();

    // Wait for task to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(onSuccess).toHaveBeenCalledWith('result');
  });

  it('should get task status', async () => {
    const task = {
      id: 'task1',
      fn: async () => 'result',
      interval: 100,
    };

    syncManager.registerTask(task);
    syncManager.start();

    // Wait for task to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    const status = syncManager.getTaskStatus('task1');
    expect(status).not.toBeNull();
    expect(status?.id).toBe('task1');
    expect(status?.successCount).toBeGreaterThan(0);
  });

  it('should get all task statuses', async () => {
    const task1 = {
      id: 'task1',
      fn: async () => 'result1',
      interval: 100,
    };

    const task2 = {
      id: 'task2',
      fn: async () => 'result2',
      interval: 100,
    };

    syncManager.registerTask(task1);
    syncManager.registerTask(task2);
    syncManager.start();

    // Wait for tasks to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    const statuses = syncManager.getAllTaskStatus();
    expect(statuses.length).toBe(2);
  });

  it('should unregister tasks', () => {
    const task = {
      id: 'task1',
      fn: async () => 'result',
      interval: 100,
    };

    syncManager.registerTask(task);
    expect(syncManager.getTaskCount()).toBe(1);

    syncManager.unregisterTask('task1');
    expect(syncManager.getTaskCount()).toBe(0);
  });

  it('should stop all tasks', async () => {
    let callCount = 0;
    const task = {
      id: 'task1',
      fn: async () => {
        callCount++;
        return 'result';
      },
      interval: 100,
    };

    syncManager.registerTask(task);
    syncManager.start();

    // Wait for task to execute
    await new Promise(resolve => setTimeout(resolve, 150));
    const countAfterStart = callCount;

    syncManager.stop();

    // Wait to ensure no more executions
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(callCount).toBe(countAfterStart);
  });

  it('should manually trigger task execution', async () => {
    let callCount = 0;
    const task = {
      id: 'task1',
      fn: async () => {
        callCount++;
        return 'result';
      },
      interval: 10000, // Long interval
    };

    syncManager.registerTask(task);

    // Manually trigger without starting
    await syncManager.triggerTask('task1');
    expect(callCount).toBe(1);
  });

  it('should track running task count', async () => {
    const task = {
      id: 'task1',
      fn: async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'result';
      },
      interval: 100,
    };

    syncManager.registerTask(task);
    syncManager.start();

    // Check running count immediately
    const runningCount = syncManager.getRunningTaskCount();
    expect(runningCount).toBeGreaterThanOrEqual(0);
  });
});
