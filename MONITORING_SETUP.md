# ORBI City Hub - Monitoring & Alerts Setup

## Health Check Endpoints

The application exposes public health check endpoints for monitoring:

### 1. Full Health Check
```
GET https://team.orbicitybatumi.com/api/trpc/health.check
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T12:00:00.000Z",
  "uptime": 86400,
  "checks": {
    "database": {
      "status": "ok",
      "latency": 45
    },
    "memory": {
      "status": "ok",
      "used": 128,
      "total": 512,
      "percentage": 25
    },
    "disk": {
      "status": "ok",
      "used": 0,
      "total": 0,
      "percentage": 0
    }
  },
  "version": "1.0.0"
}
```

### 2. Simple Ping
```
GET https://team.orbicitybatumi.com/api/trpc/health.ping
```

**Response:**
```json
{
  "pong": true,
  "timestamp": "2025-11-24T12:00:00.000Z"
}
```

---

## Uptime Monitoring Services

### Option 1: UptimeRobot (Recommended - Free)

1. **Sign up:** https://uptimerobot.com
2. **Add New Monitor:**
   - Monitor Type: HTTP(s)
   - Friendly Name: ORBI City Hub
   - URL: `https://team.orbicitybatumi.com/api/trpc/health.ping`
   - Monitoring Interval: 5 minutes
   - Alert Contacts: Your email

3. **Advanced Settings:**
   - Keyword Monitoring: `"pong":true`
   - This ensures the endpoint not only responds but returns valid data

### Option 2: Pingdom

1. **Sign up:** https://www.pingdom.com
2. **Add Check:**
   - Check Type: Uptime
   - Name: ORBI City Hub
   - URL: `https://team.orbicitybatumi.com/api/trpc/health.check`
   - Check Interval: 1 minute

3. **Response Validation:**
   - Should contain: `"status":"healthy"`

### Option 3: Better Uptime

1. **Sign up:** https://betteruptime.com
2. **Create Monitor:**
   - URL: `https://team.orbicitybatumi.com/api/trpc/health.check`
   - Expected Status Code: 200
   - Response Time Threshold: 2000ms

---

## Alert Configuration

### Email Alerts

All monitoring services support email alerts. Configure:

- **Recipients:** info@orbicitybatumi.com
- **Alert When:**
  - Site is down (2 consecutive failures)
  - Response time > 5 seconds
  - Status code != 200
  - Response doesn't contain expected keyword

### SMS Alerts (Optional)

For critical alerts, configure SMS:

- **UptimeRobot:** Supports SMS via integrations
- **Pingdom:** Native SMS support (paid)
- **Better Uptime:** SMS via Twilio integration

---

## Database Backup Monitoring

Backups run daily at 3:00 AM and send notifications via Manus notification system.

**Manual Backup:**
```typescript
// From admin panel or API
await trpc.backup.createBackup.mutate();
```

**Backup Notifications:**
- ✅ Success: Email with backup filename and size
- ❌ Failure: Email with error details

---

## Performance Monitoring

### Response Time Tracking

Monitor these key endpoints:

1. **Health Check:** `< 500ms`
2. **API Calls:** `< 2000ms`
3. **Database Queries:** `< 1000ms`

### Memory Usage Alerts

- **Warning:** > 75% memory usage
- **Critical:** > 90% memory usage

Health check endpoint automatically reports memory status.

---

## Incident Response

### When Downtime Alert Received:

1. **Check Health Endpoint:**
   ```bash
   curl https://team.orbicitybatumi.com/api/trpc/health.check
   ```

2. **Check Database:**
   - Login to Manus Dashboard
   - Navigate to Database panel
   - Verify connection

3. **Check Logs:**
   - Manus Dashboard → Code → Server Logs
   - Look for errors or exceptions

4. **Restart Server:**
   - If needed, restart via Manus Dashboard
   - Or redeploy from GitHub

### When Performance Degradation:

1. **Check Memory:**
   - Health endpoint shows memory usage
   - If > 90%, restart server

2. **Check Database Latency:**
   - Health endpoint shows DB latency
   - If > 1000ms, check database load

3. **Review Recent Changes:**
   - Check latest git commits
   - Rollback if necessary

---

## Maintenance Windows

Schedule maintenance during low-traffic hours:

- **Preferred Time:** 2:00 AM - 4:00 AM (GMT+4)
- **Notify Users:** 24 hours in advance
- **Disable Alerts:** During maintenance window

---

## Runbook

### Daily Checklist

- [ ] Check uptime monitoring dashboard
- [ ] Verify backup completed successfully
- [ ] Review error logs
- [ ] Check memory/CPU usage

### Weekly Checklist

- [ ] Review performance metrics
- [ ] Clean up old backups (> 30 days)
- [ ] Update dependencies if needed
- [ ] Test disaster recovery procedure

### Monthly Checklist

- [ ] Full system health audit
- [ ] Review and update monitoring thresholds
- [ ] Test backup restoration
- [ ] Security patches and updates

---

## Emergency Contacts

- **System Admin:** info@orbicitybatumi.com
- **Manus Support:** https://help.manus.im
- **Database Issues:** Check Manus Dashboard → Database panel

---

## Metrics Dashboard

Key metrics to track:

1. **Uptime:** Target 99.9%
2. **Response Time:** Target < 2s
3. **Error Rate:** Target < 0.1%
4. **Database Latency:** Target < 500ms
5. **Memory Usage:** Target < 75%

Use Manus built-in analytics or integrate with:
- Google Analytics
- Mixpanel
- Amplitude
