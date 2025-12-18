# API Reference

Complete API reference for the Lukas SDK.

## LukasSDK

The main SDK client class.

### Constructor

```typescript
constructor(config: LukasSDKConfig)
```

Creates a new instance of the Lukas SDK.

**Parameters:**
- `config`: Configuration object
  - `network`: Network configuration
    - `chainId`: Network chain ID (e.g., 80002 for Polygon Amoy)
    - `name`: Network name
    - `rpcUrl?`: Optional RPC endpoint URL
    - `blockExplorer?`: Optional block explorer URL
  - `provider?`: Optional ethers Provider for wallet connection
  - `contracts?`: Optional custom contract addresses
  - `options?`: Optional SDK options

**Example:**
```typescript
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
});
```

### Network Methods

#### `getNetworkInfo()`

```typescript
getNetworkInfo(): NetworkInfo
```

Returns information about the current network.

**Returns:** `NetworkInfo` object containing:
- `chainId`: Network chain ID
- `name`: Network name
- `rpcUrl`: RPC endpoint URL
- `blockExplorer?`: Block explorer URL
- `contracts`: Contract addresses

#### `switchNetwork()`

```typescript
async switchNetwork(
  networkId: number,
  customContracts?: Partial<ContractAddresses>,
  networkOptions?: { name?: string; rpcUrl?: string; blockExplorer?: string }
): Promise<NetworkInfo>
```

Switches to a different network.

**Parameters:**
- `networkId`: Target network chain ID
- `customContracts?`: Optional custom contract addresses
- `networkOptions?`: Optional network configuration

**Returns:** Promise resolving to the new network information

**Example:**
```typescript
await sdk.switchNetwork(80002);
```

#### `autoDetectNetwork()`

```typescript
async autoDetectNetwork(): Promise<NetworkInfo | null>
```

Automatically detects and switches to the provider's network.

**Returns:** Promise resolving to detected network info or null

#### `validateNetwork()`

```typescript
async validateNetwork(): Promise<{
  isValid: boolean;
  expected?: number;
  actual?: number;
}>
```

Validates that the current network matches the provider's network.

**Returns:** Validation result object

#### `addCustomNetwork()`

```typescript
async addCustomNetwork(
  config: NetworkConfig & { contracts: ContractAddresses }
): Promise<NetworkInfo>
```

Adds and switches to a custom network.

**Parameters:**
- `config`: Network configuration with contract addresses

**Returns:** Promise resolving to the new network information

#### `onNetworkChange()`

```typescript
onNetworkChange(listener: (networkInfo: NetworkInfo) => void): () => void
```

Subscribes to network change events.

**Parameters:**
- `listener`: Callback function called when network changes

**Returns:** Unsubscribe function

**Example:**
```typescript
const unsubscribe = sdk.onNetworkChange((networkInfo) => {
  console.log('Network changed:', networkInfo.name);
});

// Later: unsubscribe()
```

#### `onNetworkMismatch()`

```typescript
onNetworkMismatch(listener: (expected: number, actual: number) => void): () => void
```

Subscribes to network mismatch events.

**Parameters:**
- `listener`: Callback function called when network mismatch detected

**Returns:** Unsubscribe function

#### `startNetworkMonitoring()`

```typescript
startNetworkMonitoring(intervalMs?: number): void
```

Starts automatic network monitoring.

**Parameters:**
- `intervalMs?`: Optional monitoring interval in milliseconds (default: 5000)

#### `stopNetworkMonitoring()`

```typescript
stopNetworkMonitoring(): void
```

Stops automatic network monitoring.

#### `isNetworkMonitoringActive()`

```typescript
isNetworkMonitoringActive(): boolean
```

Checks if network monitoring is currently active.

**Returns:** Boolean indicating monitoring status

### Provider Methods

#### `getProvider()`

```typescript
getProvider(): Provider | null
```

Gets the current provider.

**Returns:** Ethers Provider or null if not connected

#### `getSigner()`

```typescript
getSigner(): Signer | null
```

Gets the current signer.

