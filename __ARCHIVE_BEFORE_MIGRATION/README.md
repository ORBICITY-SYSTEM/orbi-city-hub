# Legacy Backend Archive

**Archived Date:** December 22, 2025

**Purpose:** This folder contains the Node.js/MySQL backend logic that was active until December 2025. Preserved for reference during the PowerStack migration.

## Contents

| Folder/File | Description |
|-------------|-------------|
| `server/` | Express.js backend with tRPC API, all routers, services, and business logic |
| `drizzle/` | Database schema definitions and migrations |
| `drizzle.config.ts` | Drizzle ORM configuration |
| `update_ota_stats.sql` | SQL scripts for OTA statistics |

## Key Business Logic Preserved

### Server Components
- **Butler AI** - AI agent system with task queue and approval workflow
- **Reviews System** - Multi-platform review aggregation (Google, Booking, Airbnb, TripAdvisor)
- **OTA Integration** - Booking channel management and analytics
- **Logistics** - Housekeeping and maintenance management
- **Gmail Integration** - Email parsing and booking extraction
- **Telegram Bot** - Notification system

### Database Schema
- Users and authentication
- Reviews and AI responses
- OTA bookings and channels
- Activity logs and notifications
- Butler tasks and approvals

## Migration Notes

The new **Google PowerStack** architecture replaces:
- MySQL database → Google Sheets
- Node.js API → Google Apps Script
- tRPC → Direct Sheets API / CSV fetch

The React frontend remains active and is being rewired to use `GoogleSheetsService.ts`.

## Backup Branch

Full backup available at: `backup/legacy-backend-v1`

```bash
git checkout backup/legacy-backend-v1
```
