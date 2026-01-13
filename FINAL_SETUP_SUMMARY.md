# ✅ Supabase Instagram Analytics - Setup Complete!

## 🎉 რა გაკეთდა

1. ✅ **Supabase Project შექმნილია:** `ORBI CITY HUB` (ID: `lusagtvxjtfxgfadulgv`)
2. ✅ **Database Tables შექმნილია:**
   - `instagram_daily_metrics`
   - `instagram_posts`
   - `instagram_summary`
   - `instagram_weekly_stats`
3. ✅ **Environment Variables დამატებულია `.env`-ში:**
   - `VITE_SUPABASE_URL=https://lusagtvxjtfxgfadulgv.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_RnOx2FVP6D5iklmcYamGqQ_UiPBTsbi`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. ✅ **Supabase Secrets დამატებულია:**
   - `ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`
   - `ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo`

---

## 📋 ბოლო ნაბიჯი: Deploy Edge Functions

### Option 1: Browser Editor (Recommended)

1. **გადადი:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions`
2. **დააჭირე:** "Open Editor"
3. **Function 1: `instagram-test-connection`**
   - Name: `instagram-test-connection`
   - Copy კოდი: `supabase/functions/instagram-test-connection/index.ts`
   - Paste Editor-ში
   - Deploy
4. **Function 2: `instagram-sync-cron`**
   - Name: `instagram-sync-cron`
   - Copy კოდი: `supabase/functions/instagram-sync-cron/index.ts`
   - Paste Editor-ში
   - Deploy

### Option 2: Supabase CLI (თუ დაყენებულია)

```powershell
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"
.\use-nodejs.ps1

# Link project
supabase link --project-ref lusagtvxjtfxgfadulgv

# Deploy functions
supabase functions deploy instagram-test-connection
supabase functions deploy instagram-sync-cron
```

---

## ✅ Test Connection

1. **გაუშვი server:**
   ```powershell
   cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"
   .\use-nodejs.ps1
   pnpm dev
   ```

2. **გადადი:**
   ```
   http://localhost:3000/marketing/instagram/test
   ```

3. **შეამოწმე:**
   - ✅ Supabase Configuration: **Connected**
   - ✅ Test Rows.com Connection: **Success**
   - ✅ Sync Instagram Data: **Success**

4. **Instagram Analytics Page:**
   ```
   http://localhost:3000/marketing/instagram
   ```

---

## 🎯 Project Details

- **Project Name:** `ORBI CITY HUB`
- **Project ID:** `lusagtvxjtfxgfadulgv`
- **Project URL:** `https://lusagtvxjtfxgfadulgv.supabase.co`
- **Organization:** `info@orbicitybatumi.com`

---

**ყველაფერი მზადაა! Deploy Edge Functions და Test!**
