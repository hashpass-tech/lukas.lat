# Design Document: FHENIX Encrypted Stabilization

## Overview

The FHENIX Encrypted Stabilization system integrates Fully Homomorphic Encryption (FHE) into the LUKAS protocol to protect critical stabilization parameters. The architecture uses a modular, layered approach enabling incremental upgrades without disrupting protocol operations. The system encrypts mint ceilings, peg deviation sensitivity, and stabilization curve parameters, allowing computations on encrypted data while maintaining protocol correctness and security.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Protocol Interface Layer                  │
│              (Existing LUKAS Protocol Entry Points)          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Encryption Orchestration Layer                  │
│    (Routes operations to encrypted or unencrypted paths)    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌──▼──────────────┐
│ Encrypted    │ │ Encrypted   │ │ Encrypted      │
│ Mint Ceiling │ │ Peg Dev     │ │ Curve Params   │
│ Module       │ │ Sensitivity │ │ Module         │
│              │ │ Module      │ │                │
└───────┬──────┘ └──┬──────────┘ └──┬──────────────┘
        │           │               │
        └───────────┼───────────────┘
                    │
┌───────────────────▼───────────────────────────────────────┐
│         FHENIX Computation Engine Layer                    │
│  (Homomorphic operations, encrypted arithmetic)           │
└───────────────────┬───────────────────────────────────────┘
                    │
┌───────────────────▼───────────────────────────────────────┐
│         FHENIX Encryption/Decryption Layer                │
│  (Key management, encryption, decryption operations)      │
└───────────────────────────────────────────────────────────┘
```

### Modular Component Structure

The system is organized into independent, upgradeable modules:

1. **Encryption Manager** - Handles key generation, storage, and lifecycle
2. **Parameter Encryptor** - Encrypts individual parameter types
3. **Computation Engine** - Performs homomorphic operations
4. **Decryption Handler** - Manages final decryption and output
5. **Upgrade Proxy** - Enables incremental module upgrades

## Components and Interfaces

### 1. IFhenixEncryptionManager

Manages encryption keys and lifecycle.

```solidity
interface IFhenixEncryptionManager {
    // Initialize encryption with FHENIX parameters
    function initializeEncryption(
        bytes calldata fhenixPublicKey,
        uint256 encryptionLevel
    ) external;
    
    // Get current encryption public key
    function getPublicKey() external view returns (bytes memory);
    
    // Rotate encryption keys (for upgrades)
    function rotateKeys(bytes calldata newPublicKey) external;
    
    // Check if encryption is active
    function isEncryptionActive() external view returns (bool);
}
```

### 2. IEncryptedMintCeiling

Manages encrypted mint ceiling parameter.

```solidity
interface IEncryptedMintCeiling {
    // Set encrypted mint ceiling
    function setEncryptedMintCeiling(bytes calldata encryptedValue) external;
    
    // Get encrypted mint ceiling (returns encrypted bytes)
    function getEncryptedMintCeiling() external view returns (bytes memory);
    
    // Check if current supply exceeds encrypted ceiling (homomorphic comparison)
    function isSupplyWithinCeiling(uint256 currentSupply) external view returns (bool);
    
    // Decrypt ceiling for emergency operations (requires authorization)
    function decryptMintCeiling() external view returns (uint256);
}
```

### 3. IEncryptedPegDeviation

Manages encrypted peg deviation sensitivity parameter.

```solidity
interface IEncryptedPegDeviation {
    // Set encrypted peg deviation sensitivity
    function setEncryptedPegDeviation(bytes calldata encryptedValue) external;
    
    // Get encrypted peg deviation sensitivity
    function getEncryptedPegDeviation() external view returns (bytes memory);
    
    // Calculate adjustment using encrypted sensitivity (homomorphic computation)
    function calculateEncryptedAdjustment(
        int256 pegDeviation
    ) external view returns (bytes memory encryptedAdjustment);
    
    // Decrypt sensitivity for auditing (requires authorization)
    function decryptPegDeviation() external view returns (uint256);
}
```

### 4. IEncryptedCurveParameters

Manages encrypted stabilization curve parameters.

```solidity
interface IEncryptedCurveParameters {
    // Set encrypted curve parameters (coefficients)
    function setEncryptedCurveParameters(bytes[] calldata encryptedCoefficients) external;
    
    // Get encrypted curve parameters
    function getEncryptedCurveParameters() external view returns (bytes[] memory);
    