**Returns:** Ethers Signer or null if not available

#### `requireSigner()`

```typescript
requireSigner(): Signer
```

Requires a signer, throwing an error if not available.

**Returns:** Ethers Signer

**Throws:** `LukasSDKError` with code `SIGNER_REQUIRED` if no signer available

#### `isReadOnly()`

```typescript
isReadOnly(): boolean
```

Checks if the SDK is in read-only mode.

**Returns:** Boolean indicating read-only status

#### `connect()`

```typescript
async connect(provider?: Provider): Promise<void>
```

Connects to a wallet provider.

**Parameters:**
- `provider?`: Optional ethers Provider (uses existing if not provided)

**Example:**
```typescript
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
await sdk.connect(provider);
```

#### `disconnect()`

```typescript
disconnect(): void
```

Disconnects from the current provider.

### Contract Manager Methods

#### `getContractManager()`

```typescript
getContractManager(): ContractManager
```

Gets the contract manager instance.

**Returns:** ContractManager instance

**Throws:** `LukasSDKError` if contract manager not initialized

### Utility Methods

#### `getOptions()`

```typescript
getOptions(): SDKOptions
```

Gets the current SDK configuration options.

**Returns:** SDK options object

#### `isInitialized()`

```typescript
isInitialized(): boolean
```

Checks if the SDK is initialized.

**Returns:** Boolean indicating initialization status

#### `getCurrentNetworkType()`

```typescript
getCurrentNetworkType(): 'mainnet' | 'testnet' | 'custom' | 'unknown'
```

Gets the current network type.

**Returns:** Network type string

#### `isTestnet()`

```typescript
isTestnet(): boolean
```

Checks if the current network is a testnet.

**Returns:** Boolean indicating testnet status

## ContractManager

Manages smart contract interactions.

### Token Methods

#### `getTokenInfo()`

```typescript
async getTokenInfo(): Promise<TokenInfo>
```

Gets LUKAS token information.

**Returns:** Promise resolving to token info:
- `name`: Token name
- `symbol`: Token symbol
- `decimals`: Token decimals
- `totalSupply`: Total supply
- `address`: Contract address

#### `getBalance()`

```typescript
async getBalance(address: string): Promise<BigNumber>
```

Gets token balance for an address.

**Parameters:**
- `address`: Ethereum address

**Returns:** Promise resolving to balance as BigNumber

#### `getAllowance()`

```typescript
async getAllowance(owner: string, spender: string): Promise<BigNumber>
```

Gets token allowance.

**Parameters:**
- `owner`: Owner address
- `spender`: Spender address

**Returns:** Promise resolving to allowance as BigNumber

#### `transfer()`

```typescript
async transfer(to: string, amount: BigNumber): Promise<TransactionResponse>
```

Transfers tokens (requires signer).

**Parameters:**
- `to`: Recipient address
- `amount`: Amount to transfer

**Returns:** Promise resolving to transaction response

#### `approve()`

```typescript
async approve(spender: string, amount: BigNumber): Promise<TransactionResponse>
```

Approves token spending (requires signer).

**Parameters:**
- `spender`: Spender address
- `amount`: Amount to approve

**Returns:** Promise resolving to transaction response

### Oracle Methods

#### `getFairPrice()`

```typescript
async getFairPrice(): Promise<BigNumber>
```

Gets the fair price from the LatAm Basket Index oracle.

**Returns:** Promise resolving to fair price as BigNumber

#### `getBasketComposition()`

```typescript
async getBasketComposition(): Promise<BasketComposition>
```

Gets the basket composition.

**Returns:** Promise resolving to basket composition:
- `currencies`: Array of currency codes
- `weights`: Array of weights (in basis points)
- `prices`: Array of prices
- `lastUpdated`: Array of last update timestamps

#### `hasStaleFeeds()`

```typescript
async hasStaleFeeds(): Promise<boolean>
```

Checks if any price feeds are stale.

**Returns:** Promise resolving to boolean indicating stale feeds

### Vault Methods

#### `getVaultInfo()`

