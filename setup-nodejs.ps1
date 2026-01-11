# Node.js Setup Script (No Admin Required)
# This script downloads and sets up Node.js without requiring admin privileges

Write-Host "[*] Node.js Setup (No Admin Required)" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create nodejs folder in project directory
$NODEJS_DIR = Join-Path $PSScriptRoot "nodejs"
$NODE_VERSION = "v20.11.0"
$NODE_ARCH = "x64" # Change to "x86" if you have 32-bit Windows
$NODE_FILE = "node-$NODE_VERSION-win-$NODE_ARCH.zip"
$NODE_URL = "https://nodejs.org/dist/$NODE_VERSION/$NODE_FILE"

if (-not (Test-Path $NODEJS_DIR)) {
    New-Item -ItemType Directory -Path $NODEJS_DIR -Force | Out-Null
    Write-Host "[OK] Created nodejs folder: $NODEJS_DIR" -ForegroundColor Green
}

$NODE_EXTRACTED = Join-Path $NODEJS_DIR "node-$NODE_VERSION-win-$NODE_ARCH"
$NODE_EXE = Join-Path $NODE_EXTRACTED "node.exe"

# Step 2: Check if Node.js already exists
if (Test-Path $NODE_EXE) {
    Write-Host "[OK] Node.js already exists at: $NODE_EXTRACTED" -ForegroundColor Green
    Write-Host ""
    Write-Host "To use Node.js in this PowerShell session, run:" -ForegroundColor Yellow
    Write-Host "  `$env:PATH = `"$NODE_EXTRACTED;`$env:PATH`"" -ForegroundColor White
    Write-Host "  node --version" -ForegroundColor White
    Write-Host "  npm --version" -ForegroundColor White
    $env:PATH = "$NODE_EXTRACTED;$env:PATH"
    Write-Host ""
    Write-Host "[OK] Node.js added to PATH for this session!" -ForegroundColor Green
    exit 0
}

# Step 3: Download Node.js
$ZIP_PATH = Join-Path $NODEJS_DIR $NODE_FILE

Write-Host "[*] Downloading Node.js $NODE_VERSION..." -ForegroundColor Yellow
Write-Host "   URL: $NODE_URL" -ForegroundColor Gray
Write-Host "   Destination: $ZIP_PATH" -ForegroundColor Gray
Write-Host ""

try {
    # Use Invoke-WebRequest to download
    Invoke-WebRequest -Uri $NODE_URL -OutFile $ZIP_PATH -UseBasicParsing
    
    if (Test-Path $ZIP_PATH) {
        Write-Host "[OK] Download complete!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Download failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Error downloading: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "[TIP] Manual download:" -ForegroundColor Yellow
    Write-Host "   1. Open browser: https://nodejs.org/dist/$NODE_VERSION/" -ForegroundColor White
    Write-Host "   2. Download: $NODE_FILE" -ForegroundColor White
    Write-Host "   3. Extract to: $NODEJS_DIR" -ForegroundColor White
    exit 1
}

# Step 4: Extract ZIP file
Write-Host ""
Write-Host "[*] Extracting Node.js..." -ForegroundColor Yellow

try {
    # Use Expand-Archive (PowerShell 5.0+)
    Expand-Archive -Path $ZIP_PATH -DestinationPath $NODEJS_DIR -Force
    
    if (Test-Path $NODE_EXE) {
        Write-Host "[OK] Extraction complete!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Extraction failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Error extracting: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "[TIP] Manual extraction:" -ForegroundColor Yellow
    Write-Host "   1. Right-click $ZIP_PATH" -ForegroundColor White
    Write-Host "   2. Select 'Extract All...'" -ForegroundColor White
    Write-Host "   3. Extract to: $NODEJS_DIR" -ForegroundColor White
    exit 1
}

# Step 5: Clean up ZIP file
if (Test-Path $ZIP_PATH) {
    Remove-Item $ZIP_PATH -Force
    Write-Host "[*] Cleaned up ZIP file" -ForegroundColor Gray
}

# Step 6: Add to PATH for current session
$env:PATH = "$NODE_EXTRACTED;$env:PATH"

# Step 7: Verify installation
Write-Host ""
Write-Host "[*] Verifying installation..." -ForegroundColor Yellow

try {
    $nodeVersion = & "$NODE_EXE" --version 2>&1
    $npmVersion = & "$NODE_EXTRACTED\npm.cmd" --version 2>&1
    
    Write-Host ""
    Write-Host "[OK] Node.js installed successfully!" -ForegroundColor Green
    Write-Host "   Node.js: $nodeVersion" -ForegroundColor White
    Write-Host "   npm: $npmVersion" -ForegroundColor White
    Write-Host ""
    Write-Host "[INFO] Important Notes:" -ForegroundColor Yellow
    Write-Host "   - Node.js is now available in THIS PowerShell session" -ForegroundColor White
    Write-Host "   - For future sessions, run this command:" -ForegroundColor White
    Write-Host "     `$env:PATH = `"$NODE_EXTRACTED;`$env:PATH`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[*] Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Install pnpm: npm install -g pnpm" -ForegroundColor White
    Write-Host "   2. Install dependencies: pnpm install" -ForegroundColor White
    Write-Host "   3. Start dev server: pnpm dev" -ForegroundColor White
    
} catch {
    Write-Host "[ERROR] Verification failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "[TIP] Try running manually:" -ForegroundColor Yellow
    Write-Host "   & `"$NODE_EXE`" --version" -ForegroundColor White
    exit 1
}

# Step 8: Create a helper script for future sessions
$HELPER_SCRIPT = Join-Path $PSScriptRoot "use-nodejs.ps1"
$helperContent = @"
# Quick script to add Node.js to PATH for this session
`$NODE_PATH = "$NODE_EXTRACTED"
`$env:PATH = "`$NODE_PATH;`$env:PATH"
Write-Host "[OK] Node.js added to PATH" -ForegroundColor Green
Write-Host "   Node.js: `$(node --version)" -ForegroundColor White
Write-Host "   npm: `$(npm --version)" -ForegroundColor White
"@

Set-Content -Path $HELPER_SCRIPT -Value $helperContent -Encoding UTF8
Write-Host ""
Write-Host "[*] Created helper script: use-nodejs.ps1" -ForegroundColor Gray
Write-Host "   Run: .\use-nodejs.ps1 (in future PowerShell sessions)" -ForegroundColor Gray

Write-Host ""
Write-Host "[OK] Setup complete!" -ForegroundColor Green
