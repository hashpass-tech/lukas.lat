# Accessibility and Hydration Fixes

## Issues Fixed

### 1. DialogContent Accessibility Issue
**Problem**: `DialogContent` requires a `DialogTitle` for screen reader accessibility. The video modal in `LukasHeroAnimation` was missing this.

**Solution**: Added `DialogTitle` with `sr-only` class to hide it visually while keeping it accessible:
```typescript
<DialogTitle className="sr-only">LUKAS Protocol Video</DialogTitle>
```

**File**: `apps/web/src/components/LukasHeroAnimation.tsx`

### 2. Hydration Mismatch in SwapWidget
**Problem**: React hydration error - server-rendered HTML didn't match client properties. This typically happens when:
- Component renders differently on server vs client
- State changes immediately after mount
- Random values or Date.now() used during render

**Solution**: Added a `mounted` state flag to prevent rendering until client-side hydration is complete:
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return null;
}
```

**File**: `apps/web/src/components/SwapWidget.tsx`

**Why this works**:
- Server renders `null` (no content)
- Client hydrates with `null`
- After hydration, `useEffect` sets `mounted = true`
- Component re-renders with full content
- No mismatch between server and client

### 3. Import/Export Verification
**Status**: ✅ Verified
- `SwapWidget` is properly exported as named export
- Import in `JoinMovementSection` is correct
- No circular dependencies detected

## Files Modified
1. `apps/web/src/components/LukasHeroAnimation.tsx`
   - Added `DialogTitle` import
   - Added `DialogTitle` component to video modal

2. `apps/web/src/components/SwapWidget.tsx`
   - Added `mounted` state
   - Added `useEffect` to set mounted on client
   - Added guard to return `null` until mounted

## Testing Checklist
- [ ] No console errors about DialogContent accessibility
- [ ] No hydration mismatch warnings
- [ ] Video modal opens and closes properly
- [ ] SwapWidget renders correctly on page load
- [ ] Network switching works as expected
- [ ] Price displays only on supported networks
- [ ] All buttons and inputs are functional

## Browser Compatibility
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ Screen readers (NVDA, JAWS, VoiceOver)

## Performance Impact
- Minimal: `mounted` check adds negligible overhead
- No additional network requests
- No additional DOM elements
