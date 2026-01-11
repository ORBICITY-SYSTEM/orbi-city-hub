# 🔑 Rows.com API Integration Setup

## 📋 Required Environment Variables

For Instagram Analytics sync from Rows.com, you need to configure:

```env
ROWS_API_KEY=your_rows_api_key_here
ROWS_SPREADSHEET_ID=your_spreadsheet_id_here
```

## 🔍 How to Get Rows.com API Key

1. **Go to Rows.com** → Settings → API
2. **Create API Key** (if you don't have one)
3. **Copy the API Key** (starts with `rows_` or similar)

## 📊 How to Get Spreadsheet ID

1. **Open your Rows.com spreadsheet** with Instagram data
2. **Check the URL**: `https://rows.com/spreadsheets/{SPREADSHEET_ID}/...`
3. **Copy the Spreadsheet ID** from the URL

## 🚀 Vercel Setup

### Option 1: Via Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `ROWS_API_KEY` = `your_api_key`
   - `ROWS_SPREADSHEET_ID` = `your_spreadsheet_id`
3. Select **Production**, **Preview**, and **Development** environments
4. Click **Save**
5. **Redeploy** your application

### Option 2: Via Vercel CLI

```bash
vercel env add ROWS_API_KEY
vercel env add ROWS_SPREADSHEET_ID
vercel --prod
```

## ✅ Verification

After adding environment variables:

1. Go to **Instagram Analytics** page
2. Click **"Test"** button
3. Should see: **"კავშირი წარმატებულია!"** (Connection successful!)

## 📝 Table IDs (Already Configured)

The following table IDs are already set in the code:

- **Account Metrics**: `7f6062fa-ab98-4307-8491-94fcecb9efa8`
- **All Posts**: `b8c2c96b-dd6b-4990-93b5-18bd2664dd9f`
- **Posts Summary**: `11e6fa3c-ad2f-4d7f-81e7-d73cf74a4c67`
- **Weekly Stats**: `29d39fdc-47ac-40e3-9862-5f3d836ea8a2`

These match the structure from `orb-city-harmony` repository.

## 🔗 API Endpoints

The integration uses:
- **Test Connection**: `trpc.instagram.testConnection`
- **Sync Data**: `trpc.instagram.syncFromRows`
- **Get Metrics**: `trpc.instagram.getMetrics`
- **Get Posts**: `trpc.instagram.getPosts`
- **Get Summary**: `trpc.instagram.getSummary`
- **Get Weekly Stats**: `trpc.instagram.getWeeklyStats`

## ⚠️ Troubleshooting

If you see "ROWS_API_KEY or ROWS_SPREADSHEET_ID not configured":

1. ✅ Check environment variables are set in Vercel
2. ✅ Make sure you selected all environments (Production, Preview, Development)
3. ✅ **Redeploy** after adding variables
4. ✅ Check API key has correct permissions in Rows.com
