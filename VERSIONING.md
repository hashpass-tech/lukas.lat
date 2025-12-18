# Versioning System Documentation

This document describes the versioning strategy for the Lukas Protocol monorepo.

## Overview

The Lukas Protocol uses a **dual versioning system**:

1. **Global Version** - Tracks the overall project (web app + docs)
2. **SDK Version** - Independent versioning for the npm package

## Version Structure

### Global Version (Web + Docs)

**Source of Truth**: `version.json` (root)

```json
{
  "version": "0.2.16",
  "releaseDate": "2025-12-18",
  "buildMetadata": {
    "lastUpdated": "2025-12-18T02:10:00.000Z",
    "buildNumber": 81
  }
}
```

**Synced Files**:
- `version.json` (root) - Master version file
- `apps/web/public/version.json` - Public version for web app
- `apps/web/package.json` - Web app package version
- `package.json` (root) - Root package version
- `CHANGELOG.md` - Global changelog

**Version Format**: `MAJOR.MINOR.PATCH` (Semantic Versioning)

### SDK Version (Independent)

**Source of Truth**: `packages/lukas-sdk/package.json`

```json
{
  "name": "@lukas-protocol/sdk",
  "version": "0.2.2"
}
```

**Synced Files**:
- `packages/lukas-sdk/package.json` - SDK package version
- `packages/lukas-sdk/CHANGELOG.md` - SDK-specific changelog

**Version Format**: `MAJOR.MINOR.PATCH` (Semantic Versioning)

## Versioning Workflows

### Global Version Bump (Web + Docs)

Use the automated version script:

```bash
# Patch version (0.2.16 → 0.2.17)
node scripts/version.js patch

# Minor version (0.2.16 → 0.3.0)
node scripts/version.js minor

# Major version (0.2.16 → 1.0.0)
node scripts/version.js major
```

**What it does**:
1. ✅ Auto-commits any uncommitted changes
2. ✅ Generates changelog from git commits
3. ✅ Bumps version in all synced files
4. ✅ Updates build metadata (timestamp, build number)
5. ✅ Creates version commit: `chore(release): vX.Y.Z`
6. ✅ Creates and pushes git tag: `vX.Y.Z`
7. ✅ Pushes to remote repository

**Options**:
- `--auto-changelog` - Force generate changelog from commits
- `--check-build` - Run build check before version bump

### SDK Version Bump (Independent)

Use the SDK-specific release script:

```bash
cd packages/lukas-sdk

# Patch version (0.2.2 → 0.2.3)
npm run release patch

# Minor version (0.2.2 → 0.3.0)
npm run release minor

# Major version (0.2.2 → 1.0.0)
npm run release major

# Or specify exact version
npm run release 0.2.3
```

**What it does**:
1. ✅ Validates git working directory is clean
2. ✅ Runs type checking
3. ✅ Runs all tests (including property-based tests)
4. ✅ Builds the SDK package
5. ✅ Bumps version in `packages/lukas-sdk/package.json`
6. ✅ Creates version commit
7. ✅ Creates and pushes git tag: `sdk-vX.Y.Z`
8. ✅ Triggers GitHub Actions to publish to npm

## Version Independence

### Why Separate Versions?

**Global Version (Web + Docs)**:
- Tracks user-facing application changes
- Includes UI updates, feature additions, bug fixes
- Deployed together as a cohesive product
- Version reflects the overall product state

**SDK Version (Independent)**:
- Follows npm package versioning best practices
- Breaking changes require major version bump
- Published independently to npm registry
- Consumed by external developers
- Must maintain backward compatibility

### Version Relationship

The SDK version and global version are **intentionally decoupled**:

```
Global Version: v0.2.16 (Web App + Docs)
SDK Version:    v0.2.2  (@lukas-protocol/sdk)
```

This allows:
- ✅ SDK stability without forcing web app releases
- ✅ Web app updates without SDK republishing
- ✅ Independent semantic versioning for each
- ✅ Clear communication to SDK consumers

## Changelog Management

### Global Changelog (`CHANGELOG.md`)

Tracks all changes to web app and docs:

```markdown
## [Unreleased]

### Added

### Changed

### Fixed

## [0.2.16] - 2025-12-18

### Added
- New Web3 Settings Dialog
- Enhanced wallet provider

### Changed
- Updated SDK integration
- Improved UI components

### Fixed
- TypeScript build issues
```

