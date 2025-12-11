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

// Get git commits since last version
function getGitCommits() {
    try {
        // Get the last version tag or fallback to first commit
        let lastTag;
        try {
            lastTag = execSync('git describe --tags --abbrev=0', { 
                cwd: ROOT_DIR, 
                encoding: 'utf8' 
            }).trim();
        } catch (e) {
            // No tags found, get first commit
            lastTag = execSync('git rev-list --max-parents=0 HEAD', { 
                cwd: ROOT_DIR, 
                encoding: 'utf8' 
            }).trim();
        }

        // Get commits since last tag
        const commitOutput = execSync(`git log ${lastTag}..HEAD --pretty=format:"%h|%s" --date=short`, {
            cwd: ROOT_DIR,
            encoding: 'utf8'
        }).trim();
        
        if (!commitOutput) {
            log('No commits found since last tag', colors.yellow);
            return [];
        }
        
        const commits = commitOutput.split('\n').filter(line => line.trim());

        return commits.map(commit => {
            const [hash, ...messageParts] = commit.split('|');
            const message = messageParts.join('|').trim();
            return { hash, message, author: '', date: '' };
        });
    } catch (error) {
        log('Warning: Could not get git commits for changelog', colors.yellow);
        return [];
    }
}

// Categorize commits based on message patterns (supports conventional commits)
function categorizeCommit(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for conventional commit types first
    if (message.match(/^(feat|feature)(\(.+\))?:/)) {
        return 'added';
    }
    if (message.match(/^fix(\(.+\))?:/)) {
        return 'fixed';
    }
    if (message.match(/^refactor(\(.+\))?:|^chore(\(.+\))?:|^perf(\(.+\))?:/)) {
        return 'changed';
    }
    
    // Fallback to pattern matching
    // Added patterns
    if (lowerMessage.includes('add') || lowerMessage.includes('create') || 
        lowerMessage.includes('new') || lowerMessage.includes('implement')) {
        return 'added';
    }
    
    // Changed patterns
    if (lowerMessage.includes('update') || lowerMessage.includes('modify') || 
        lowerMessage.includes('refactor') || lowerMessage.includes('improve') ||
        lowerMessage.includes('enhance') || lowerMessage.includes('change')) {
        return 'changed';
    }
    
    // Fixed patterns
    if (lowerMessage.includes('fix') || lowerMessage.includes('bug') || 
        lowerMessage.includes('error') || lowerMessage.includes('issue') ||
        lowerMessage.includes('resolve') || lowerMessage.includes('patch')) {
        return 'fixed';
    }
    
    // Default to changed
    return 'changed';
}

// Clean up commit message for changelog
function formatCommitMessage(message, hash) {
    // Remove conventional commit prefixes
    let cleanMessage = message.replace(/^(feat|feature|fix|refactor|chore|perf|docs|style|test)(\(.+\))?:\s*/i, '');
    
    // Remove hash from the message if present
    cleanMessage = cleanMessage.replace(/\s*\([a-f0-9]{7,}\)\s*$/, '');
    
    // Capitalize first letter
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    
    return `- ${cleanMessage} (${hash})`;
}

// Generate changelog from git commits
function generateChangelogFromCommits() {
    const commits = getGitCommits();
    const categories = {
        added: [],
        changed: [],
        fixed: []
    };

    commits.forEach(commit => {
        const category = categorizeCommit(commit.message);
        // Skip version bump commits and merge commits
        if (!commit.message.includes('chore(release)') && !commit.message.startsWith('Merge')) {
            categories[category].push(formatCommitMessage(commit.message, commit.hash));
        }
    });

    return categories;
}

