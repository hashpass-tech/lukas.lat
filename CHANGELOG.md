# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

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
