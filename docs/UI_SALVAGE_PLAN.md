# PowerStack → Hub UI Salvage Plan

## Overview

This document outlines the UI components from PowerStack that should be ported to ORBI-CITY-HUB. The goal is NOT to create a separate UI app, but to merge the best parts into Hub's existing Next.js + shadcn UI.

## Current State Analysis

### Hub Already Has (DO NOT DUPLICATE):
- ✅ Admin.tsx (23KB) - Admin panel
- ✅ EmailInbox.tsx (11KB) - Email management
- ✅ FinanceDashboard.tsx (17KB) - Finance overview
- ✅ Reservations.tsx (15KB) - Booking management
- ✅ LiveChatDashboard.tsx (13KB) - Tawk.to integration
- ✅ Reports.tsx (23KB) - Reporting system
- ✅ BookingsTable.tsx - Data tables
- ✅ DashboardLayout.tsx - Layout system

### PowerStack Has (CANDIDATES FOR PORTING):

| Component | File | Size | Priority | Notes |
|-----------|------|------|----------|-------|
| **Owners Portal** | `owners.js` | 13KB | 🔴 HIGH | Commission split, owner statements - Hub lacks this |
| **Channel Manager** | `channel-manager.js` | 24KB | 🟡 MEDIUM | OTA integration UI - Hub has basic version |
| **Radar Dashboard** | `radar.js` | 14KB | 🟡 MEDIUM | Internal monitoring - unique concept |
| **Guest Experience** | `guest-experience.js` | 28KB | 🟢 LOW | Hub has similar in Reviews |
| **Marketing** | `marketing.js` | 33KB | 🟢 LOW | Hub has Marketing.tsx |
| **Logistics** | `logistics.js` | 18KB | 🟢 LOW | Hub has Logistics.tsx |

---

## Priority 1: Owners Portal (MUST PORT)

### Why:
Hub completely lacks owner/investor management. PowerStack has a working implementation.

### Source Files:
```
powerstack-ui/pages/owners.js (13,692 bytes)
```

### Key Features to Port:
1. **Owner List View** - List of property owners with contact info
2. **Commission Calculator** - Split calculations per booking
3. **Statement Generator** - Monthly owner statements
4. **Payment Tracking** - Owner payouts history

### Target Location in Hub:
```
client/src/pages/Owners.tsx
client/src/components/owners/
  ├── OwnersList.tsx
  ├── CommissionCalculator.tsx
  ├── StatementGenerator.tsx
  └── PayoutHistory.tsx
```

### Backend Requirements:
- Add `owners` table to Drizzle schema
- Add `ownerPayouts` table
- Create `ownersRouter.ts` in tRPC

---

## Priority 2: Enhanced Channel Manager

### Why:
PowerStack has more detailed OTA integration UI with status indicators.

### Source Files:
```
powerstack-ui/pages/channel-manager.js (24,776 bytes)
powerstack-ui/components/dashboard/ChannelDistribution.js
powerstack-ui/components/dashboard/IntegrationStatusWidget.js
```

### Features to Merge:
1. **Channel Health Dashboard** - Real-time status per OTA
2. **Sync Status Indicators** - Last sync time, error counts
3. **Rate Parity Checker** - Price comparison across channels
4. **Inventory Sync UI** - Bulk availability updates

### Target: Enhance existing Hub components:
```
client/src/pages/ChannelDetail.tsx (enhance)
client/src/components/ChannelsGrid.tsx (enhance)
```

---

## Priority 3: Radar Dashboard

### Why:
Unique internal monitoring concept not in Hub.

### Source Files:
```
powerstack-ui/pages/radar.js (14,289 bytes)
```

### Features:
1. **Live Activity Feed** - Real-time events
2. **Alert Center** - Critical notifications
3. **Performance Metrics** - Key KPIs at a glance
4. **Staff Activity** - Who did what, when

