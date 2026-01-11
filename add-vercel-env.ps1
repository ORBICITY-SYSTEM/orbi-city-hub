# PowerShell Script to Add Vercel Environment Variables
# Requires: Vercel CLI installed (npm i -g vercel)

param(
    [switch]$All,
    [switch]$InstagramOnly
)

Write-Host "🚀 Vercel Environment Variables Setup`n" -ForegroundColor Cyan

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI found: $vercelVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm i -g vercel`n" -ForegroundColor Yellow
    exit 1
}

# Instagram Analytics (Required)
$instagramVars = @{
    "ROWS_API_KEY" = "rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC"
    "ROWS_SPREADSHEET_ID" = "6TEX2TmAJXfWwBiRltFBuo"
}

# All Environment Variables
$allVars = @{
    # Rows.com
    "ROWS_API_KEY" = "rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC"
    "ROWS_SPREADSHEET_ID" = "6TEX2TmAJXfWwBiRltFBuo"
    "ROWS_SYNC_MODE" = "overwrite"
    "ROWS_CALENDAR_TABLE_ID" = "cb0eed95-0f57-4640-975a-8dc7a053f732"
    "ROWS_STATUS_TABLE_ID" = "9fd54415-7bfd-4e5b-b8bb-17c9e03a5273"
    "ROWS_RLIST_CREATED_TABLE_ID" = "be9ac7f9-9795-4b0b-b974-d3fac458d834"
    "ROWS_RLIST_CHECKIN_TABLE_ID" = "0f146429-1ed0-418c-9b8c-b1fd41be44cc"
    "ROWS_RLIST_CHECKOUT_TABLE_ID" = "ec7c99d8-88b7-430d-98ea-5273e43e9b41"
    "ROWS_HISTORY_TABLE_ID" = "d5c025b0-55cb-473b-9657-f6f0ac3e227c"
    "ROWS_RLIST_STAY_DAYS_TABLE_ID" = "ec7c99d8-88b7-430d-98ea-5273e43e9b41"
    
    # OTELMS
    "OTELMS_USERNAME" = "tamunamaxaradze@yahoo.com"
    "OTELMS_PASSWORD" = "Orbicity1234!"
    
    # GCS
    "GCS_BUCKET" = "otelms-data"
    
    # Calendar
    "CALENDAR_RENDER_TIMEOUT" = "300"
    "CALENDAR_SCAN_SECONDS" = "90"
    "CALENDAR_MONTH_SHIFTS" = "-1,0,1"
    "CALENDAR_TODAY" = "1"
    
    # RLIST
    "RLIST_ACTIVE_CATEGORIES" = "Suite with Sea view,Delux suite with sea view,Superior Suite with Sea View,Interconnected Family Room"
    "RLIST_STATUS" = "ყველა"
    "SKIP_ROWS_IF_UNCHANGED" = "1"
    "ROWS_APPEND_CHUNK_SIZE" = "500"
    "SCRAPER_PROFILE" = "prod"
    
    # Security
    "SERVICE_API_KEY" = "MySuperSecretKeyForOrbi2025"
}

# Select which variables to add
$varsToAdd = if ($InstagramOnly) { $instagramVars } elseif ($All) { $allVars } else { $instagramVars }

Write-Host "📝 Adding environment variables to Vercel...`n" -ForegroundColor Yellow

$success = 0
$failed = 0

foreach ($var in $varsToAdd.GetEnumerator()) {
    $key = $var.Key
    $value = $var.Value
    
    Write-Host "Adding: $key" -ForegroundColor Cyan -NoNewline
    
    try {
        # Add to all environments (production, preview, development)
        $result = echo $value | vercel env add $key production preview development 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $success++
        } else {
            Write-Host " ❌ (may already exist)" -ForegroundColor Yellow
            $failed++
        }
    } catch {
        Write-Host " ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Success: $success" -ForegroundColor Green
Write-Host "  ⚠️  Failed/Skipped: $failed" -ForegroundColor Yellow

Write-Host "`n🔄 Next: Redeploy your application on Vercel`n" -ForegroundColor Cyan
Write-Host "  1. Go to Vercel Dashboard → Deployments" -ForegroundColor White
Write-Host "  2. Click '...' on latest deployment → 'Redeploy'" -ForegroundColor White
Write-Host "  3. Test Instagram Analytics page`n" -ForegroundColor White
