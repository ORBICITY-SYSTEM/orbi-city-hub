# 🚀 Deploy Edge Functions - Manual Instructions

## Edge Functions-ის დეპლოირება Browser-ით

### Function 1: `instagram-test-connection`

1. **გადადი:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions`
2. **დააჭირე:** "Deploy a new function" ან "Open Editor"
3. **Function Name:** `instagram-test-connection`
4. **Copy კოდი:**
   - გახსენი: `supabase/functions/instagram-test-connection/index.ts`
   - Copy მთელი კოდი
5. **Paste Editor-ში** და **Deploy**

### Function 2: `instagram-sync-cron`

1. **გადადი:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions`
2. **დააჭირე:** "Deploy a new function" ან "Open Editor"
3. **Function Name:** `instagram-sync-cron`
4. **Copy კოდი:**
   - გახსენი: `supabase/functions/instagram-sync-cron/index.ts`
   - Copy მთელი კოდი
5. **Paste Editor-ში** და **Deploy**

---

## ✅ Verification

დეპლოირების შემდეგ, უნდა ჩანდეს:
- `instagram-test-connection` - Active
- `instagram-sync-cron` - Active

---

## 🎯 Next: Test Connection

დეპლოირების შემდეგ:
1. გაუშვი dev server: `pnpm dev`
2. გადადი: `http://localhost:3000/marketing/instagram/test`
3. დააჭირე "Test Rows.com Connection"
4. დააჭირე "Sync Instagram Data"

---

**ყველაფერი მზადაა!**
