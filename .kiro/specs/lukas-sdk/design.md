# Lukas SDK Design Document

## Overview

The Lukas SDK is a comprehensive TypeScript library that provides developers with a clean, type-safe interface for interacting with the Lukas Protocol smart contracts. The SDK abstracts the complexity of direct blockchain interactions while maintaining full functionality and flexibility.

The SDK follows modern web3 development patterns, supporting multiple wallet providers (MetaMask, WalletConnect, Alchemy Account Kit), multiple networks, and both read-only and transactional operations. It's designed to integrate seamlessly with existing web applications, particularly those using wagmi, viem, and React.

Key design principles:
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Modularity**: Clean separation of concerns with focused modules
- **Extensibility**: Easy to extend for new features and networks
- **Developer Experience**: Intuitive API with excellent error handling and documentation
- **Performance**: Efficient caching and batching of blockchain calls
- **Compatibility**: Works with existing web3 infrastructure

## Architecture

The SDK follows a layered architecture pattern:

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│  (React Hooks, Utilities, Examples)    │
├─────────────────────────────────────────┤
│            Service Layer                │
│   (Token, Vault, Oracle, Hook Services)│
├─────────────────────────────────────────┤
│             Core Layer                  │
│    (SDK Client, Contract Manager)      │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │
│   (Provider, Network, Error Handling)  │
└─────────────────────────────────────────┘
```

### Core Components

1. **LukasSDK**: Main SDK client that orchestrates all operations
2. **ContractManager**: Manages contract instances and network switching
3. **ServiceLayer**: Individual service classes for each protocol component
4. **ProviderManager**: Handles wallet provider abstraction
5. **NetworkManager**: Manages network configurations and switching
6. **ErrorHandler**: Centralized error handling and user-friendly messages
7. **EventManager**: Real-time event subscription and management
8. **CacheManager**: Intelligent caching for read operations

## Components and Interfaces

### Core SDK Client

```typescript
export class LukasSDK {
  // Core services
  public readonly token: TokenService;
  public readonly vault: VaultService;
  public readonly oracle: OracleService;
  public readonly hook: HookService;
  public readonly liquidity: LiquidityService;
  
  // Utilities
  public readonly events: EventManager;
  public readonly network: NetworkManager;
  
  constructor(config: LukasSDKConfig);
  
  // Network operations
  switchNetwork(networkId: number): Promise<void>;
  getNetworkInfo(): NetworkInfo;
  
  // Provider operations
  connect(provider?: Provider): Promise<void>;
  disconnect(): void;
  getSigner(): Signer | null;
  getProvider(): Provider;
}
```

### Service Interfaces

```typescript
export interface TokenService {
  // Read operations
  getTokenInfo(): Promise<TokenInfo>;
  getBalance(address: string): Promise<BigNumber>;
  getAllowance(owner: string, spender: string): Promise<BigNumber>;
  getTotalSupply(): Promise<BigNumber>;
  
  // Write operations
  transfer(to: string, amount: BigNumber): Promise<TransactionResponse>;
  approve(spender: string, amount: BigNumber): Promise<TransactionResponse>;
  transferFrom(from: string, to: string, amount: BigNumber): Promise<TransactionResponse>;
  
  // Events
  onTransfer(callback: (event: TransferEvent) => void): () => void;
  onApproval(callback: (event: ApprovalEvent) => void): () => void;
}

export interface VaultService {
  // Read operations
  getVaultInfo(): Promise<VaultInfo>;
  getCollateralBalance(): Promise<CollateralBalance>;
  isAuthorized(address: string): Promise<boolean>;
  shouldStabilize(poolPrice: BigNumber): Promise<StabilizationCheck>;
  
  // Write operations (authorized only)
  stabilizeMint(amount: BigNumber, recipient: string): Promise<TransactionResponse>;
  stabilizeBuyback(amount: BigNumber): Promise<TransactionResponse>;
  addLiquidity(lukasAmount: BigNumber, usdcAmount: BigNumber): Promise<TransactionResponse>;
  removeLiquidity(liquidity: BigNumber): Promise<TransactionResponse>;
  
  // Events
  onStabilizationMint(callback: (event: StabilizationMintEvent) => void): () => void;
  onStabilizationBuyback(callback: (event: StabilizationBuybackEvent) => void): () => void;
}

export interface OracleService {
  // Price operations
  getCurrentPrice(): Promise<PriceInfo>;
  getFairPrice(): Promise<BigNumber>;
  getIndexUSD(): Promise<IndexInfo>;
  getCurrencyPrice(currency: string): Promise<CurrencyPriceInfo>;
  
  // Peg operations
  getPegStatus(): Promise<PegStatus>;
  getBasketComposition(): Promise<BasketComposition>;
  hasStaleFeeds(): Promise<boolean>;
  
