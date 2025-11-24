# ORBI City Hub 🏢

**AI-Powered Enterprise ERP Dashboard for ORBI City Batumi**

A comprehensive aparthotel management system with integrated AI agents, real-time analytics, and multi-channel distribution management.

---

## 🌟 Overview

ORBI City Hub is a production-ready enterprise resource planning (ERP) system designed specifically for **ORBI City Batumi** - a 60-studio aparthotel in Batumi, Georgia. The system features hierarchical module architecture with dedicated AI agents for each department, providing intelligent automation and data-driven insights.

### Key Features

- **🤖 6 AI Agents** - Specialized AI assistants for CEO, Reservations, Finance, Marketing, Logistics, and Data Analytics
- **📊 Real-time Analytics** - Live KPIs, revenue tracking, occupancy monitoring, and predictive forecasting
- **🌐 Multi-Channel Management** - Integration with 15+ booking platforms (Booking.com, Airbnb, Expedia, Agoda, etc.)
- **💰 Financial Intelligence** - P&L analysis, Georgian tax compliance (VAT 18%, Income Tax), revenue optimization
- **📧 Email Integration** - Gmail IMAP sync with AI-powered booking parser
- **🏨 Housekeeping & Logistics** - Inventory management, staff scheduling, maintenance tracking
- **📈 Advanced Reporting** - RevPAR calculator, seasonality analysis, competitor benchmarking
- **🔐 Enterprise Security** - Audit logs, RBAC (4 roles), activity tracking

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4 (ORBI Green theme)
- Wouter (routing)
- Recharts (data visualization)
- shadcn/ui components

**Backend:**
- Node.js 22 + Express 4
- tRPC 11 (type-safe API)
- Drizzle ORM
- MySQL/TiDB database

**AI & Integration:**
- Manus AI (LLM integration)
- Gmail IMAP (email sync)
- S3 Storage (file management)
- Google Maps API

**DevOps:**
- GitHub Actions (CI/CD)
- UptimeRobot (monitoring)
- Custom domain with SSL

### Module Structure

```
ORBI City Hub
├── CEO Dashboard
│   ├── Overview
│   ├── Analytics
│   ├── Reports
│   ├── Team
│   ├── Settings
│   └── 🤖 Main AI Orchestrator
│
├── Reservations
│   ├── Calendar View
│   ├── All Bookings
│   ├── Guest CRM
│   ├── 📧 Mail Room
│   └── 🤖 Reservations AI
│
├── Finance
│   ├── Transactions
│   ├── P&L Dashboard
│   ├── Owner Settlements
│   ├── Invoicing
│   └── 🤖 Finance AI
│
├── Marketing
│   ├── Channel Performance
│   ├── Reputation Management
│   ├── Campaigns
│   ├── Social Media
│   └── 🤖 Marketing AI
│
├── Logistics
│   ├── Inventory
│   ├── Housekeeping
│   ├── Maintenance
│   ├── Supplies
│   ├── Staff
│   └── 🤖 Logistics AI
│
└── Reports & Analytics
    ├── Monthly Reports
    ├── Yearly Reports
    ├── Heatmap Analysis
    ├── Export Data
    └── 🤖 Data Scientist AI
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 8+
- MySQL/TiDB database
- Manus account (for AI features)

### Installation

```bash
# Clone repository
git clone https://github.com/ORBICITY-SYSTEM/orbi-city-hub.git
cd orbi-city-hub

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

Required environment variables (automatically injected in Manus platform):

```env
# Database
DATABASE_URL=mysql://...

# Authentication
JWT_SECRET=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...

# Application
VITE_APP_ID=...
VITE_APP_TITLE="ORBI City Hub"
VITE_APP_LOGO="/logo-orbi.jpg"

# AI & APIs
BUILT_IN_FORGE_API_KEY=...
BUILT_IN_FORGE_API_URL=...
VITE_FRONTEND_FORGE_API_KEY=...
```

---

## 🤖 AI Knowledge Base

Each AI agent is equipped with comprehensive domain knowledge:

### Georgian Tax System
- **VAT**: 18% on accommodation services
- **Corporate Income Tax**: 15% (Estonian model - on distribution only)
- **Personal Income Tax**: 20%
- **Tourist Tax**: 1 GEL per person per night in Batumi

### Batumi Tourism Market
- **High Season** (Jun-Sep): 85% occupancy, $120 ADR
- **Shoulder Season** (Apr-May, Oct): 60% occupancy, $80 ADR
- **Low Season** (Nov-Mar): 35% occupancy, $50 ADR

### Distribution Channels
- Booking.com: 42% share, 15% commission
- Airbnb: 30% share, 14% commission
- Expedia: 15% share, 18% commission
- Agoda: 10% share, 15% commission
- Direct: 3% share, 0% commission

