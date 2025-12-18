import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Validation utilities for the Lukas SDK
 */

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  if (typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate an Ethereum address and throw error if invalid
 */
export function validateAddress(address: string, fieldName: string = 'address'): void {
  if (!address || typeof address !== 'string') {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_ADDRESS,
      `${fieldName} must be a string`
    );
  }

  if (!isValidAddress(address)) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_ADDRESS,
      `Invalid ${fieldName}: ${address}. Must be a valid Ethereum address (0x followed by 40 hex characters)`
    );
  }
}

/**
 * Validate an amount is a valid positive number
 */
export function validateAmount(
  amount: string | number | bigint,
  fieldName: string = 'amount'
): void {
  if (amount === null || amount === undefined) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_AMOUNT,
      `${fieldName} is required`
    );
  }

  try {
    const amountBN = typeof amount === 'string' ? BigInt(amount) : BigInt(amount.toString());
    if (amountBN < 0n) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_AMOUNT,
        `${fieldName} must be non-negative, got: ${amount}`
      );
    }
  } catch (error) {
    if (error instanceof LukasSDKError) throw error;
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_AMOUNT,
      `Invalid ${fieldName}: ${amount}. Must be a valid number`
    );
  }
}

/**
 * Validate multiple addresses
 */
export function validateAddresses(addresses: string[], fieldName: string = 'addresses'): void {
  if (!Array.isArray(addresses)) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be an array`
    );
  }

  if (addresses.length === 0) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} cannot be empty`
    );
  }

  addresses.forEach((address, index) => {
    validateAddress(address, `${fieldName}[${index}]`);
  });
}

/**
 * Validate that a value is not null or undefined
 */
export function validateRequired<T>(value: T | null | undefined, fieldName: string = 'value'): T {
  if (value === null || value === undefined) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} is required`
    );
  }
  return value;
}

/**
 * Validate that a string is not empty
 */
export function validateNonEmptyString(value: string, fieldName: string = 'value'): string {
  if (typeof value !== 'string') {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be a string`
    );
  }

  if (value.trim().length === 0) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} cannot be empty`
    );
  }

  return value.trim();
}

/**
 * Sanitize input string by trimming and validating
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      'Input must be a string'
    );
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      'Input cannot be empty'
    );
  }

  if (trimmed.length > maxLength) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `Input exceeds maximum length of ${maxLength} characters`
    );
  }

  return trimmed;
}

/**
 * Validate that a number is within a range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'value'
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be a valid number`
    );
  }

  if (value < min || value > max) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be between ${min} and ${max}, got: ${value}`
    );
  }
}

/**
 * Validate that a value is one of the allowed options
 */
export function validateEnum<T>(
  value: T,
  allowedValues: T[],
  fieldName: string = 'value'
): void {
  if (!allowedValues.includes(value)) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be one of: ${allowedValues.join(', ')}, got: ${value}`
    );
  }
}

/**
 * Validate that an object has required properties
 */
export function validateObjectShape<T extends Record<string, any>>(
  obj: any,
  requiredKeys: (keyof T)[],
  objectName: string = 'object'
): T {
  if (typeof obj !== 'object' || obj === null) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${objectName} must be an object`
    );
  }

  const missingKeys = requiredKeys.filter((key) => !(key in obj));

  if (missingKeys.length > 0) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${objectName} is missing required properties: ${missingKeys.join(', ')}`
    );
  }

  return obj as T;
}

/**
 * Validate that a value is a positive integer
 */
export function validatePositiveInteger(
  value: any,
  fieldName: string = 'value'
): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be a positive integer, got: ${value}`
    );
  }
  return value;
}

/**
 * Validate that a value is a non-negative integer
 */
export function validateNonNegativeInteger(
  value: any,
  fieldName: string = 'value'
): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be a non-negative integer, got: ${value}`
    );
  }
  return value;
}

/**
 * Validate that a value is a valid URL
 */
export function validateUrl(url: string, fieldName: string = 'url'): string {
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be a valid URL, got: ${url}`
    );
  }
}

/**
 * Validate that a value is a valid JSON string
 */
export function validateJson(value: string, fieldName: string = 'value'): any {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new LukasSDKError(
      LukasSDKErrorCode.INVALID_PARAMETERS,
      `${fieldName} must be valid JSON`
    );
  }
}

/**
 * Batch validation - validate multiple values and collect errors
 */
export function validateBatch(
  validations: Array<{ name: string; fn: () => void }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  validations.forEach(({ name, fn }) => {
    try {
      fn();
    } catch (error) {
      if (error instanceof LukasSDKError) {
        errors[name] = error.message;
      } else {
        errors[name] = String(error);
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
