# Changelog

All notable changes to the Lukas SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.11] - 2024-12-18

### Added
- Comprehensive testing suite with 160+ tests
- Event subscription stress tests for high-volume scenarios
- Performance testing framework for concurrent operations
- Property-based tests for core SDK functionality
- Integration test templates for contract interactions

### Improved
- Test coverage for all core services
- Event manager stress testing with up to 1000 concurrent subscriptions
- Memory efficiency validation
- Error handling and edge case coverage

### Fixed
- Test infrastructure and mocking patterns
- Event subscription lifecycle management
- History buffer management in EventManager

## [0.2.1] - 2024-12-17

### Added
- Core SDK infrastructure with LukasSDK main class
- Network management with multi-network support
- Provider and signer management
- Contract manager for ABI handling
- React integration layer with hooks
- Comprehensive TypeScript type definitions
- Property-based testing with fast-check
- Example applications and documentation

### Features
- Token service for LUKAS token operations
- Oracle service for price and peg data
- Vault service for stabilization operations
- Liquidity service for pool management
- Event management system
- Error handling with descriptive messages
- Network switching and detection
- wagmi and viem compatibility

### Documentation
- Complete API documentation
- Migration guide from direct contract calls
- Example applications for common use cases
- Troubleshooting guide

## [0.2.0] - 2024-12-10

### Added
- Initial SDK release
- Basic token operations
- Network configuration support

## [0.1.0] - 2024-12-01

### Added
- Project setup and initial structure
- TypeScript configuration
- Build tooling with Vite
