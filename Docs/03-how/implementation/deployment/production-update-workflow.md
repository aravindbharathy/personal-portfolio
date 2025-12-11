---
type: process
last_updated: 2025-12-10
---

# Production Update Workflow

## Overview

This document defines the systematic process for updating the production portfolio website on Google Cloud Platform. Following this workflow ensures safe, predictable deployments with minimal downtime.

## Workflow Stages

```
┌──────────────────────────────────────────────┐
│     Production Update Workflow (GCP)        │
└──────────────────────────────────────────────┘

1. Development
   ├─ Make changes locally
   ├─ Test thoroughly
   └─ Commit to feature branch

2. Pre-Deployment
   ├─ Backup production database
   ├─ Review changes
   ├─ Test migrations locally
   └─ Update documentation

3. Deployment
   ├─ Deploy backend (if needed)
   ├─ Run database migrations
   ├─ Deploy frontend (if needed)
   └─ Verify services

4. Post-Deployment
   ├─ Monitor logs
   ├─ Test critical paths
   ├─ Update changelog
   └─ Merge to main

5. Rollback (if needed)
   ├─ Revert to previous revision
   ├─ Restore database
   └─ Investigate issues
```

## Detailed Workflow

### Stage 1: Development

**1.1 Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

**1.2 Make Changes**
- Edit code as needed
- Add tests for new functionality
- Update documentation

**1.3 Test Locally**
```bash
# Backend
cd backend
npm run type-check
npm run build
npm test (if tests exist)

# Frontend
cd frontend
npm run type-check
npm run build
npm run preview
```

**1.4 Test with Local Database**
```bash
# If schema changes
cd backend
npx prisma migrate dev --name your_migration_name

# Verify changes
npx prisma studio
```

**1.5 Commit Changes**
```bash
git add .
git commit -m "feat: description of changes"
```

### Stage 2: Pre-Deployment

**2.1 Backup Production Database**
```bash
# CRITICAL: Production is the source of truth. This backup contains your live data.
# If migrations fail or data is corrupted, you will restore from this backup.

# Run backup script
./Docs/scripts/backup-production-db.sh

# Verify backup file exists and has content
ls -lh /tmp/backups/portfolio_backup_*.sql

# CRITICAL: Verify production data state BEFORE migration
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "SELECT
    (SELECT COUNT(*) FROM \"Project\") as projects,
    (SELECT COUNT(*) FROM \"Publication\") as publications,
    (SELECT COUNT(*) FROM \"User\") as users;"

# Document these counts - they should match after migration
# Save the timestamp of this backup for potential restoration
```

**2.2 Review Deployment Impact**

Determine what needs to be deployed:
- [ ] **Backend only**: API changes, bug fixes
- [ ] **Frontend only**: UI changes, styling
- [ ] **Both**: Feature changes affecting both layers
- [ ] **Database migrations**: Schema changes

**2.3 Test Database Migrations (if applicable)**
```bash
# Connect to local test database
cd backend

# Test migration
npx prisma migrate dev --name test_migration

# Verify schema
npx prisma migrate status

# Test rollback capability
npx prisma migrate reset
npx prisma migrate dev
```

**2.4 Update Documentation**
- Update implementation docs for new features
- Add bug fix documentation if applicable
- Update API documentation if endpoints changed
- Update user guides if UX changed

**2.5 Final Local Verification**
```bash
# Start both services
cd backend && npm run dev &
cd frontend && npm run dev &

# Test complete user flows
# - Login/logout
# - Create/edit/delete content
# - View projects and publications
# - Admin dashboard
```

### Stage 3: Deployment

**3.1 Deploy Backend** (if backend changed)

```bash
cd /Users/aravind/Projects/portfolio

# Option A: Using deploy script
./Docs/scripts/deploy-backend.sh

# Option B: Manual deployment
cd backend
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/backend:latest

gcloud run deploy portfolio-backend \
  --image us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/backend:latest \
  --region us-central1
```

