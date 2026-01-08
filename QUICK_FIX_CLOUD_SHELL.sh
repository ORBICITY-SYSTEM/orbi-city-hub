#!/bin/bash

# Quick Fix Script for Cloud Shell Push
# This script helps you find the repository and push to GitHub

echo "🔍 Looking for repository..."
echo ""

# Try to find repository
REPO_PATH=$(find ~ -name "orbi-city-hub-main" -type d 2>/dev/null | grep -E "orbi-city-hub-main/orbi-city-hub-main$" | head -1)

if [ -z "$REPO_PATH" ]; then
    REPO_PATH=$(find ~ -name "AIDirectorsShowcase.tsx" 2>/dev/null | head -1 | xargs dirname | xargs dirname | xargs dirname)
fi

if [ -z "$REPO_PATH" ]; then
    echo "❌ Repository not found!"
    echo ""
    echo "Please navigate to repository manually:"
    echo "  cd ~/path/to/orbi-city-hub-main/orbi-city-hub-main"
    exit 1
fi

echo "✅ Found repository at: $REPO_PATH"
echo ""

cd "$REPO_PATH"

echo "📂 Current directory: $(pwd)"
echo ""

# Check if .git exists
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized. Initializing..."
    git init
    echo "✅ Git initialized"
    echo ""
fi

# Check Git status
echo "📊 Git status:"
git status --short | head -10
echo ""

# Show files that will be pushed
echo "📦 Files ready to push:"
git ls-files --others --exclude-standard | wc -l | xargs echo "New files:"
git diff --cached --name-only | wc -l | xargs echo "Staged files:"
echo ""

echo "✅ Ready to push!"
echo ""
echo "Next steps:"
echo "1. Get GitHub token from: https://github.com/settings/tokens"
echo "2. Run: git add ."
echo "3. Run: git commit -m '✨ Add 5D AI Directors Showcase'"
echo "4. Run: git push https://YOUR_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git main"
echo ""
