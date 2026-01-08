# 🏨 ORBI Ultimate V2 - Hotel Management System

Professional hotel management platform with AI-powered operations, real-time data sync, and comprehensive business intelligence.

## 🌟 Overview

ORBI Ultimate V2 is the next-generation hotel management system built with modern technologies and AI-first architecture.

**Key Features:**
- ✅ **AI Directors** - Centralized AI management for Marketing, Reservations, Finance, and Logistics
- ✅ **Real-time Data Sync** - OTELMS Channel Manager → Rows.com integration
- ✅ **Knowledge Base** - Obsidian integration for staff documentation
- ✅ **Type-safe API** - tRPC for end-to-end type safety
- ✅ **Modern Stack** - React 19, Vite, Express, Drizzle ORM

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORBI ULTIMATE V2                           │
│                  Production Platform                          │
└─────────────────────────────────────────────────────────────┘

Backend:
├── tRPC (Type-safe API)
├── Express Server
├── Drizzle ORM (MySQL/TiDB)
└── Python API Integration (OTELMS → Rows.com)

Frontend:
├── React 19 + Vite
├── shadcn/ui Components
├── AI Directors Pattern
├── Rows.com Embeds
└── Obsidian Knowledge Base
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- pnpm 10.x or higher
- MySQL/TiDB (or Docker)
- Rows.com Premium account
- Obsidian license (for knowledge base)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/orbi-ultimate-v2.git
cd orbi-ultimate-v2

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Update .env.local with your credentials
# See Environment Variables section below

# 5. Run database migrations
pnpm db:push

# 6. Start development server
pnpm dev

# ✅ Server runs on http://localhost:3000
```

---

## 🔧 Environment Variables

See `.env.example` for all required variables. Key variables:

### Required

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/orbi_db

# Rows.com Integration
VITE_ROWS_SPREADSHEET_ID=your_spreadsheet_id
VITE_ROWS_API_KEY=your_api_key
VITE_ROWS_CALENDAR_TABLE_ID=your_calendar_table_id
VITE_ROWS_STATUS_TABLE_ID=your_status_table_id

# Python API (OTELMS Sync)
VITE_OTELMS_API_URL=https://otelms-api.run.app
OTELMS_API_URL=https://otelms-api.run.app

# OAuth (Manus)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
```

### Optional

```env
# App Configuration
VITE_APP_TITLE=ORBI Ultimate V2
VITE_APP_ID=orbi-ultimate-v2

# Knowledge Base
VITE_KNOWLEDGE_BASE_URL=your_obsidian_url
VITE_KNOWLEDGE_STORAGE_PATH=knowledge-base

# Demo Mode (for testing)
VITE_USE_DEMO_DATA=false
```

---

## 📁 Project Structure

```
orbi-ultimate-v2/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities & tRPC client
│   │   └── ...
│   └── public/             # Static assets
├── server/                 # Backend (Express + tRPC)
│   ├── _core/              # Core server setup
│   ├── routers/            # tRPC routers
│   ├── db.ts               # Database connection
│   └── ...
├── drizzle/                # Database schema & migrations
│   ├── schema.ts           # Drizzle schema
│   └── migrations/         # Database migrations
├── shared/                 # Shared types & utilities
├── docs/                   # Documentation
├── vercel.json             # Vercel configuration
└── package.json            # Dependencies
```

---

## 🎯 Key Modules

### 📊 Main Dashboard
- Real-time KPI overview
- Module summaries
- Live activity feed

### 📢 Marketing Module
- **AI Marketing Director** - Centralized AI management
- Instagram Analytics
- Website Analytics
- OTA Channels
- Leads Management

### 📅 Reservations Module
- **AI Reservations Director** - Booking optimization
- Calendar View (Rows.com embed)
- Status Dashboard
- Guest Management
- Reviews Management

### 💰 Finance Module
- **AI Finance Director** - Revenue forecasting
- Dashboard & Analytics
- OTELMS Data (Rows.com embed)
- Reports & Expenses

### 🧹 Logistics Module
- **AI Logistics Director** - Task automation
- Housekeeping Management
- Inventory Control
- Maintenance Scheduling

### 📚 Knowledge Base
- Obsidian integration
- Staff Operations
- Housekeeping Procedures
- Maintenance Guides

---

## 🔌 Integrations

### Rows.com Integration

Real-time data sync from OTELMS Channel Manager:

1. **Python API** scrapes OTELMS (Selenium)
2. **Data pushed** to Rows.com via REST API
3. **Frontend embeds** Rows.com tables/charts
4. **Auto-sync** via Cloud Scheduler (hourly)

See `PYTHON_API_INTEGRATION_GUIDE.md` for details.

### Obsidian Integration

Knowledge base for staff documentation:

- Markdown files stored in Supabase Storage
- Rendered in React with markdown renderer
- Searchable navigation tree
- Category organization

### Python API (OTELMS Sync)

Location: `otelms-rows-api-master/otelms-rows-api-master/main.py`

Endpoints:
- `POST /scrape` - Calendar sync
- `POST /scrape/status` - Status sync
- `POST /scrape/rlist` - Reporting list sync

Deployment: Google Cloud Run

---

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start dev server (port 3000)

# Build
pnpm build                  # Build for production

# Type Checking
pnpm check                  # TypeScript type check

# Database
pnpm db:push                # Generate and run migrations

# Testing
pnpm test                   # Run tests
```

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... edit files ...

# 3. Test locally
pnpm dev
pnpm check

# 4. Commit
git add .
git commit -m "feat: Add new feature"

# 5. Push
git push origin feature/new-feature

# 6. Create PR on GitHub
# 7. After review, merge to main
# 8. Vercel auto-deploys! 🎉
```

---

## 🚀 Deployment

### Vercel Deployment

This project is configured for automatic deployment on Vercel.

**Setup:**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Push to `main` branch → Auto-deploys

**Configuration:**
- Framework: Vite
- Build Command: `pnpm run build`
- Output Directory: `dist/public`
- Install Command: `pnpm install`

See `docs/VERCEL_DEPLOYMENT_GUIDE.md` for details.

---

## 📚 Documentation

- [Architecture](./ORBI_ULTIMATE_V2_FINAL_ARCHITECTURE.md) - Complete architecture
- [Implementation Guide](./IMPLEMENTATION_GUIDE_CORRECTED.md) - Step-by-step guide
- [Python API Integration](./PYTHON_API_INTEGRATION_GUIDE.md) - OTELMS sync setup
- [Next Steps](./NEXT_STEPS.md) - What to do next
- [Start Here](./START_HERE.md) - Quick start guide

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with conventional commits
5. Push and create PR
6. Wait for review and merge

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- **Production:** [orbi-city-hub.vercel.app](https://orbi-city-hub.vercel.app)
- **GitHub:** [github.com/ORBICITY-SYSTEM/orbi-city-hub](https://github.com/ORBICITY-SYSTEM/orbi-city-hub)
- **Documentation:** See `/docs` folder

---

## 💬 Support

For issues or questions:
- Open an issue on GitHub
- Check documentation in `/docs`
- Contact: info@orbicitybatumi.com

---

**Built with ❤️ for ORBI City**
