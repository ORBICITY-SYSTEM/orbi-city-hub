# Universal GitHub Push Script
# Uses .github-config.ps1 for credentials (which is in .gitignore)

param(
    [string]$Path = ".",
    [string]$CommitMessage = "Update files",
    [switch]$All
)

# Load config if exists
$configPath = Join-Path $PSScriptRoot ".github-config.ps1"
if (Test-Path $configPath) {
    . $configPath
    $RepoOwner = $script:GitHubConfig.RepoOwner
    $RepoName = $script:GitHubConfig.RepoName
    $Branch = $script:GitHubConfig.Branch
    $Token = $script:GitHubConfig.Token
} else {
    Write-Host "❌ Config file not found: .github-config.ps1" -ForegroundColor Red
    Write-Host "Creating template config file..." -ForegroundColor Yellow
    @"
`$script:GitHubConfig = @{
    RepoOwner = "ORBICITY-SYSTEM"
    RepoName = "orbi-city-hub"
    Branch = "main"
    Token = "YOUR_TOKEN_HERE"
}
"@ | Out-File -FilePath $configPath -Encoding UTF8
    Write-Host "✅ Created .github-config.ps1 - Please add your token!" -ForegroundColor Green
    exit
}

$apiBase = "https://api.github.com/repos/$RepoOwner/$RepoName"

$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
}

function Push-File {
    param(
        [string]$RelPath,
        [string]$CommitMsg
    )
    
    $fullPath = Join-Path $PSScriptRoot $RelPath
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️  Not found: $RelPath" -ForegroundColor Yellow
        return $false
    }
    
    try {
        $content = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($fullPath))
        $url = "$apiBase/contents/$RelPath"
        
        # Check if file exists
        $sha = $null
        try {
            $existing = Invoke-RestMethod -Uri "$url?ref=$Branch" -Headers $headers -Method Get -ErrorAction Stop
            $sha = $existing.sha
        } catch {
            # File doesn't exist yet
        }
        
        # Prepare body
        $body = @{
            message = $CommitMsg
            content = $content
            branch = $Branch
        }
        
        if ($sha) {
            $body.sha = $sha
        }
        
        $bodyJson = $body | ConvertTo-Json -Depth 10
        
        # Push file
        Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json" | Out-Null
        
        Write-Host "✅ $RelPath" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $RelPath : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# If All flag, push all tracked files
if ($All) {
    Write-Host "`n🚀 Pushing all modified files...`n" -ForegroundColor Cyan
    
    # Get list of files to push (example - modify based on your needs)
    $files = @(
        @("drizzle\schema.ts", "Update schema"),
        @("server\routers.ts", "Update routers"),
        @("client\src\App.tsx", "Update App")
    )
    
    $success = 0
    foreach ($file in $files) {
        $relPath = $file[0].Replace("\", "/")
        $commitMsg = $file[1]
        if (Push-File -RelPath $relPath -CommitMsg $commitMsg) {
            $success++
        }
    }
    
    Write-Host "`n✅ Pushed $success/$($files.Count) files!`n" -ForegroundColor Green
} else {
    # Push single file
    $relPath = $Path.Replace("\", "/")
    if (Push-File -RelPath $relPath -CommitMsg $CommitMessage) {
        Write-Host "`n✅ Successfully pushed!`n" -ForegroundColor Green
    }
}

$commitUrl = "https://github.com/$RepoOwner/$RepoName/commits/$Branch"
Write-Host "🔗 View commits: $commitUrl" -ForegroundColor Cyan