    // Evaluate curve using encrypted parameters (homomorphic polynomial evaluation)
    function evaluateEncryptedCurve(
        uint256 input
    ) external view returns (bytes memory encryptedOutput);
    
    // Decrypt parameters for auditing (requires authorization)
    function decryptCurveParameters() external view returns (uint256[] memory);
}
```

### 5. IFhenixComputationEngine

Performs homomorphic operations on encrypted data.

```solidity
interface IFhenixComputationEngine {
    // Add two encrypted values
    function encryptedAdd(
        bytes calldata a,
        bytes calldata b
    ) external pure returns (bytes memory);
    
    // Multiply encrypted value by plaintext scalar
    function encryptedScalarMultiply(
        bytes calldata encrypted,
        uint256 scalar
    ) external pure returns (bytes memory);
    
    // Compare encrypted value with plaintext (returns encrypted boolean)
    function encryptedCompare(
        bytes calldata encrypted,
        uint256 plaintext
    ) external pure returns (bytes memory);
    
    // Evaluate polynomial on encrypted input
    function encryptedPolyEval(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients
    ) external pure returns (bytes memory);
}
```

### 6. IFhenixDecryptionHandler

Manages decryption operations with authorization.

```solidity
interface IFhenixDecryptionHandler {
    // Decrypt value (requires authorization)
    function decrypt(bytes calldata encryptedValue) external view returns (uint256);
    
    // Decrypt with threshold signature (for multi-sig scenarios)
    function decryptWithThreshold(
        bytes calldata encryptedValue,
        bytes[] calldata signatures
    ) external view returns (uint256);
    
