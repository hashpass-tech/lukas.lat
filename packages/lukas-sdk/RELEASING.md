# Releasing Lukas SDK

This document describes the process for releasing new versions of the Lukas SDK.

## Prerequisites

1. **NPM Access**: Ensure you have publish access to the `@lukas/sdk` package on npm
2. **GitHub Access**: Ensure you have push access to the repository
3. **Clean Working Directory**: All changes should be committed before releasing

## Release Process

### Automated Release (Recommended)

Use the built-in release script for a streamlined process:

```bash
# Navigate to the SDK directory
cd packages/lukas-sdk

# Release with semantic version bump
npm run release patch    # 1.0.0 -> 1.0.1
npm run release minor    # 1.0.0 -> 1.1.0
npm run release major    # 1.0.0 -> 2.0.0

# Release with specific version
npm run release 1.2.3
npm run release 1.0.0-beta.1
```

The release script will:
1. ✅ Validate git status (clean working directory)
2. 📝 Update package.json version
3. 🔍 Run type checking
4. 🧪 Run all tests
5. 🏗️ Build the package
6. 📝 Commit version change
7. 🏷️ Create and push git tag
8. 🚀 Trigger automated CI/CD publishing

### Manual Release Process

If you need to release manually:

1. **Update Version**
   ```bash
   npm version patch  # or minor, major, or specific version
   ```

2. **Run Quality Checks**
   ```bash
   npm run type-check
   npm run test
   npm run build
   ```

3. **Create and Push Tag**
   ```bash
   git add package.json
   git commit -m "chore: bump version to x.x.x"
   git tag sdk-vx.x.x
   git push origin main
   git push origin sdk-vx.x.x
   ```

## CI/CD Pipeline

The automated publishing pipeline is triggered by tags matching `sdk-v*` pattern:

### GitHub Actions Workflow

The `.github/workflows/publish-sdk.yml` workflow will:

1. **Validate**: Run type checking and tests
2. **Build**: Create production build
3. **Publish**: Publish to npm registry
4. **Release**: Create GitHub release with changelog
5. **Notify**: Log success information

### Environment Variables

The following secrets must be configured in GitHub:

- `NPM_TOKEN`: npm authentication token for publishing
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Version Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, backward compatible

### Pre-release Versions

For beta/alpha releases:
```bash
npm run release 1.0.0-beta.1
npm run release 1.0.0-alpha.1
```

## Troubleshooting

### Common Issues

1. **"Working directory not clean"**
   - Commit or stash all changes before releasing

2. **"npm publish failed"**
   - Check NPM_TOKEN is valid and has publish permissions
   - Verify package name is available

3. **"Tests failed"**
   - Fix failing tests before releasing
   - All tests must pass for release

4. **"Tag already exists"**
   - Delete the existing tag: `git tag -d sdk-vx.x.x`
   - Push deletion: `git push origin :refs/tags/sdk-vx.x.x`

### Manual Cleanup

If a release fails partway through:

```bash
# Reset version change (if not committed)
git checkout package.json

# Delete local tag
git tag -d sdk-vx.x.x

# Delete remote tag (if pushed)
git push origin :refs/tags/sdk-vx.x.x
```

## Post-Release

After a successful release:

1. **Verify npm**: Check package is available at https://www.npmjs.com/package/@lukas/sdk
2. **Update Documentation**: Update any version references in docs
3. **Announce**: Notify team/community of the new release
4. **Monitor**: Watch for any issues or feedback

## Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Version follows semantic versioning
- [ ] Clean git working directory
- [ ] NPM_TOKEN configured
- [ ] Release notes prepared