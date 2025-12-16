#!/usr/bin/env node

/**
 * Release script for Lukas SDK
 * 
 * This script helps with creating releases by:
 * 1. Validating the current state
 * 2. Running tests
 * 3. Building the package
 * 4. Creating git tags
 * 5. Pushing to trigger CI/CD
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function exec(command, options = {}) {
  console.log(`🔄 Running: ${command}`);
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..'),
      ...options 
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

function getPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  return packageJson.version;
}

function validateVersion(version) {
  const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
  if (!versionRegex.test(version)) {
    console.error('❌ Invalid version format. Use semantic versioning (e.g., 1.0.0, 1.0.0-beta.1)');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📦 Lukas SDK Release Script

Usage:
  npm run release <version>
  npm run release patch|minor|major

Examples:
  npm run release 1.0.1
  npm run release patch
  npm run release minor
  npm run release major
  npm run release 1.0.0-beta.1

This script will:
1. ✅ Run type checking
2. ✅ Run all tests
3. 🏗️  Build the package
4. 🏷️  Create a git tag
5. 🚀 Push to trigger automated publishing
`);
    process.exit(0);
  }

  const versionArg = args[0];
  
  console.log('🚀 Starting Lukas SDK release process...\n');

  // Step 1: Validate git status
  console.log('📋 Step 1: Validating git status...');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.error('❌ Working directory is not clean. Please commit or stash changes.');
      process.exit(1);
    }
    console.log('✅ Working directory is clean\n');
  } catch (error) {
    console.error('❌ Failed to check git status');
    process.exit(1);
  }

  // Step 2: Update version
  console.log('📋 Step 2: Updating version...');
  if (['patch', 'minor', 'major'].includes(versionArg)) {
    exec(`npm version ${versionArg} --no-git-tag-version`);
  } else {
    validateVersion(versionArg);
    exec(`npm version ${versionArg} --no-git-tag-version`);
  }
  
  const newVersion = getPackageVersion();
  console.log(`✅ Updated version to ${newVersion}\n`);

  // Step 3: Run type checking
  console.log('📋 Step 3: Running type check...');
  exec('npm run type-check');
  console.log('✅ Type check passed\n');

  // Step 4: Run tests
  console.log('📋 Step 4: Running tests...');
  exec('npm run test');
  console.log('✅ All tests passed\n');

  // Step 5: Build package
  console.log('📋 Step 5: Building package...');
  exec('npm run build');
  console.log('✅ Package built successfully\n');

  // Step 6: Commit version change
  console.log('📋 Step 6: Committing version change...');
  exec('git add package.json');
  exec(`git commit -m "chore: bump version to ${newVersion}"`);
  console.log('✅ Version change committed\n');

  // Step 7: Create and push tag
  console.log('📋 Step 7: Creating and pushing tag...');
  const tagName = `sdk-v${newVersion}`;
  exec(`git tag ${tagName}`);
  exec('git push origin main');
  exec(`git push origin ${tagName}`);
  console.log(`✅ Tag ${tagName} created and pushed\n`);

  console.log(`🎉 Release process completed!

📦 Version: ${newVersion}
🏷️  Tag: ${tagName}
🚀 GitHub Actions will now:
   - Run tests and build
   - Publish to npm
   - Create GitHub release

Monitor the progress at:
https://github.com/lukas-protocol/lukas-monorepo/actions

Package will be available at:
https://www.npmjs.com/package/@lukas/sdk
`);
}

if (require.main === module) {
  main();
}