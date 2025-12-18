import type { EventData } from '../types';
import { EventManager } from './EventManager';

/**
 * WebSocket connection state
 */
export enum WebSocketState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  CLOSED = 'CLOSED',
}

/**
 * WebSocket event monitor configuration
 */
export interface WebSocketMonitorConfig {
  /** WebSocket URL */
  wsUrl: string;
  /** Reconnection options */
  reconnect?: {
    /** Whether to auto-reconnect */
    enabled?: boolean;
    /** Initial delay in milliseconds */
    initialDelay?: number;
    /** Maximum delay in milliseconds */
    maxDelay?: number;
    /** Backoff multiplier */
    backoffMultiplier?: number;
    /** Maximum reconnection attempts */
    maxAttempts?: number;
  };
  /** Event batching options */
  batching?: {
    /** Whether to batch events */
    enabled?: boolean;
    /** Batch size */
    size?: number;
    /** Batch timeout in milliseconds */
    timeout?: number;
  };
  /** Throttling options */
  throttling?: {
    /** Whether to throttle events */
    enabled?: boolean;
    /** Throttle interval in milliseconds */
    interval?: number;
  };
}

/**
 * Real-time event monitoring via WebSocket
 */
export class WebSocketEventMonitor {
  private eventManager: EventManager;
  private config: WebSocketMonitorConfig;
  private ws: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private reconnectDelay: number = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventBatch: EventData[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private lastThrottledEventTime: number = 0;
  private stateChangeListeners: Set<(state: WebSocketState) => void> = new Set();
  private errorListeners: Set<(error: Error) => void> = new Set();

  constructor(eventManager: EventManager, config: WebSocketMonitorConfig) {
    this.eventManager = eventManager;
    this.config = {
      reconnect: {
        enabled: true,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        maxAttempts: 10,
        ...config.reconnect,
      },
      batching: {
        enabled: true,
        size: 10,
        timeout: 1000,
        ...config.batching,
      },
      throttling: {
        enabled: false,
        interval: 100,
        ...config.throttling,
      },
      ...config,
    };
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    if (this.state === WebSocketState.CONNECTED || this.state === WebSocketState.CONNECTING) {
      return;
    }

    this.setState(WebSocketState.CONNECTING);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.wsUrl);

        this.ws.onopen = () => {
          this.setState(WebSocketState.CONNECTED);
          this.reconnectAttempts = 0;
          this.reconnectDelay = this.config.reconnect?.initialDelay || 1000;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          const err = new Error(`WebSocket error: ${error}`);
          this.notifyError(err);
          reject(err);
        };

        this.ws.onclose = () => {
          this.setState(WebSocketState.DISCONNECTED);
          this.attemptReconnect();
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.notifyError(err);
        reject(err);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.setState(WebSocketState.CLOSED);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const event = JSON.parse(data) as EventData;

      // Apply throttling if enabled
      if (this.config.throttling?.enabled) {
        const now = Date.now();
        if (now - this.lastThrottledEventTime < (this.config.throttling.interval || 100)) {
          return;
        }
        this.lastThrottledEventTime = now;
      }

      // Apply batching if enabled
      if (this.config.batching?.enabled) {
        this.eventBatch.push(event);

        if (this.eventBatch.length >= (this.config.batching.size || 10)) {
          this.flushBatch();
        } else if (!this.batchTimer) {
          this.batchTimer = setTimeout(() => {
            this.flushBatch();
          }, this.config.batching.timeout || 1000);
        }
      } else {
        // Emit immediately
        this.eventManager.emit(event);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
    }
  }

  /**
   * Flush batched events
   */
  private flushBatch(): void {
    if (this.eventBatch.length > 0) {
      // Emit all batched events
      for (const event of this.eventBatch) {
        this.eventManager.emit(event);
      }
      this.eventBatch = [];
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.state === WebSocketState.CLOSED) {
      return;
    }

    const maxAttempts = this.config.reconnect?.maxAttempts || 10;
    if (this.reconnectAttempts >= maxAttempts) {
      this.setState(WebSocketState.CLOSED);
      const error = new Error(`Failed to reconnect after ${maxAttempts} attempts`);
      this.notifyError(error);
      return;
    }

    this.setState(WebSocketState.RECONNECTING);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.notifyError(error);
      });
    }, this.reconnectDelay);

    // Update delay for next attempt
    const maxDelay = this.config.reconnect?.maxDelay || 30000;
    const multiplier = this.config.reconnect?.backoffMultiplier || 2;
    this.reconnectDelay = Math.min(this.reconnectDelay * multiplier, maxDelay);
  }

  /**
   * Set connection state
   */
  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.notifyStateChange(newState);
    }
  }

  /**
   * Notify state change listeners
   */
  private notifyStateChange(state: WebSocketState): void {
    for (const listener of this.stateChangeListeners) {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    }
  }

  /**
   * Notify error listeners
   */
  private notifyError(error: Error): void {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    }
  }

  /**
   * Add state change listener
   */
  onStateChange(listener: (state: WebSocketState) => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  /**
   * Add error listener
   */
  onError(listener: (error: Error) => void): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === WebSocketState.CONNECTED;
  }

  /**
   * Get reconnection attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Get current reconnect delay
   */
  getReconnectDelay(): number {
    return this.reconnectDelay;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.disconnect();
    this.stateChangeListeners.clear();
    this.errorListeners.clear();
  }
}

