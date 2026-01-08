#!/bin/bash

# Quick check script for Cloud Shell
# This script checks where repository files are

echo "🔍 Checking for repository files..."
echo ""

# Check for key files
echo "Looking for AIDirectorsShowcase.tsx:"
find ~ -name "AIDirectorsShowcase.tsx" 2>/dev/null

echo ""
echo "Looking for orbi-city-hub-main folders:"
find ~ -name "orbi-city-hub-main" -type d 2>/dev/null

echo ""
echo "Current directory contents:"
pwd
ls -la | grep -E "(orbi|city|hub)" || echo "No repository folders found in current directory"

echo ""
echo "Checking if GitHub repository exists:"
curl -s https://api.github.com/repos/ORBICITY-SYSTEM/orbi-city-hub 2>/dev/null | jq -r '.name // "Repository does not exist or is private"' 2>/dev/null || echo "Repository check failed (need authentication or repo doesn't exist)"

echo ""
echo "✅ Check complete!"
echo ""
echo "If repository files not found, you need to:"
echo "1. Upload files via Cloud Shell Editor, OR"
echo "2. Clone from GitHub if repository exists, OR"
echo "3. Create repository structure manually"
