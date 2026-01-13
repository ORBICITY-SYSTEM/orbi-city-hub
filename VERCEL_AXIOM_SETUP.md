# 🔧 Vercel Environment Variables - Axiom AI

## ✅ Axiom AI Environment Variables for Vercel

Vercel-ზე deployment-ისთვის საჭიროა environment variables-ების დამატება Vercel Dashboard-ში.

---

## 📋 Required Variables

### Axiom AI Integration

| Key | Value | Sensitive | Required |
|-----|-------|-----------|----------|
| `AXIOM_API_TOKEN` | `28632451e1c3bd006512ed` | ✅ Yes | ✅ Yes |
| `AXIOM_API_BASE_URL` | `https://api.axiom.ai/v1` | ❌ No | ❌ Optional (has default) |

---

## 🔧 How to Add to Vercel

### Step 1: Go to Vercel Dashboard

1. გადადი: https://vercel.com/orbi-city/orbi-city-hub/settings/environment-variables
2. ან: Vercel Dashboard → Your Project → Settings → Environment Variables

### Step 2: Add AXIOM_API_TOKEN

1. Click **"Add New"** button
2. **Key**: `AXIOM_API_TOKEN`
3. **Value**: `28632451e1c3bd006512ed`
4. **Environments**: Select all (Production, Preview, Development)
5. **Sensitive**: ✅ Enable (check the box)
6. Click **"Save"**

### Step 3: Add AXIOM_API_BASE_URL (Optional)

1. Click **"Add New"** button
2. **Key**: `AXIOM_API_BASE_URL`
3. **Value**: `https://api.axiom.ai/v1`
4. **Environments**: Select all (Production, Preview, Development)
5. **Sensitive**: ❌ No need (it's not a secret)
6. Click **"Save"**

---

## ⚠️ Important Notes

1. **`.env` file vs Vercel**:
   - `.env` file = Local development only (არ commit-დება Git-ში)
   - Vercel Environment Variables = Production deployment-ისთვის

2. **After Adding Variables**:
   - Vercel ავტომატურად დაიწყებს ახალ deployment-ს
   - ან manually trigger-ი გააკეთე: Deployments → Redeploy

3. **Security**:
   - ✅ `AXIOM_API_TOKEN` - **Sensitive** (check the box)
   - ❌ `AXIOM_API_BASE_URL` - Not sensitive (public URL)

---

## 📝 Complete List of Axiom Variables

```
AXIOM_API_TOKEN=28632451e1c3bd006512ed
AXIOM_API_BASE_URL=https://api.axiom.ai/v1
```

---

## ✅ Verification

After adding variables, you can verify:

1. Go to your deployment logs
2. Check that the API token is being used (don't worry if it's masked)
3. Test the connection via AdminIntegrations page → Axiom AI → Test Connection

---

## 🔄 When to Add Variables to Vercel

**დიახ, ყოველთვის უნდა:**

- ✅ როცა ახალ API integration-ს ამატებ
- ✅ როცა environment variable-ს ამატებ local `.env`-ში
- ✅ როცა sensitive data-ს იყენებ (API keys, tokens, passwords)
- ✅ როცა production-ში გჭირდება რაიმე configuration

**როცა არ არის საჭირო:**
- ❌ Local-only development variables
- ❌ Test/Mock data
- ❌ Variables that have defaults and work without configuration

---

**Status**: ✅ **Ready to add to Vercel!**