### Hospitality Standards
- Checkout cleaning: 45-60 minutes per studio
- Daily service: 20-30 minutes per studio
- Quality control: Every 10th room inspection

---

## 📊 Analytics & Reporting

### Key Performance Indicators (KPIs)

**RevPAR** (Revenue Per Available Room)
```
RevPAR = Total Room Revenue / Total Available Rooms
```

**ADR** (Average Daily Rate)
```
ADR = Total Room Revenue / Number of Rooms Sold
```

**Occupancy Rate**
```
Occupancy = Rooms Sold / Total Available Rooms
```

### Advanced Analytics

- **Revenue Forecasting**: Linear regression with 30-day ahead prediction
- **Dynamic Pricing**: Occupancy-based, lead time, and seasonality adjustments
- **Booking Pace Analysis**: Year-over-year comparison
- **Competitor Benchmarking**: Price positioning analysis
- **LOS Distribution**: Length of stay patterns
- **Cancellation Analytics**: Rate and revenue impact

---

## 🔐 Security & Compliance

### Role-Based Access Control (RBAC)

- **Admin**: Full system access, user management, configuration
- **Manager**: Department management, reporting, analytics
- **Staff**: Operational tasks, booking management, housekeeping
- **Guest**: Limited read-only access

### Audit Logging

All critical operations are logged:
- User actions (create, update, delete)
- Entity changes (bookings, transactions, guests)
- IP address and user agent tracking
- Timestamp and user attribution

### Data Protection

- HTTPS/SSL encryption
- JWT-based authentication
- Session management
- Input validation and sanitization
- SQL injection prevention (Drizzle ORM)

---

## 🌐 Deployment

### Production Environment

- **URL**: https://team.orbicitybatumi.com
- **Platform**: Manus Cloud
- **SSL**: Automatic HTTPS
- **Monitoring**: UptimeRobot (5-minute intervals)
- **Backups**: Automated daily backups to S3

### CI/CD Pipeline

GitHub Actions workflow:
- Health check on every push
- Automated testing (when database is available)
- Scheduled health checks every 6 hours
- Email alerts on failures

---

## 📚 Documentation

### API Documentation

All API endpoints are type-safe through tRPC:

```typescript
// Example: Fetch AI chat response
const { data } = trpc.ai.chat.useMutation();
await data({
  module: "Finance",
  userMessage: "Analyze October P&L",
  fileUrl: "/path/to/excel.xlsx"
});
```

### Database Schema

11 main tables:
- `users` - Authentication and user management
- `guests` - Guest profiles and preferences
- `bookings` - Reservation records
- `transactions` - Financial transactions
- `campaigns` - Marketing campaigns
- `channelPerformance` - Distribution channel metrics
- `inventory` - Stock and supplies
- `housekeeping` - Housekeeping tasks
- `aiConversations` - AI chat history
- `systemConfig` - System configuration
- `auditLogs` - Activity tracking

---

## 🛠️ Development

### Project Structure

```
orbi-city-hub/
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
│
├── server/              # Backend Express + tRPC
│   ├── routers/         # tRPC routers
│   ├── _core/           # Core functionality
│   └── db.ts            # Database queries
│
├── drizzle/             # Database schema
├── shared/              # Shared types and utilities
│   ├── moduleConfig.ts  # Module configuration
│   ├── aiKnowledgeBase.ts # AI knowledge base
│   └── analyticsUtils.ts  # Analytics utilities
│
└── tests/               # Unit tests
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/ai.test.ts

# Watch mode
pnpm test --watch
```

### Code Quality

```bash
# TypeScript type checking
pnpm tsc

# Lint code
pnpm lint

# Format code
pnpm format
```

---

## 📈 Roadmap

### Phase 2: External Integrations (Requires User Input)

- [ ] Gmail Integration (IMAP sync)
- [ ] Booking.com API
- [ ] Airbnb API
- [ ] TBC/BOG Bank API
- [ ] Facebook/Instagram API
- [ ] Google Analytics

### Phase 3: Advanced Features

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Telegram bot
- [ ] Voice commands
- [ ] Predictive maintenance
- [ ] Guest sentiment analysis

---

## 🤝 Support

For questions, issues, or feature requests:

- **Email**: info@orbicitybatumi.com
- **GitHub**: https://github.com/ORBICITY-SYSTEM/orbi-city-hub
- **Website**: https://orbicitybatumi.com

---

## 📄 License

Proprietary - ORBI City Batumi

© 2025 ORBI City. All rights reserved.

---

## 🙏 Acknowledgments

- Built with [Manus AI Platform](https://manus.im)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Made with ❤️ in Batumi, Georgia 🇬🇪**
