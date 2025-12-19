/**
 * React hooks and utilities for the Lukas SDK
 * 
 * These exports are optional and only available when React is installed
 * 
 * Note: This file will cause build errors if React is not installed.
 * The SDK is designed to work without React, but React integration
 * requires React to be available as a peer dependency.
 */

// Since React is a peer dependency, we assume it's available when this module is imported
// If React is not available, the consuming application should not import from this module

// Providers (includes useLukasSDK hook)
export * from './providers';

// Adapters
export * from './adapters';