# Quick script to add Node.js to PATH for this session
$NODE_PATH = "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main\nodejs\node-v20.11.0-win-x64"
$env:PATH = "$NODE_PATH;$env:PATH"
Write-Host "[OK] Node.js added to PATH" -ForegroundColor Green
Write-Host "   Node.js: $(node --version)" -ForegroundColor White
Write-Host "   npm: $(npm --version)" -ForegroundColor White
