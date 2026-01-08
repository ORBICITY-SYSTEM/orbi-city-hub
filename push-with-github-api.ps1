# PowerShell Script to Push to GitHub using GitHub API
# This script uses GitHub API to upload files directly (bypasses Git CLI requirement)

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$Repository = "ORBICITY-SYSTEM/orbi-city-hub",
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Pushing to GitHub using API..." -ForegroundColor Cyan
Write-Host "Repository: $Repository" -ForegroundColor Yellow
Write-Host "Branch: $Branch" -ForegroundColor Yellow

# GitHub API base URL
$apiBase = "https://api.github.com/repos/$Repository"

# Headers with authentication
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "PowerShell-Push-Script"
}

# Get current SHA of branch (needed for updating files)
try {
    $branchUrl = "$apiBase/git/refs/heads/$Branch"
    $branchInfo = Invoke-RestMethod -Uri $branchUrl -Headers $headers -Method Get
    $baseSha = $branchInfo.object.sha
    Write-Host "✅ Found branch SHA: $baseSha" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting branch info: $_" -ForegroundColor Red
    exit 1
}

# Function to upload file to GitHub
function Push-FileToGitHub {
    param(
        [string]$FilePath,
        [string]$GitPath,
        [string]$CommitMessage
    )
    
    $fullPath = Join-Path $PSScriptRoot $FilePath
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️  File not found: $fullPath" -ForegroundColor Yellow
        return $false
    }
    
    # Read file content and encode to base64
    $content = [System.IO.File]::ReadAllBytes($fullPath)
    $base64Content = [System.Convert]::ToBase64String($content)
    
    # Check if file exists in repo
    try {
        $fileUrl = "$apiBase/contents/$GitPath"
        $fileInfo = Invoke-RestMethod -Uri "$fileUrl?ref=$Branch" -Headers $headers -Method Get
        $sha = $fileInfo.sha
        $action = "update"
    } catch {
        $sha = $null
        $action = "create"
    }
    
    # Prepare request body
    $body = @{
        message = $CommitMessage
        content = $base64Content
        branch = $Branch
    } | ConvertTo-Json
    
    if ($sha) {
        $body = @{
            message = $CommitMessage
            content = $base64Content
            branch = $Branch
            sha = $sha
        } | ConvertTo-Json
    }
    
    try {
        $result = Invoke-RestMethod -Uri $fileUrl -Headers $headers -Method Put -Body $body -ContentType "application/json"
        Write-Host "✅ $action`: $GitPath" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error $action` $GitPath`: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n📦 Preparing to push files..." -ForegroundColor Cyan

# List of files to push (new and modified)
$filesToPush = @(
    @{ Path = "client/src/components/AIDirectorsShowcase.tsx"; GitPath = "client/src/components/AIDirectorsShowcase.tsx" },
    @{ Path = "client/src/pages/reservations/AIReservationsDirector.tsx"; GitPath = "client/src/pages/reservations/AIReservationsDirector.tsx" },
    @{ Path = "client/src/pages/finance/AIFinanceDirector.tsx"; GitPath = "client/src/pages/finance/AIFinanceDirector.tsx" },
    @{ Path = "client/src/pages/logistics/AILogisticsDirector.tsx"; GitPath = "client/src/pages/logistics/AILogisticsDirector.tsx" },
    @{ Path = "server/routers/reservationsRouter.ts"; GitPath = "server/routers/reservationsRouter.ts" },
    @{ Path = "server/routers/financeRouter.ts"; GitPath = "server/routers/financeRouter.ts" },
    @{ Path = "server/routers/logisticsRouter.ts"; GitPath = "server/routers/logisticsRouter.ts" },
    @{ Path = "drizzle/0004_reservations_tasks.sql"; GitPath = "drizzle/0004_reservations_tasks.sql" },
    @{ Path = "drizzle/0005_finance_tasks.sql"; GitPath = "drizzle/0005_finance_tasks.sql" },
    @{ Path = "drizzle/0006_logistics_tasks.sql"; GitPath = "drizzle/0006_logistics_tasks.sql" },
    @{ Path = "client/src/pages/Home.tsx"; GitPath = "client/src/pages/Home.tsx" },
    @{ Path = "client/src/pages/Integrations.tsx"; GitPath = "client/src/pages/Integrations.tsx" },
    @{ Path = "client/src/components/ModularLayout.tsx"; GitPath = "client/src/components/ModularLayout.tsx" },
    @{ Path = "client/src/App.tsx"; GitPath = "client/src/App.tsx" },
    @{ Path = "client/src/lib/translations/ka.ts"; GitPath = "client/src/lib/translations/ka.ts" },
    @{ Path = "client/src/lib/translations/en.ts"; GitPath = "client/src/lib/translations/en.ts" },
    @{ Path = "server/routers.ts"; GitPath = "server/routers.ts" },
    @{ Path = "drizzle/schema.ts"; GitPath = "drizzle/schema.ts" }
)

$successCount = 0
$failCount = 0

foreach ($file in $filesToPush) {
    $result = Push-FileToGitHub -FilePath $file.Path -GitPath $file.GitPath -CommitMessage "✨ Add 5D AI Directors Showcase with stunning effects"
    if ($result) {
        $successCount++
    } else {
        $failCount++
    }
    Start-Sleep -Milliseconds 200  # Rate limiting
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "✅ Successfully pushed: $successCount files" -ForegroundColor Green
Write-Host "❌ Failed: $failCount files" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })

if ($successCount -gt 0) {
    Write-Host "`n🎉 Push completed! Check repository: https://github.com/$Repository" -ForegroundColor Green
}
