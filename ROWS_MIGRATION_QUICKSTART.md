# ROWS.COM Migration - Quick Start Guide

## 🚨 Phase 0: Security Fixes (START HERE - 1 Week)

### Problem
**CRITICAL SECURITY VULNERABILITY:** API keys are exposed in client-side code!

```bash
# CURRENT (.env) - DANGEROUS!
VITE_ROWS_API_KEY=your_api_key_here  # ⚠️ Visible in browser!
```

---

## Step 1: Clean Up Environment Variables (30 min)

### Remove from `.env`:
```bash
# DELETE THESE LINES:
VITE_ROWS_API_KEY=...
VITE_ROWS_SPREADSHEET_ID=...
```

### Keep only server-side variables:
```bash
# KEEP THESE (no VITE_ prefix):
ROWS_API_KEY=your_api_key_here
ROWS_SPREADSHEET_ID=your_spreadsheet_id_here
```

### Update Vercel Environment Variables:
```bash
# In Vercel Dashboard → Settings → Environment Variables:
# DELETE:
- VITE_ROWS_API_KEY
- VITE_ROWS_SPREADSHEET_ID

# KEEP:
- ROWS_API_KEY (server-side only)
- ROWS_SPREADSHEET_ID (server-side only)
```

---

## Step 2: Create Server-Side Proxy Router (2 hours)

Create file: `server/routers/rowsProxyRouter.ts`

```typescript
import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const ROWS_API_BASE = "https://api.rows.com/v1";
const ROWS_API_KEY = process.env.ROWS_API_KEY!;
const ROWS_SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID!;

// Table ID validation schema
const tableIdSchema = z.string().uuid();

export const rowsProxyRouter = router({
  /**
   * Fetch table data (replaces direct client calls)
   */
  fetchTable: protectedProcedure
    .input(z.object({
      tableId: tableIdSchema,
      range: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const url = `${ROWS_API_BASE}/spreadsheets/${ROWS_SPREADSHEET_ID}/tables/${input.tableId}/values/${input.range || 'A1:Z1000'}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${ROWS_API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error(`ROWS API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('ROWS API error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch data from ROWS',
        });
      }
    }),

  /**
   * Insert row (write operation)
   */
  insertRow: protectedProcedure
    .input(z.object({
      tableId: tableIdSchema,
      values: z.array(z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const url = `${ROWS_API_BASE}/spreadsheets/${ROWS_SPREADSHEET_ID}/tables/${input.tableId}/values`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ROWS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rows: [input.values] }),
        });

        if (!response.ok) {
          throw new Error(`ROWS API error: ${response.statusText}`);
        }

        return { success: true };
      } catch (error) {
        console.error('ROWS API error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to insert row to ROWS',
        });
      }
    }),
});
```

---

## Step 3: Register Proxy Router (5 min)

Update `server/index.ts` (or wherever your main router is):

```typescript
import { rowsProxyRouter } from "./routers/rowsProxyRouter";

export const appRouter = router({
  // ... existing routers
  instagram: instagramRouter,
  rowsProxy: rowsProxyRouter,  // ← ADD THIS
});
```

---

## Step 4: Update Client-Side Code (1 hour)

### BEFORE (❌ Insecure):
```typescript
// client/src/hooks/useInstagramAnalytics.ts

const fetchFromRows = async () => {
  const response = await fetch(
    `https://api.rows.com/v1/spreadsheets/${import.meta.env.VITE_ROWS_SPREADSHEET_ID}/tables/${tableId}/values/A1:Z1000`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_ROWS_API_KEY}`,  // ⚠️ EXPOSED!
      },
    }
  );
  return response.json();
};
```

### AFTER (✅ Secure):
```typescript
// client/src/hooks/useInstagramAnalytics.ts

const fetchFromRows = async () => {
  // Use tRPC proxy instead
  const data = await trpc.rowsProxy.fetchTable.query({
    tableId: 'your-table-id',
    range: 'A1:Z1000',
  });
  return data;
};
```

---

## Step 5: Add Rate Limiting (1 hour)

Install dependency:
```bash
npm install express-rate-limit
```

Create file: `server/middleware/rateLimit.ts`

```typescript
import rateLimit from 'express-rate-limit';