// Validate changelog has actual content
function validateChangelogContent(newVersion, date, { allowEmpty } = { allowEmpty: false }) {
    let changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
    
    // Find the new version section
    const versionRegex = new RegExp(`## \\[${newVersion}\\] - ${date}\\n([\\s\\S]*?)(?=\\n## \\[|$)`);
    const match = changelog.match(versionRegex);
    
    if (!match) {
        throw new Error(`Could not find version section for v${newVersion} in changelog`);
    }
    
    const versionContent = match[1];
    
    // Check if there are actual changes (not just empty sections)
    const hasAdded = versionContent.includes('### Added') && 
                    versionContent.split('### Added')[1]?.split('###')[0]?.trim().length > 0;
    const hasChanged = versionContent.includes('### Changed') && 
                      versionContent.split('### Changed')[1]?.split('###')[0]?.trim().length > 0;
    const hasFixed = versionContent.includes('### Fixed') && 
                    versionContent.split('### Fixed')[1]?.trim().length > 0;

    if (!hasAdded && !hasChanged && !hasFixed) {
        if (allowEmpty) {
            log(`No categorized changelog entries found for v${newVersion}. Proceeding with empty sections due to --auto-changelog.`, colors.yellow);
            return true;
        }

        log(`No changelog entries found for v${newVersion}. Skipping version bump to avoid empty release.`, colors.yellow);
        return false;
    }
    
    return true;
}

