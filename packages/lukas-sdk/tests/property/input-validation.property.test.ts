import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  isValidAddress,
  validateAddress,
  validateAmount,
  validateAddresses,
  validateRequired,
  validateNonEmptyString,
  sanitizeInput,
  validateRange,
  validateEnum,
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateUrl,
  validateBatch,
} from '../../src/utils/Validation';
import { LukasSDKError, LukasSDKErrorCode } from '../../src/errors';

describe('Input Validation Property Tests', () => {
  /**
   * **Feature: lukas-sdk, Property 23: Input validation consistency**
   * **Validates: Requirements 7.4**
   *
   * For any invalid parameters provided to SDK methods, the SDK should validate
   * inputs and return descriptive validation errors
   */
  it('Property 23: Input validation consistency', async () => {
    // Generator for invalid addresses
    const invalidAddressGen = fc.oneof(
      fc.constant(''),
      fc.constant('0x'),
      fc.constant('0x123'),
      fc.constant('not-an-address'),
      fc.constant('0x' + 'g'.repeat(40)),
      fc.constant('0x' + 'a'.repeat(39)),
      fc.constant('0x' + 'a'.repeat(41)),
      fc.stringMatching(/^0x[a-fA-F0-9]{0,39}$/),
      fc.stringMatching(/^0x[a-fA-F0-9]{41,}$/)
    );

    await fc.assert(
      fc.asyncProperty(invalidAddressGen, async (invalidAddress) => {
        // Verify invalid address is rejected
        expect(() => validateAddress(invalidAddress)).toThrow(LukasSDKError);

        try {
          validateAddress(invalidAddress);
        } catch (error) {
          if (error instanceof LukasSDKError) {
            expect(error.code).toBe(LukasSDKErrorCode.INVALID_ADDRESS);
            expect(error.message).toBeDefined();
            expect(error.message.length).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that valid addresses are accepted
   */
  it('Valid addresses are accepted', async () => {
    const validAddressGen = fc
      .hexaString({ minLength: 40, maxLength: 40 })
      .map((hex) => `0x${hex}`);

    await fc.assert(
      fc.asyncProperty(validAddressGen, async (validAddress) => {
        // Should not throw
        expect(() => validateAddress(validAddress)).not.toThrow();

        // isValidAddress should return true
        expect(isValidAddress(validAddress)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that invalid amounts are rejected
   */
  it('Invalid amounts are rejected', async () => {
    const invalidAmountGen = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant('not-a-number'),
      fc.constant('-100'),
      fc.constant('-1'),
      fc.stringMatching(/^-[1-9]\d*$/) // Negative numbers (excluding -0)
    );

    await fc.assert(
      fc.asyncProperty(invalidAmountGen, async (invalidAmount) => {
        // Verify invalid amount is rejected
        expect(() => validateAmount(invalidAmount as any)).toThrow(LukasSDKError);

        try {
          validateAmount(invalidAmount as any);
        } catch (error) {
          if (error instanceof LukasSDKError) {
            expect(error.code).toBe(LukasSDKErrorCode.INVALID_AMOUNT);
            expect(error.message).toBeDefined();
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that valid amounts are accepted
   */
  it('Valid amounts are accepted', async () => {
    const validAmountGen = fc.bigUintN(256).map((n) => n.toString());

    await fc.assert(
      fc.asyncProperty(validAmountGen, async (validAmount) => {
        // Should not throw
        expect(() => validateAmount(validAmount)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that required values are enforced
   */
  it('Required values are enforced', async () => {
    expect(() => validateRequired(null, 'test')).toThrow(LukasSDKError);
    expect(() => validateRequired(undefined, 'test')).toThrow(LukasSDKError);
    expect(() => validateRequired('value', 'test')).not.toThrow();
    expect(() => validateRequired(0, 'test')).not.toThrow();
    expect(() => validateRequired(false, 'test')).not.toThrow();
  });

  /**
   * Test that non-empty strings are enforced
   */
  it('Non-empty strings are enforced', async () => {
    const emptyStringGen = fc.oneof(
      fc.constant(''),
      fc.constant('   '),
      fc.constant('\t'),
      fc.constant('\n')
    );

    await fc.assert(
      fc.asyncProperty(emptyStringGen, async (emptyString) => {
        expect(() => validateNonEmptyString(emptyString)).toThrow(LukasSDKError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that non-empty strings are accepted
   */
  it('Non-empty strings are accepted', async () => {
    // Generate strings with at least one non-whitespace character
    const nonEmptyStringGen = fc
      .tuple(
        fc.stringMatching(/^[a-zA-Z0-9]{1,50}$/),
        fc.stringMatching(/^[ ]*$/),
        fc.stringMatching(/^[ ]*$/)
      )
      .map(([middle, prefix, suffix]) => prefix + middle + suffix);

    await fc.assert(
      fc.asyncProperty(nonEmptyStringGen, async (nonEmptyString) => {
        expect(() => validateNonEmptyString(nonEmptyString)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that input sanitization works
   */
  it('Input sanitization works', async () => {
    // Generate strings with at least one non-whitespace character
    const inputGen = fc
      .tuple(
        fc.stringMatching(/^[a-zA-Z0-9]{1,50}$/),
        fc.stringMatching(/^[ ]*$/),
        fc.stringMatching(/^[ ]*$/)
      )
      .map(([middle, prefix, suffix]) => prefix + middle + suffix);

    await fc.assert(
      fc.asyncProperty(inputGen, async (input) => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).toBe(input.trim());
        expect(sanitized.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that range validation works
   */
  it('Range validation works', async () => {
    const inRangeGen = fc.integer({ min: 0, max: 100 });
    const outOfRangeGen = fc.oneof(
      fc.integer({ min: -100, max: -1 }),
      fc.integer({ min: 101, max: 200 })
    );

    await fc.assert(
      fc.asyncProperty(inRangeGen, async (value) => {
        // Should not throw for values in range
        expect(() => validateRange(value, 0, 100)).not.toThrow();
      }),
      { numRuns: 50 }
    );

    await fc.assert(
      fc.asyncProperty(outOfRangeGen, async (value) => {
        // Should throw for values outside range
        expect(() => validateRange(value, 0, 100)).toThrow(LukasSDKError);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Test that enum validation works
   */
  it('Enum validation works', async () => {
    const allowedValues = ['red', 'green', 'blue'];
    const valueGen = fc.oneof(
      fc.constantFrom(...allowedValues),
      fc.stringMatching(/^[a-z]{1,10}$/)
    );

    await fc.assert(
      fc.asyncProperty(valueGen, async (value) => {
        if (allowedValues.includes(value)) {
          expect(() => validateEnum(value, allowedValues)).not.toThrow();
        } else {
          expect(() => validateEnum(value, allowedValues)).toThrow(LukasSDKError);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that positive integer validation works
   */
  it('Positive integer validation works', async () => {
    const positiveIntGen = fc.integer({ min: 1, max: 1000 });
    const nonPositiveGen = fc.oneof(
      fc.integer({ min: -1000, max: 0 }),
      fc.constant(null),
      fc.constant(undefined)
    );

    await fc.assert(
      fc.asyncProperty(positiveIntGen, async (value) => {
        expect(() => validatePositiveInteger(value)).not.toThrow();
      }),
      { numRuns: 50 }
    );

    await fc.assert(
      fc.asyncProperty(nonPositiveGen, async (value) => {
        expect(() => validatePositiveInteger(value)).toThrow(LukasSDKError);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Test that non-negative integer validation works
   */
  it('Non-negative integer validation works', async () => {
    const nonNegativeIntGen = fc.integer({ min: 0, max: 1000 });
    const negativeGen = fc.integer({ min: -1000, max: -1 });

    await fc.assert(
      fc.asyncProperty(nonNegativeIntGen, async (value) => {
        expect(() => validateNonNegativeInteger(value)).not.toThrow();
      }),
      { numRuns: 50 }
    );

    await fc.assert(
      fc.asyncProperty(negativeGen, async (value) => {
        expect(() => validateNonNegativeInteger(value)).toThrow(LukasSDKError);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Test that URL validation works
   */
  it('URL validation works', async () => {
    const validUrlGen = fc.oneof(
      fc.constant('https://example.com'),
      fc.constant('http://localhost:3000'),
      fc.constant('https://api.example.com/path')
    );

    const invalidUrlGen = fc.oneof(
      fc.constant('not-a-url'),
      fc.constant('example.com'),
      fc.constant('invalid')
    );

    await fc.assert(
      fc.asyncProperty(validUrlGen, async (url) => {
        expect(() => validateUrl(url)).not.toThrow();
      }),
      { numRuns: 50 }
    );

    await fc.assert(
      fc.asyncProperty(invalidUrlGen, async (url) => {
        expect(() => validateUrl(url)).toThrow(LukasSDKError);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Test that batch validation works
   */
  it('Batch validation works', async () => {
    const result = validateBatch([
      {
        name: 'address',
        fn: () => validateAddress('0x' + 'a'.repeat(40)),
      },
      {
        name: 'amount',
        fn: () => validateAmount('1000'),
      },
    ]);

    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  /**
   * Test that batch validation collects errors
   */
  it('Batch validation collects errors', async () => {
    const result = validateBatch([
      {
        name: 'address',
        fn: () => validateAddress('invalid'),
      },
      {
        name: 'amount',
        fn: () => validateAmount('-100'),
      },
    ]);

    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(2);
    expect(result.errors.address).toBeDefined();
    expect(result.errors.amount).toBeDefined();
  });

  /**
   * Test that validation errors have consistent structure
   */
  it('Validation errors have consistent structure', async () => {
    const invalidInputGen = fc.oneof(
      fc.constant('invalid-address'),
      fc.constant('-100'),
      fc.constant('')
    );

    await fc.assert(
      fc.asyncProperty(invalidInputGen, async (input) => {
        try {
          validateAddress(input);
        } catch (error) {
          if (error instanceof LukasSDKError) {
            expect(error.code).toBeDefined();
            expect(typeof error.code).toBe('string');
            expect(error.message).toBeDefined();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that multiple addresses validation works
   */
  it('Multiple addresses validation works', async () => {
    const validAddressGen = fc
      .hexaString({ minLength: 40, maxLength: 40 })
      .map((hex) => `0x${hex}`);

    const addressArrayGen = fc.array(validAddressGen, { minLength: 1, maxLength: 5 });

    await fc.assert(
      fc.asyncProperty(addressArrayGen, async (addresses) => {
        expect(() => validateAddresses(addresses)).not.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Test that empty address array is rejected
   */
  it('Empty address array is rejected', async () => {
    expect(() => validateAddresses([])).toThrow(LukasSDKError);
  });
});
