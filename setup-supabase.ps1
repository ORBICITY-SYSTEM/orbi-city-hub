# Supabase Setup Script for Instagram Analytics
# This script helps you set up Supabase for Instagram Analytics

Write-Host "🚀 Supabase Setup for Instagram Analytics" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
    Write-Host ""
}

# Check if user is logged in
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login to Supabase:" -ForegroundColor Yellow
    Write-Host "1. Open: https://supabase.com/dashboard" -ForegroundColor Cyan
    Write-Host "2. Create a new project (or use existing)" -ForegroundColor Cyan
    Write-Host "3. Get your project URL and keys from Settings → API" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI is ready" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create Supabase Project:" -ForegroundColor Yellow
Write-Host "   - Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Click 'New Project'" -ForegroundColor White
Write-Host "   - Enter project name and password" -ForegroundColor White
Write-Host ""
Write-Host "2. Get Credentials:" -ForegroundColor Yellow
Write-Host "   - Go to: Settings → API" -ForegroundColor White
Write-Host "   - Copy Project URL → VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "   - Copy anon public key → VITE_SUPABASE_PUBLISHABLE_KEY" -ForegroundColor White
Write-Host "   - Copy service_role key → SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host ""
Write-Host "3. Create Database Tables:" -ForegroundColor Yellow
Write-Host "   - Go to: SQL Editor" -ForegroundColor White
Write-Host "   - Copy content from: supabase/setup-database.sql" -ForegroundColor White
Write-Host "   - Paste and click 'RUN'" -ForegroundColor White
Write-Host ""
Write-Host "4. Deploy Edge Functions:" -ForegroundColor Yellow
Write-Host "   supabase functions deploy instagram-test-connection" -ForegroundColor White
Write-Host "   supabase functions deploy instagram-sync-cron" -ForegroundColor White
Write-Host ""
Write-Host "5. Set Secrets:" -ForegroundColor Yellow
Write-Host "   supabase secrets set ROWS_API_KEY=your-key" -ForegroundColor White
Write-Host "   supabase secrets set ROWS_SPREADSHEET_ID=your-id" -ForegroundColor White
Write-Host "   supabase secrets set SUPABASE_URL=your-url" -ForegroundColor White
Write-Host "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key" -ForegroundColor White
Write-Host ""
Write-Host "6. Add to .env file:" -ForegroundColor Yellow
Write-Host "   VITE_SUPABASE_URL=your-url" -ForegroundColor White
Write-Host "   VITE_SUPABASE_PUBLISHABLE_KEY=your-key" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup instructions displayed" -ForegroundColor Green
Write-Host ""
Write-Host "After setup, test connection at: http://localhost:3000/marketing/instagram/test" -ForegroundColor Cyan
