/**
 * Test setup file for Vitest
 */
import { beforeEach, afterEach } from 'vitest';

// Global test setup
beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Cleanup after each test
});

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress logs in tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};