**Monitor Build**:
```bash
# Watch build progress
gcloud builds list --ongoing

# View build logs
gcloud builds log [BUILD_ID]
```

**3.2 Verify Database Migrations** (if schema changed)

Migrations are designed to run automatically on backend startup via:
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy || true && node server.js"]
```

**IMPORTANT**: The `|| true` in the CMD allows the container to start even if migrations fail. You MUST verify migrations succeeded after deployment.

**Verification Steps**:
```bash
# Step 1: Wait for container startup (10 seconds)
sleep 10

# Step 2: Test API endpoint to detect migration failures
curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects

# Step 3: Check for error messages
# If you see "does not exist in the current database", migrations FAILED

# Step 4: Check logs for migration output
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-backend AND textPayload=~\"Migration\"" \
  --limit 20 \
  --format json
```

**If Migrations Failed**:
```bash
# Option 1: Use helper script (recommended)
./Docs/scripts/run-prod-migrations.sh

# Option 2: Manual migration
# Start Cloud SQL proxy
cloud-sql-proxy personal-website-480707:us-central1:portfolio-db --port=5433 &

# Run migrations
cd backend
DATABASE_URL="postgresql://postgres:@Atr2xLtdda9EfdsXdky@localhost:5433/portfolio" \
  npx prisma migrate deploy

# Verify status
npx prisma migrate status

# Test API again
curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects
```

**Note**: The `deploy-backend.sh` script now automatically detects migration failures and provides actionable error messages.

**3.3 Verify Backend Deployment**

```bash
# Test health endpoint
curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects

# Check revision status
gcloud run revisions list \
  --service=portfolio-backend \
  --region=us-central1 \
  --limit=5
```

**3.4 Deploy Frontend** (if frontend changed)

```bash
cd /Users/aravind/Projects/portfolio

# Option A: Using deploy script
./Docs/scripts/deploy-frontend.sh

# Option B: Manual deployment
cd frontend
gcloud builds submit \
  --config cloudbuild.yaml \
  --region us-central1

gcloud run deploy portfolio-frontend \
  --image us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/frontend:latest \
  --region us-central1
```

**3.5 Verify Frontend Deployment**

```bash
# Test homepage
curl -I https://portfolio-frontend-1017578449720.us-central1.run.app

# Check revision status
gcloud run revisions list \
  --service=portfolio-frontend \
  --region=us-central1 \
  --limit=5
```

### Stage 4: Post-Deployment

**4.1 Monitor Application Logs**

```bash
# Backend logs (real-time)
gcloud logging tail \
  "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-backend"

# Check for errors
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-backend AND severity>=ERROR" \
  --limit 20
```

**4.2 Verify Data Integrity**

```bash
# CRITICAL: Verify production data exists after migration
# Data counts should MATCH the pre-deployment counts from Step 2.1

PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "SELECT
    (SELECT COUNT(*) FROM \"Project\") as projects,
    (SELECT COUNT(*) FROM \"Publication\") as publications,
    (SELECT COUNT(*) FROM \"User\") as users;"

# Compare with counts from Step 2.1
# If counts don't match or data is missing → RESTORE FROM BACKUP immediately
# See Step 5.4 for database restoration procedure
```

**4.3 Test Critical User Flows**

Test these paths in production:
- [ ] Homepage loads
- [ ] Projects page displays all projects (verify count matches database)
- [ ] Individual project pages load
- [ ] Publications page works (verify count matches database)
- [ ] Guidebooks display correctly
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] Admin dashboard shows correct project/publication counts
- [ ] Create/edit operations work
- [ ] Images load correctly
- [ ] Navigation works

**4.4 Monitor Performance**

```bash
# Check response times
time curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects

# Monitor Cloud Run metrics
gcloud run services describe portfolio-backend \
  --region us-central1 \
  --format="value(status.traffic)"
```

**4.5 Update Changelog**

Create entry in `/Docs/05-project-mgmt/CHANGELOG.md`:
```markdown
## [1.2.0] - 2025-12-10

### Added
- New feature description

### Changed
- Updated feature description

### Fixed
- Bug fix description

### Deployment
- Backend: portfolio-backend-00018-xyz
- Frontend: portfolio-frontend-00003-abc
- Database: No schema changes
```

**4.6 Merge to Main**

```bash
git checkout main
git merge feature/your-feature-name
git push origin main
```

### Stage 5: Rollback (if needed)

**5.1 Identify Issue**
- Check error logs
- Identify which service is failing
- Determine if database migration is involved

**5.2 Rollback Backend**

```bash
# List recent revisions
gcloud run revisions list \
  --service=portfolio-backend \
  --region=us-central1

# Route all traffic to previous revision
gcloud run services update-traffic portfolio-backend \
  --to-revisions=[PREVIOUS_REVISION]=100 \
  --region=us-central1
```

**5.3 Rollback Frontend**

```bash
# List recent revisions
gcloud run revisions list \
  --service=portfolio-frontend \
  --region=us-central1

# Route all traffic to previous revision
gcloud run services update-traffic portfolio-frontend \
  --to-revisions=[PREVIOUS_REVISION]=100 \
  --region=us-central1
```

**5.4 Rollback Database** (if migrations corrupted data)

**WARNING**: This will restore the entire database to the backup state, losing any changes made after backup.

```bash
# Ensure Cloud SQL Proxy is running
# Check: lsof -i :5433
# If not running: cloud-sql-proxy personal-website-480707:us-central1:portfolio-db --port=5433 &

# Find your backup file
ls -lht /tmp/backups/portfolio_backup_*.sql | head -1

# Restore from backup (replace [timestamp] with actual backup timestamp)
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost \
  -p 5433 \
  -U postgres \
  -d portfolio \
  -f /tmp/backups/portfolio_backup_[timestamp].sql

# Verify data restoration
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "SELECT
    (SELECT COUNT(*) FROM \"Project\") as projects,
    (SELECT COUNT(*) FROM \"Publication\") as publications;"

# Counts should match pre-deployment counts from Step 2.1
```

**5.5 Investigate and Fix**
- Review deployment logs
- Identify root cause
- Fix issues locally
- Test thoroughly
- Re-deploy following full workflow

## Deployment Scenarios

### Scenario 1: Minor Bug Fix (Backend Only)

**Steps**:
1. Fix bug locally
2. Test fix
3. Backup database
4. Deploy backend
5. Verify fix in production
6. Monitor for 10 minutes
7. Merge to main

**Time**: ~15 minutes
**Risk**: Low

### Scenario 2: UI Update (Frontend Only)

**Steps**:
1. Make UI changes
2. Test locally
3. Deploy frontend
4. Verify changes
5. Merge to main

**Time**: ~10 minutes
**Risk**: Very Low

### Scenario 3: New Feature (Both Services)

**Steps**:
1. Implement feature in both services
2. Test integration locally
3. Backup database
4. Deploy backend first
5. Verify backend works
6. Deploy frontend
7. Test complete feature
8. Monitor for 30 minutes
9. Update documentation
10. Merge to main

**Time**: ~30 minutes
**Risk**: Medium

### Scenario 4: Database Schema Change

**Steps**:
1. Create migration locally
2. Test migration and rollback locally
3. **CRITICAL**: Document production data counts (Step 2.1)
4. Backup production database (includes schema + data)
5. Test migration on backup copy locally
6. Deploy backend (migrations run automatically)
7. **CRITICAL**: Verify migrations succeeded via API test
8. If migrations failed, run `./Docs/scripts/run-prod-migrations.sh`
9. **CRITICAL**: Verify data integrity (Step 4.2 - counts must match Step 3)
10. If data is missing or corrupted → Restore from backup immediately
11. Deploy frontend if needed
12. Keep backup for 7 days minimum
13. Document schema changes
14. Merge to main

**Time**: ~45 minutes
**Risk**: High

**NOTE**: Production database is the source of truth. Backups are for restoration if migration corrupts data, not for schema-only rollback.

**Common Pitfalls**:

1. **Migration Failures**: The Dockerfile's `|| true` allows containers to start even when migrations fail. Always test the API endpoint after deployment to ensure migrations ran successfully. Look for "does not exist in the current database" errors which indicate migration failure.

2. **Data Loss During Migration**: Migrations can corrupt or delete data if not tested properly. **Always verify data counts before (Step 2.1) and after (Step 4.2) deployment**. If counts don't match, restore from backup immediately. Production is the source of truth - never assume you can recreate data from local.

## Emergency Procedures

### Immediate Rollback Required

If production is broken:
```bash
# 1. Rollback immediately (30 seconds)
gcloud run services update-traffic portfolio-backend \
  --to-revisions=[LAST_KNOWN_GOOD]=100 \
  --region=us-central1

# 2. Verify service restored
curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects

# 3. Investigate in parallel
gcloud logging read "..." --limit 50
```

### Database Corruption

If data is corrupted:
```bash
# 1. Stop accepting writes (if possible)
# 2. Restore from most recent backup
# 3. Verify data integrity
# 4. Resume service
# 5. Investigate root cause
```

## Best Practices

### Before Deployment
- ✅ Always backup database
- ✅ Test migrations on backup copy
- ✅ Deploy during low-traffic hours
- ✅ Have rollback plan ready
- ✅ Communicate with stakeholders

### During Deployment
- ✅ Deploy backend before frontend
- ✅ Monitor logs actively
- ✅ Test immediately after deployment
- ✅ Keep backup window open

### After Deployment
- ✅ Monitor for at least 10 minutes
- ✅ Test all critical paths
- ✅ Update documentation
- ✅ Keep backups for 7 days
- ✅ Document any issues encountered

## Automation Opportunities

### Future Improvements

**1. CI/CD Pipeline**
- Auto-deploy on merge to main
- Run tests before deployment
- Automatic rollback on failure

**2. Monitoring Alerts**
- Error rate threshold alerts
- Response time alerts
- Service down alerts

**3. Automated Backups**
- Scheduled daily backups
- Backup verification
- Automatic cleanup

**4. Deployment Dashboard**
- Track deployment history
- View current versions
- One-click rollback

## Troubleshooting

### Deployment Fails

**Check**:
1. Build logs: `gcloud builds log [BUILD_ID]`
2. Docker image exists in Artifact Registry
3. Environment variables are set
4. Service account has permissions

### Service Won't Start

**Check**:
1. Container logs: `gcloud run services logs read`
2. Port configuration (must be 8080)
3. DATABASE_URL is correct
4. Cloud SQL connection is added

### Database Migration Fails

**Symptoms**:
- API returns `500 Internal Server Error`
- Error message contains "does not exist in the current database"
- Logs show Prisma validation errors

**Check**:
1. Test API endpoint: `curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects`
2. Check logs for migration output
3. Review migration SQL syntax
4. Verify database connection
5. Check for schema conflicts

**Immediate Fix**:
```bash
# Run manual migration using helper script
./Docs/scripts/run-prod-migrations.sh

# Verify fix
curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects
```

**Long-term Fix**:
1. Migration fails but service starts (via `|| true` in Dockerfile)
2. Fix migration locally and test thoroughly
3. Create new migration if needed
4. Deploy again with improved migration
5. Consider removing `|| true` to fail fast on migration errors

**Prevention**:
- Always test migrations on local copy of production data
- Use the `deploy-backend.sh` script which detects migration failures
- Monitor API immediately after deployment
- Keep database backup until verified working

## Related Documentation

- [GCP Deployment Implementation](./gcp-deployment.impl.md)
- [Deployment Scripts](../../scripts/README.md)
- [Troubleshooting Guide](../../../04-guides/troubleshooting.md)

---

**Document Owner**: Technical Lead
**Review Frequency**: After each deployment
**Last Updated**: 2025-12-10
