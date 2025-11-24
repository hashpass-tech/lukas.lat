# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [0.1.22] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.21] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.20] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.19] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.18] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.17] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.16] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.15] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.14] - 2025-11-24
### Added

### Changed

### Fixed

## [0.1.13] - 2025-11-24

### Added
- Shared HtmlLayout component for single source of truth HTML structure
- Shared createMetadata function for centralized metadata generation
- Proper wallet connection state handling in CurrencyPageClient
- JoinMovementSectionStatic component for SSR compatibility

### Changed
- Refactored layouts to eliminate duplicate HTML code
- Increased wallet connect button size from 200px to 280px
- Simplified Join now button by removing unnecessary hover effects
- Updated DitheringShader dimensions to match button container

### Fixed
- Wallet context SSR errors during static export
- Wallet connect button cutoff on right side
- TypeScript import errors (useSimpleWallet → useWallet)
- Layout hierarchy following Next.js best practices


## [0.1.5] - 2025-11-24

### Added
- Automatic language detection based on browser Accept-Language header
- Middleware for locale-based routing and redirection
- Cookie-based language preference persistence
- Client-side language detection fallback
- Dynamic theme switcher rope animation that expands with pull gesture

### Changed
- Enhanced theme switcher with smooth rope expansion animation
- Improved language switcher with Next.js router integration
- Better user experience with automatic locale detection

### Fixed
- Theme switcher rope positioning to attach properly to the circle
- Prevented users from accessing site without locale prefix
- Rope now expands smoothly instead of appearing cut


## [0.1.2] - 2025-11-24

### Added
- Comprehensive versioning system with semantic versioning
- Automated changelog management
- Single source of truth for version (version.json)


## [0.1.0] - 2025-11-24

### Added
- Initial release of $LUKAS landing page
- Modern landing page with glassmorphism design
- Dark/light mode theme support with next-themes
- LightPullThemeSwitcher component with drag-to-toggle animation
- OrbitingSkills animation with cursor tracking
- Currency weights display with interactive progress bars
- Responsive design for mobile and desktop
- LukasGravityCenter shader background animation
- Connect Wallet button
- Support for 5 LatAm currencies: BRL, MXN, COP, CLP, ARS

### Changed
- Improved light mode contrast and readability
- Enhanced theme switcher with visual sun/moon states
- Optimized orbiting animation to prevent click interference

### Fixed
- Click behavior on Connect Wallet button
- Theme switcher animation pull-back behavior
- Percentage display centered in progress bars
- Orbit tracking stops over interactive elements
