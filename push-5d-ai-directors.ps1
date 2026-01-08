# PowerShell Script to Push 5D AI Directors Implementation to GitHub
# Run this script from the repository root directory

Write-Host "🚀 Pushing 5D AI Directors Implementation to GitHub..." -ForegroundColor Cyan

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "📥 Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "   Or use GitHub Desktop: https://desktop.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Not a git repository. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "⚠️  Please add remote: git remote add origin https://github.com/ORBICITY-SYSTEM/orbi-city-hub.git" -ForegroundColor Yellow
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Cyan

# Check if there are changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    exit 0
}

# Show changes
Write-Host "`n📋 Changes to be committed:" -ForegroundColor Cyan
git status --short

# Stage all files
Write-Host "`n📦 Staging all files..." -ForegroundColor Cyan
git add .

# Commit with message
$commitMessage = @"
✨ Add 5D AI Directors Showcase with stunning effects

🎯 Main Features:
- Created interactive 5D AI Directors Panel with 3D transforms
- Added CEO AI with personalized prototype (182cm, elegant, professional)
- Created Marketing, Reservations, Finance, Logistics AI Directors
- Added scrolling task marquee with real-time data
- Implemented particle effects, glow animations, professional gestures
- Enhanced Integrations page with Development Tools section
- Added complete bilingual support (English/Georgian)

🤖 AI Directors:
- CEO AI: 182cm, blonde, elegant black dress, professional
- Marketing AI Director: Young male, tech suit, blue theme
- Reservations AI Director: Young female, diverse, green theme
- Finance AI Director: Mature male, classic suit, amber theme
- Logistics AI Director: Mature female, work uniform, purple theme

✨ 5D Effects:
- 3D transforms with perspective
- Particle systems (100+ particles)
- Energy ripple effects
- Hand wave animations
- Professional gesture animations
- Shimmer borders
- Multiple glow layers

🔧 Backend:
- Added reservationsRouter, financeRouter, logisticsRouter
- Database schema: reservationsTasks, financeTasks, logisticsTasks
- tRPC integration for all AI Directors
- Real-time task stats

🌍 Internationalization:
- All UI text in English/Georgian
- Professional terms remain in English
- Task descriptions bilingual

📱 Integration Enhancements:
- Development Tools section (Rows.com, Obsidian, Python API, etc.)
- GitHub, Vercel, Cloud Run integration cards
- Gemini AI, MySQL/TiDB, tRPC showcase
"@

Write-Host "`n💾 Committing changes..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit successful!" -ForegroundColor Green
    
    # Push to remote
    Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Cyan
    git push origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 SUCCESS! All changes pushed to GitHub!" -ForegroundColor Green
        Write-Host "📍 Repository: https://github.com/ORBICITY-SYSTEM/orbi-city-hub" -ForegroundColor Cyan
        Write-Host "`n✨ The 5D AI Directors Showcase is now live!" -ForegroundColor Magenta
    } else {
        Write-Host "`n⚠️  Push failed. You may need to:" -ForegroundColor Yellow
        Write-Host "   1. Set up remote: git remote add origin https://github.com/ORBICITY-SYSTEM/orbi-city-hub.git" -ForegroundColor Yellow
        Write-Host "   2. Or use GitHub Desktop to push manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Commit failed" -ForegroundColor Red
}
