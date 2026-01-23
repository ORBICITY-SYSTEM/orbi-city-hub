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

### 3. Integration Architecture

- **OtelMS** (Hotel Management System) - Primary data source
- **OTA Platforms** - Booking.com, Airbnb, Expedia, etc.
- **Google Sheets** - Financial data backup and reporting
- **Power BI style dashboards** - Real-time analytics

---

## Technical Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express + tRPC
- **Database**: MySQL (via Drizzle ORM)
- **AI**: Google Gemini 2.5 Flash (via `invokeLLM()`)
- **Auth**: Session-based with Supabase fallback
- **Deployment**: Vercel

---

## Key Principles for Development

1. **AI-First**: Every feature should consider AI automation potential
2. **Bilingual**: All UI must support Georgian (ka) and English (en)
3. **Demo Mode**: Features should work with demo data when DB unavailable
4. **Mobile-First**: All interfaces must be responsive
5. **Real Data**: Connect to OtelMS and Google Sheets for actual metrics

---

## Current State

- Core dashboard with PowerStack real-time metrics
- Four AI Director pages (Marketing, Reservations, Finance, Logistics)
- Finance Copilot - AI assistant for financial insights
- Instagram Analytics module
- Monthly financial reports system
- **Video Marketing Pipeline** - Automated video generation & social media posting

---

## Video Marketing Pipeline (NEW)

Automated video creation and distribution system for apartment marketing.

### n8n Workflows (ACTIVE)
| Workflow | Schedule | Purpose |
|----------|----------|---------|
| Orbi City Video Marketing Pipeline | Every 6 hours | Generate videos & post to social |
| Orbi City Video Metrics Collector | Daily | Track views/likes across platforms |
| Orbi City Auto Video Scheduler | Weekly | Auto-queue videos for apartments |

### Integration Points
- **Runway ML (PRO)** - AI video generation from photos
- **Google Drive** - Apartment photo storage
- **Google Sheets** - Video queue & performance tracking
- **Social Media** - YouTube, Instagram, TikTok, Facebook

### Google Sheets (Video Marketing)
- `Video Content Queue` - Pending videos to generate
- `Video Performance` - Posted videos with metrics

---

## API Keys & Credentials

### Runway ML (Video Generation)
- **Plan**: Pro ($28/month)
- **Features**: Custom voices, unlimited generations, 500GB storage
- **API Key**: Stored in `.env` as `RUNWAY_API_KEY`

### n8n Cloud
- **URL**: https://orbicity.app.n8n.cloud
- **Credentials**: Stored in `.env`

---

## Next Priorities

1. Complete AI Director autonomous actions
2. OTA integration for automatic responses
3. WhatsApp/Telegram bot for guest communication
4. Predictive maintenance based on cleaning patterns
5. **Connect social media APIs** (YouTube, Instagram, TikTok, Facebook) to video pipeline

---

*This document defines the soul of the project. Every feature and decision should align with this vision.*