**Auto-generation**: The version script automatically generates changelog entries from git commits using conventional commit patterns.

### SDK Changelog (`packages/lukas-sdk/CHANGELOG.md`)

Tracks SDK-specific changes:

```markdown
## [0.2.2] - 2024-12-17

### Added
- Core SDK infrastructure
- Property-based testing

### Fixed
- Undefined values in partial contracts
- Invalid USDC address
```

## Git Tags

### Global Tags

Format: `vX.Y.Z`

Example: `v0.2.16`

Created by: `scripts/version.js`

### SDK Tags

Format: `sdk-vX.Y.Z`

Example: `sdk-v0.2.2`

Created by: `packages/lukas-sdk/scripts/release.js`

## CI/CD Integration

### Web App Deployment

Triggered by: Global version tags (`v*`)

Workflow: `.github/workflows/deploy.yml`

Deploys:
- Web app to production
- Documentation site

### SDK Publishing

Triggered by: SDK version tags (`sdk-v*`)

Workflow: `.github/workflows/publish-sdk.yml`

Publishes:
- Package to npm registry
- Creates GitHub release

## Best Practices

### When to Bump Global Version

**Patch (0.2.16 → 0.2.17)**:
- Bug fixes
- Minor UI tweaks
- Documentation updates
- Dependency updates

**Minor (0.2.16 → 0.3.0)**:
- New features
- Significant UI changes
- New pages or sections
- Non-breaking API changes

**Major (0.2.16 → 1.0.0)**:
- Breaking changes
- Complete redesigns
- Major feature overhauls

### When to Bump SDK Version

**Patch (0.2.2 → 0.2.3)**:
- Bug fixes
- Documentation updates
- Internal refactoring
- No API changes

**Minor (0.2.2 → 0.3.0)**:
- New features
- New methods/properties
- Backward-compatible changes
- Deprecations (with warnings)

**Major (0.2.2 → 1.0.0)**:
- Breaking API changes
- Removed methods/properties
- Changed method signatures
- Incompatible with previous versions

## Commit Message Conventions

The version script uses conventional commits for changelog generation:

```bash
# Features (→ Added section)
feat: add new wallet provider
feat(sdk): implement token service

# Fixes (→ Fixed section)
fix: resolve TypeScript error
fix(ui): correct button alignment

# Changes (→ Changed section)
refactor: improve error handling
chore: update dependencies
perf: optimize rendering
```

## Manual Version Updates

If you need to manually update versions:

### Global Version

1. Update `version.json`
2. Update `apps/web/package.json`
3. Update `package.json` (root)
4. Copy to `apps/web/public/version.json`
5. Update `CHANGELOG.md`
6. Commit and tag: `git tag vX.Y.Z`

### SDK Version

1. Update `packages/lukas-sdk/package.json`
2. Update `packages/lukas-sdk/CHANGELOG.md`
3. Build: `npm run build`
4. Commit and tag: `git tag sdk-vX.Y.Z`

## Troubleshooting

### Version Script Fails

**Issue**: Uncommitted changes

**Solution**: The script auto-commits changes, but if it fails:
```bash
git add .
git commit -m "chore: prepare for version bump"
node scripts/version.js patch
```

### SDK Release Fails

**Issue**: Tests failing

**Solution**: Fix tests before releasing:
```bash
cd packages/lukas-sdk
npm run test
npm run build
npm run release patch
```

### Version Mismatch

**Issue**: Web app shows wrong version

**Solution**: Ensure `apps/web/public/version.json` is synced:
```bash
cp version.json apps/web/public/version.json
```

## Version History

### Current Versions

- **Global**: v0.2.16 (Web + Docs)
- **SDK**: v0.2.2 (@lukas-protocol/sdk)

### Recent Releases

**v0.2.16** (2025-12-18)
- SDK v0.2.2 integration
- Web3 Settings Dialog
- Enhanced wallet provider

**sdk-v0.2.2** (2025-12-18)
- Published to npm
- Property-based testing
- Bug fixes and improvements

## Summary

✅ **Global version** tracks web app + docs (use `scripts/version.js`)
✅ **SDK version** is independent (use `packages/lukas-sdk/scripts/release.js`)
✅ Both use semantic versioning
✅ Automated changelog generation
✅ Git tags trigger CI/CD deployments
✅ Clear separation of concerns
