# 🚀 Edge Functions Deployment Guide

## ✅ Current Status

**Deployed Function:** `clever-endpoint`
- Endpoint: `https://lusagtvxjtfxgfadulgv.supabase.co/functions/v1/clever-endpoint`

**Required Functions:**
1. `instagram-test-connection` - ❌ Not deployed
2. `instagram-sync-cron` - ❌ Not deployed

---

## 📋 Deploy Required Functions

### Option 1: Rename/Delete `clever-endpoint` and Deploy Correct Functions

1. **გადადი:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions`
2. **წაშალე** `clever-endpoint` (თუ არ გჭირდება)
3. **დააჭირე:** "Deploy a new function" ან "Open Editor"

### Function 1: `instagram-test-connection`

1. **Function Name:** `instagram-test-connection`
2. **Copy კოდი** `supabase/functions/instagram-test-connection/index.ts`-დან
3. **Paste Editor-ში**
4. **Deploy**

**Expected Endpoint:** `https://lusagtvxjtfxgfadulgv.supabase.co/functions/v1/instagram-test-connection`

### Function 2: `instagram-sync-cron`

1. **Function Name:** `instagram-sync-cron`
2. **Copy კოდი** `supabase/functions/instagram-sync-cron/index.ts`-დან
3. **Paste Editor-ში**
4. **Deploy**

**Expected Endpoint:** `https://lusagtvxjtfxgfadulgv.supabase.co/functions/v1/instagram-sync-cron`

---

## ✅ Verification

დეპლოირების შემდეგ, უნდა ჩანდეს:
- ✅ `instagram-test-connection` - Active
- ✅ `instagram-sync-cron` - Active

---

## 🎯 Test After Deployment

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
   - ✅ Test Rows.com Connection
   - ✅ Sync Instagram Data

---

**ყველაფერი მზადაა! Deploy სწორი function names-ით!**
