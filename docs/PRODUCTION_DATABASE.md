# Production Database Configuration

## Overview

This guide covers setting up a production-ready MySQL/TiDB database with connection pooling, replication, and monitoring.

## Current Setup

- **Development**: Shared Manus database (automatically provisioned)
- **Production**: Needs dedicated database instance

## Production Database Options

### Option 1: Manus Managed Database (Recommended)

Manus provides managed MySQL databases for production:

1. **Automatic provisioning** - Database created when you publish
2. **Automatic backups** - Daily backups with 30-day retention
3. **High availability** - 99.9% uptime SLA
4. **Automatic scaling** - Scales with your traffic
5. **No configuration needed** - DATABASE_URL automatically set

**Status**: ✅ Active (current setup)

### Option 2: External MySQL Provider

If you need more control, use external providers:

#### PlanetScale (Recommended for scale)
```bash
# 1. Create database at https://planetscale.com
# 2. Get connection string
# 3. Update environment variable
DATABASE_URL="mysql://user:pass@host.psdb.cloud/dbname?ssl=true"
```

#### AWS RDS MySQL
```bash
# 1. Create RDS instance
# 2. Configure security groups
# 3. Enable automated backups
# 4. Update connection string
DATABASE_URL="mysql://user:pass@instance.region.rds.amazonaws.com:3306/dbname"
```

#### TiDB Cloud
```bash
# 1. Create cluster at https://tidbcloud.com
# 2. Get connection string
# 3. Update environment variable
DATABASE_URL="mysql://user:pass@gateway.tidbcloud.com:4000/dbname?ssl=true"
```

## Connection Pooling

Current implementation uses Drizzle ORM with built-in connection pooling:

```typescript
// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL);
```

### Advanced Connection Pool Configuration

For high-traffic production:

```typescript
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,        // Max connections
  queueLimit: 0,              // Unlimited queue
  waitForConnections: true,   // Wait if all connections busy
  enableKeepAlive: true,      // Keep connections alive
  keepAliveInitialDelay: 0,
});

const db = drizzle(pool);
```

## Database Replication (Optional)

For high availability:

### Master-Slave Replication

```typescript
// Read from slaves, write to master
const masterDb = drizzle(process.env.DATABASE_MASTER_URL);
const slaveDb = drizzle(process.env.DATABASE_SLAVE_URL);

// Write operations
await masterDb.insert(users).values({ ... });

// Read operations
const users = await slaveDb.select().from(users);
```

## Database Migrations

### Production Migration Strategy

1. **Test migrations locally**
   ```bash
   pnpm db:push
   ```

2. **Create migration files**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Review migration SQL**
   ```bash
   cat drizzle/migrations/*.sql
   ```

4. **Apply to production**
   ```bash
   # Automatic on deployment
   pnpm db:push
   ```

### Zero-Downtime Migrations

For schema changes without downtime:

1. **Add new column** (nullable)
2. **Deploy code** that writes to both old and new
3. **Backfill data** from old to new column
4. **Deploy code** that reads from new column
5. **Remove old column**

## Monitoring

### Database Health Checks

Already implemented in `server/routers/healthCheck.ts`:

```typescript
healthCheck.check.useQuery() // Returns database status
```

### Query Performance Monitoring

Enable slow query log:

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- Log queries > 1 second
```

### Connection Pool Monitoring

```typescript
// Get pool stats
const pool = getDb().pool;
console.log({
  total: pool.config.connectionLimit,
  active: pool._allConnections.length,
  idle: pool._freeConnections.length,
});
```

## Backup Strategy

### Automated Backups (Implemented)

Already configured in `server/backupScheduler.ts`:
- ✅ Daily backups at 3 AM
- ✅ 30-day retention
- ✅ S3 storage
- ✅ Owner notifications

### Manual Backup

```bash
# Trigger manual backup
curl -X POST https://your-domain.com/api/trpc/backup.createBackup \
  -H "Cookie: session=your-session-cookie"
```

### Restore from Backup

```bash
# 1. Download backup from S3
aws s3 cp s3://bucket/backups/database/backup.sql.gz .

# 2. Decompress
gunzip backup.sql.gz

# 3. Restore
mysql -h host -u user -p database < backup.sql
```

## Security

### SSL/TLS Connections

Always use SSL in production:

```
DATABASE_URL="mysql://user:pass@host/db?ssl=true"
```

### Credentials Management

- ✅ Use environment variables (never commit credentials)
- ✅ Rotate credentials regularly (every 90 days)
- ✅ Use IAM authentication when possible (AWS RDS)
- ✅ Limit database user permissions (principle of least privilege)

### Network Security

- ✅ Whitelist application IP addresses only
- ✅ Use VPC/private network when possible
- ✅ Enable firewall rules
- ✅ Disable public access if not needed

## Performance Optimization

### Indexing Strategy

Current indexes:
```sql
-- Users table
CREATE INDEX idx_users_openId ON users(openId);
CREATE INDEX idx_users_email ON users(email);

-- Add more as needed based on query patterns
```

### Query Optimization

Use EXPLAIN to analyze slow queries:

```sql
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

### Connection Pooling Best Practices

1. **Set appropriate pool size**
   - Formula: `connections = ((core_count * 2) + effective_spindle_count)`
   - Example: 4 cores + 1 disk = 10 connections

2. **Monitor connection usage**
   - Alert if > 80% connections used
   - Scale up if consistently high

3. **Use connection timeouts**
   - Prevent connection leaks
   - Set reasonable timeout values

## Disaster Recovery

### Recovery Time Objective (RTO)

Target: < 1 hour

1. **Detect failure** (5 minutes)
2. **Spin up new instance** (15 minutes)
3. **Restore from backup** (30 minutes)
4. **Verify and switch** (10 minutes)

### Recovery Point Objective (RPO)

Target: < 24 hours (daily backups)

For critical data, consider:
- Hourly backups
- Point-in-time recovery
- Database replication

## Checklist

### Pre-Production
- [ ] Choose database provider
- [ ] Configure connection pooling
- [ ] Set up SSL/TLS
- [ ] Test migrations
- [ ] Configure monitoring
- [ ] Set up alerts

### Production
- [x] Automated backups configured
- [x] Health checks implemented
- [ ] Slow query log enabled
- [ ] Connection pool monitoring
- [ ] Disaster recovery plan documented
- [ ] Security audit completed

### Post-Production
- [ ] Monitor query performance
- [ ] Optimize slow queries
- [ ] Review and adjust connection pool
- [ ] Test backup restoration
- [ ] Review security regularly

## Status

- ✅ Database: Manus managed MySQL
- ✅ Backups: Automated (daily at 3 AM)
- ✅ Health checks: Implemented
- ⚠️ Connection pooling: Basic (can be optimized)
- ⚠️ Replication: Not configured (optional)
- ⚠️ Monitoring: Basic (can be enhanced)

## Next Steps

1. Monitor database performance in production
2. Optimize queries based on real traffic
3. Consider replication if traffic grows
4. Set up advanced monitoring (Datadog, New Relic)
5. Regular security audits