### Target Location:
```
client/src/pages/Radar.tsx (new)
client/src/components/radar/
  ├── ActivityFeed.tsx
  ├── AlertCenter.tsx
  └── PerformanceMetrics.tsx
```

---

## Implementation Checklist

### Phase 1: Owners Portal (Week 1)
- [ ] Create Drizzle schema for owners, ownerPayouts
- [ ] Create ownersRouter.ts with CRUD operations
- [ ] Port owners.js → Owners.tsx (convert to TypeScript + shadcn)
- [ ] Create commission calculation logic
- [ ] Add to Hub sidebar navigation

### Phase 2: Channel Manager Enhancement (Week 2)
- [ ] Analyze channel-manager.js patterns
- [ ] Enhance ChannelDetail.tsx with status indicators
- [ ] Add rate parity comparison component
- [ ] Integrate with existing OTA router

### Phase 3: Radar Dashboard (Week 3)
- [ ] Create Radar.tsx page
- [ ] Port activity feed concept
- [ ] Connect to existing activityLog router
- [ ] Add real-time WebSocket updates (optional)

---

## Code Conversion Guidelines

### From PowerStack (React + vanilla CSS):
```javascript
// PowerStack style
function OwnerCard({ owner }) {
  return (
    <div className="owner-card" style={{ padding: '16px', border: '1px solid #ddd' }}>
      <h3>{owner.name}</h3>
      <p>{owner.email}</p>
    </div>
  );
}
```

### To Hub (TypeScript + shadcn + Tailwind):
```typescript
// Hub style
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Owner {
  id: string;
  name: string;
  email: string;
}

export function OwnerCard({ owner }: { owner: Owner }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{owner.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{owner.email}</p>
      </CardContent>
    </Card>
  );
}
```

---

## Files NOT to Port (Already Better in Hub)

| PowerStack File | Hub Equivalent | Reason |
|-----------------|----------------|--------|
| `index.js` (dashboard) | `Home.tsx` | Hub version more complete |
| `finance.js` | `FinanceDashboard.tsx` | Hub has real data integration |
| `integrations.js` | `AdminIntegrations.tsx` | Hub has more integrations |
| `login.js` | `AdminLogin.tsx` | Hub has proper auth |
| `admin.js` | `Admin.tsx` | Hub version is comprehensive |

---

## Database Schema Additions Required

```typescript
// Add to drizzle/schema.ts

// Owners table
export const owners = mysqlTable('owners', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  taxId: varchar('tax_id', { length: 50 }),
  bankAccount: varchar('bank_account', { length: 100 }),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('15.00'),
  status: varchar('status', { length: 20 }).default('ACTIVE'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Owner-Unit relationship
export const ownerUnits = mysqlTable('owner_units', {
  id: varchar('id', { length: 36 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 36 }).notNull(),
  unitId: varchar('unit_id', { length: 36 }).notNull(),
  ownershipPercentage: decimal('ownership_percentage', { precision: 5, scale: 2 }).default('100.00'),
  startDate: date('start_date'),
  endDate: date('end_date'),
});

// Owner payouts
export const ownerPayouts = mysqlTable('owner_payouts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 36 }).notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  grossRevenue: decimal('gross_revenue', { precision: 12, scale: 2 }),
  commission: decimal('commission', { precision: 12, scale: 2 }),
  expenses: decimal('expenses', { precision: 12, scale: 2 }),
  netPayout: decimal('net_payout', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 20 }).default('PENDING'),
  paidAt: timestamp('paid_at'),
  paymentRef: varchar('payment_ref', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## Summary

**Total Effort Estimate:** 2-3 weeks

| Priority | Component | Effort | Value |
|----------|-----------|--------|-------|
| 🔴 P1 | Owners Portal | 5 days | HIGH - fills major gap |
| 🟡 P2 | Channel Manager | 3 days | MEDIUM - enhances existing |
| 🟡 P3 | Radar Dashboard | 3 days | MEDIUM - nice to have |

**Key Principle:** Don't duplicate, enhance. Hub is the master, PowerStack is the donor.