// Clean up empty version sections (but keep unreleased)
function cleanupEmptySections() {
    let changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
    
    // Remove empty version sections, but skip [Unreleased]
    changelog = changelog.replace(/## \[(?!Unreleased)v?\d+\.\d+\.\d+\] - \d{4}-\d{2}-\d{2}\n\n### Added\n\n### Changed\n\n### Fixed\n\n*/g, '');
    
    fs.writeFileSync(CHANGELOG_FILE, changelog);
    log('✓ Cleaned up empty changelog sections', colors.green);
}

// Update CHANGELOG.md with auto-generated content
function updateChangelog(newVersion, date, { autoChangelog } = { autoChangelog: false }) {
    let changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');

    // Find the [Unreleased] section
    const unreleasedRegex = /## \[Unreleased\]([\s\S]*?)(?=\n## \[|$)/;
    const match = changelog.match(unreleasedRegex);

    let unreleasedContent = '';
    
    if (match && match[1].trim() && !autoChangelog) {
        // Use existing unreleased content when not forcing auto-changelog
        unreleasedContent = match[1].trim();
    } else {
        // Generate from git commits
        const categories = generateChangelogFromCommits();
        
        unreleasedContent = '\n### Added\n\n';
        if (categories.added.length > 0) {
            unreleasedContent += categories.added.join('\n') + '\n\n';
        } else {
            unreleasedContent += '\n\n';
        }
        
        unreleasedContent += '### Changed\n\n';
        if (categories.changed.length > 0) {
            unreleasedContent += categories.changed.join('\n') + '\n\n';
        } else {
            unreleasedContent += '\n\n';
        }
        
        unreleasedContent += '### Fixed\n\n';
        if (categories.fixed.length > 0) {
            unreleasedContent += categories.fixed.join('\n') + '\n\n';
        } else {
            unreleasedContent += '\n\n';
        }
    }

    // Create new version section
    const newVersionSection = `## [${newVersion}] - ${date}\n${unreleasedContent}\n`;

    // Reset [Unreleased] section
    const newUnreleasedSection = `## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n\n`;

    // Replace in changelog
    changelog = changelog.replace(
        unreleasedRegex,
        newUnreleasedSection + newVersionSection
    );

    fs.writeFileSync(CHANGELOG_FILE, changelog);
    
    // Validate the changelog has content; if not, signal caller to skip bump
    const isValid = validateChangelogContent(newVersion, date, { allowEmpty: autoChangelog });
    if (!isValid) {
        return false;
    }

    return true;
}
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

// Get git status and auto-commit changes
function autoCommitChanges() {
    try {
        // Check if there are any changes to commit
        const statusOutput = execSync('git status --porcelain', {
            cwd: ROOT_DIR,
            encoding: 'utf8'
        }).trim();

        if (!statusOutput) {
            log('No changes to commit', colors.blue);
            return;
        }

        log('Detected changes, auto-committing...', colors.blue);
        
        // Add all changes
        execSync('git add .', {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });

        // Get list of changed files for commit message
        const diffNamestat = execSync('git diff --cached --name-status', {
            cwd: ROOT_DIR,
            encoding: 'utf8'
        }).trim();

        // Create commit message based on changes
        let commitMessage = 'chore: auto-commit changes before version bump\n\n';
        commitMessage += 'Files changed:\n';
        
        diffNamestat.split('\n').forEach(line => {
            if (line.trim()) {
                const [status, ...filePathParts] = line.split('\t');
                const filePath = filePathParts.join('\t');
                const statusEmoji = status === 'A' ? '➕' : status === 'M' ? '📝' : status === 'D' ? '🗑️' : '🔄';
                commitMessage += `${statusEmoji} ${filePath}\n`;
            }
        });

        // Create the commit
        execSync(`git commit -m "${commitMessage}"`, {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });

        log('✓ Auto-committed detected changes', colors.green);
        
    } catch (error) {
        log('✗ Failed to auto-commit changes', colors.red);
        log('You may need to commit manually', colors.yellow);
        throw error;
    }
}

// Execute git commands
function gitCommit(version) {
    try {
        // Stage all version-related files
        execSync('git add version.json apps/web/public/version.json CHANGELOG.md package.json apps/web/package.json', {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });

        // Create version bump commit
        execSync(`git commit -m "chore(release): v${version}"`, {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });

        log(`✓ Git commit created: chore(release): v${version}`, colors.green);
        
        // Auto-push to remote
        log('\nPushing to remote repository...', colors.blue);
        execSync('git push origin main', {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });
        
        log('✓ Pushed to remote repository', colors.green);
        
    } catch (error) {
        log('✗ Failed to create git commit or push', colors.red);
        log('You may need to commit and push manually', colors.yellow);
    }
}

// Main function
function main() {
    const args = process.argv.slice(2);
    const bumpType = args[0];
    const flags = args.slice(1);
    const autoChangelog = flags.includes('--auto-changelog');

    if (!bumpType) {
        log('Usage: node scripts/version.js <major|minor|patch> [--auto-changelog]', colors.yellow);
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

    // Update version data
    const date = getCurrentDate();
    const timestamp = getCurrentTimestamp();
    versionData.version = newVersion;
    versionData.releaseDate = date;
    versionData.buildMetadata.lastUpdated = timestamp;
    versionData.buildMetadata.buildNumber = (versionData.buildMetadata.buildNumber || 0) + 1;

    // Git commit - auto-commit if changes detected
    log('\nChecking for uncommitted changes...', colors.blue);
    
    const statusOutput = execSync('git status --porcelain', {
        cwd: ROOT_DIR,
        encoding: 'utf8'
    }).trim();

    if (statusOutput) {
        log('Detected uncommitted changes, auto-committing...', colors.yellow);
        autoCommitChanges();
    }
    
    // Before mutating version files, ensure there will be real changelog content
    const changelogUpdated = updateChangelog(newVersion, date, { autoChangelog });
    if (!changelogUpdated) {
        log('No relevant changes detected for changelog. Version bump has been skipped.', colors.yellow);
        log('Tip: Add entries under [Unreleased] in CHANGELOG.md before running version:patch, or make code changes that generate changelog entries.', colors.blue);
        process.exit(0);
    }

    // Now update version files
    writeVersion(versionData);
    updatePackageJson(ROOT_PACKAGE, newVersion);
    updatePackageJson(WEB_PACKAGE, newVersion);
    copyToPublic(versionData);
    
    log('✓ Updated all version files', colors.green);
    
    // Clean up empty sections after changelog is updated
    // cleanupEmptySections(); // Disabled for now
    
    log('\nCreating version bump commit...', colors.blue);
    gitCommit(newVersion);

    log(`\n${colors.bright}${colors.green}Version bump complete!${colors.reset}`);
    log(`\nNew version: ${colors.bright}v${newVersion}${colors.reset}\n`);
}

main();
