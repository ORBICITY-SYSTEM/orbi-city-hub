# PowerHub Setup Guide

## Overview

PowerHub is the integration architecture that connects ORBI-CITY-HUB with Google Workspace services via Apps Script Gateway.

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORBI CITY HUB                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │    tRPC      │  │   MySQL      │          │
│  │   Frontend   │  │   Backend    │  │   (Drizzle)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                           │                                     │
│                    ┌──────┴──────┐                              │
│                    │   Ingest    │ ← HMAC + Nonce + Idempotency │
│                    │   Router    │                              │
│                    └──────┬──────┘                              │
│                           │                                     │
│                    ┌──────┴──────┐                              │
│                    │   Outbox    │ → Retry + Backoff            │
│                    │   Worker    │                              │
│                    └──────┬──────┘                              │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                  APPS SCRIPT GATEWAY                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  Gmail  │  │ Sheets  │  │Calendar │  │  Drive  │         │
│  │ Parser  │  │  Sync   │  │  Sync   │  │  Sync   │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
└───────────────────────────────────────────────────────────────┘
```

---

## 1. Database Setup

### Run Migrations

The PowerHub tables have been added to `drizzle/schema.ts`. Run migrations:

```bash
cd orbi-city-hub
pnpm drizzle-kit generate:mysql
pnpm drizzle-kit push:mysql
```

### New Tables

| Table | Purpose |
|-------|---------|
| `integration_events` | Outbox for reliable event delivery |
| `used_nonces` | Replay attack prevention |
| `processed_events` | Idempotency tracking |
| `bookings` | Booking data (enhanced) |
| `tasks` | Task management |
| `messages` | Communication log |
| `payments` | Payment records |
| `leads` | Marketing leads |
| `units` | Room/apartment inventory |

---

## 2. Environment Variables

Add to `.env`:

```env
# PowerHub Security
POWERHUB_SECRET=your-secure-secret-min-32-chars

# Apps Script Webhook (for Sheets sync)
APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Optional: Telegram notifications
TELEGRAM_WEBHOOK_URL=https://api.telegram.org/botYOUR_TOKEN/sendMessage
```

---

## 3. Apps Script Gateway Setup

### Step 1: Create Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Create new project: "PowerHub Gateway"
3. Copy contents of `appscript-gateway/Code.gs`
4. Copy `appscript-gateway/appsscript.json` to project settings

### Step 2: Configure Script Properties

In Apps Script Editor → Project Settings → Script Properties:

| Property | Value |
|----------|-------|
| `HUB_INGEST_URL` | `https://your-hub.vercel.app/api/trpc/ingest.ingest` |
| `HUB_SECRET` | Same as `POWERHUB_SECRET` in Hub |
| `SHEETS_ID` | Google Sheets ID for data mirror |

### Step 3: Create Gmail Label

1. In Gmail, create label: `OTELMS`
2. Set up filter to auto-label OTA emails (booking.com, airbnb.com, etc.)

### Step 4: Deploy as Web App

1. Deploy → New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Copy deployment URL

### Step 5: Set Up Triggers

Run `setupTriggers()` function once to create:
- Time-driven trigger for `processNewEmails` (every 10 minutes)

---

## 4. Testing the Integration

### Test 1: Health Check

```bash
curl https://your-hub.vercel.app/api/trpc/ingest.health
```

Expected response:
```json
{
  "result": {
    "data": {
      "status": "ok",
      "timestamp": "2024-01-03T12:00:00.000Z",
      "version": "1.0.0"
    }
  }
}
```

### Test 2: Send Test Event from Apps Script

In Apps Script, run `testSendToHub()` function.

Check Hub logs for:
```
[Ingest] Successfully processed 1 events
```

### Test 3: Gmail Processing

1. Forward a test booking email to your Gmail
2. Add `OTELMS` label
3. Run `testProcessEmails()` in Apps Script
4. Check Hub database for new booking

---

## 5. Event Types Reference

