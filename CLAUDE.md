# ORBICITY AI Operating System - Project Vision

> **IMPORTANT**: Read this document FIRST before making any changes to this repository.

## Who We Are

**Founder**: Tamara
**Company**: ORBICITY SYSTEM
**Location**: Orbi City Batumi, Georgia
**Scale**: 60 luxury apartments

We're building an **AI-first hotel management infrastructure** that lets us compete with large hospitality chains through technology, not headcount.

---

## What We Want to Achieve

A **"handsfree" AI operating system** where the founder gives strategic direction and AI handles execution.

### 1. Autonomous Decision-Making

- **Dynamic pricing** based on demand, seasonality, competitor rates, and occupancy
- **Automatic response** to booking inquiries across all OTA platforms
- **Predictive maintenance** scheduling
- **Guest communication** automation

### 2. Four AI Directors (Modules)

| Director | Responsibilities |
|----------|-----------------|
| **Marketing Director** | Content generation, OTA listing optimization, review responses |
| **Reservations Director** | Booking management, availability sync, rate optimization |
| **Finance Director** | Revenue tracking, expense monitoring, profitability analysis |
| **Logistics Director** | Cleaning schedules, maintenance, inventory management |

### 3. CEO AI (Claude Code) - Autonomous Controller

The CEO AI has full autonomy to:
- **Create new UI elements** (buttons, widgets, charts)
- **Add statistics and metrics** to any module
- **Generate analytics and visualizations**
- **Distribute data** across modules automatically
- **Make independent decisions** based on business context

---

## Data Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  External Scrapers (Cloud Run / Python)                        │
│  https://github.com/ORBICITY-SYSTEM/otelms-rows-api            │
├─────────────────────────────────────────────────────────────────┤
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SUPABASE (Single Source of Truth)          │   │
│  │  • rooms, room_inventory_items                           │   │
│  │  • housekeeping_schedules, maintenance_schedules         │   │
│  │  • bookings, guests                                      │   │
│  │  • finance_data, revenue, expenses                       │   │
│  │  • social_media_metrics, reviews                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              DATA HUB (/data) - Raw Materials            │   │
│  │  Password Protected Admin Access                         │   │
│  │  All Supabase data visible in structured format          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CEO AI (Claude Code)                        │   │
│  │  Autonomous data distribution and visualization          │   │
│  │  Creates widgets, charts, analytics on demand            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Finance  │  │Reserv.   │  │Marketing │  │Logistics │       │
│  │ Module   │  │ Module   │  │ Module   │  │ Module   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express + tRPC
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude Code (CEO AI) + Claude Haiku 3.5 (assistants)
- **Auth**: Session-based with Supabase fallback
- **Deployment**: Vercel
- **Data Source**: ORBICITY-SYSTEM/otelms-rows-api (Cloud Run scrapers)

---

## Key Principles for Development

1. **AI-First**: Every feature should consider AI automation potential
2. **Bilingual**: All UI must support Georgian (ka) and English (en)
3. **Supabase Only**: All data flows through Supabase - NO external spreadsheets
4. **Mobile-First**: All interfaces must be responsive
5. **CEO AI Autonomy**: Claude Code can create/modify UI elements independently

---

## Current State

- Core dashboard with real-time metrics from Supabase
- Four AI Director pages (Marketing, Reservations, Finance, Logistics)
- Finance Copilot - AI assistant for financial insights
- Logistics module - fully connected to Supabase
- Data Hub - admin access to raw Supabase data

---

## Deprecated Integrations (REMOVED)

The following integrations have been removed:
- ~~n8n Cloud workflows~~
- ~~Google Sheets integration~~
- ~~rows.com API~~

All data now flows through Supabase exclusively.

---

## API Keys & Credentials

### Supabase
- **URL**: `VITE_SUPABASE_URL` = `https://lusagtvxjtfxgfadulgv.supabase.co`
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Dashboard**: https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv
- **Login Email**: `info@orbicitybatumi.com`
- **Login Password**: `SHAKOniniamasho1!`

### Claude AI (Assistants)
- **API Key**: `ANTHROPIC_API_KEY`

### Data Hub Password
- **Access**: Password protected for admin access

---

## Next Priorities

1. Connect Cloud Run scrapers to Supabase
2. Build comprehensive Data Hub with all tables
3. Implement CEO AI with Claude Code
4. Complete autonomous module data distribution
5. OTA integration for automatic responses
6. WhatsApp/Telegram bot for guest communication

---

*This document defines the soul of the project. Every feature and decision should align with this vision.*

*CEO AI (Claude Code) has authority to modify this codebase autonomously within these guidelines.*
