/**
 * Error codes for the Lukas SDK
 */
export enum LukasSDKErrorCode {
  // Network errors
  NETWORK_NOT_SUPPORTED = 'NETWORK_NOT_SUPPORTED',
  NETWORK_CONNECTION_FAILED = 'NETWORK_CONNECTION_FAILED',
  PROVIDER_NOT_AVAILABLE = 'PROVIDER_NOT_AVAILABLE',
  
  // Contract errors
  CONTRACT_NOT_DEPLOYED = 'CONTRACT_NOT_DEPLOYED',
  CONTRACT_CALL_FAILED = 'CONTRACT_CALL_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // Validation errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE = 'INSUFFICIENT_ALLOWANCE',
  
  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  SIGNER_REQUIRED = 'SIGNER_REQUIRED',
  
  // Data errors
  STALE_DATA = 'STALE_DATA',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  
  // Configuration errors
  INVALID_NETWORK_CONFIG = 'INVALID_NETWORK_CONFIG',
  MISSING_CONTRACT_ADDRESS = 'MISSING_CONTRACT_ADDRESS',
}

/**
 * Custom error class for Lukas SDK operations
 */
export class LukasSDKError extends Error {
  constructor(
    public code: LukasSDKErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'LukasSDKError';
  }
}