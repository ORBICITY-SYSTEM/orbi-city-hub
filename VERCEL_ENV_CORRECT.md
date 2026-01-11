# ✅ Vercel Environment Variables - სწორი ფორმატი

## ⚠️ მნიშვნელოვანი: ROWS_API_KEY

**✅ სწორი:**
```env
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
```

**რატომ:** Rows.com API key-ს **უნდა** ჰქონდეს "rows-" პრეფიქსი! კოდი ამატებს `Bearer` prefix-ს authentication-ისთვის, რის შედეგადაც გამოდის: `Bearer rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`

---

## 📋 სრული სია (სწორი ფორმატით)

### STEP 1: CRITICAL (აუცილებელი)

| Key | Value (მაგალითი) | Sensitive |
|-----|-------------------|-----------|
| `DATABASE_URL` | `mysql://user:password@host:port/database` | ✅ |
| `JWT_SECRET` | `your-secret-key-min-32-chars` | ✅ |
| `OAUTH_SERVER_URL` | `https://your-oauth-server.com` | ❌ |
| `VITE_APP_ID` | `orbi-city-hub` | ❌ |
| `OWNER_OPEN_ID` | `your-openid` | ❌ |
| `ROWS_API_KEY` | `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC` | ✅ |
| `ROWS_SPREADSHEET_ID` | `6TEX2TmAJXfWwBiRltFBuo` | ❌ |

### STEP 2: IMPORTANT

| Key | Value | Sensitive |
|-----|-------|-----------|
| `OTELMS_USERNAME` | `tamunamaxaradze@yahoo.com` | ❌ |
| `OTELMS_PASSWORD` | `Orbicity1234!` | ✅ |
| `OTELMS_API_URL` | `https://otelms-api.run.app` | ❌ |
| `VITE_OTELMS_API_URL` | `https://otelms-api.run.app` | ❌ |
| `GEMINI_API_KEY` | `your-gemini-key` | ✅ |

---

## 🔧 Vercel-ში დამატება

1. გადადი: https://vercel.com/orbi-city/~/settings/environment-variables

2. **ROWS_API_KEY**-ისთვის:
   - Key: `ROWS_API_KEY`
   - Value: `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC` (**"rows-" prefix-ით!**)
   - Environments: Production, Preview, Development
   - Sensitive: ✅ (ჩართე)

3. **ROWS_SPREADSHEET_ID**-ისთვის:
   - Key: `ROWS_SPREADSHEET_ID`
   - Value: `6TEX2TmAJXfWwBiRltFBuo`
   - Environments: Production, Preview, Development
   - Sensitive: ❌

4. დააჭირე **"Save"**

5. **Redeploy**: Deployments → "..." → "Redeploy"

---

## ✅ შემოწმება

1. გადადი: https://orbicityhotel.com/marketing/instagram
2. დააჭირე **"Test"** ღილაკს
3. უნდა გამოჩნდეს: **"Connection successful!"**

---

**განახლებული**: 2025-01-11
**ვერსია**: 2.1 - Corrected Format
