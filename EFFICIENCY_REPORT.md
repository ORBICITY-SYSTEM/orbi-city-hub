# ORBI City Hub - Code Efficiency Report

## Overview

This report identifies several areas in the codebase where performance and efficiency can be improved. The issues range from database query optimization to reducing redundant iterations in JavaScript code.

---

## Issue 1: Inefficient Database Queries in `getReservationStats()` (HIGH PRIORITY)

**File:** `server/reservationDb.ts` (lines 199-236)

**Problem:** The function fetches ALL reservations from the database, then filters them in JavaScript to count by status. It also makes two additional database calls (`getCurrentGuests` and `getUpcomingCheckIns`), resulting in 3 separate database queries when 1 would suffice.

**Current Code:**
```typescript
const all = await db.select().from(reservations);

const confirmed = all.filter(r => r.status === "confirmed").length;
const pending = all.filter(r => r.status === "pending").length;
const cancelled = all.filter(r => r.status === "cancelled").length;

const currentGuests = await getCurrentGuests();
const upcomingCheckIns = await getUpcomingCheckIns(7);
```

**Impact:** 
- Fetches potentially thousands of records when only counts are needed
- 3 database round-trips instead of 1
- High memory usage for large datasets
- Slow response times

**Recommendation:** Use SQL COUNT with GROUP BY to get counts directly from the database in a single query.

---

## Issue 2: Multiple Iterations in Finance Summary Calculation

**File:** `server/routers/finance.ts` (lines 37-51)

**Problem:** The code iterates over the same data array 4 times using separate `reduce()` calls to calculate different totals.

**Current Code:**
```typescript
const totalRevenue = data.reduce((sum, row) => sum + parseFloat(row.totalRevenue.toString()), 0);
const totalExpenses = data.reduce((sum, row) => sum + parseFloat(row.totalExpenses.toString()), 0);
const netProfit = totalRevenue - totalExpenses;
const companyShare = data.reduce((sum, row) => sum + parseFloat(row.companyProfit.toString()), 0);
const ownersShare = data.reduce((sum, row) => sum + parseFloat(row.ownersProfit.toString()), 0);
```

**Impact:** O(4n) time complexity when O(n) is achievable.

**Recommendation:** Calculate all totals in a single pass through the data.

---

## Issue 3: Redundant Filtering in FinanceTransactions Component

**File:** `client/src/components/FinanceTransactions.tsx` (lines 52-64)

**Problem:** The component iterates over `filteredTransactions` 4 times to calculate summary statistics.

**Current Code:**
```typescript
const totalRevenue = filteredTransactions
  .filter(t => t.type === "revenue")
  .reduce((sum, t) => sum + t.amount, 0);

const totalExpenses = filteredTransactions
  .filter(t => t.type === "expense")
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);

const totalCommissions = filteredTransactions
  .reduce((sum, t) => sum + t.commission, 0);

const netTotal = filteredTransactions
  .reduce((sum, t) => sum + t.net, 0);
```

**Impact:** Creates intermediate arrays and iterates multiple times.

**Recommendation:** Use a single reduce to calculate all values at once.

---

## Issue 4: Switch Statements Recreated on Every Render

**File:** `client/src/components/BookingsTable.tsx` (lines 41-74)

**Problem:** The `getStatusColor()` and `getChannelColor()` functions use switch statements that are recreated on every render. These could be converted to lookup objects for O(1) lookup.

**Current Code:**
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-green-500";
    case "pending": return "bg-yellow-500";
    // ... more cases
  }
};
```

**Recommendation:** Use constant lookup objects defined outside the component:
```typescript
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-500",
  pending: "bg-yellow-500",
  // ...
};
```

---

## Issue 5: Inefficient File Search in AI Router

**File:** `server/routers/ai.ts` (lines 72-87)

**Problem:** The code fetches up to 10 files from the database, then uses JavaScript `find()` to search for a matching file name. This could be optimized by using a SQL LIKE query directly.

**Current Code:**
```typescript
const matchingFiles = await db
  .select()
  .from(files)
  .where(eq(files.userId, ctx.user.id))
  .limit(10);

referencedFile = matchingFiles.find(f => 
  f.fileName.toLowerCase().includes(searchFileName.toLowerCase())
);
```

**Recommendation:** Use SQL LIKE query to filter at the database level.

---

## Issue 6: Date Object Creation in Loop

**File:** `shared/analyticsUtils.ts` (lines 152-165)

**Problem:** Creates and mutates Date objects inside a loop for forecasting.

**Current Code:**
```typescript
for (let i = 1; i <= daysAhead; i++) {
  const date = new Date(lastDate);
  date.setDate(date.getDate() + i);
  // ...
}
```

**Recommendation:** Calculate timestamps directly using arithmetic for better performance.

---

## Summary

| Issue | File | Priority | Estimated Impact |
|-------|------|----------|------------------|
| 1 | reservationDb.ts | HIGH | Database load reduction |
| 2 | finance.ts | MEDIUM | CPU optimization |
| 3 | FinanceTransactions.tsx | MEDIUM | Frontend performance |
| 4 | BookingsTable.tsx | LOW | Minor optimization |
| 5 | ai.ts | MEDIUM | Database efficiency |
| 6 | analyticsUtils.ts | LOW | Minor optimization |

---

## Selected Fix

This PR will address **Issue 1: Inefficient Database Queries in `getReservationStats()`** as it has the highest impact on overall application performance.
