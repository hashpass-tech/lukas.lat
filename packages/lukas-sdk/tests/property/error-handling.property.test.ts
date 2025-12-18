import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  LukasSDKError,
  LukasSDKErrorCode,
  parseContractError,
  getUserFriendlyMessage,
  createErrorResponse,
} from '../../src/errors';

describe('Error Handling Property Tests', () => {
  /**
   * **Feature: lukas-sdk, Property 6: Error handling consistency**
   * **Validates: Requirements 2.5, 7.1, 7.3**
   *
   * For any SDK method that encounters an error, the response should be a
   * structured error object with error codes and human-readable messages
   */
  it('Property 6: Error handling consistency', async () => {
    // Generator for error messages that might come from contracts
    const errorMessageGen = fc.oneof(
      fc.constant('insufficient balance'),
      fc.constant('insufficient allowance'),
      fc.constant('transfer amount exceeds balance'),
      fc.constant('transfer amount exceeds allowance'),
      fc.constant('caller is not the owner'),
      fc.constant('only authorized'),
      fc.constant('network mismatch'),
      fc.constant('call failed'),
      fc.constant('reverted'),
      fc.stringMatching(/^Error: .{1,100}$/),
      fc.stringMatching(/^Contract call failed: .{1,100}$/)
    );

    await fc.assert(
      fc.asyncProperty(errorMessageGen, async (errorMessage) => {
        // Create an error object similar to what ethers.js would throw
        const error = new Error(errorMessage);

        // Parse the error
        const parsedError = parseContractError(error);

        // Verify error is a LukasSDKError
        expect(parsedError).toBeInstanceOf(LukasSDKError);

        // Verify error has a valid code
        expect(parsedError.code).toBeDefined();
        expect(typeof parsedError.code).toBe('string');

        // Verify error code is one of the known codes
        const validCodes = Object.values(LukasSDKErrorCode);
        expect(validCodes).toContain(parsedError.code);

        // Verify error has a message
        expect(parsedError.message).toBeDefined();
        expect(typeof parsedError.message).toBe('string');
        expect(parsedError.message.length).toBeGreaterThan(0);

        // Verify message is human-readable (not just the raw error)
        expect(parsedError.message).not.toBe(errorMessage);

        // Verify we can get a user-friendly message for the code
        const userMessage = getUserFriendlyMessage(parsedError.code);
        expect(userMessage).toBeDefined();
        expect(typeof userMessage).toBe('string');
        expect(userMessage.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that all error codes have user-friendly messages
   */
  it('All error codes have user-friendly messages', () => {
    const allCodes = Object.values(LukasSDKErrorCode);

    allCodes.forEach((code) => {
      const message = getUserFriendlyMessage(code);
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test that error response creation is consistent
   */
  it('Error response creation is consistent', async () => {
    const errorGen = fc.oneof(
      fc.constant(new Error('test error')),
      fc.constant(new Error('insufficient balance')),
      fc.constant(new Error('network error')),
      fc.constant(new LukasSDKError(LukasSDKErrorCode.INVALID_ADDRESS, 'Invalid address'))
    );

    await fc.assert(
      fc.asyncProperty(errorGen, async (error) => {
        const response = createErrorResponse(error);

        // Verify response structure
        expect(response).toBeDefined();
        expect(response.code).toBeDefined();
        expect(response.message).toBeDefined();

        // Verify code is valid
        const validCodes = Object.values(LukasSDKErrorCode);
        expect(validCodes).toContain(response.code);

        // Verify message is a string
        expect(typeof response.message).toBe('string');
        expect(response.message.length).toBeGreaterThan(0);

        // Verify details are optional but if present, are objects
        if (response.details !== undefined) {
          expect(typeof response.details).toBe('object');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that LukasSDKError instances are preserved
   */
  it('LukasSDKError instances are preserved through error handling', async () => {
    const codeGen = fc.constantFrom(...Object.values(LukasSDKErrorCode));
    const messageGen = fc.stringMatching(/^[a-zA-Z0-9 ]{1,100}$/);

    await fc.assert(
      fc.asyncProperty(codeGen, messageGen, async (code, message) => {
        const originalError = new LukasSDKError(code, message);
        const response = createErrorResponse(originalError);

        // Verify the error code is preserved
        expect(response.code).toBe(code);

        // Verify the message is preserved
        expect(response.message).toBe(message);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that contract revert patterns are correctly identified
   */
  it('Contract revert patterns are correctly identified', async () => {
    const revertPatterns = [
      { pattern: 'insufficient balance', expectedCode: LukasSDKErrorCode.INSUFFICIENT_BALANCE },
      { pattern: 'insufficient allowance', expectedCode: LukasSDKErrorCode.INSUFFICIENT_ALLOWANCE },
      { pattern: 'transfer amount exceeds balance', expectedCode: LukasSDKErrorCode.INSUFFICIENT_BALANCE },
      { pattern: 'transfer amount exceeds allowance', expectedCode: LukasSDKErrorCode.INSUFFICIENT_ALLOWANCE },
      { pattern: 'caller is not the owner', expectedCode: LukasSDKErrorCode.UNAUTHORIZED },
      { pattern: 'only authorized', expectedCode: LukasSDKErrorCode.UNAUTHORIZED },
      { pattern: 'network mismatch', expectedCode: LukasSDKErrorCode.NETWORK_NOT_SUPPORTED },
    ];

    revertPatterns.forEach(({ pattern, expectedCode }) => {
      const error = new Error(pattern);
      const parsedError = parseContractError(error);

      expect(parsedError.code).toBe(expectedCode);
    });
  });

  /**
   * Test that error messages are consistent across similar errors
   */
  it('Error messages are consistent across similar errors', async () => {
    const errorVariations = [
      new Error('insufficient balance'),
      new Error('INSUFFICIENT BALANCE'),
      new Error('Insufficient Balance'),
      new Error('Error: insufficient balance'),
      new Error('Contract Error: insufficient balance'),
    ];

    const parsedErrors = errorVariations.map((error) => parseContractError(error));

    // All should have the same error code
    const firstCode = parsedErrors[0].code;
    parsedErrors.forEach((error) => {
      expect(error.code).toBe(firstCode);
    });

    // All should have non-empty messages
    parsedErrors.forEach((error) => {
      expect(error.message.length).toBeGreaterThan(0);
    });
  });
});
