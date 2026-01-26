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
- **AI Agents System** - აგენტების სისტემა Supabase-ით (2025-01-26)

---

## AI Agents System (შექმნილია 2025-01-26)

### რა შევქმენით:

**Supabase Tables:**
- `ai_agents` - აგენტების მონაცემები (name, role, module, capabilities)
- `ai_agent_tasks` - აგენტების დავალებები
- `ai_agent_plans` - გეგმები (მარკეტინგის, ფინანსების და ა.შ.)
- `ai_agent_conversations` - აგენტებთან ჩატის ისტორია
- `ai_agent_execution_log` - აგენტების მოქმედებების ლოგი
- `ai_agent_permissions` - აგენტების უფლებები

**Default Agents:**
1. 📊 **Marketing AI Director** - მარკეტინგის სტრატეგი
2. 🤖 **ClawdBot** - Claude AI ასისტენტი
3. 👥 **Cowork** - დავალებების კოორდინატორი

**React Hooks (client/src/hooks/useAIAgents.ts):**
- `useAIAgents()` - აგენტების სია
- `useAIAgentTasks()` - დავალებების სია
- `useAIAgentPlans()` - გეგმების სია
- `useAIAgentChat()` - ჩატის ფუნქციონალი
- `useAIAgentApprovals()` - დამტკიცების სისტემა

**UI Component:**
- `client/src/components/ai-agents/AIAgentsPanel.tsx` - მთავარი პანელი

### როგორ გავუშვათ SQL:
1. გახსენი: https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/sql/new
2. დაალოგინე: `info@orbicitybatumi.com` / `SHAKOniniamasho1!`
3. ჩააკოპირე SQL ფაილიდან: `supabase_migration_ai_agents.sql`
4. დააჭირე RUN

---

## Claude Code Profiles

პროექტში სამი Claude Code profile გამოიყენება:

| Batch File | Project | MCP Profile |
|------------|---------|-------------|
| `claude-cloud-deploy.bat` | cloud-deploy (scrapers) | mcp-profiles\python |
| `claude-orbi-hub.bat` | orbi-city-hub | mcp-profiles\hub |

---

## პრობლემები და გადაწყვეტილებები

### 1. Playwright Browser Session კონფლიქტი
**პრობლემა:** Chrome უკვე გახსნილია და Playwright ვერ შედის
**გადაწყვეტა:** მომხმარებელმა ხელით გაუშვა SQL Supabase Dashboard-ში

### 2. rows.com კოდი ჯერ კიდევ არის
**პრობლემა:** Marketing გვერდზე ჩანს "Loading data from ROWS.COM..."
**გადაწყვეტა:** TODO - წაშალეთ rows.com references კოდიდან

### 3. Port 3000 დაკავებული
**გადაწყვეტა:** სერვერი ავტომატურად გადადის 3001 პორტზე

---

## Deprecated Integrations (წასაშლელია კოდიდან!)

⚠️ **ეს ინტეგრაციები მოშორებულია, მაგრამ კოდი ჯერ კიდევ არის:**
- ~~n8n Cloud workflows~~
- ~~Google Sheets integration~~
- ~~**rows.com API**~~ ← კოდი ჯერ კიდევ არის, უნდა წაიშალოს!

**TODO:** მოძებნე და წაშალე ყველა rows.com reference:
- `server/services/rowsService.ts`
- Marketing page-ის rows.com loading
- `.env`-ში ROWS_* variables

ყველა მონაცემი უნდა მოდიოდეს მხოლოდ **Supabase**-იდან!

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

1. ✅ ~~AI Agents System - Supabase tables და hooks~~
2. 🔴 **წაშალე rows.com კოდი** - მთავარი პრიორიტეტი!
3. Connect Cloud Run scrapers to Supabase
4. Build comprehensive Data Hub with all tables
5. Implement CEO AI with Claude Code
6. Complete autonomous module data distribution
7. OTA integration for automatic responses
8. WhatsApp/Telegram bot for guest communication

---

## Session Log (2025-01-26)

**რა გაკეთდა:**
1. შეიქმნა AI Agents SQL migration
2. შეიქმნა useAIAgents.ts hooks
3. განახლდა AIAgentsPanel.tsx Supabase-ით
4. მომხმარებელმა ხელით გაუშვა SQL Supabase-ში
5. დაემატა credentials CLAUDE.md-ში და .env-ში
6. დაიპუშა GitHub-ზე

**რა დარჩა:**
1. rows.com კოდის წაშლა
2. AI Agents tab-ის ტესტირება
3. Vercel-ზე deploy

---

*This document defines the soul of the project. Every feature and decision should align with this vision.*

*CEO AI (Claude Code) has authority to modify this codebase autonomously within these guidelines.*

*Last updated: 2025-01-26 by Claude Code*