  // Events
  onIndexUpdate(callback: (event: IndexUpdateEvent) => void): () => void;
  onPegDeviation(callback: (event: PegDeviationEvent) => void): () => void;
}
```

### Configuration Types

```typescript
export interface LukasSDKConfig {
  network: NetworkConfig;
  provider?: Provider;
  contracts?: Partial<ContractAddresses>;
  options?: SDKOptions;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
  blockExplorer?: string;
}

export interface ContractAddresses {
  lukasToken: string;
  stabilizerVault: string;
  latAmBasketIndex: string;
  lukasHook: string;
  usdc: string;
}

export interface SDKOptions {
  enableCaching?: boolean;
  cacheTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableEvents?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

## Data Models

### Core Data Types

```typescript
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
  address: string;
}

export interface VaultInfo {
  maxMintPerAction: BigNumber;
  maxBuybackPerAction: BigNumber;
  deviationThreshold: number;
  cooldownPeriod: number;
  lastStabilization: number;
  totalMinted: BigNumber;
  totalBoughtBack: BigNumber;
}

export interface PegStatus {
  poolPrice: BigNumber;
  fairPrice: BigNumber;
  deviation: number; // in basis points
  isOverPeg: boolean;
  shouldStabilize: boolean;
}

export interface BasketComposition {
  currencies: string[];
  weights: number[]; // in basis points
  prices: BigNumber[];
  lastUpdated: number[];
}

export interface StabilizationCheck {
  shouldStabilize: boolean;
  isOverPeg: boolean;
  deviationBps: number;
  recommendedAmount: BigNumber;
  canExecute: boolean;
  reason?: string;
}
```

### Event Types

```typescript
export interface TransferEvent {
  from: string;
  to: string;
  amount: BigNumber;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

export interface StabilizationMintEvent {
  amount: BigNumber;
  poolPrice: BigNumber;
  fairPrice: BigNumber;
  recipient: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

export interface PegDeviationEvent {
  poolPrice: BigNumber;
  fairPrice: BigNumber;
  deviationBps: number;
  isOverPeg: boolean;
  blockNumber: number;
  timestamp: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Let me analyze the acceptance criteria to determine testable properties:

Based on the prework analysis, here are the key correctness properties for the Lukas SDK:

**Property 1: Network initialization consistency**
*For any* valid network configuration, initializing the SDK should result in connections to the correct contract addresses for that network
**Validates: Requirements 1.3, 10.1**

**Property 2: Invalid network error handling**
*For any* invalid network configuration, the SDK should throw descriptive error messages and not initialize
**Validates: Requirements 1.5, 10.5**

**Property 3: Token information completeness**
*For any* network state, calling getTokenInfo should return all required fields (name, symbol, decimals, totalSupply, address)
**Validates: Requirements 2.1, 2.4**

**Property 4: Balance query consistency**
*For any* valid address, querying balance should return a valid BigNumber representing the current LUKAS balance
**Validates: Requirements 2.2**

**Property 5: Allowance query consistency**
*For any* valid owner and spender address pair, querying allowances should return the correct approved amount
**Validates: Requirements 2.3**

**Property 6: Error handling consistency**
*For any* SDK method that encounters an error, the response should be a structured error object with error codes and human-readable messages
**Validates: Requirements 2.5, 7.1, 7.3**

**Property 7: Transfer operation validity**
*For any* valid transfer parameters with sufficient balance, the transfer method should execute successfully and return transaction details
**Validates: Requirements 3.1**

**Property 8: Insufficient balance protection**
*For any* transfer attempt with insufficient balance, the SDK should prevent the transaction and return an appropriate error
**Validates: Requirements 3.4**

**Property 9: Approval operation validity**
*For any* valid approval parameters, the approve method should set the allowance and return transaction confirmation
**Validates: Requirements 3.2**

**Property 10: TransferFrom with allowance**
*For any* valid transferFrom parameters with sufficient allowance, the operation should execute successfully
**Validates: Requirements 3.3**

**Property 11: Insufficient allowance protection**
*For any* transferFrom attempt with insufficient allowance, the SDK should prevent the transaction and return an appropriate error
**Validates: Requirements 3.5**

**Property 12: Price data validity**
*For any* price query (getCurrentPrice, getFairPrice), the SDK should return valid price data with proper formatting
**Validates: Requirements 4.1, 4.2**

**Property 13: Peg status completeness**
*For any* peg status query, the response should include deviation percentage, over/under peg indication, and all required fields
**Validates: Requirements 4.3**

**Property 14: Basket composition completeness**
*For any* basket composition query, the response should include all currencies, their weights, and individual prices
**Validates: Requirements 4.4**

**Property 15: Stale feed detection**
*For any* price feed query when feeds are stale, the SDK should indicate staleness in the returned data
**Validates: Requirements 4.5**

**Property 16: Event subscription functionality**
*For any* event subscription, the SDK should provide real-time notifications when the subscribed events occur
**Validates: Requirements 5.1, 5.5**

**Property 17: Vault status completeness**
*For any* vault status query, the response should include current collateral balances and all operational parameters
**Validates: Requirements 5.2**

**Property 18: Authorization check accuracy**
*For any* address, checking authorization status should return the correct boolean indicating vault operation permissions
**Validates: Requirements 5.4**

**Property 19: Liquidity operation validity**
*For any* valid liquidity operation parameters with sufficient tokens, the operation should execute and return proper details
**Validates: Requirements 6.1, 6.2, 6.5**

**Property 20: Liquidity position queries**
*For any* valid address, querying liquidity positions should return current position information
**Validates: Requirements 6.3**

**Property 21: Insufficient token protection**
*For any* liquidity operation with insufficient tokens, the SDK should prevent the transaction and return appropriate error
**Validates: Requirements 6.4**

**Property 22: Network retry behavior**
*For any* network connectivity issue, the SDK should retry operations with exponential backoff
**Validates: Requirements 7.2**

**Property 23: Input validation consistency**
*For any* invalid parameters provided to SDK methods, the SDK should validate inputs and return descriptive validation errors
**Validates: Requirements 7.4**

**Property 24: Functional equivalence**
*For any* operation, SDK methods should produce equivalent results to direct contract calls
**Validates: Requirements 8.2**

**Property 25: Network switching consistency**
*For any* network switch operation, the SDK should update all contract connections to the new network automatically
**Validates: Requirements 10.2**

**Property 26: Custom contract configuration**
*For any* valid custom contract addresses, the SDK should accept the configuration and connect to the specified contracts
**Validates: Requirements 10.4**

## Error Handling

The SDK implements a comprehensive error handling strategy:

### Error Types

```typescript
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
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE = 'INSUFFICIENT_ALLOWANCE',
  
  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  SIGNER_REQUIRED = 'SIGNER_REQUIRED',
  
