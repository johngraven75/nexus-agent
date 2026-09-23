#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  push-to-github.sh
#  Run this once to create the GitHub repo and push everything.
#  Usage: GITHUB_TOKEN=ghp_xxx bash scripts/push-to-github.sh
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

GITHUB_USER="johngraven75"
REPO_NAME="nexus-agent"
REPO_DESC="Autonomous Software Engineering AI Platform for Windows — 11 AI providers, free tier, multimodal, uncensored models, media generation, 60+ connectors, 40+ skills"
REPO_TOPICS="electron windows ai llm autonomous-agent openrouter huggingface ollama multimodal free"

TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "Error: Set GITHUB_TOKEN=<your_personal_access_token>"
  echo ""
  echo "Get a token at: https://github.com/settings/tokens"
  echo "Required scopes: repo, workflow"
  echo ""
  echo "Usage: GITHUB_TOKEN=ghp_xxx bash scripts/push-to-github.sh"
  exit 1
fi

echo "=== Creating GitHub repository: ${GITHUB_USER}/${REPO_NAME} ==="

# Create the repo
CREATE_RESP=$(curl -s -X POST \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"${REPO_NAME}\",
    \"description\": \"${REPO_DESC}\",
    \"private\": false,
    \"has_issues\": true,
    \"has_projects\": false,
    \"has_wiki\": false,
    \"auto_init\": false
  }")

REPO_URL=$(echo "$CREATE_RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('clone_url',''))" 2>/dev/null)
if [ -z "$REPO_URL" ]; then
  # Check if repo already exists
  CHECK=$(curl -s -H "Authorization: token ${TOKEN}" "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('clone_url',''))" 2>/dev/null)
  if [ -n "$CHECK" ]; then
    echo "Repo already exists — pushing to existing repo"
    REPO_URL="$CHECK"
  else
    echo "Error creating repo:"
    echo "$CREATE_RESP"
    exit 1
  fi
fi

echo "Repo URL: $REPO_URL"

# Configure git
git config user.name "${GITHUB_USER}"
git config user.email "${GITHUB_USER}@users.noreply.github.com"

# Init git if needed
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Stage all files
git add -A

# Commit
git commit -m "feat: initial release Nexus Agent v3.2.0

- Autonomous software engineering AI harness
- 11 AI providers with free tier defaults
- Multimodal models: Llama Vision, LLaVA, Qwen2-VL
- Uncensored models: Dolphin, Hermes, MythoMax
- Image generation: DALL-E, SD XL, Flux, Ideogram
- Video generation: Runway, Kling, Luma, Pika
- 60+ platform connectors
- 40+ AI skills from all major platforms
- App Doctor with auto-fix
- Dependency wizard (22 tools)
- Windows x64 Electron app" 2>/dev/null || echo "(already committed)"

# Set remote
git remote remove origin 2>/dev/null || true
REMOTE_WITH_TOKEN="${REPO_URL/https:\/\//https:\/\/${TOKEN}@}"
git remote add origin "${REMOTE_WITH_TOKEN}"

# Push
echo ""
echo "Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "Setting repository topics..."
curl -s -X PUT \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github.mercy-preview+json" \
  "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/topics" \
  -d "{\"names\": $(echo "${REPO_TOPICS}" | python3 -c "import sys; words=sys.stdin.read().split(); print('[' + ','.join(f'\"'+w+'\"' for w in words) + ']')")}" \
  > /dev/null && echo "Topics set"

echo ""
echo "Creating initial release tag..."
git tag -a "v3.2.0" -m "Release v3.2.0" 2>/dev/null || true
git push origin v3.2.0 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Repository created and pushed!"
echo ""
echo "  View at: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo "  Actions: https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
echo ""
echo "  Next steps:"
echo "  1. Go to repo → Settings → Secrets → Actions"
echo "  2. Add OPENROUTER_KEY for monthly model refresh workflow"
echo "  3. Add EV code signing cert secrets for signed Windows builds"
echo "  4. Enable GitHub Discussions for community support"
echo "═══════════════════════════════════════════════════════"
