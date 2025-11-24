#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(ROOT_DIR, 'version.json');
const PUBLIC_VERSION_FILE = path.join(ROOT_DIR, 'apps/web/public/version.json');
const CHANGELOG_FILE = path.join(ROOT_DIR, 'CHANGELOG.md');
const ROOT_PACKAGE = path.join(ROOT_DIR, 'package.json');
const WEB_PACKAGE = path.join(ROOT_DIR, 'apps/web/package.json');

// Read version.json
function readVersion() {
    const data = fs.readFileSync(VERSION_FILE, 'utf8');
    return JSON.parse(data);
}

// Write version.json
function writeVersion(versionData) {
    fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2) + '\n');
}

// Bump version based on type
function bumpVersion(currentVersion, bumpType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (bumpType) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            throw new Error(`Invalid bump type: ${bumpType}`);
    }
}

// Update package.json files
function updatePackageJson(filePath, newVersion) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.version = newVersion;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

// Update CHANGELOG.md
function updateChangelog(newVersion, date) {
    let changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');

    // Find the [Unreleased] section
    const unreleasedRegex = /## \[Unreleased\]([\s\S]*?)(?=\n## \[|$)/;
    const match = changelog.match(unreleasedRegex);

    if (!match) {
        log('Warning: Could not find [Unreleased] section in CHANGELOG.md', colors.yellow);
        return;
    }

    const unreleasedContent = match[1].trim();

    // Create new version section
    const newVersionSection = `## [${newVersion}] - ${date}\n\n${unreleasedContent}\n\n`;

    // Reset [Unreleased] section
    const newUnreleasedSection = `## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n\n`;

    // Replace in changelog
    changelog = changelog.replace(
        unreleasedRegex,
        newUnreleasedSection + newVersionSection
    );

    fs.writeFileSync(CHANGELOG_FILE, changelog);
}

// Copy version to public directory
function copyToPublic(versionData) {
    fs.writeFileSync(PUBLIC_VERSION_FILE, JSON.stringify(versionData, null, 2) + '\n');
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Get current ISO timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Execute git commands
function gitCommit(version) {
    try {
        // Stage all changes
        execSync('git add version.json apps/web/public/version.json CHANGELOG.md package.json apps/web/package.json', {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });

        // Create commit
        execSync(`git commit -m "chore(release): v${version}"`, {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });

        log(`✓ Git commit created: chore(release): v${version}`, colors.green);
    } catch (error) {
        log('✗ Failed to create git commit', colors.red);
        log('You may need to commit manually', colors.yellow);
    }
}

// Main function
function main() {
    const args = process.argv.slice(2);
    const bumpType = args[0];

    if (!bumpType) {
        log('Usage: node scripts/version.js <major|minor|patch>', colors.yellow);
        log('\nCurrent version:', colors.blue);
        const versionData = readVersion();
        log(`  v${versionData.version}`, colors.bright);
        process.exit(0);
    }

    if (!['major', 'minor', 'patch'].includes(bumpType)) {
        log(`Invalid bump type: ${bumpType}`, colors.red);
        log('Use: major, minor, or patch', colors.yellow);
        process.exit(1);
    }

    log(`\n${colors.bright}Starting ${bumpType} version bump...${colors.reset}\n`);

    // Read current version
    const versionData = readVersion();
    const currentVersion = versionData.version;
    log(`Current version: v${currentVersion}`, colors.blue);

    // Bump version
    const newVersion = bumpVersion(currentVersion, bumpType);
    log(`New version: v${newVersion}`, colors.green);

    // Update version.json
    const date = getCurrentDate();
    const timestamp = getCurrentTimestamp();
    versionData.version = newVersion;
    versionData.releaseDate = date;
    versionData.buildMetadata.lastUpdated = timestamp;
    versionData.buildMetadata.buildNumber = (versionData.buildMetadata.buildNumber || 0) + 1;
    writeVersion(versionData);
    log('✓ Updated version.json', colors.green);

    // Update package.json files
    updatePackageJson(ROOT_PACKAGE, newVersion);
    log('✓ Updated package.json', colors.green);

    updatePackageJson(WEB_PACKAGE, newVersion);
    log('✓ Updated apps/web/package.json', colors.green);

    // Update CHANGELOG.md
    updateChangelog(newVersion, date);
    log('✓ Updated CHANGELOG.md', colors.green);

    // Copy to public directory
    copyToPublic(versionData);
    log('✓ Updated apps/web/public/version.json', colors.green);

    // Git commit
    log('\nCreating git commit...', colors.blue);
    gitCommit(newVersion);

    log(`\n${colors.bright}${colors.green}Version bump complete!${colors.reset}`);
    log(`\nNew version: ${colors.bright}v${newVersion}${colors.reset}\n`);
}

main();
