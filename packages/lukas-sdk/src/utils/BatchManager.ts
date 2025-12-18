/**
 * Batch request interface
 */
interface BatchRequest<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

/**
 * BatchManager for request batching and deduplication
 * 
 * Combines multiple requests into single batches to reduce blockchain calls.
 * Deduplicates identical requests and coalesces concurrent calls.
 */
export class BatchManager {
  private pendingBatches: Map<string, BatchRequest<any>[]> = new Map();
  private deduplicationMap: Map<string, Promise<any>> = new Map();
  private batchTimeout: number;
  private batchSize: number;
  private timeoutHandles: Map<string, NodeJS.Timeout> = new Map();

  constructor(batchTimeout: number = 100, batchSize: number = 50) {
    this.batchTimeout = batchTimeout;
    this.batchSize = batchSize;
  }

  /**
   * Generate a request key for deduplication
   */
  static generateKey(...params: any[]): string {
    return params
      .map(p => {
        if (typeof p === 'object') {
          return JSON.stringify(p);
        }
        return String(p);
      })
      .join(':');
  }

  /**
   * Add a request to the batch
   */
  async batch<T>(batchKey: string, requestId: string, fn: () => Promise<T>): Promise<T> {
    // Check for deduplication
    const dedupeKey = `${batchKey}:${requestId}`;
    if (this.deduplicationMap.has(dedupeKey)) {
      return this.deduplicationMap.get(dedupeKey)!;
    }

    // Create the promise for this request
    const promise = new Promise<T>((resolve, reject) => {
      // Get or create batch queue
      if (!this.pendingBatches.has(batchKey)) {
        this.pendingBatches.set(batchKey, []);
      }

      const batch = this.pendingBatches.get(batchKey)!;
      batch.push({
        id: requestId,
        fn,
        resolve,
        reject,
      });

      // Check if we should execute immediately
      if (batch.length >= this.batchSize) {
        this.executeBatch(batchKey);
      } else if (batch.length === 1) {
        // Schedule batch execution
        const timeout = setTimeout(() => {
          this.executeBatch(batchKey);
        }, this.batchTimeout);

        this.timeoutHandles.set(batchKey, timeout);
      }
    });

    // Store in deduplication map
    this.deduplicationMap.set(dedupeKey, promise);

    // Clean up deduplication map after promise settles
    promise
      .then(() => {
        setTimeout(() => this.deduplicationMap.delete(dedupeKey), 100);
      })
      .catch(() => {
        setTimeout(() => this.deduplicationMap.delete(dedupeKey), 100);
      });

    return promise;
  }

  /**
   * Execute a batch of requests
   */
  private async executeBatch(batchKey: string): Promise<void> {
    const batch = this.pendingBatches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }

    // Remove from pending
    this.pendingBatches.delete(batchKey);

    // Clear timeout if exists
    const timeout = this.timeoutHandles.get(batchKey);
    if (timeout) {
      clearTimeout(timeout);
      this.timeoutHandles.delete(batchKey);
    }

    // Execute all requests in parallel
    const results = await Promise.allSettled(batch.map(req => req.fn()));

    // Resolve or reject each request
    for (let i = 0; i < batch.length; i++) {
      const request = batch[i];
      const result = results[i];

      if (!request || !result) {
        continue;
      }

      if (result.status === 'fulfilled') {
        request.resolve((result as PromiseFulfilledResult<any>).value);
      } else if (result.status === 'rejected') {
        request.reject((result as PromiseRejectedResult).reason);
      }
    }
  }

  /**
   * Flush all pending batches
   */
  async flush(): Promise<void> {
    const batchKeys = Array.from(this.pendingBatches.keys());

    for (const batchKey of batchKeys) {
      await this.executeBatch(batchKey);
    }
  }

  /**
   * Clear all pending batches
   */
  clear(): void {
    this.pendingBatches.clear();
    this.deduplicationMap.clear();

    for (const timeout of this.timeoutHandles.values()) {
      clearTimeout(timeout);
    }
    this.timeoutHandles.clear();
  }

  /**
   * Get pending batch count
   */
  getPendingCount(): number {
    let count = 0;
    for (const batch of this.pendingBatches.values()) {
      count += batch.length;
    }
    return count;
  }

  /**
   * Destroy the batch manager
   */
  destroy(): void {
    this.clear();
  }
}
