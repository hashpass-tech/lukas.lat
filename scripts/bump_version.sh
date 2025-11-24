#!/usr/bin/env bash
# bump_version.sh - increments patch version in version.json and apps/web/package.json
set -e
VERSION_FILE="$(dirname "$0")/../version.json"
PACKAGE_FILE="$(dirname "$0")/../apps/web/package.json"
# Extract current version
CURRENT=$(jq -r '.version' "$VERSION_FILE")
# Split into major.minor.patch
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
# Increment patch
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
# Update version.json
jq ".version = \"$NEW_VERSION\"" "$VERSION_FILE" > "$VERSION_FILE.tmp" && mv "$VERSION_FILE.tmp" "$VERSION_FILE"
# Update apps/web/package.json
jq ".version = \"$NEW_VERSION\"" "$PACKAGE_FILE" > "$PACKAGE_FILE.tmp" && mv "$PACKAGE_FILE.tmp" "$PACKAGE_FILE"
# Print new version
echo "Bumped version to $NEW_VERSION"
