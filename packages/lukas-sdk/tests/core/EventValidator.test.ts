import { describe, it, expect, beforeEach } from 'vitest';
import { EventValidator, EventFormatter } from '../../src/core/EventValidator';
import type { TransferEvent, ApprovalEvent } from '../../src/types';

describe('EventValidator', () => {
  let validator: EventValidator;

  beforeEach(() => {
    validator = new EventValidator();
  });

  it('should validate Transfer events', () => {
    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const result = validator.validate('Transfer', event);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid Transfer events', () => {
    const invalidEvent = {
      from: 'invalid-address',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const result = validator.validate('Transfer', invalidEvent);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should detect missing required fields', () => {
    const incompleteEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      // missing amount, blockNumber, transactionHash, timestamp
    };

    const result = validator.validate('Transfer', incompleteEvent);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should format events consistently', () => {
    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xABCDEF',
      timestamp: Date.now(),
    };

    const formatted = validator.formatEvent(event);
    expect(formatted.from).toBe(formatted.from.toLowerCase());
    expect(formatted.to).toBe(formatted.to.toLowerCase());
    expect(formatted.transactionHash).toBe(formatted.transactionHash.toLowerCase());
  });

  it('should convert events to JSON', () => {
    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: BigInt('1000000000000000000'),
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const json = validator.toJSON(event);
    expect(json.amount).toBe('1000000000000000000');
    expect(typeof json.amount).toBe('string');
  });

  it('should parse events from JSON', () => {
    const json = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const event = validator.fromJSON('Transfer', json);
    expect(event.from).toBe(json.from);
    expect(event.to).toBe(json.to);
  });

  it('should get event schema', () => {
    const schema = validator.getSchema('Transfer');
    expect(schema).toBeDefined();
    expect(schema?.required).toContain('from');
    expect(schema?.required).toContain('to');
    expect(schema?.required).toContain('amount');
  });

  it('should get all event types', () => {
    const eventTypes = validator.getEventTypes();
    expect(eventTypes).toContain('Transfer');
    expect(eventTypes).toContain('Approval');
    expect(eventTypes).toContain('StabilizationMint');
    expect(eventTypes).toContain('StabilizationBuyback');
  });
});

describe('EventFormatter', () => {
  let validator: EventValidator;
  let formatter: EventFormatter;

  beforeEach(() => {
    validator = new EventValidator();
    formatter = new EventFormatter(validator);
  });

  it('should format event with metadata', () => {
    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const formatted = formatter.formatWithMetadata(event, { source: 'test' });
    expect(formatted._metadata).toBeDefined();
    expect(formatted._metadata.source).toBe('test');
    expect(formatted._metadata.formattedAt).toBeDefined();
  });

  it('should format event for display', () => {
    const event: TransferEvent = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      amount: '1000000000000000000',
      blockNumber: 100,
      transactionHash: '0xabcdef',
      timestamp: Date.now(),
    };

    const displayString = formatter.formatForDisplay(event);
    expect(displayString).toContain('Transfer Event');
    expect(displayString).toContain('0x1234567890123456789012345678901234567890');
  });
});
