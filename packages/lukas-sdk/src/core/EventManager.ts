import type {
  TransferEvent,
  ApprovalEvent,
  StabilizationMintEvent,
  StabilizationBuybackEvent,
  VaultParameterUpdateEvent,
  IndexUpdateEvent,
  PegDeviationEvent,
  LiquidityAddedEvent,
  LiquidityRemovedEvent,
} from '../types';

/**
 * Event types supported by the SDK
 */
export type EventType =
  | 'Transfer'
  | 'Approval'
  | 'StabilizationMint'
  | 'StabilizationBuyback'
  | 'VaultParameterUpdate'
  | 'IndexUpdate'
  | 'PegDeviation'
  | 'LiquidityAdded'
  | 'LiquidityRemoved';

/**
 * Union type for all event data
 */
export type EventData =
  | TransferEvent
  | ApprovalEvent
  | StabilizationMintEvent
  | StabilizationBuybackEvent
  | VaultParameterUpdateEvent
  | IndexUpdateEvent
  | PegDeviationEvent
  | LiquidityAddedEvent
  | LiquidityRemovedEvent;

/**
 * Event filter for filtering events
 */
export interface EventFilter {
  /** Filter by event type */
  eventType?: EventType;
  /** Filter by address (from/to/owner/spender) */
  address?: string;
  /** Filter by block number range */
  blockNumberRange?: { from: number; to: number };
  /** Filter by timestamp range */
  timestampRange?: { from: number; to: number };
  /** Custom filter function */
  customFilter?: (event: EventData) => boolean;
}

/**
 * Event subscription options
 */
export interface EventSubscriptionOptions {
  /** Whether to include historical events */
  includeHistory?: boolean;
  /** Maximum number of historical events to retrieve */
  maxHistorySize?: number;
  /** Event filter */
  filter?: EventFilter;
  /** Whether to batch events */
  batchEvents?: boolean;
  /** Batch size for event batching */
  batchSize?: number;
  /** Batch timeout in milliseconds */
  batchTimeout?: number;
}

/**
 * Event subscription callback
 */
export type EventCallback = (event: EventData) => void;

/**
 * Event subscription ID
 */
export type SubscriptionId = string;

/**
 * Centralized event manager for handling all SDK events
 */
export class EventManager {
  private subscriptions: Map<SubscriptionId, {
    callback: EventCallback;
    filter?: EventFilter | undefined;
    batchEvents?: boolean | undefined;
    batchSize?: number | undefined;
    batchTimeout?: number | undefined;
    batchedEvents?: EventData[] | undefined;
    batchTimer?: NodeJS.Timeout | undefined;
  }> = new Map();