  // Data errors
  STALE_DATA = 'STALE_DATA',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
}

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
```

### Error Handling Strategy

1. **Input Validation**: All public methods validate inputs before execution
2. **Network Error Recovery**: Automatic retry with exponential backoff
3. **Contract Error Parsing**: Parse revert reasons into human-readable messages
4. **Graceful Degradation**: Fallback to read-only mode when signer unavailable
5. **Detailed Error Context**: Include relevant context in error objects

## Testing Strategy

The Lukas SDK will implement a comprehensive dual testing approach combining unit tests and property-based tests to ensure correctness and reliability.

### Unit Testing Approach

Unit tests will focus on:
- **Specific Examples**: Test concrete scenarios with known inputs and expected outputs
- **Edge Cases**: Test boundary conditions, empty inputs, and error scenarios
- **Integration Points**: Test interactions between SDK components
- **Mock Scenarios**: Test behavior with mocked providers and contracts

Unit test examples:
- Test SDK initialization with specific network configurations
- Test token transfer with specific amounts and addresses
- Test error handling with specific failure scenarios
- Test event subscription and unsubscription flows

### Property-Based Testing Approach

Property-based tests will verify universal properties using **fast-check** as the testing library. Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage.

Property-based tests will focus on:
- **Universal Behaviors**: Properties that should hold across all valid inputs
- **Invariants**: Conditions that should remain true regardless of operations
- **Error Consistency**: Ensure error handling behaves consistently across input ranges
- **Data Integrity**: Verify data transformations preserve essential properties

Key property-based test categories:

1. **Network Configuration Properties**
   - Valid network configs should always result in successful initialization
   - Invalid network configs should always throw descriptive errors

2. **Token Operation Properties**
   - Balance queries should always return valid BigNumber values
   - Transfer operations should preserve total supply invariants
   - Allowance operations should maintain consistency between approve/transferFrom

3. **Price and Oracle Properties**
   - Price queries should always return positive values with proper decimals
   - Peg calculations should maintain mathematical consistency
   - Basket composition should always sum to 100% (10000 basis points)

4. **Error Handling Properties**
   - All methods should return structured errors for invalid inputs
   - Error messages should be human-readable and contain relevant context
   - Network failures should trigger consistent retry behavior

5. **Event System Properties**
   - Event subscriptions should always provide cleanup functions
   - Event data should match expected schemas
   - Multiple subscriptions should not interfere with each other

### Testing Configuration

- **Property-based testing library**: fast-check
- **Minimum iterations per property**: 100
- **Test tagging format**: `**Feature: lukas-sdk, Property {number}: {property_text}**`
- **Integration testing**: Tests against deployed contracts on testnets
- **Mock testing**: Comprehensive mocking of blockchain interactions for unit tests

### Test Organization

```
tests/
├── unit/
│   ├── core/
│   ├── services/
│   └── utils/
├── property/
│   ├── network.property.test.ts
│   ├── token.property.test.ts
│   ├── oracle.property.test.ts
│   └── error.property.test.ts
├── integration/
│   ├── contract-interaction.test.ts
│   └── end-to-end.test.ts
└── fixtures/
    ├── contracts.ts
    └── test-data.ts
```

Each property-based test will be tagged with its corresponding design property and requirements validation, ensuring traceability from requirements through design to implementation and testing.