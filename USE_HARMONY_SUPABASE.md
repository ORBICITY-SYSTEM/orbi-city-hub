# ✅ გამოიყენე Harmony-ს Supabase Project

## 🎯 რა არის Harmony-ში

Harmony repository-ში უკვე არის:
- ✅ Supabase Project: `eifaludttgnpoesjewlv`
- ✅ Supabase URL: `https://eifaludttgnpoesjewlv.supabase.co`
- ✅ Edge Functions დეპლოირებულია
- ✅ Database tables შექმნილია

---

## 🚀 როგორ გამოვიყენო

### STEP 1: მიიღე Supabase Keys

1. **გადადი:** https://supabase.com/dashboard/project/eifaludttgnpoesjewlv
2. **Settings → API:**
   - **Project URL:** `https://eifaludttgnpoesjewlv.supabase.co`
   - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### STEP 2: დაამატე Environment Variables

**`.env` ფაილში:**

```env
# Harmony Supabase (Frontend)
VITE_SUPABASE_URL=https://eifaludttgnpoesjewlv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)

# Harmony Supabase (Backend - Edge Functions)
SUPABASE_URL=https://eifaludttgnpoesjewlv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)

# Rows.com (Edge Functions)
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```

### STEP 3: Link Supabase Project

```powershell
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"
.\use-nodejs.ps1

# Install Supabase CLI (ერთჯერ)
npm install -g supabase

# Login
supabase login

# Link Harmony project
supabase link --project-ref eifaludttgnpoesjewlv
```

### STEP 4: Set Secrets (თუ არ არის დაყენებული)

```powershell
supabase secrets set ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
supabase secrets set ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
supabase secrets set SUPABASE_URL=https://eifaludttgnpoesjewlv.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### STEP 5: Test Connection

1. **გაუშვი server:**
   ```powershell
   pnpm dev
   ```

2. **გადადი:**
   ```
   http://localhost:3000/marketing/instagram/test
   ```

3. **შეამოწმე:**
   - ✅ Supabase Configuration: **Connected**
   - ✅ Test Rows.com Connection: **Success**

---

## ✅ მზადაა!

Harmony-ს Supabase project უკვე მუშაობს. უბრალოდ დაამატე environment variables და test-ი!

---

**Project ID:** `eifaludttgnpoesjewlv`  
**Supabase URL:** `https://eifaludttgnpoesjewlv.supabase.co`
