# 🏠 Local Development Setup

## ✅ შექმნილია `.env` ფაილი!

`.env` ფაილი უკვე შექმნილია პროექტის root-ში შენი მონაცემებით.

---

## 🚀 Local-ზე გაშვება (Web Preview)

### 1. Terminal-ში გადადი პროექტის დირექტორიაში:

```powershell
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"
```

### 2. Install dependencies (თუ პირველად):

```powershell
pnpm install
```

### 3. გაუშვი development server:

```powershell
pnpm dev
```

### 4. გახსენი browser-ში:

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

## 📋 .env ფაილის შინაარსი

`.env` ფაილი შეიცავს:

- ✅ OTELMS credentials
- ✅ Google Cloud Storage
- ✅ Calendar settings
- ✅ Rows.com API key (სწორი ფორმატით - **არა "rows-" prefix!**)
- ✅ Rows.com Spreadsheet ID
- ✅ Rows.com Table IDs
- ✅ RLIST filters
- ✅ Security keys

---

## ⚠️ მნიშვნელოვანი

1. **ROWS_API_KEY** - **არ დაამატო "rows-" პრეფიქსი!**
   - ✅ სწორი: `1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`
   - ❌ არასწორი: `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`

2. **.env ფაილი** - **არ commit-ო Git-ში!**
   - ის უკვე `.gitignore`-შია

3. **Local vs Vercel:**
   - **Local (.env)**: Development-ისთვის (localhost:3000)
   - **Vercel (Env Vars)**: Production-ისთვის (https://orbicityhotel.com)

---

## 🔧 Vercel-ზე Fix

Vercel build error გავასწორე:
- ✅ წავშალე `functions` ობიექტი `vercel.json`-დან
- ✅ Runtime კონფიგურაცია ახლა `api/trpc/[path].ts` ფაილშია (`export const config`)

**ახლა Vercel-ზე deployment უნდა იმუშაოს!**

---

**განახლებული**: 2025-01-11
**ვერსია**: 1.0