export const rowsApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes per IP
  message: 'Too many requests to ROWS API, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

Apply to API routes in `server/index.ts`:

```typescript
import { rowsApiLimiter } from "./middleware/rateLimit";

// Apply to all /api/rows/* endpoints
app.use('/api/rows', rowsApiLimiter);
```

---

## Step 6: Input Validation (30 min)

Update `server/routers/rowsProxyRouter.ts` with strict Zod schemas:

```typescript
// Validate table IDs are valid UUIDs
const tableIdSchema = z.string().uuid();

// Validate range format (e.g., "A1:Z1000")
const rangeSchema = z.string().regex(/^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/);

// Validate row data
const rowValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const rowsProxyRouter = router({
  fetchTable: protectedProcedure
    .input(z.object({
      tableId: tableIdSchema,
      range: rangeSchema.optional(),
    }))
    .query(async ({ input }) => {
      // input is validated ✅
    }),

  insertRow: protectedProcedure
    .input(z.object({
      tableId: tableIdSchema,
      values: z.array(rowValueSchema),
    }))
    .mutation(async ({ input }) => {
      // input is validated ✅
    }),
});
```

---

## Step 7: Error Sanitization (30 min)

Update error handling to hide internal details:

```typescript
// server/routers/rowsProxyRouter.ts

try {
  // ... ROWS API call
} catch (error) {
  // Log server-side (for debugging)
  console.error('ROWS API error:', error);

  // Show user-friendly message only
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to fetch data from ROWS',
    // ❌ DO NOT expose: error.stack, error.message, API details
  });
}
```

---

## Step 8: Test Everything (1 hour)

### Test Checklist:
```
☐ Verify VITE_* variables removed from .env
☐ Test Instagram Analytics page still works
☐ Check browser DevTools → Network tab (no API keys visible)
☐ Test rate limiting (make 101 requests in 15 min → should fail)
☐ Test invalid table ID → should return 400 error
☐ Test ROWS API down → should show friendly error
☐ Verify all existing features work (no regressions)
```

---

## Step 9: Deploy Security Patch (30 min)

```bash
# Commit changes
git add .
git commit -m "Security: Remove client-side ROWS API keys, add server proxy"

# Push to production
git push origin main

# Update Vercel environment variables
# (delete VITE_* variables as mentioned in Step 1)

# Verify deployment
curl https://your-app.vercel.app/api/rows/test
```

---

## Verification Checklist ✅

After completing all steps:

```
☐ No VITE_ROWS_* variables in .env
☐ No VITE_ROWS_* variables in Vercel dashboard
☐ rowsProxyRouter.ts created and registered
☐ All client-side code uses trpc.rowsProxy.*
☐ Rate limiting active (tested)
☐ Input validation working (tested with invalid UUIDs)
☐ Error messages don't leak internal details
☐ Instagram Analytics still works correctly
☐ Security patch deployed to production
☐ Browser DevTools shows no API keys
```

---

## What Changed?

### BEFORE (Insecure):
```
Browser → ROWS API (direct call)
           ↑
      API key exposed!
```

### AFTER (Secure):
```
Browser → Your Server → ROWS API
          (tRPC proxy)   ↑
                    API key hidden!
```

---

## Next Steps (After Phase 0)

Once security is fixed, proceed to:

1. **Phase 1:** Infrastructure Setup (rowsConfig.ts, RowsClient class)
2. **Phase 2:** Reservations Migration (first business module)
3. **Phase 3:** Finance Migration
4. ... (see full roadmap in ROWS_ARCHITECTURE_ANALYSIS.md)

---

## Need Help?

- Full analysis: `/ROWS_ARCHITECTURE_ANALYSIS.md`
- ROWS API docs: https://rows.com/api
- Questions: Check the architecture analysis document

---

**⏱️ Total Time:** ~6 hours
**🎯 Priority:** 🚨 URGENT (fix today!)
**👥 Team:** 1 developer
**💰 Cost:** Free (just refactoring)

---

*Start with this guide, then review the full architecture analysis for long-term planning.*
