# ============================================
# Git Setup Script - ORBI Ultimate V2
# ============================================
# This script helps you setup Git and push to GitHub
# Run this script in PowerShell: .\git-setup.ps1

Write-Host "🚀 ORBI Ultimate V2 - Git Setup Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Or use GitHub Desktop: https://desktop.github.com" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Cyan

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found! Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found package.json - correct directory" -ForegroundColor Green
Write-Host ""

# Check if Git is already initialized
if (Test-Path ".git") {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
    Write-Host "✅ Git initialized" -ForegroundColor Green
}

Write-Host ""

# Check files status
Write-Host "Checking file status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add all files:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor White
Write-Host ""
Write-Host "2. Create first commit:" -ForegroundColor Yellow
Write-Host "   git commit -m 'feat: Initial commit - ORBI Ultimate V2'" -ForegroundColor White
Write-Host ""
Write-Host "3. Create GitHub repository:" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/new" -ForegroundColor White
Write-Host "   Repository name: orbi-ultimate-v2" -ForegroundColor White
Write-Host "   DON'T initialize with README" -ForegroundColor White
Write-Host ""
Write-Host "4. Add remote (replace YOUR_USERNAME):" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/orbi-ultimate-v2.git" -ForegroundColor White
Write-Host ""
Write-Host "5. Push to GitHub:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📚 For detailed guide, see: COMPLETE_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
