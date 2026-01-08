# ORBI City Hub - Architecture Document

**Version:** 1.0.0  
**Last Updated:** 2025-12-21  
**Status:** LOCKED - No architectural refactor allowed

---

## Executive Decision

This document represents the **Single Source of Truth** for ORBI City Hub architecture.
All decisions documented here are **FINAL and LOCKED** by executive order.

---

## Technology Stack (CONFIRMED)

| Component | Technology | Status |
|-----------|------------|--------|
| **Primary Database** | MySQL / TiDB (Manus built-in) | ✅ LOCKED |
| **ORM** | Drizzle | ✅ LOCKED |
| **API Layer** | tRPC | ✅ LOCKED |
| **Backend Runtime** | Node.js + Express | ✅ LOCKED |
| **Frontend** | React 19 + Vite + Tailwind | ✅ LOCKED |
| **Authentication** | OAuth (Manus) | ✅ LOCKED |
| **AI Engine** | Gemini 2.0 Flash | ✅ LOCKED |
| **Webhooks** | Outscraper, Tawk.to, N8N | ✅ LOCKED |

---

## Architectural Constraints

### What is NOT allowed:

1. **Supabase** is NOT part of the core system
   - No Supabase for transactional data
   - No Supabase for authentication
   - No Supabase for core realtime features

2. **No architectural refactoring** without executive approval
   - Stack is locked
   - Database schema changes require review
   - New integrations require approval

3. **AI limitations**
   - AI may SUGGEST, never DECIDE
   - No automatic compensation (discounts, refunds)
   - All AI responses require manager approval before publishing

---

## System Modules

### Core Modules

| Module | Router | Description | Priority |
|--------|--------|-------------|----------|
| **CEO Dashboard** | ceoDashboardRouter | Real-time KPIs for management | P0 |
| **Finance** | financeRouter, realFinanceRouter | Financial analytics and reporting | P1 |
| **OTA Command Center** | otaRouter | Multi-channel booking management | P1 |
| **Reviews** | reviewsRouter | Multi-platform review aggregation + AI responses | P0 |
| **Live Chat** | tawktoRouter | Tawk.to integration | P1 |
| **Telegram Bot** | telegramRouter | Notification system | P1 |
| **Butler AI** | butlerRouter | Task management | P2 |
| **Logistics** | logisticsRouter | Housekeeping & Maintenance | P2 |

### Integration Points

| Integration | Endpoint | Status | Data Flow |
|-------------|----------|--------|-----------|
| **Outscraper** | `/api/webhooks/outscraper` | ✅ Active | Reviews → DB → AI → Butler Task |
| **Tawk.to** | `/api/webhooks/tawkto` | ✅ Active | Chat Events → DB → Notifications |
| **N8N** | `/api/webhooks/n8n` | ⚠️ Partial | Workflow triggers |
| **Telegram** | Bot API | ✅ Active | Outbound notifications |
| **Google Business** | OAuth | ⚠️ Partial | Review responses |

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SOURCES                            │
├─────────────────────────────────────────────────────────────────┤
│  Outscraper    │   Tawk.to    │    N8N     │   Telegram        │
│  (Reviews)     │   (Chat)     │ (Workflows)│   (Notifications) │
└───────┬────────┴──────┬───────┴─────┬──────┴────────┬──────────┘
        │               │             │               │
        ▼               ▼             ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WEBHOOK LAYER                               │
│  /api/webhooks/outscraper  │  /api/webhooks/tawkto  │  /api/... │
│  P0 FIX: Property whitelist validation enabled                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     tRPC API LAYER                              │
│  45+ routers │ Type-safe │ Rate-limited │ Authenticated        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                              │
│  MySQL / TiDB │ Drizzle ORM │ 39 tables │ Redis cache          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AI PROCESSING LAYER                         │
│  Gemini 2.0 Flash │ Review responses │ Task suggestions        │
│  P0 FIX: No automatic compensation - manager approval required  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                              │
│  React 19 │ Vite │ Tailwind │ 59 pages │ Real-time updates     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Measures

| Measure | Implementation | Status |
|---------|----------------|--------|
| **Rate Limiting** | Express rate limiter | ✅ Active |
| **Security Headers** | Helmet middleware | ✅ Active |
| **Authentication** | OAuth + JWT | ✅ Active |
| **Input Validation** | Zod schemas | ✅ Active |
| **Property Whitelist** | Outscraper webhook filter | ✅ Active (P0 Fix) |

---

## P0 Fixes Applied (2025-12-21)

### 1. Outscraper Webhook - Property Whitelist Validation

**Problem:** Foreign property reviews (e.g., Empoli, Italy) were being imported.

**Solution:** Strict whitelist validation added:
- Only Orbi City Batumi property IDs accepted
- Location validation (Batumi, Georgia)
- All non-matching reviews are rejected with logging

### 2. AI Review Prompt - Cleaned

**Problem:** Potential for inconsistent or inappropriate AI responses.

**Solution:** 
- Plain text prompts only
- No automatic compensation offers
- Clear instruction: "AI may suggest, never decide"

### 3. Automatic Compensation - Removed

**Problem:** 20% discount was automatically offered in negative review responses.

**Solution:**
- Removed from all templates
- AI instructed to never offer compensation
- Manager must approve any discounts manually

---

## Deployment

| Environment | URL | Status |
|-------------|-----|--------|
| **Production** | Manus hosted | ✅ Active |
| **Database** | MySQL/TiDB | ✅ Active |
| **CDN** | Manus built-in | ✅ Active |

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-21 | 1.0.0 | Initial architecture document, P0 fixes applied |

---

## Approval

This architecture is approved and locked by executive decision.

**No changes allowed without explicit approval from:**
- Project Director
- Technical Lead

---

*Document generated: 2025-12-21*
*GitHub: ORBICITY-SYSTEM/orbi-city-hub*