    // Check if decryption is authorized for caller
    function isDecryptionAuthorized(address caller) external view returns (bool);
}
```

## Data Models

### EncryptedParameter

```solidity
struct EncryptedParameter {
    bytes encryptedValue;           // The encrypted parameter value
    uint256 encryptionTimestamp;    // When parameter was encrypted
    bytes encryptionMetadata;       // FHENIX-specific metadata
    bool isActive;                  // Whether parameter is currently in use
}
```

### EncryptionConfig

```solidity
struct EncryptionConfig {
    bytes publicKey;                // FHENIX public key
    uint256 encryptionLevel;        // Security level (128, 192, 256 bits)
    uint256 keyRotationInterval;    // Blocks between key rotations
    address decryptionAuthorizer;   // Address authorized to decrypt
    bool emergencyDecryptEnabled;   // Allow emergency decryption
}
```

### ComputationResult

```solidity
struct ComputationResult {
    bytes encryptedResult;          // Result of homomorphic computation
    uint256 computationGas;         // Gas used for computation
    bool requiresDecryption;        // Whether result needs decryption
    uint256 decryptionThreshold;    // Threshold for decryption authorization
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Encryption Round-Trip Consistency

*For any* plaintext parameter value and valid FHENIX encryption configuration, encrypting then decrypting the value should produce the original plaintext value.

**Validates: Requirements 1.2, 4.2**

### Property 2: Homomorphic Operation Correctness

*For any* two plaintext values a and b, and their encrypted counterparts, performing homomorphic addition on encrypted values then decrypting should equal the plaintext addition of a and b.

**Validates: Requirements 1.2, 4.2**

### Property 3: Encrypted Comparison Equivalence

*For any* plaintext value and encrypted threshold, the result of encrypted comparison should be equivalent to plaintext comparison of the same values.

**Validates: Requirements 1.3, 4.2**

### Property 4: Polynomial Evaluation Correctness

*For any* plaintext input and encrypted curve coefficients, evaluating the encrypted polynomial then decrypting should equal evaluating the plaintext polynomial with plaintext coefficients.

**Validates: Requirements 1.2, 4.2**

### Property 5: Encryption Integrity Preservation

*For any* encrypted parameter, unauthorized access attempts should fail and the encrypted value should remain unchanged.

**Validates: Requirements 1.4, 4.1**

### Property 6: Parameter Immutability During Computation

*For any* encrypted parameter used in homomorphic operations, the original encrypted value should remain unchanged after computation.

**Validates: Requirements 1.2, 4.2**

### Property 7: Decryption Authorization Enforcement

*For any* decryption request, if the caller is not authorized, the decryption should fail and no plaintext should be revealed.

**Validates: Requirements 1.4, 4.1**

## Error Handling

### Encryption Errors

- **InvalidPublicKey**: FHENIX public key is malformed or invalid
- **EncryptionFailed**: Encryption operation failed (insufficient gas, invalid input)
- **KeyRotationFailed**: Key rotation operation failed

### Computation Errors

- **InvalidEncryptedValue**: Encrypted value is corrupted or invalid
- **ComputationOverflow**: Homomorphic computation would overflow
- **UnsupportedOperation**: Requested homomorphic operation not supported

### Decryption Errors

- **DecryptionUnauthorized**: Caller not authorized to decrypt
- **DecryptionFailed**: Decryption operation failed
- **InvalidDecryptionThreshold**: Threshold signature requirements not met

### Parameter Errors

- **ParameterNotEncrypted**: Parameter accessed before encryption
- **ParameterNotActive**: Parameter is not currently active
- **InvalidParameterValue**: Parameter value outside acceptable range

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples and edge cases:

- Encryption/decryption of individual parameters
- Homomorphic operations on known values
- Authorization checks for decryption
- Parameter activation/deactivation
- Key rotation procedures
- Error handling for invalid inputs

### Property-Based Testing Approach

Property-based tests verify universal properties using the Foundry framework with custom generators:

- **Framework**: Foundry (Solidity native testing)
- **Minimum Iterations**: 100 per property
- **Generator Strategy**: Generate valid plaintext values, encrypt them, perform operations, and verify results

Each property-based test will:
1. Generate random plaintext values within valid ranges
2. Encrypt values using FHENIX
3. Perform homomorphic operations
4. Decrypt results
5. Verify results match plaintext operations

### Test Organization

```
packages/contracts/test/
├── fhenix/
│   ├── FhenixEncryptionManager.t.sol
│   ├── EncryptedMintCeiling.t.sol
│   ├── EncryptedPegDeviation.t.sol
│   ├── EncryptedCurveParameters.t.sol
│   ├── FhenixComputationEngine.t.sol
│   └── FhenixDecryptionHandler.t.sol
└── integration/
    └── FhenixStabilizationIntegration.t.sol
```

## Incremental Upgrade Strategy

### Phase 1: Foundation (Non-Breaking)
- Deploy FHENIX encryption infrastructure
- Implement encryption manager and key management
- Deploy alongside existing unencrypted parameters
- No changes to existing protocol logic

### Phase 2: Parameter Encryption (Gradual)
- Encrypt mint ceiling (optional parameter)
- Encrypt peg deviation sensitivity (optional parameter)
- Maintain dual-path execution (encrypted and unencrypted)
- Governance vote to enable encrypted path

### Phase 3: Computation Migration (Controlled)
- Migrate stabilization calculations to use encrypted parameters
- Implement homomorphic computation engine
- Validate results against unencrypted baseline
- Gradual rollout with monitoring

### Phase 4: Full Integration (Production)
- Complete migration to encrypted parameters
- Deprecate unencrypted paths
- Optimize gas consumption
- Full audit and security review

### Upgrade Mechanism

Each module uses a proxy pattern enabling independent upgrades:

```solidity
contract EncryptedParameterProxy {
    address public implementation;
    address public admin;
    
    function upgrade(address newImplementation) external onlyAdmin {
        // Validate new implementation
        // Migrate state if needed
        // Update implementation pointer
        implementation = newImplementation;
    }
}
```

## Security Considerations

1. **Key Management**: FHENIX keys stored in secure enclave or hardware wallet
2. **Decryption Authorization**: Multi-sig required for emergency decryption
3. **Computation Verification**: All homomorphic operations verified against plaintext baseline
4. **Audit Trail**: All encryption/decryption operations logged
5. **Gradual Rollout**: Encrypted parameters optional initially, enabling rollback

## Performance Characteristics

- **Encryption Overhead**: ~2-5x gas vs plaintext operations
- **Homomorphic Operations**: ~10-50x gas vs plaintext arithmetic
- **Decryption**: ~1-2x gas vs plaintext operations
- **Storage**: ~2-3x larger for encrypted values vs plaintext

## Documentation Structure

1. **Integration Guide**: Step-by-step FHENIX integration instructions
2. **API Reference**: Complete interface documentation
3. **Configuration Guide**: Parameter setup and best practices
4. **Troubleshooting Guide**: Common issues and solutions
5. **Security Audit Report**: Third-party security review
6. **Roadmap**: Future enhancements and timeline

