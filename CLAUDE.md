# ORBICITY AI Operating System - Project Vision

> **IMPORTANT**: Read this document FIRST before making any changes to this repository.
> This file is Claude Code's memory for future sessions.

---

## რა პროექტია (What This Project Is)

**Founder**: Tamara (Tamuna)
**Company**: ORBICITY SYSTEM
**Location**: Orbi City Batumi, Georgia
**Scale**: 60 luxury apartments

**Mission**: AI-first hotel management infrastructure - "handsfree" AI operating system where the founder gives strategic direction and AI handles execution.

### Four AI Directors (Modules)

| Director | Role | Status |
|----------|------|--------|
| **Marketing Director** | Content, OTA optimization, review responses | Active |
| **Reservations Director** | Booking management, availability sync | Active |
| **Finance Director** | Revenue tracking, expense monitoring | Active |
| **Logistics Director** | Cleaning, maintenance, inventory | Active |

### CEO AI (Claude Code)

Claude Code acts as CEO AI with full autonomy to:
- Create new UI elements (buttons, widgets, charts)
- Add statistics and metrics to any module
- Generate analytics and visualizations
- Distribute data across modules automatically
- Make independent decisions based on business context

---

## Technical Stack

```
Frontend:  React + TypeScript + Vite + TailwindCSS + shadcn/ui
Backend:   Node.js + Express + tRPC
Database:  Supabase (PostgreSQL) - SINGLE SOURCE OF TRUTH
AI:        Claude Code (CEO AI) + Claude Haiku 3.5 (assistants)
Auth:      Session-based with Supabase fallback
Deploy:    Vercel
Scrapers:  Cloud Run (Python) - github.com/ORBICITY-SYSTEM/otelms-rows-api
```

### Key Principles

1. **AI-First** - Every feature should consider AI automation
2. **Bilingual** - All UI must support Georgian (ka) and English (en)
3. **Supabase Only** - NO external spreadsheets, ALL data through Supabase
4. **Mobile-First** - All interfaces must be responsive

---

## Credentials & Access

### Supabase (Main Database)
- **URL**: `https://lusagtvxjtfxgfadulgv.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv
- **Login**: `info@orbicitybatumi.com` / `SHAKOniniamasho1!`
- **Env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### GitHub Repository
- **Repo**: https://github.com/ORBICITY-SYSTEM/orbi-city-hub
- **Branch**: main

### Local Development
- **Command**: `pnpm dev`
- **Default Port**: 3000 (falls back to 3001 if busy)
- **URL**: http://localhost:3000 or http://localhost:3001

---

## Claude Code Profiles

| Batch File | Project | MCP Profile |
|------------|---------|-------------|
| `claude-cloud-deploy.bat` | cloud-deploy (scrapers) | mcp-profiles\python |
| `claude-orbi-hub.bat` | orbi-city-hub | mcp-profiles\hub |

---

# SESSION LOGS (ჩემი მეხსიერება)

---

## SESSION: 2025-01-26 - AI Agents System

### რა გავაკეთეთ (What We Did)

#### 1. AI Agents Supabase Tables
შევქმენით 6 ცხრილი Supabase-ში:

```sql
-- ai_agents - აგენტების მონაცემები
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    name_ka TEXT,
    role TEXT NOT NULL,
    description TEXT,
    description_ka TEXT,
    module TEXT NOT NULL,
    capabilities JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true
);

-- ai_agent_tasks - დავალებები
-- ai_agent_plans - გეგმები
-- ai_agent_conversations - ჩატის ისტორია
-- ai_agent_execution_log - მოქმედებების ლოგი
-- ai_agent_permissions - უფლებები
```

**SQL File**: `supabase_migration_ai_agents.sql` ან Desktop/AI_AGENTS_SQL.txt

#### 2. Default Agents (ჩასმულია Supabase-ში)
| Agent | Role | Module | Capabilities |
|-------|------|--------|--------------|
| 📊 Marketing AI Director | marketing_director | marketing | create_plan, analyze |
| 🤖 ClawdBot | clawdbot | marketing | answer, analyze |
| 👥 Cowork | cowork | marketing | coordinate, assign |

#### 3. React Hooks
**File**: `client/src/hooks/useAIAgents.ts`

```typescript
useAIAgents()         // აგენტების სია Supabase-დან
useAIAgentTasks()     // დავალებები
useAIAgentPlans()     // გეგმები
useAIAgentChat()      // ჩატის ფუნქციონალი
useAIAgentApprovals() // დამტკიცების სისტემა
```

#### 4. UI Component
**File**: `client/src/components/ai-agents/AIAgentsPanel.tsx`
- Marketing გვერდზე "AI Agents" tab
- ქართული/ინგლისური ენების მხარდაჭერა
- აგენტების კარტები capabilities-ით

#### 5. ROWS.COM References Removed
**File**: `client/src/components/marketing/MarketingAnalyticsDashboard.tsx`
- Loading text: "Loading marketing data..." (was "Loading data from ROWS.COM...")
- DataSourceBadge: "Supabase" (was "ROWS.COM")

---

### პრობლემები და გადაწყვეტილებები (Problems & Solutions)

#### Problem 1: Playwright Browser Conflict
**Error**: "Opening in existing browser session" - Chrome already running
**Solution**: User manually ran SQL in Supabase Dashboard
**Lesson**: When Playwright fails, create SQL file for manual execution

#### Problem 2: ROWS.COM Code Still Present
**Problem**: Marketing page showed "Loading data from ROWS.COM..."
**Solution**: Changed text to generic, but tRPC endpoint still uses rows router
**TODO**: Full migration needed - replace `trpc.rows.*` with Supabase hooks

#### Problem 3: Port 3000 Busy
**Solution**: Server auto-switches to port 3001

---

### Commits Made
```
48bf0ae - docs: Update CLAUDE.md with AI Agents session log and remove ROWS.COM references
9942ca0 - (previous commits)
```

---

## TODO - Next Priorities

### 🔴 URGENT - rows.com Code Removal
The following files still contain rows.com references that need to be replaced with Supabase:

```
server/rowsApi.ts
server/lib/rowsClient.ts
server/routers/rowsRouter.ts
server/services/rowsService.ts (if exists)
```

**Action**: Replace `trpc.rows.*` calls with direct Supabase queries

### Medium Priority
1. Connect Cloud Run scrapers to Supabase
2. Build comprehensive Data Hub with all tables
3. Complete autonomous module data distribution

### Lower Priority
1. OTA integration for automatic responses
2. WhatsApp/Telegram bot for guest communication
3. Vercel deployment optimization

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
│  │  • ai_agents, ai_agent_tasks, ai_agent_plans (NEW!)      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CEO AI (Claude Code)                        │   │
│  │  Autonomous data distribution and visualization          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Finance  │  │Reserv.   │  │Marketing │  │Logistics │       │
│  │ Module   │  │ Module   │  │ Module   │  │ Module   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deprecated (DO NOT USE)

These integrations have been removed:
- ~~n8n Cloud workflows~~
- ~~Google Sheets integration~~
- ~~rows.com API~~ (code still exists, needs cleanup)

---

## Quick Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Push to GitHub
git add -A && git commit -m "message" && git push

# Run SQL in Supabase
# Open: https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/sql/new
```

---

*This document defines the soul of the project. Every feature and decision should align with this vision.*

*CEO AI (Claude Code) has authority to modify this codebase autonomously within these guidelines.*

*Last updated: 2025-01-26 by Claude Code (Opus 4.5)*