  private eventHistory: EventData[] = [];
  private maxHistorySize: number = 1000;
  private subscriptionCounter: number = 0;
  private eventListeners: Map<EventType, Set<EventCallback>> = new Map();
  private isCleaningUp: boolean = false;

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
    this.initializeEventListeners();
  }

  /**
   * Initialize event listener maps for all event types
   */
  private initializeEventListeners(): void {
    const eventTypes: EventType[] = [
      'Transfer',
      'Approval',
      'StabilizationMint',
      'StabilizationBuyback',
      'VaultParameterUpdate',
      'IndexUpdate',
      'PegDeviation',
      'LiquidityAdded',
      'LiquidityRemoved',
    ];

    for (const eventType of eventTypes) {
      this.eventListeners.set(eventType, new Set());
    }
  }

  /**
   * Subscribe to events with optional filtering
   */
  subscribe(
    callback: EventCallback,
    options?: EventSubscriptionOptions
  ): SubscriptionId {
    const subscriptionId = `sub_${this.subscriptionCounter++}`;

    const subscription = {
      callback,
      filter: options?.filter,
      batchEvents: options?.batchEvents || false,
      batchSize: options?.batchSize || 10,
      batchTimeout: options?.batchTimeout || 1000,
      batchedEvents: options?.batchEvents ? [] : undefined,
      batchTimer: undefined,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // If including history, emit historical events
    if (options?.includeHistory) {
      const maxHistory = options?.maxHistorySize || 100;
      const relevantHistory = this.getFilteredHistory(options?.filter, maxHistory);
      
      for (const event of relevantHistory) {
        callback(event);
      }
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: SubscriptionId): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      // Clear any pending batch timer
      if (subscription.batchTimer) {
        clearTimeout(subscription.batchTimer);
      }
      
      // Flush any remaining batched events
      if (subscription.batchedEvents && subscription.batchedEvents.length > 0) {
        const lastEvent = subscription.batchedEvents[subscription.batchedEvents.length - 1];
        if (lastEvent) {
          subscription.callback(lastEvent);
        }
      }

      this.subscriptions.delete(subscriptionId);
      return true;
    }

    return false;
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: EventData): void {
    // Add to history
    this.addToHistory(event);

    // Process all subscriptions
    for (const [subscriptionId, subscription] of this.subscriptions) {
      // Check if event matches filter
      if (!this.matchesFilter(event, subscription.filter)) {
        continue;
      }

      // Handle batching if enabled
      if (subscription.batchEvents && subscription.batchedEvents) {
        subscription.batchedEvents.push(event);

        // Check if batch is full
        if (subscription.batchedEvents.length >= (subscription.batchSize || 10)) {
          this.flushBatch(subscriptionId);
        } else if (!subscription.batchTimer) {
          // Set timeout for batch flush
          subscription.batchTimer = setTimeout(() => {
            this.flushBatch(subscriptionId);
          }, subscription.batchTimeout || 1000);
        }
      } else {
        // Emit immediately
        try {
          subscription.callback(event);
        } catch (error) {
          console.error(`Error in event callback for subscription ${subscriptionId}:`, error);
        }
      }
    }
  }

  /**
   * Flush batched events for a subscription
   */
  private flushBatch(subscriptionId: SubscriptionId): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription && subscription.batchedEvents && subscription.batchedEvents.length > 0) {
      // Emit the last event in the batch (or could emit all)
      const lastEvent = subscription.batchedEvents[subscription.batchedEvents.length - 1];
      
      if (lastEvent) {
        try {
          subscription.callback(lastEvent);
        } catch (error) {
          console.error(`Error in event callback for subscription ${subscriptionId}:`, error);
        }
      }

      // Clear batched events and timer
      subscription.batchedEvents = [];
      if (subscription.batchTimer) {
        clearTimeout(subscription.batchTimer);
        subscription.batchTimer = undefined;
      }
    }
  }

  /**
   * Check if an event matches a filter
   */
  private matchesFilter(event: EventData, filter?: EventFilter): boolean {
    if (!filter) {
      return true;
    }

    // Check event type filter
    if (filter.eventType) {
      const eventType = this.getEventType(event);
      if (eventType !== filter.eventType) {
        return false;
      }
    }

    // Check address filter
    if (filter.address) {
      const eventAddresses = this.getEventAddresses(event);
      if (!eventAddresses.includes(filter.address.toLowerCase())) {
        return false;
      }
    }

    // Check block number range
    if (filter.blockNumberRange) {
      if (
        event.blockNumber < filter.blockNumberRange.from ||
        event.blockNumber > filter.blockNumberRange.to
      ) {
        return false;
      }
    }

    // Check timestamp range
    if (filter.timestampRange) {
      if (
        event.timestamp < filter.timestampRange.from ||
        event.timestamp > filter.timestampRange.to
      ) {
        return false;
      }
    }

    // Check custom filter
    if (filter.customFilter) {
      return filter.customFilter(event);
    }

    return true;
  }

  /**
   * Get event type from event data
   */
  private getEventType(event: EventData): EventType {
    if ('from' in event && 'to' in event && 'amount' in event && 'owner' in event === false) {
      return 'Transfer';
    }
    if ('owner' in event && 'spender' in event) {
      return 'Approval';
    }
    if ('recipient' in event && 'poolPrice' in event && 'fairPrice' in event) {
      return 'StabilizationMint';
    }
    if ('poolPrice' in event && 'fairPrice' in event && 'recipient' in event === false) {
      return 'StabilizationBuyback';
    }
    if ('parameterName' in event) {
      return 'VaultParameterUpdate';
    }
    if ('deviationBps' in event && 'isOverPeg' in event) {
      return 'PegDeviation';
    }
    if ('currencies' in event) {
      return 'IndexUpdate';
    }
    if ('liquidity' in event && 'tickLower' in event) {
      return 'LiquidityAdded';
    }
    if ('liquidity' in event && 'tickLower' in event) {
      return 'LiquidityRemoved';
    }

    return 'Transfer'; // Default fallback
  }

  /**
   * Get addresses from event data
   */
  private getEventAddresses(event: EventData): string[] {
    const addresses: string[] = [];

    if ('from' in event) addresses.push(event.from.toLowerCase());
    if ('to' in event) addresses.push(event.to.toLowerCase());
    if ('owner' in event) addresses.push(event.owner.toLowerCase());
    if ('spender' in event) addresses.push(event.spender.toLowerCase());
    if ('recipient' in event) addresses.push(event.recipient.toLowerCase());

    return addresses;
  }

  /**
   * Add event to history
   */
  private addToHistory(event: EventData): void {
    this.eventHistory.push(event);

    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get filtered history
   */
  private getFilteredHistory(filter?: EventFilter, maxSize: number = 100): EventData[] {
    let filtered = this.eventHistory.filter(event => this.matchesFilter(event, filter));
    
    if (filtered.length > maxSize) {
      filtered = filtered.slice(-maxSize);
    }

    return filtered;
  }

  /**
   * Get all events in history
   */
  getHistory(filter?: EventFilter, maxSize: number = 100): EventData[] {
    return this.getFilteredHistory(filter, maxSize);
  }

  /**
   * Clear all event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get number of active subscriptions
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get history size
   */
  getHistorySize(): number {
    return this.eventHistory.length;
  }

  /**
   * Clean up all subscriptions and resources
   */
  cleanup(): void {
    if (this.isCleaningUp) {
      return;
    }

    this.isCleaningUp = true;

    // Clear all batch timers
    for (const subscription of this.subscriptions.values()) {
      if (subscription.batchTimer) {
        clearTimeout(subscription.batchTimer);
      }
    }

    // Clear all subscriptions
    this.subscriptions.clear();

    // Clear event listeners
    for (const listeners of this.eventListeners.values()) {
      listeners.clear();
    }

    // Clear history
    this.eventHistory = [];

    this.isCleaningUp = false;
  }

  /**
   * Get subscription details (for debugging)
   */
  getSubscriptionDetails(subscriptionId: SubscriptionId): any {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription) {
      return null;
    }

    return {
      id: subscriptionId,
      hasFilter: !!subscription.filter,
      batchingEnabled: subscription.batchEvents,
      batchSize: subscription.batchSize,
      batchTimeout: subscription.batchTimeout,
      pendingBatchedEvents: subscription.batchedEvents?.length || 0,
    };
  }
}
