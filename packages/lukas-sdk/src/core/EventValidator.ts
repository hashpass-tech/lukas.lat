import { isAddress } from 'ethers';
import type { EventData } from '../types';

/**
 * Event validation schema
 */
export interface EventSchema {
  /** Required fields */
  required: string[];
  /** Field types */
  types: Record<string, string>;
  /** Field validators */
  validators?: Record<string, (value: any) => boolean>;
}

/**
 * Event validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

/**
 * Event validator for schema validation and data integrity
 */
export class EventValidator {
  private schemas: Map<string, EventSchema> = new Map();

  constructor() {
    this.initializeSchemas();
  }

  /**
   * Initialize event schemas
   */
  private initializeSchemas(): void {
    // Transfer event schema
    this.schemas.set('Transfer', {
      required: ['from', 'to', 'amount', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        from: 'string',
        to: 'string',
        amount: 'bigint|string|number',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        from: (v) => isAddress(v),
        to: (v) => isAddress(v),
        amount: (v) => this.isValidAmount(v),
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // Approval event schema
    this.schemas.set('Approval', {
      required: ['owner', 'spender', 'amount', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        owner: 'string',
        spender: 'string',
        amount: 'bigint|string|number',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        owner: (v) => isAddress(v),
        spender: (v) => isAddress(v),
        amount: (v) => this.isValidAmount(v),
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // StabilizationMint event schema
    this.schemas.set('StabilizationMint', {
      required: ['amount', 'poolPrice', 'fairPrice', 'recipient', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        amount: 'bigint|string|number',
        poolPrice: 'bigint|string|number',
        fairPrice: 'bigint|string|number',
        recipient: 'string',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        amount: (v) => this.isValidAmount(v),
        poolPrice: (v) => this.isValidAmount(v),
        fairPrice: (v) => this.isValidAmount(v),
        recipient: (v) => isAddress(v),
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // StabilizationBuyback event schema
    this.schemas.set('StabilizationBuyback', {
      required: ['amount', 'poolPrice', 'fairPrice', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        amount: 'bigint|string|number',
        poolPrice: 'bigint|string|number',
        fairPrice: 'bigint|string|number',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        amount: (v) => this.isValidAmount(v),
        poolPrice: (v) => this.isValidAmount(v),
        fairPrice: (v) => this.isValidAmount(v),
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // VaultParameterUpdate event schema
    this.schemas.set('VaultParameterUpdate', {
      required: ['parameterName', 'oldValue', 'newValue', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        parameterName: 'string',
        oldValue: 'bigint|string|number',
        newValue: 'bigint|string|number',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        parameterName: (v) => typeof v === 'string' && v.length > 0,
        oldValue: (v) => this.isValidAmount(v),
        newValue: (v) => this.isValidAmount(v),
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // IndexUpdate event schema
    this.schemas.set('IndexUpdate', {
      required: ['valueUSD', 'currencies', 'weights', 'prices', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        valueUSD: 'bigint|string|number',
        currencies: 'array',
        weights: 'array',
        prices: 'array',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        valueUSD: (v) => this.isValidAmount(v),
        currencies: (v) => Array.isArray(v) && v.length > 0,
        weights: (v) => Array.isArray(v) && v.length > 0,
        prices: (v) => Array.isArray(v) && v.length > 0,
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // PegDeviation event schema
    this.schemas.set('PegDeviation', {
      required: ['poolPrice', 'fairPrice', 'deviationBps', 'isOverPeg', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        poolPrice: 'bigint|string|number',
        fairPrice: 'bigint|string|number',
        deviationBps: 'number',
        isOverPeg: 'boolean',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        poolPrice: (v) => this.isValidAmount(v),
        fairPrice: (v) => this.isValidAmount(v),
        deviationBps: (v) => typeof v === 'number' && v >= 0,
        isOverPeg: (v) => typeof v === 'boolean',
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // LiquidityAdded event schema
    this.schemas.set('LiquidityAdded', {
      required: ['provider', 'liquidity', 'tickLower', 'tickUpper', 'amount0', 'amount1', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        provider: 'string',
        liquidity: 'bigint|string|number',
        tickLower: 'number',
        tickUpper: 'number',
        amount0: 'bigint|string|number',
        amount1: 'bigint|string|number',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        provider: (v) => isAddress(v),
        liquidity: (v) => this.isValidAmount(v),
        tickLower: (v) => typeof v === 'number',
        tickUpper: (v) => typeof v === 'number',
        amount0: (v) => this.isValidAmount(v),
        amount1: (v) => this.isValidAmount(v),
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });

    // LiquidityRemoved event schema
    this.schemas.set('LiquidityRemoved', {
      required: ['provider', 'liquidity', 'tickLower', 'tickUpper', 'amount0', 'amount1', 'blockNumber', 'transactionHash', 'timestamp'],
      types: {
        provider: 'string',
        liquidity: 'bigint|string|number',
        tickLower: 'number',
        tickUpper: 'number',
        amount0: 'bigint|string|number',
        amount1: 'bigint|string|number',
        blockNumber: 'number',
        transactionHash: 'string',
        timestamp: 'number',
      },
      validators: {
        provider: (v) => isAddress(v),
        liquidity: (v) => this.isValidAmount(v),
        tickLower: (v) => typeof v === 'number',
        tickUpper: (v) => typeof v === 'number',
        amount0: (v) => this.isValidAmount(v),
        amount1: (v) => this.isValidAmount(v),
        blockNumber: (v) => typeof v === 'number' && v >= 0,
        transactionHash: (v) => typeof v === 'string' && v.startsWith('0x'),
        timestamp: (v) => typeof v === 'number' && v > 0,
      },
    });
  }

  /**
   * Check if value is a valid amount
   */
  private isValidAmount(value: any): boolean {
    try {
      if (typeof value === 'number') {
        return value >= 0 && Number.isFinite(value);
      }
      if (typeof value === 'string') {
        const bn = BigInt(value);
        return bn >= 0n;
      }
      if (typeof value === 'bigint') {
        return value >= 0n;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Validate event data against schema
   */
  validate(eventType: string, data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const schema = this.schemas.get(eventType);
    if (!schema) {
      errors.push(`Unknown event type: ${eventType}`);
      return { valid: false, errors, warnings };
    }

    // Check required fields
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate fields
    for (const [field, value] of Object.entries(data)) {
      if (!schema.required.includes(field)) {
        warnings.push(`Unknown field: ${field}`);
        continue;
      }

      // Run custom validator if available
      if (schema.validators && schema.validators[field]) {
        if (!schema.validators[field](value)) {
          errors.push(`Invalid value for field ${field}: ${value}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Format event data for consistent output
   */
  formatEvent(event: EventData): EventData {
    // Normalize addresses to lowercase
    if ('from' in event) {
      event.from = event.from.toLowerCase();
    }
    if ('to' in event) {
      event.to = event.to.toLowerCase();
    }
    if ('owner' in event) {
      event.owner = event.owner.toLowerCase();
    }
    if ('spender' in event) {
      event.spender = event.spender.toLowerCase();
    }
    if ('recipient' in event) {
      event.recipient = event.recipient.toLowerCase();
    }
    if ('provider' in event) {
      event.provider = event.provider.toLowerCase();
    }

    // Ensure timestamp is set
    if (!event.timestamp || event.timestamp === 0) {
      event.timestamp = Date.now();
    }

    // Ensure transaction hash is lowercase
    if (event.transactionHash) {
      event.transactionHash = event.transactionHash.toLowerCase();
    }

    return event;
  }

  /**
   * Convert event to JSON-serializable format
   */
  toJSON(event: EventData): Record<string, any> {
    const json: Record<string, any> = {};

    for (const [key, value] of Object.entries(event)) {
      if (typeof value === 'bigint') {
        json[key] = value.toString();
      } else if (Array.isArray(value)) {
        json[key] = value.map(v => typeof v === 'bigint' ? v.toString() : v);
      } else {
        json[key] = value;
      }
    }

    return json;
  }

  /**
   * Parse event from JSON
   */
  fromJSON(eventType: string, json: Record<string, any>): EventData {
    const event = { ...json } as any;

    // Convert string amounts back to BigInt where needed
    const schema = this.schemas.get(eventType);
    if (schema) {
      for (const [field, typeStr] of Object.entries(schema.types)) {
        if (typeStr.includes('bigint') && typeof event[field] === 'string') {
          try {
            event[field] = BigInt(event[field]);
          } catch {
            // Keep as string if conversion fails
          }
        }
      }
    }

    return event as EventData;
  }

  /**
   * Get event schema
   */
  getSchema(eventType: string): EventSchema | undefined {
    return this.schemas.get(eventType);
  }

  /**
   * Get all event types
   */
  getEventTypes(): string[] {
    return Array.from(this.schemas.keys());
  }
}

/**
 * Event formatter for consistent event data formatting
 */
export class EventFormatter {
  private validator: EventValidator;

  constructor(validator: EventValidator) {
    this.validator = validator;
  }

  /**
   * Format event with metadata
   */
  formatWithMetadata(event: EventData, metadata?: Record<string, any>): Record<string, any> {
    const formatted = this.validator.toJSON(event);

    return {
      ...formatted,
      _metadata: {
        formattedAt: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Format event for display
   */
  formatForDisplay(event: EventData): string {
    const eventType = this.getEventType(event);
    const json = this.validator.toJSON(event);

    return `${eventType} Event:\n${JSON.stringify(json, null, 2)}`;
  }

  /**
   * Get event type from event data
   */
  private getEventType(event: EventData): string {
    if ('from' in event && 'to' in event && 'owner' in event === false) {
      return 'Transfer';
    }
    if ('owner' in event && 'spender' in event) {
      return 'Approval';
    }
    if ('recipient' in event && 'poolPrice' in event) {
      return 'StabilizationMint';
    }
    if ('poolPrice' in event && 'recipient' in event === false) {
      return 'StabilizationBuyback';
    }
    if ('parameterName' in event) {
      return 'VaultParameterUpdate';
    }
    if ('currencies' in event) {
      return 'IndexUpdate';
    }
    if ('deviationBps' in event) {
      return 'PegDeviation';
    }
    if ('liquidity' in event && 'tickLower' in event && 'provider' in event) {
      return 'LiquidityAdded';
    }

    return 'Unknown';
  }
}
