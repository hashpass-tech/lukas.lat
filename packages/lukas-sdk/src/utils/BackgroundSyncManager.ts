import { CacheManager } from './CacheManager';

/**
 * Background sync task configuration
 */
export interface SyncTask {
  id: string;
  fn: () => Promise<any>;
  interval: number;
  cacheKey?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Sync task status
 */
export interface SyncTaskStatus {
  id: string;
  isRunning: boolean;
  lastRun: number | undefined;
  lastError: Error | undefined;
  successCount: number;
  errorCount: number;
}

/**
 * BackgroundSyncManager for periodic data refresh and synchronization
 * 
 * Manages background tasks that periodically refresh cached data and monitor events.
 * Implements stale-while-revalidate patterns for optimal performance.
 */
export class BackgroundSyncManager {
  private tasks: Map<string, SyncTask> = new Map();
  private taskIntervals: Map<string, NodeJS.Timeout> = new Map();
  private taskStatus: Map<string, SyncTaskStatus> = new Map();
  private cacheManager: CacheManager | null = null;
  private isRunning: boolean = false;

  constructor(cacheManager?: CacheManager) {
    this.cacheManager = cacheManager || null;
  }

  /**
   * Register a background sync task
   */
  registerTask(task: SyncTask): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with id ${task.id} already registered`);
    }

    this.tasks.set(task.id, task);
    this.taskStatus.set(task.id, {
      id: task.id,
      isRunning: false,
      lastRun: undefined,
      lastError: undefined,
      successCount: 0,
      errorCount: 0,
    });

    // Start task if manager is running
    if (this.isRunning) {
      this.startTask(task.id);
    }
  }

  /**
   * Unregister a background sync task
   */
  unregisterTask(taskId: string): void {
    this.stopTask(taskId);
    this.tasks.delete(taskId);
    this.taskStatus.delete(taskId);
  }

  /**
   * Start a specific task
   */
  private startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Clear existing interval if any
    if (this.taskIntervals.has(taskId)) {
      clearInterval(this.taskIntervals.get(taskId)!);
    }

    // Execute immediately
    this.executeTask(taskId);

    // Schedule periodic execution
    const interval = setInterval(() => {
      this.executeTask(taskId);
    }, task.interval);

    this.taskIntervals.set(taskId, interval);
  }

  /**
   * Stop a specific task
   */
  private stopTask(taskId: string): void {
    const interval = this.taskIntervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.taskIntervals.delete(taskId);
    }

    const status = this.taskStatus.get(taskId);
    if (status) {
      status.isRunning = false;
    }
  }

  /**
   * Execute a task
   */
  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    const status = this.taskStatus.get(taskId);

    if (!task || !status) {
      return;
    }

    status.isRunning = true;

    try {
      const result = await task.fn();

      // Update cache if cache key is provided
      if (task.cacheKey && this.cacheManager) {
        this.cacheManager.set(task.cacheKey, result);
      }

      status.lastRun = Date.now();
      status.successCount++;
      status.lastError = undefined;

      // Call success callback
      if (task.onSuccess) {
        task.onSuccess(result);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      status.lastRun = Date.now();
      status.errorCount++;
      status.lastError = err;

      // Call error callback
      if (task.onError) {
        task.onError(err);
      }
    } finally {
      status.isRunning = false;
    }
  }

  /**
   * Start all registered tasks
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    for (const taskId of this.tasks.keys()) {
      this.startTask(taskId);
    }
  }

  /**
   * Stop all registered tasks
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    for (const taskId of this.tasks.keys()) {
      this.stopTask(taskId);
    }
  }

  /**
   * Check if manager is running
   */
  isManagerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get status of a specific task
   */
  getTaskStatus(taskId: string): SyncTaskStatus | null {
    return this.taskStatus.get(taskId) || null;
  }

  /**
   * Get status of all tasks
   */
  getAllTaskStatus(): SyncTaskStatus[] {
    return Array.from(this.taskStatus.values());
  }

  /**
   * Get task count
   */
  getTaskCount(): number {
    return this.tasks.size;
  }

  /**
   * Get running task count
   */
  getRunningTaskCount(): number {
    let count = 0;
    for (const status of this.taskStatus.values()) {
      if (status.isRunning) {
        count++;
      }
    }
    return count;
  }

  /**
   * Manually trigger a task execution
   */
  async triggerTask(taskId: string): Promise<void> {
    if (!this.tasks.has(taskId)) {
      throw new Error(`Task ${taskId} not found`);
    }

    await this.executeTask(taskId);
  }

  /**
   * Destroy the sync manager
   */
  destroy(): void {
    this.stop();
    this.tasks.clear();
    this.taskStatus.clear();
  }
}
