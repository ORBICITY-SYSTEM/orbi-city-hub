# ORBI City Hub - Deployment & Rollback Guide

## 🚀 Current Deployment Status

**Production URL:** https://team.orbicitybatumi.com  
**Platform:** Manus Cloud (Managed Hosting)  
**Auto-Deploy:** Enabled via Management UI "Publish" button

---

## 📦 Deployment Methods

### Method 1: Manus Cloud (Current - Recommended)

**Advantages:**
- ✅ Zero configuration required
- ✅ Automatic SSL certificates
- ✅ Built-in CDN
- ✅ One-click rollback
- ✅ Automatic backups
- ✅ No server management

**How to Deploy:**
1. Save checkpoint: `webdev_save_checkpoint`
2. Click "Publish" button in Management UI
3. Confirm deployment
4. Site goes live in ~2 minutes

**How to Rollback:**
1. Open Management UI → Dashboard
2. Find previous checkpoint
3. Click "Rollback" button
4. Confirm rollback
5. Previous version restored in ~1 minute

---

### Method 2: Google Cloud Run (Alternative)

**Advantages:**
- ✅ Full control over infrastructure
- ✅ Scalable to millions of users
- ✅ Pay-per-use pricing
- ✅ Custom domains
- ✅ Advanced monitoring

**Disadvantages:**
- ❌ Requires Google Cloud account
- ❌ Manual configuration needed
- ❌ More complex rollback process
- ❌ You manage SSL certificates
- ❌ You manage database backups

**Setup Steps:**

1. **Install Google Cloud CLI:**
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

2. **Create Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

3. **Deploy to Cloud Run:**
```bash
# Build and deploy
gcloud run deploy orbi-city-hub \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET
```

4. **Configure Custom Domain:**
```bash
gcloud run domain-mappings create \
  --service orbi-city-hub \
  --domain team.orbicitybatumi.com \
  --region europe-west1
```

5. **Rollback on Cloud Run:**
```bash
# List revisions
gcloud run revisions list --service orbi-city-hub

# Rollback to specific revision
gcloud run services update-traffic orbi-city-hub \
  --to-revisions REVISION_NAME=100
```

---

## 🔄 Version Control & Safety

### Checkpoint System (Built-in)

Every checkpoint creates a complete snapshot:
- ✅ All code files
- ✅ Database schema
- ✅ Environment variables
- ✅ Dependencies

**List all checkpoints:**
```bash
# Via Management UI → Dashboard → Checkpoints tab
# Or via CLI:
gh api repos/ORBICITY-SYSTEM/orbi-city-hub/commits
```

**Restore from checkpoint:**
- Management UI: Click "Rollback" on any checkpoint
- Or use `webdev_rollback_checkpoint` with version ID

### Git Backup (GitHub)

**Repository:** https://github.com/ORBICITY-SYSTEM/orbi-city-hub

All code is automatically backed up to GitHub:
```bash
# Clone repository
gh repo clone ORBICITY-SYSTEM/orbi-city-hub

# View commit history
cd orbi-city-hub
git log --oneline

# Restore specific commit
git checkout COMMIT_HASH
```

---

## 🛡️ Safety Guarantees

### What's Protected:

1. **Code:** Every checkpoint saved
2. **Database Schema:** Tracked in `drizzle/schema.ts`
3. **Environment Variables:** Stored securely in Management UI
4. **Dependencies:** Locked in `pnpm-lock.yaml`

### What's NOT Protected:

1. **Database Data:** User-generated content (bookings, guests, etc.)
   - **Solution:** Enable automatic database backups in Management UI → Settings → Database
   
2. **Uploaded Files:** Images, documents in S3
   - **Solution:** S3 has versioning enabled by default

---

## 📊 Monitoring & Health Checks

### Current Monitoring:

1. **UptimeRobot:** https://uptimerobot.com
   - Checks every 5 minutes
   - Email alerts on downtime

2. **GitHub Actions:** Workflow runs every 6 hours
   - Health check: `/api/trpc/health.ping`
   - Alerts on failure

3. **Manus Analytics:** Built-in
   - UV/PV tracking
   - Error logging
   - Performance metrics

### Access Logs:

- **Management UI → Dashboard → Logs**
- **GitHub Actions → Actions tab**
- **Browser Console:** F12 → Console (for frontend errors)

---

## 🆘 Emergency Procedures

### Site is Down:

1. Check Management UI → Dashboard → Status
2. If "Offline", click "Restart" button
3. If still down, rollback to last working checkpoint
4. If still down, contact Manus support: https://help.manus.im

### Database Issues:

1. Management UI → Settings → Database → "Restore Backup"
2. Select most recent backup
3. Confirm restore

### Lost Code Changes:

1. Management UI → Dashboard → Checkpoints
2. Find checkpoint before changes
3. Click "View" to see code
4. Copy needed files
5. Apply to current version

---

## 💡 Best Practices

### Before Making Changes:

1. **Always save checkpoint first:**
   ```bash
   webdev_save_checkpoint --description "Before adding feature X"
   ```

2. **Test locally first:**
   - Make changes
   - Test on dev server (https://3000-xxx.manusvm.computer)
   - Verify all modules work
   - Save checkpoint
   - Then publish

3. **Incremental deployments:**
   - Deploy small changes frequently
   - Don't accumulate many changes before deploying
   - Easier to identify issues

### After Deployment:

1. **Verify immediately:**
   - Visit https://team.orbicitybatumi.com
   - Test all navigation links
   - Check browser console for errors

2. **Monitor for 24 hours:**
   - Check UptimeRobot alerts
   - Review error logs
   - Watch user feedback

3. **Keep previous checkpoint:**
   - Don't delete old checkpoints immediately
   - Keep at least 3-5 recent checkpoints

---

## 🎯 Recommendation

**For ORBI City Hub, stick with Manus Cloud deployment:**

1. **Simplicity:** One-click publish, one-click rollback
2. **Safety:** Automatic checkpoints, no data loss risk
3. **Cost:** Included in Manus subscription
4. **Speed:** 2-minute deployments
5. **Support:** Manus team handles infrastructure

**Only consider Google Cloud Run if:**
- You need 100,000+ concurrent users
- You need specific compliance requirements
- You want to integrate with other Google Cloud services

---

## 📞 Support

- **Manus Support:** https://help.manus.im
- **GitHub Issues:** https://github.com/ORBICITY-SYSTEM/orbi-city-hub/issues
- **Emergency Contact:** info@orbicitybatumi.com

---

**Last Updated:** 2025-11-24  
**Version:** Phase 18 - Bug Fixes & Production Deployment
