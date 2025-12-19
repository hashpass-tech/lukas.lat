# Release v0.2.28 - Pool Monitoring Dashboard Improvements

**Date:** December 19, 2025

## Overview
Unified and improved the Pool Monitoring Dashboard with better responsive design, proper dark/light theme support, and consolidated transaction history.

## Changes

### 🎨 UI/UX Improvements
- **Unified Dashboard**: Consolidated metrics, price chart, and transactions into a single responsive component
- **Mobile Responsive**: Improved breakpoints and spacing for all screen sizes (mobile, tablet, desktop)
- **Better Tab Navigation**: Horizontal scrollable tabs on mobile, fixed layout on desktop
- **Removed Duplication**: Eliminated duplicate metric displays across different views

### 🌓 Theme Support
- **CSS Variables**: Replaced hardcoded `dark:` classes with proper CSS variable system
- **Consistent Theming**: All components now use `--foreground`, `--background`, `--card`, `--border` variables
- **Automatic Switching**: Dark/light mode now switches properly based on `.dark` class on root element

### 📊 Dashboard Tabs
1. **Overview** - Key metrics grid (price, liquidity, volume, fee tier) + pool state + price deviation status
2. **Price Chart** - Interactive price chart visualization
3. **Transactions** - Recent pool transactions with type icons, status, and timestamps

### 🔧 Component Updates
- `MonitoringDashboard.tsx` - Complete rewrite with unified layout
- `PoolMetricsPanel.tsx` - Updated to use CSS variables and improved responsive design
- `PoolPageClient.tsx` - Removed duplicate TransactionHistory component

### ✅ Responsive Design
- Grid layouts adapt from 2 columns (mobile) to 4 columns (desktop)
- Text sizes scale appropriately (`text-xs` → `text-sm` → `text-base`)
- Padding and gaps adjust for different screen sizes
- Transaction list optimized for mobile viewing

## Technical Details
- Uses Tailwind CSS responsive prefixes (`sm:`, `lg:`)
- Proper use of CSS custom properties for theming
- Maintains accessibility with semantic HTML
- No breaking changes to existing APIs

## Version
- **Previous**: 0.2.27
- **Current**: 0.2.28
- **Build Number**: 93
