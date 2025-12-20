# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [0.2.37] - 2025-12-20
### Added
- WalletConnect session restoration on page refresh for mobile persistence

### Changed
- Pool page now defaults to Metrics tab instead of Swap
- View Metrics link now navigates directly to Metrics tab

### Fixed
- Fixed WalletConnect mobile session not persisting after page refresh
- Fixed pool page tab parameter support (?tab=metrics)

## [0.2.36] - 2025-12-20
### Added
- Auto-sync CHANGELOG.md to public folder on version bump

### Changed
- Improved changelog modal spacing and styling for better readability
- Enhanced header/footer backgrounds with proper border radius on large screens
- Updated Web3SettingsDialog to use CSS variables for full dark mode support

### Fixed
- Fixed changelog modal not showing latest versions (synced public CHANGELOG.md)
- Fixed header/footer backgrounds not expanding properly on big screens
- Fixed Web3SettingsDialog dark mode support using CSS variables (bg-background, text-foreground, bg-card, bg-muted, border-border)
- Fixed network badge color not changing correctly with network (using inline styles)

## [0.2.35] - 2025-12-19

### Added
- Direct contract detection from deployments.json for reliable network switching
- Auto-switch to Polygon Amoy (default testnet) on wallet connection

### Changed
- Improved contract detection to be reactive to network changes
- Updated WalletConnect to use Polygon Amoy as primary chain with Sepolia as optional
- Enhanced Web3SettingsDialog contract loading to respond to chainId changes

### Fixed
- Fixed contract detection not updating when switching networks
- Fixed Live indicator showing incorrect status after network switch
- Improved wallet provider network switching reliability

## [0.2.34] - 2025-12-19

### Added
- Network-specific color coding for UI components (green for Ethereum, purple for Polygon Amoy, blue for Sepolia)
- Independent Live indicator that shows green when contracts are deployed, grey when not
- Network icons (Ξ for Ethereum, ◆ for Polygon) in wallet connect button and swap widget
- Comprehensive network color system with tailwind class support
- TODO documentation for contract detection logic improvements

### Changed
- Updated SwapWidget to display network-aware UI with proper Live/Not Live status
- Improved contract detection logic with better logging for debugging
- Enhanced WalletConnectButton with network-specific background colors
- Updated Web3SettingsDialog to show network icons in selection buttons
- Refined LukasHeroAnimation coin colors to match selected network
- Updated WalletHeader DitheringShader with network-specific colors

### Fixed
- Fixed hydration mismatch in Footer component with mounted state
- Corrected network color application across all components
- Improved contract address validation in SDK provider

## [0.2.33] - 2025-12-19

### Added
- Comprehensive protocol documentation in Docusaurus (overview, tokenomics, architecture, roadmap, integrations)
- Dynamic locale-based titles for Privacy and Terms pages
- Translation keys for footer links in all locales (en, es, pt, cl)

### Changed
- Updated Footer "Documentation" link to "Docs"
- Updated SDK documentation to v0.2.22
- Enhanced Docusaurus sidebar with protocol documentation section

### Fixed
- Fixed LukasSDKProvider context initialization for SSR
- Fixed Footer hydration mismatch with mounted state for Dialog component

## [0.2.32] - 2025-12-19

### Added

### Changed
- Reduced video modal size on mobile devices for better fit
- Improved mobile video modal max-height constraints

### Fixed
- Fixed video modal overflow on mobile by reducing viewport width usage
- Improved scroll behavior prevention with overscroll-behavior
- Better responsive sizing across all breakpoints

## [0.2.31] - 2025-12-19

### Added
- Video modal responsive sizing system

### Changed
- Improved video modal overflow prevention with aggressive CSS constraints
- Enhanced dialog sizing for better mobile responsiveness

### Fixed
- Fixed video modal x-axis overflow on mobile devices with !important overrides
- Resolved video modal height constraints across all breakpoints
- Fixed dialog content padding and gap for video display

## [0.2.30] - 2025-12-19

### Added
- Network state verification in Web3SettingsDialog to detect and report stale state
- Network sync status indicator showing "Synced" or "Verifying..." state
- Error banner for network state mismatches with reload option
- Better error handling for network switch failures

### Changed
- Improved mobile responsiveness for video modal in hero section
- Enhanced dialog component with better mobile constraints (95vw width, max-height)
- Optimized changelog modal for mobile with responsive padding and text sizes
- Improved Web3SettingsDialog with real-time network state tracking
- Better error messages for network switching failures

### Fixed
- Fixed video modal x-axis overflow on mobile devices
- Fixed changelog modal overflow issues on small screens
- Resolved stale network state being displayed in Web3SettingsDialog
- Fixed dialog close button positioning on mobile
- Improved text wrapping in changelog entries to prevent overflow
- Better handling of network mismatches between UI and wallet

## [0.2.29] - 2025-12-19

### Added
- Unified Pool Monitoring Dashboard with consolidated metrics, price chart, and transactions
- Responsive transaction history integrated into dashboard tabs

### Changed
- Refactored MonitoringDashboard component with improved layout and mobile responsiveness
- Updated PoolMetricsPanel to use CSS variables for proper theme support
- Removed duplicate TransactionHistory component from PoolPageClient
- Improved tab navigation with horizontal scroll on mobile devices

### Fixed
- Dark/light theme switching now works properly using CSS variables
- Fixed responsive design issues on mobile and tablet screens
- Resolved duplicate metric displays across different views
- Improved spacing and padding consistency across all screen sizes
