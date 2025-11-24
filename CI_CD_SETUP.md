# ORBI City Hub - CI/CD Pipeline Setup

## Overview

Automated deployment pipeline using GitHub Actions that:
1. Runs tests on every push to `main` branch
2. Builds the project
3. Notifies on success/failure
4. Performs post-deployment health checks

---

## GitHub Actions Workflow

Located at: `.github/workflows/deploy.yml`

### Workflow Stages

1. **Test**
   - Checkout code
   - Install dependencies
   - Run TypeScript check
   - Run unit tests
   - Build project

2. **Deploy**
   - Only runs if tests pass
   - Creates deployment notification
   - Manus handles actual deployment

3. **Health Check**
   - Waits 30 seconds for deployment
   - Checks `/api/trpc/health.ping`
   - Verifies database connection
   - Fails if health check doesn't pass

---

## Setup Instructions

### 1. GitHub Repository Secrets

Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

Required secrets:
```
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
```

### 2. Enable GitHub Actions

1. Go to your repository
2. Click **Actions** tab
3. Enable workflows if not already enabled

### 3. Configure Branch Protection

**Settings → Branches → Add rule**

Branch name pattern: `main`

Enable:
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Status checks that are required:
  - `test`
  - `deploy`
  - `health-check`

---

## Deployment Process

### Automatic Deployment

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

2. **GitHub Actions automatically:**
   - Runs all tests
   - Builds the project
   - Creates deployment notification

3. **Manual step (Manus Dashboard):**
   - Go to Manus Dashboard
   - Click **Publish** button
   - Deployment goes live

### Manual Deployment

1. **Go to GitHub Actions:**
   - Repository → Actions tab
   - Select "Deploy to Production" workflow
   - Click "Run workflow"
   - Select branch: `main`
   - Click "Run workflow"

2. **Monitor progress:**
   - Watch each job complete
   - Check logs if any failures

3. **Publish via Manus:**
   - After tests pass
   - Go to Manus Dashboard
   - Click **Publish**

---

## Rollback Procedure

### If Deployment Fails:

1. **Check GitHub Actions logs:**
   ```
   Repository → Actions → Failed workflow → View logs
   ```

2. **Identify the issue:**
   - Test failures?
   - Build errors?
   - Health check failures?

3. **Rollback in Manus:**
   - Go to Manus Dashboard
   - Find previous checkpoint
   - Click **Rollback** button

4. **Fix the issue:**
   ```bash
   # Fix code locally
   git add .
   git commit -m "fix: resolve deployment issue"
   git push origin main
   ```

### Emergency Rollback:

If production is broken:

1. **Immediate rollback:**
   - Manus Dashboard → Previous checkpoint → Rollback

2. **Investigate offline:**
   - Check logs
   - Review recent commits
   - Test locally

3. **Deploy fix:**
   - Once fixed, push to main
   - Monitor deployment carefully

---

## Testing Locally Before Push

Always test locally before pushing:

```bash
# Run TypeScript check
pnpm exec tsc --noEmit

# Run tests
pnpm test

# Build project
pnpm build

# Start dev server
pnpm dev
```

If all pass locally, safe to push!

---

## Monitoring Deployments

### GitHub Actions Dashboard

- **Repository → Actions**
- View all workflow runs
- Check success/failure status
- Download logs

### Deployment Notifications

Configure GitHub to send notifications:

**Settings → Notifications**
- [x] Email notifications for workflow runs
- [x] Actions: Notify on failure

### Slack Integration (Optional)

Add Slack webhook to workflow:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Best Practices

### 1. Small, Frequent Commits

```bash
# Good
git commit -m "feat: add user profile page"
git commit -m "fix: resolve login redirect issue"

# Bad
git commit -m "massive update with 50 changes"
```

### 2. Descriptive Commit Messages

Follow conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` add tests
- `refactor:` code refactoring
- `chore:` maintenance

### 3. Test Before Push

```bash
# Always run before pushing
pnpm test && pnpm build
```

### 4. Review Changes

```bash
# Check what you're committing
git diff
git status
```

### 5. Use Feature Branches

```bash
# Create feature branch
git checkout -b feature/new-dashboard

# Work on feature
git add .
git commit -m "feat: new dashboard layout"

# Push feature branch
git push origin feature/new-dashboard

# Create Pull Request on GitHub
# Merge after review and tests pass
```

---

## Troubleshooting

### Tests Fail in CI but Pass Locally

**Cause:** Environment differences

**Solution:**
```bash
# Check Node version matches
node --version  # Should be 22.x

# Check pnpm version
pnpm --version

# Clear cache and reinstall
rm -rf node_modules
pnpm install
```

### Build Fails in CI

**Cause:** Missing dependencies or TypeScript errors

**Solution:**
```bash
# Run build locally
pnpm build

# Fix any TypeScript errors
pnpm exec tsc --noEmit
```

### Health Check Fails

**Cause:** Deployment not complete or server issue

**Solution:**
1. Wait longer (increase sleep time in workflow)
2. Check Manus Dashboard for deployment status
3. Manually verify health endpoint:
   ```bash
   curl https://team.orbicitybatumi.com/api/trpc/health.ping
   ```

---

## Metrics

Track these deployment metrics:

- **Deployment Frequency:** Target 2-5 per week
- **Lead Time:** Target < 1 hour (commit to production)
- **Mean Time to Recovery:** Target < 30 minutes
- **Change Failure Rate:** Target < 15%

View in GitHub:
- Repository → Insights → Deployments

---

## Security

### Secrets Management

- Never commit secrets to git
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly (every 90 days)

### Code Review

- Require at least 1 reviewer for main branch
- Use pull requests for all changes
- Enable branch protection rules

### Dependency Security

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

---

## Support

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Manus Deployment:** https://help.manus.im
- **Issues:** Create GitHub issue for bugs
