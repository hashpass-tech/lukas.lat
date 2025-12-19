# React Dispatcher Error Fix - SDK v0.2.21

## Problem
The SDK was throwing: `TypeError: can't access property "ReactCurrentDispatcher", h is undefined`

This error occurred because React hooks were being called at module load time, before React's context was initialized.

## Root Cause
Two issues combined to cause the error:

1. **Module-level exports calling hooks**: `packages/lukas-sdk/src/react/index.ts` was exporting from `./context/LukasSDKContext` which calls `createContext()` and `useContext()` at module load time
2. **Context creation at module load**: `LukasSDKProvider.tsx` was calling `createContext()` at the top level of the module (line 13), not inside the provider function

## Solution
Restructured the SDK's React module to prevent hooks from being called at module load:

### Changes Made

1. **`packages/lukas-sdk/src/react/index.ts`**
   - Removed export of `./context/LukasSDKContext` 
   - Removed export of `./hooks` (which was re-exporting context hooks)
   - Now only exports from `./providers` and `./adapters`

2. **`packages/lukas-sdk/src/react/hooks/index.ts`**
   - Removed re-export of context hooks (`useLukasSDK`, `useLukasSDKInstance`, etc.)
   - Context hooks are now only exported from providers

3. **`packages/lukas-sdk/src/react/providers/LukasSDKProvider.tsx`** (CRITICAL FIX)
   - Moved `createContext()` call from module level into a lazy initialization function
   - Created `getLukasSDKContext()` function that only creates context on first call
   - Context is now created when provider is first rendered, not when module is imported
   - This prevents React hooks from being called before React is initialized

4. **`packages/lukas-sdk/src/react/providers/index.ts`**
   - Now exports both `LukasSDKProvider` and `useLukasSDK` hook
   - This is the single source of truth for context hooks

### Architecture
```
SDK React Module Structure (v0.2.20):
├── providers/
│   ├── LukasSDKProvider.tsx (defines context and useLukasSDK hook)
│   └── index.ts (exports provider and hook)
├── hooks/
│   ├── usePoolMetrics.ts
│   ├── useSwap.ts
│   └── ... (other hooks that use useLukasSDK)
├── adapters/
│   ├── wagmiAdapter.ts
│   └── viemAdapter.ts
└── index.ts (exports only providers and adapters)
```

### Web App Usage
The web app provider correctly wraps the SDK provider:

```typescript
// apps/web/src/app/providers/lukas-sdk-provider.tsx
'use client';

import { LukasSDKProvider as SDKProvider, useLukasSDK as useSDK } from '@lukas-protocol/sdk/react';

export function LukasSDKProvider({ children }) {
  // ... wallet integration and config creation
  return <SDKProvider config={config}>{children}</SDKProvider>;
}

export function useLukasSDK() {
  return useSDK();
}
```

## Key Principles
- ✅ SDK provider has NO `'use client'` directive (it's a library)
- ✅ Web app provider HAS `'use client'` directive (it's the entry point)
- ✅ React hooks are only called when components render, not at module load
- ✅ Context is created inside the provider, not at module level
- ✅ All hooks are exported from a single location (providers/index.ts)

## Version
- **SDK Version**: 0.2.21 (published to npm)
- **Git Tag**: `sdk-v0.2.21`
- **Web App Updated**: `@lukas-protocol/sdk@^0.2.21`

## Key Code Changes

### Before (Broken)
```typescript
// packages/lukas-sdk/src/react/providers/LukasSDKProvider.tsx
const LukasSDKContext = createContext<LukasSDKContextType | undefined>(undefined); // ❌ Called at module load
```

### After (Fixed)
```typescript
// packages/lukas-sdk/src/react/providers/LukasSDKProvider.tsx
let LukasSDKContext: Context<LukasSDKContextType | undefined> | null = null;

function getLukasSDKContext(): Context<LukasSDKContextType | undefined> {
  if (!LukasSDKContext) {
    LukasSDKContext = createContext<LukasSDKContextType | undefined>(undefined); // ✅ Called on first render
  }
  return LukasSDKContext;
}
```

## Testing
After installing v0.2.21:
1. Clear node_modules cache: `rm -rf node_modules && pnpm install`
2. Start dev server: `pnpm dev`
3. Verify no "ReactCurrentDispatcher" errors in console
4. Test pool metrics and SDK functionality
5. Verify app loads without React dispatcher errors
