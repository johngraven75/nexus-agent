#!/usr/bin/env bash
# release.sh — Tag and trigger a GitHub Actions release
set -euo pipefail

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 3.3.0"
  exit 1
fi

# Validate semver
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Error: Version must be semver (e.g. 3.3.0)"
  exit 1
fi

echo "=== Releasing Nexus Agent v${VERSION} ==="

# Update package.json version
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
  pkg.version = '${VERSION}';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('✅ package.json updated to v${VERSION}');
"

# Stage and commit
git add package.json
git commit -m "chore: bump version to ${VERSION}"

# Tag
git tag -a "v${VERSION}" -m "Release v${VERSION}"

# Push
echo "Pushing to origin..."
git push origin main --tags

echo ""
echo "✅ Tag v${VERSION} pushed. GitHub Actions will build and release."
echo "   Monitor at: https://github.com/johngraven75/nexus-agent/actions"
