# 🔍 Vercel Environment Variables Check for Instagram Analytics

## ✅ Required Variables for Instagram Analytics:

1. **ROWS_API_KEY** 
   - Format: `rows-XXXXXXXXX...`
   - Should include the "rows-" prefix
   - Used for Rows.com API authentication

2. **ROWS_SPREADSHEET_ID**
   - For Instagram Analytics: `590R621oSJPeF4u2jPBPzz`
   - This is the Instagram Page Analytics Dashboard spreadsheet ID

## 📋 How to Check in Vercel:

1. Go to: https://vercel.com/orbi-city/orbi-city-hub/settings/environment-variables
2. Look for:
   - `ROWS_API_KEY` - Should be visible with masked value (********)
   - `ROWS_SPREADSHEET_ID` - Should be visible with masked value (********)
3. Click the eye icon to reveal the values (if you have permission)
4. Verify:
   - `ROWS_API_KEY` starts with `rows-`
   - `ROWS_SPREADSHEET_ID` = `590R621oSJPeF4u2jPBPzz` (for Instagram Analytics)

## ⚠️ Common Issues:

1. **Missing variables**: If either variable is missing, add it in Vercel
2. **Wrong spreadsheet ID**: If `ROWS_SPREADSHEET_ID` is pointing to a different spreadsheet (like OTELMS), it won't work for Instagram Analytics
3. **Wrong API key format**: If `ROWS_API_KEY` doesn't start with `rows-`, it's incorrect
4. **Variables not deployed**: After adding/updating variables, you need to redeploy

## 🔧 Quick Fix:

If variables are missing or wrong:
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add/Edit:
   - `ROWS_API_KEY` = `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`
   - `ROWS_SPREADSHEET_ID` = `590R621oSJPeF4u2jPBPzz`
4. Scope: "All Environments" or "Production"
5. Redeploy the project

## 📝 Current Code Expectations:

The Instagram router (`server/routers/instagramRouter.ts`) uses:
- `process.env.ROWS_API_KEY` - for API authentication
- `process.env.ROWS_SPREADSHEET_ID` - for the spreadsheet ID
- Table IDs are hardcoded in the code (they don't need to be env vars)
