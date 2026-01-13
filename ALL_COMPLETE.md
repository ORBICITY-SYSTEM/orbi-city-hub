# 🎉 Supabase Setup - ALL COMPLETE!

## ✅ რა გაკეთდა

1. ✅ **Supabase Project შექმნილია:** `ORBI CITY HUB` (ID: `lusagtvxjtfxgfadulgv`)
2. ✅ **Database Tables შექმნილია:**
   - `instagram_daily_metrics`
   - `instagram_posts`
   - `instagram_summary`
   - `instagram_weekly_stats`
3. ✅ **Environment Variables დამატებულია `.env`-ში:**
   - `VITE_SUPABASE_URL=https://lusagtvxjtfxgfadulgv.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_RnOx2FVP6D5iklmcYamGqQ_UiPBTsbi`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMwODYzNiwiZXhwIjoyMDgzODg0NjM2fQ.i3sYcVnhd07Vt-eX6KcEfJ1NJDT7Iwu53M-8RK252sU`

---

## 📋 ბოლო 2 ნაბიჯი

### STEP 1: Set Supabase Secrets (Browser-ში)

**გადადი:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions/secrets`

**დაამატე 4 secrets:**

1. **ROWS_API_KEY** = `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`
2. **ROWS_SPREADSHEET_ID** = `6TEX2TmAJXfWwBiRltFBuo`
3. **SUPABASE_URL** = `https://lusagtvxjtfxgfadulgv.supabase.co`
4. **SUPABASE_SERVICE_ROLE_KEY** = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMwODYzNiwiZXhwIjoyMDgzODg0NjM2fQ.i3sYcVnhd07Vt-eX6KcEfJ1NJDT7Iwu53M-8RK252sU`

**დააჭირე:** "Save"

---

### STEP 2: Deploy Edge Functions

**გადადი:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions`

**დააჭირე:** "Deploy a new function"

**Function 1: `instagram-test-connection`**
- Name: `instagram-test-connection`
- Code: Copy from `supabase/functions/instagram-test-connection/index.ts`
- Deploy

**Function 2: `instagram-sync-cron`**
- Name: `instagram-sync-cron`
- Code: Copy from `supabase/functions/instagram-sync-cron/index.ts`
- Deploy

---

## ✅ Test

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

---

## 🎯 Project Details

- **Project Name:** `ORBI CITY HUB`
- **Project ID:** `lusagtvxjtfxgfadulgv`
- **Project URL:** `https://lusagtvxjtfxgfadulgv.supabase.co`
- **Organization:** `info@orbicitybatumi.com`

---

**ყველაფერი მზადაა! Secrets-ების დაყენება და Edge Functions-ის დეპლოირება!**