### Booking.Upserted
```typescript
{
  eventType: "Booking.Upserted",
  payload: {
    booking: {
      bookingId: "b_abc123",
      channelRef: { channel: "BOOKING", externalReservationId: "123456" },
      status: "CONFIRMED",
      checkIn: "2024-02-01",
      checkOut: "2024-02-05",
      nights: 4,
      guest: { fullName: "John Doe", email: "john@example.com" },
      occupancy: { adults: 2, children: 0 },
      pricing: { amount: 400, currency: "USD" }
    }
  }
}
```

### Task.Upserted
```typescript
{
  eventType: "Task.Upserted",
  payload: {
    task: {
      taskId: "t_xyz789",
      type: "HOUSEKEEPING",
      title: "Clean Room 101",
      priority: "HIGH",
      status: "PENDING",
      assignees: [{ staffId: "s_001", name: "Maria" }],
      links: { unitId: "u_101", bookingId: "b_abc123" }
    }
  }
}
```

### Lead.Captured
```typescript
{
  eventType: "Lead.Captured",
  payload: {
    lead: {
      leadId: "l_lead001",
      source: "WEBSITE",
      contact: { name: "Jane Smith", email: "jane@example.com", phone: "+1234567890" },
      intent: "BOOKING_QUESTION",
      message: "Is the pool heated?",
      utm: { source: "google", medium: "cpc", campaign: "summer2024" }
    }
  }
}
```

---

## 6. Monitoring & Debugging

### View Outbox Status

```typescript
// In Hub admin panel or via tRPC
const stats = await trpc.outbox.stats.query();
// { pending: 5, processing: 1, completed: 100, failed: 2, deadLetter: 0 }
```

### Retry Failed Events

```typescript
// Retry single event
await trpc.outbox.retry.mutate({ eventId: "ev_abc123" });

// Retry all dead-lettered
await trpc.outbox.retryAll.mutate();
```

### View Apps Script Logs

1. Go to Apps Script Editor
2. View → Executions
3. Check logs for errors

---

## 7. Security Checklist

- [ ] `POWERHUB_SECRET` is at least 32 characters
- [ ] Secret is different in dev/staging/production
- [ ] Apps Script deployed with "Execute as: Me"
- [ ] Gmail label filter is specific (not catching personal emails)
- [ ] Nonce TTL is set appropriately (default: 5 minutes)
- [ ] HTTPS only for all endpoints

---

## 8. Troubleshooting

### "Invalid signature" error
- Check `POWERHUB_SECRET` matches in both Hub and Apps Script
- Ensure timestamp is within 5 minutes of server time
- Verify JSON payload is not modified in transit

### "Nonce already used" error
- Normal if same request sent twice
- Check for duplicate triggers in Apps Script

### Events stuck in "PROCESSING"
- Worker may have crashed mid-process
- Events older than 30 seconds in PROCESSING will be retried

### Gmail emails not being processed
- Verify `OTELMS` label exists and is applied
- Check Apps Script trigger is active
- Run `testProcessEmails()` manually to see errors

---

## 9. Next Steps

1. **Deploy Hub to Vercel** with new environment variables
2. **Set up Apps Script** with correct URLs and secrets
3. **Test end-to-end** with a real booking email
4. **Monitor** outbox stats for first week
5. **Tune** retry intervals based on failure patterns

---

## Files Reference

| File | Purpose |
|------|---------|
| `drizzle/schema.ts` | Database schema (PowerHub tables at bottom) |
| `shared/powerhub/eventTypes.ts` | Event type definitions + Zod validators |
| `shared/powerhub/security.ts` | HMAC verification utilities |
| `server/routers/ingestRouter.ts` | Main ingest endpoint |
| `server/routers/outboxRouter.ts` | Outbox management endpoints |
| `server/workers/outboxWorker.ts` | Background event delivery |
| `appscript-gateway/Code.gs` | Apps Script gateway code |
| `docs/UI_SALVAGE_PLAN.md` | UI porting plan from PowerStack |
