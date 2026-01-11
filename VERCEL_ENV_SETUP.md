# 🚀 Vercel Environment Variables Setup

## 📋 Required Variables for Instagram Analytics

Add these to Vercel Dashboard → Settings → Environment Variables:

### Rows.com Integration (Instagram Analytics)
```env
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```

### OTELMS Integration (Channel Manager)
```env
OTELMS_USERNAME=tamunamaxaradze@yahoo.com
OTELMS_PASSWORD=Orbicity1234!
```

### Google Cloud Storage
```env
GCS_BUCKET=otelms-data
```

### Calendar Settings
```env
CALENDAR_RENDER_TIMEOUT=300
CALENDAR_SCAN_SECONDS=90
CALENDAR_MONTH_SHIFTS=-1,0,1
CALENDAR_TODAY=1
```

### Rows.com Table IDs
```env
ROWS_SYNC_MODE=overwrite
ROWS_CALENDAR_TABLE_ID=cb0eed95-0f57-4640-975a-8dc7a053f732
ROWS_STATUS_TABLE_ID=9fd54415-7bfd-4e5b-b8bb-17c9e03a5273
ROWS_RLIST_CREATED_TABLE_ID=be9ac7f9-9795-4b0b-b974-d3fac458d834
ROWS_RLIST_CHECKIN_TABLE_ID=0f146429-1ed0-418c-9b8c-b1fd41be44cc
ROWS_RLIST_CHECKOUT_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41
ROWS_HISTORY_TABLE_ID=d5c025b0-55cb-473b-9657-f6f0ac3e227c
ROWS_RLIST_STAY_DAYS_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41
```

### RLIST Filters
```env
RLIST_ACTIVE_CATEGORIES=Suite with Sea view,Delux suite with sea view,Superior Suite with Sea View,Interconnected Family Room
RLIST_STATUS=ყველა
SKIP_ROWS_IF_UNCHANGED=1
ROWS_APPEND_CHUNK_SIZE=500
SCRAPER_PROFILE=prod
```

### Security
```env
SERVICE_API_KEY=MySuperSecretKeyForOrbi2025
```

## 🔧 How to Add in Vercel Dashboard

1. **Go to**: https://vercel.com/dashboard → Your Project → **Settings** → **Environment Variables**

2. **For each variable above**:
   - Click **"Add New"**
   - Enter **Key** (e.g., `ROWS_API_KEY`)
   - Enter **Value** (e.g., `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`)
   - Select **Production**, **Preview**, and **Development**
   - Click **Save**

3. **After adding all variables**:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment → **Redeploy**

## ✅ Verification

After redeploy, test Instagram Analytics:
1. Go to `/marketing/instagram`
2. Click **"Test"** button
3. Should see: **"კავშირი წარმატებულია!"**

## 🔐 Security Note

- `OTELMS_PASSWORD` and `SERVICE_API_KEY` are sensitive
- Make sure they're only in **Production** environment if needed
- Never commit these to Git!
