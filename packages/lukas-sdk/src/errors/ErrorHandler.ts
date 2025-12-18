import { LukasSDKError, LukasSDKErrorCode } from './LukasSDKError';

/**
 * Error message mapping for user-friendly error messages
 */
const ERROR_MESSAGE_MAP: Record<LukasSDKErrorCode, string> = {
  // Network errors
  [LukasSDKErrorCode.NETWORK_NOT_SUPPORTED]: 'The specified network is not supported by the Lukas SDK',
  [LukasSDKErrorCode.NETWORK_CONNECTION_FAILED]: 'Failed to connect to the network. Please check your connection and try again',
  [LukasSDKErrorCode.PROVIDER_NOT_AVAILABLE]: 'No wallet provider is available. Please connect a wallet',

  // Contract errors
  [LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED]: 'The contract is not deployed on this network',
  [LukasSDKErrorCode.CONTRACT_CALL_FAILED]: 'Failed to call the contract. Please try again',
  [LukasSDKErrorCode.TRANSACTION_FAILED]: 'Transaction failed. Please check your parameters and try again',

  // Validation errors
  [LukasSDKErrorCode.INVALID_ADDRESS]: 'Invalid Ethereum address provided',
  [LukasSDKErrorCode.INVALID_AMOUNT]: 'Invalid amount provided. Amount must be a positive number',
  [LukasSDKErrorCode.INVALID_PARAMETERS]: 'Invalid parameters provided',
  [LukasSDKErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient balance to complete this transaction',
  [LukasSDKErrorCode.INSUFFICIENT_ALLOWANCE]: 'Insufficient allowance. Please approve the token first',

  // Authorization errors
  [LukasSDKErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action',
  [LukasSDKErrorCode.SIGNER_REQUIRED]: 'A signer is required to perform this action. Please connect a wallet',

  // Data errors
  [LukasSDKErrorCode.STALE_DATA]: 'The data is stale. Please refresh and try again',
  [LukasSDKErrorCode.INVALID_RESPONSE]: 'Invalid response received from the contract',

  // Configuration errors
  [LukasSDKErrorCode.INVALID_NETWORK_CONFIG]: 'Invalid network configuration provided',
  [LukasSDKErrorCode.MISSING_CONTRACT_ADDRESS]: 'Required contract address is missing',
};

/**
 * Common contract revert patterns and their user-friendly messages
 */
const REVERT_PATTERN_MAP: Record<string, { code: LukasSDKErrorCode; message: string }> = {
  'insufficient balance': {
    code: LukasSDKErrorCode.INSUFFICIENT_BALANCE,
    message: 'You do not have enough tokens to complete this transaction',
  },
  'insufficient allowance': {
    code: LukasSDKErrorCode.INSUFFICIENT_ALLOWANCE,
    message: 'You need to approve more tokens before performing this action',
  },
  'transfer amount exceeds balance': {
    code: LukasSDKErrorCode.INSUFFICIENT_BALANCE,
    message: 'Transfer amount exceeds your balance',
  },
  'transfer amount exceeds allowance': {
    code: LukasSDKErrorCode.INSUFFICIENT_ALLOWANCE,
    message: 'Transfer amount exceeds the approved allowance',
  },
  'caller is not the owner': {
    code: LukasSDKErrorCode.UNAUTHORIZED,
    message: 'You do not have permission to perform this action',
  },
  'only authorized': {
    code: LukasSDKErrorCode.UNAUTHORIZED,
    message: 'Only authorized addresses can perform this action',
  },
  'network mismatch': {
    code: LukasSDKErrorCode.NETWORK_NOT_SUPPORTED,
    message: 'Your wallet is connected to a different network',
  },
};

/**
 * Parse contract revert reasons and return structured error
 */
export function parseContractError(error: any): LukasSDKError {
  const errorMessage = error?.message || error?.reason || String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Check for known revert patterns
  for (const [pattern, errorInfo] of Object.entries(REVERT_PATTERN_MAP)) {
    if (lowerMessage.includes(pattern)) {
      return new LukasSDKError(errorInfo.code, errorInfo.message, error);
    }
  }

  // Check for generic contract call failures
  if (lowerMessage.includes('call failed') || lowerMessage.includes('reverted')) {
    return new LukasSDKError(
      LukasSDKErrorCode.CONTRACT_CALL_FAILED,
      'Contract call failed. Please check your parameters and try again',
      error
    );
  }

  // Check for network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout')
  ) {
    return new LukasSDKError(
      LukasSDKErrorCode.NETWORK_CONNECTION_FAILED,
      'Network error occurred. Please check your connection and try again',
      error
    );
  }

  // Default to generic error
  return new LukasSDKError(
    LukasSDKErrorCode.CONTRACT_CALL_FAILED,
    'An unexpected error occurred',
    error
  );
}

/**
 * Get user-friendly error message for an error code
 */
export function getUserFriendlyMessage(code: LukasSDKErrorCode): string {
  return ERROR_MESSAGE_MAP[code] || 'An unexpected error occurred';
}

/**
 * Create a structured error response
 */
export function createErrorResponse(error: any): {
  code: LukasSDKErrorCode;
  message: string;
  details?: any;
} {
  if (error instanceof LukasSDKError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  const parsedError = parseContractError(error);
  return {
    code: parsedError.code,
    message: parsedError.message,
    details: parsedError.details,
  };
}

/**
 * Wrap an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string = 'Operation'
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof LukasSDKError) {
      throw error;
    }
    const parsedError = parseContractError(error);
    throw new LukasSDKError(
      parsedError.code,
      `${context}: ${parsedError.message}`,
      error
    );
  }
}
