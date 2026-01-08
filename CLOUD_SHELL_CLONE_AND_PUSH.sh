#!/bin/bash

# Quick script to clone and push to GitHub from Cloud Shell

echo "🚀 Cloning repository from GitHub..."
echo ""

cd ~

# Clone repository
git clone https://github.com/ORBICITY-SYSTEM/orbi-city-hub.git

if [ $? -eq 0 ]; then
    echo "✅ Repository cloned successfully!"
    echo ""
    
    cd orbi-city-hub
    
    echo "📂 Current directory: $(pwd)"
    echo ""
    echo "📦 Repository contents:"
    ls -la | head -20
    echo ""
    
    echo "✅ Repository is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Upload your new files (AIDirectorsShowcase.tsx, etc.) via Cloud Shell Editor"
    echo "2. Or copy files from Windows to Cloud Shell"
    echo "3. Then run:"
    echo "   git add ."
    echo "   git commit -m '✨ Add 5D AI Directors Showcase'"
    echo "   git push https://YOUR_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git main"
else
    echo "❌ Clone failed!"
    exit 1
fi
