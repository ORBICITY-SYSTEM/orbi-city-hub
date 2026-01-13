# 🚀 შექმენი Supabase Project - Harmony-ს მსგავსი

## ✅ რა გჭირდება

1. **Account:** `info@orbicitybatumi.com` Supabase-ში
2. **5-10 წუთი** დრო

---

## 📋 STEP 1: შექმენი Project (2 წუთი)

1. **გადადი:** https://supabase.com/dashboard
2. **Sign In** `info@orbicitybatumi.com` account-ით
3. **დააჭირე:** "New Project" (მწვანე ღილაკი)
4. **შეიყვანე:**
   - **Name:** `orbi-city-hub` (ან რა გინდა)
   - **Database Password:** (შეიყვანე ძლიერი პაროლი, დაწერე სადმე!)
   - **Region:** `Europe West` (ან უახლოესი)
5. **დააჭირე:** "Create new project"
6. **დაელოდე** 2-3 წუთს project-ის შექმნას

---

## 🔑 STEP 2: მიიღე Keys (1 წუთი)

1. **გადადი:** Settings → API (მარცხენა მენიუში)
2. **დააკოპირე:**
   - **Project URL** → ეს იქნება `VITE_SUPABASE_URL`
   - **anon public** key → ეს იქნება `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role** key → ეს იქნება `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET!)

---

## 💾 STEP 3: შექმენი Database Tables (1 წუთი)

1. **გადადი:** SQL Editor (მარცხენა მენიუში)
2. **დააჭირე:** "New query"
3. **გახსენი ფაილი:** `supabase/setup-database.sql`
4. **დააკოპირე** მთელი შიგთავსი
5. **ჩასვი** SQL Editor-ში
6. **დააჭირე:** "RUN" (ქვედა მარჯვენა კუთხეში)
7. **დაადასტურე:** უნდა გამოჩნდეს "Success. No rows returned"

---

## 🚀 STEP 4: Deploy Edge Functions (3 წუთი)

**ტერმინალში:**

```powershell
# 1. გადადი პროექტის ფოლდერში
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"

# 2. დაამატე Node.js PATH-ში
.\use-nodejs.ps1

# 3. დაინსტალირე Supabase CLI (ერთჯერ)
npm install -g supabase

# 4. Login Supabase-ში
supabase login

# 5. Link project (შეიყვანე project ID - URL-დან)
supabase link --project-ref your-project-id

# 6. Deploy functions
supabase functions deploy instagram-test-connection
supabase functions deploy instagram-sync-cron

# 7. Set secrets
supabase secrets set ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
supabase secrets set ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 🔧 STEP 5: დაამატე Environment Variables (30 წამი)

**შექმენი/განაახლე `.env` ფაილი:**

```env
# Supabase (Frontend)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)

# Supabase (Backend - Edge Functions)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)

# Rows.com (Edge Functions)
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```

---

## ✅ STEP 6: Test Connection (30 წამი)

1. **გაუშვი server:**
   ```powershell
   pnpm dev
   ```

2. **გადადი browser-ში:**
   ```
   http://localhost:3000/marketing/instagram/test
   ```

3. **შეამოწმე:**
   - ✅ Supabase Configuration: **Connected**
   - ✅ დააჭირე "Test Rows.com Connection"
   - ✅ უნდა გამოჩნდეს: "Connection successful!"

---

## 🎉 მზადაა!

თუ ყველაფერი მუშაობს:
- ✅ Supabase Connected
- ✅ Rows.com Test Successful
- ✅ Sync მუშაობს

გადადი: `/marketing/instagram` და დააჭირე "Sync" ღილაკს!

---

## 📋 Checklist

- [ ] Project შექმნილია Supabase-ში
- [ ] Keys მიღებულია (Settings → API)
- [ ] Database tables შექმნილია (SQL Editor)
- [ ] Edge Functions დეპლოირებულია
- [ ] Secrets დაყენებულია
- [ ] Environment variables დამატებულია (`.env`)
- [ ] Test page-ზე Connection Successful ✅

---

**განახლებული:** 2025-01-11