/**
 * Real-time event monitoring system with batching and throttling
 */
export class RealtimeEventMonitor {
  private eventManager: EventManager;
  private wsMonitor: WebSocketEventMonitor | null = null;
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isMonitoring: boolean = false;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
  }

  /**
   * Start WebSocket monitoring
   */
  async startWebSocketMonitoring(config: WebSocketMonitorConfig): Promise<void> {
    if (this.wsMonitor) {
      await this.wsMonitor.connect();
      return;
    }

    this.wsMonitor = new WebSocketEventMonitor(this.eventManager, config);
    await this.wsMonitor.connect();
    this.isMonitoring = true;
  }

  /**
   * Stop WebSocket monitoring
   */
  stopWebSocketMonitoring(): void {
    if (this.wsMonitor) {
      this.wsMonitor.disconnect();
      this.wsMonitor = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Start polling for events
   */
  startPolling(
    pollFn: () => Promise<EventData[]>,
    intervalMs: number = 5000,
    pollId: string = 'default'
  ): void {
    // Clear existing polling for this ID
    this.stopPolling(pollId);

    const poll = async () => {
      try {
        const events = await pollFn();
        for (const event of events) {
          this.eventManager.emit(event);
        }
      } catch (error) {
        console.error(`Error during polling (${pollId}):`, error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const interval = setInterval(poll, intervalMs);
    this.pollingIntervals.set(pollId, interval);
  }

  /**
   * Stop polling for events
   */
  stopPolling(pollId: string = 'default'): void {
    const interval = this.pollingIntervals.get(pollId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(pollId);
    }
  }

  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    for (const interval of this.pollingIntervals.values()) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
  }

  /**
   * Check if monitoring is active
   */
  isActive(): boolean {
    return this.isMonitoring || this.pollingIntervals.size > 0;
  }

  /**
   * Get WebSocket monitor state
   */
  getWebSocketState(): WebSocketState | null {
    return this.wsMonitor?.getState() || null;
  }

  /**
   * Add WebSocket state change listener
   */
  onWebSocketStateChange(listener: (state: WebSocketState) => void): (() => void) | null {
    return this.wsMonitor?.onStateChange(listener) || null;
  }

  /**
   * Add WebSocket error listener
   */
  onWebSocketError(listener: (error: Error) => void): (() => void) | null {
    return this.wsMonitor?.onError(listener) || null;
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.stopAllPolling();
    if (this.wsMonitor) {
      this.wsMonitor.cleanup();
      this.wsMonitor = null;
    }
    this.isMonitoring = false;
  }
}
