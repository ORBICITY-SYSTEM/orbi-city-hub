# 🚀 Quick Start - Local Development

## ✅ Vercel Build Error - გასწორებულია!

**Problem:** `Function Runtimes must have a valid version`

**Solution:** 
- ✅ წავშალე `functions` ობიექტი `vercel.json`-დან
- ✅ Runtime კონფიგურაცია ახლა `api/trpc/[path].ts` ფაილშია (`export const config`)

**Status:** ✅ **გასწორებულია!** ახლა Vercel-ზე deployment უნდა იმუშაოს!

---

## 📋 .env ფაილი - შექმნა

### 1. Terminal-ში:

```powershell
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"
```

### 2. შექმენი `.env` ფაილი:

**.env** ფაილი უკვე შექმნილია! თუ არა, შექმენი ხელით:

```env
OTELMS_USERNAME=tamunamaxaradze@yahoo.com
OTELMS_PASSWORD=Orbicity1234!
OTELMS_API_URL=https://otelms-api.run.app
VITE_OTELMS_API_URL=https://otelms-api.run.app

GCS_BUCKET=otelms-data

CALENDAR_RENDER_TIMEOUT=300
CALENDAR_SCAN_SECONDS=90
CALENDAR_MONTH_SHIFTS=-1,0,1
CALENDAR_TODAY=1

ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
ROWS_SYNC_MODE=overwrite

ROWS_CALENDAR_TABLE_ID=cb0eed95-0f57-4640-975a-8dc7a053f732
ROWS_STATUS_TABLE_ID=9fd54415-7bfd-4e5b-b8bb-17c9e03a5273
ROWS_RLIST_CREATED_TABLE_ID=be9ac7f9-9795-4b0b-b974-d3fac458d834
ROWS_RLIST_CHECKIN_TABLE_ID=0f146429-1ed0-418c-9b8c-b1fd41be44cc
ROWS_RLIST_CHECKOUT_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41
ROWS_HISTORY_TABLE_ID=d5c025b0-55cb-473b-9657-f6f0ac3e227c
ROWS_RLIST_STAY_DAYS_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41

RLIST_ACTIVE_CATEGORIES=Suite with Sea view,Delux suite with sea view,Superior Suite with Sea View,Interconnected Family Room
RLIST_STATUS=all
SKIP_ROWS_IF_UNCHANGED=1
ROWS_APPEND_CHUNK_SIZE=500
SCRAPER_PROFILE=prod

SERVICE_API_KEY=MySuperSecretKeyForOrbi2025
```

**⚠️ მნიშვნელოვანი:** `ROWS_API_KEY` - **უნდა იყოს "rows-" prefix-ით!** (მაგ: `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`)

---

## 🏃 Local-ზე გაშვება

### 1. Install dependencies (თუ პირველად):

```powershell
pnpm install
```

### 2. გაუშვი development server:

```powershell
pnpm dev
```

### 3. Browser-ში გახსენი:

```
http://localhost:3000
```

---

## ✅ შემოწმება

1. **Terminal-ში** უნდა გამოჩნდეს:
   ```
   Server running on http://localhost:3000/
   ```

2. **Browser-ში** გადადი: `http://localhost:3000`

3. **Instagram Analytics** გვერდზე:
   - გადადი: `http://localhost:3000/marketing/instagram`
   - დააჭირე **"Test"** ღილაკს
   - უნდა გამოჩნდეს: **"Connection successful!"**

---

## 📋 Vercel Deployment

Vercel build error გავასწორე! ახლა:

1. **გადადი Vercel Dashboard-ზე:**
   https://vercel.com/orbi-city/orbi-city-hub

2. **Redeploy:**
   - Deployments → "..." → "Redeploy"

3. **ან push GitHub-ზე:**
   - ყველა ცვლილება უკვე დაპუშულია!
   - Vercel ავტომატურად გააკეთებს deployment-ს

---

**განახლებული**: 2025-01-11
**ვერსია**: 1.0