```typescript
async getVaultInfo(): Promise<VaultInfo>
```

Gets vault information.

**Returns:** Promise resolving to vault info:
- `maxMintPerAction`: Maximum mint per action
- `maxBuybackPerAction`: Maximum buyback per action
- `deviationThreshold`: Deviation threshold
- `cooldownPeriod`: Cooldown period
- `lastStabilization`: Last stabilization timestamp
- `totalMinted`: Total minted amount
- `totalBoughtBack`: Total bought back amount

#### `isAuthorized()`

```typescript
async isAuthorized(address: string): Promise<boolean>
```

Checks if an address is authorized for vault operations.

**Parameters:**
- `address`: Address to check

**Returns:** Promise resolving to authorization status

#### `stabilizeMint()`

```typescript
async stabilizeMint(amount: BigNumber, recipient: string): Promise<TransactionResponse>
```

Performs stabilization mint (requires signer and authorization).

**Parameters:**
- `amount`: Amount to mint
- `recipient`: Recipient address

**Returns:** Promise resolving to transaction response

#### `stabilizeBuyback()`

```typescript
async stabilizeBuyback(amount: BigNumber): Promise<TransactionResponse>
```

Performs stabilization buyback (requires signer and authorization).

**Parameters:**
- `amount`: Amount to buy back

**Returns:** Promise resolving to transaction response

### Contract Instance Methods

#### `getLukasToken()`

```typescript
getLukasToken(): Contract
```

Gets the LUKAS token contract instance.

**Returns:** Ethers Contract instance

#### `getStabilizerVault()`

```typescript
getStabilizerVault(): Contract
```

Gets the Stabilizer Vault contract instance.

**Returns:** Ethers Contract instance

#### `getLatAmBasketIndex()`

```typescript
getLatAmBasketIndex(): Contract
```

Gets the LatAm Basket Index contract instance.

**Returns:** Ethers Contract instance

#### `getAddresses()`

```typescript
getAddresses(): ContractAddresses
```

Gets all contract addresses.

**Returns:** Object containing all contract addresses

## Error Types

### LukasSDKError

Custom error class for SDK errors.

```typescript
class LukasSDKError extends Error {
  code: LukasSDKErrorCode;
  details?: any;
}
```

### LukasSDKErrorCode

Enum of error codes:

- `NETWORK_NOT_SUPPORTED`: Network not supported
- `NETWORK_CONNECTION_FAILED`: Network connection failed
- `PROVIDER_NOT_AVAILABLE`: Provider not available
- `CONTRACT_NOT_DEPLOYED`: Contract not deployed
- `CONTRACT_CALL_FAILED`: Contract call failed
- `TRANSACTION_FAILED`: Transaction failed
- `INVALID_ADDRESS`: Invalid address
- `INVALID_AMOUNT`: Invalid amount
- `INSUFFICIENT_BALANCE`: Insufficient balance
- `INSUFFICIENT_ALLOWANCE`: Insufficient allowance
- `UNAUTHORIZED`: Unauthorized operation
- `SIGNER_REQUIRED`: Signer required

## Type Definitions

### NetworkConfig

```typescript
interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
  blockExplorer?: string;
}
```

### ContractAddresses

```typescript
interface ContractAddresses {
  lukasToken: string;
  stabilizerVault: string;
  latAmBasketIndex: string;
  lukasHook: string;
  usdc: string;
}
```

### SDKOptions

```typescript
interface SDKOptions {
  enableCaching?: boolean;
  cacheTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableEvents?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### TokenInfo

```typescript
interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
  address: string;
}
```

### VaultInfo

```typescript
interface VaultInfo {
  maxMintPerAction: BigNumber;
  maxBuybackPerAction: BigNumber;
  deviationThreshold: number;
  cooldownPeriod: number;
  lastStabilization: number;
  totalMinted: BigNumber;
  totalBoughtBack: BigNumber;
}
```

### BasketComposition

```typescript
interface BasketComposition {
  currencies: string[];
  weights: number[];
  prices: BigNumber[];
  lastUpdated: number[];
}
```
