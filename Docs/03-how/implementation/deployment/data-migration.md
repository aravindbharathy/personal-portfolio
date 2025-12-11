---
type: guide
last_updated: 2025-12-10
status: ONE-TIME SETUP ONLY
---

# Data Migration Guide: Local to Production (Initial Setup Only)

## ⚠️ IMPORTANT WARNING

**This guide is ONLY for initial setup when production database is completely empty.**

**For normal deployments**, production is the source of truth. Use the backup-and-restore workflow instead:
- See: [Production Update Workflow - Scenario 4](/Docs/03-how/implementation/deployment/production-update-workflow.md#scenario-4-database-schema-change)

## Overview

This guide covers the **one-time** migration of content data (projects, publications, etc.) from local development database to production when production has schema but no data.

**This is NOT a regular deployment procedure.**

## When to Use This Guide

Use this process when:
- ✅ Production database has schema (from migrations)
- ✅ Production database has 0 or very few rows
- ✅ Local database has content you want to migrate
- ✅ You want to sync local development data to production

**DO NOT use** if production already has data you want to keep.

## Prerequisites

1. Cloud SQL proxy running on port 5433
2. Backup of production database (just in case)
3. Admin user exists in production

## Migration Process

### Step 1: Verify Environment State

```bash
# Check LOCAL data counts
psql postgresql://aravind@localhost:5432/portfolio_db \
  -c "SELECT
    (SELECT COUNT(*) FROM \"Project\") as projects,
    (SELECT COUNT(*) FROM \"Publication\") as publications,
    (SELECT COUNT(*) FROM \"User\") as users;"

# Check PRODUCTION data counts (via Cloud SQL proxy)
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "SELECT
    (SELECT COUNT(*) FROM \"Project\") as projects,
    (SELECT COUNT(*) FROM \"Publication\") as publications,
    (SELECT COUNT(*) FROM \"User\") as users;"
```

**Decision Point**:
- If production has 0 rows and local has data → Proceed with migration
- If production already has data → STOP, investigate why data differs

### Step 2: Get User IDs

```bash
# Get LOCAL admin user ID
psql postgresql://aravind@localhost:5432/portfolio_db \
  -t -c "SELECT id FROM \"User\" WHERE role='ADMIN' LIMIT 1;"

# Example output: cmica6w7v0000j8ixt0o1koju

# Get PRODUCTION admin user ID
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -t -c "SELECT id FROM \"User\" WHERE role='ADMIN' LIMIT 1;"

# Example output: cmj13gi640000ec5zhbyaz1wg
```

**Save these IDs** - you'll need them for Step 4.

### Step 3: Export Data from Local

```bash
# Export data from local database
pg_dump postgresql://aravind@localhost:5432/portfolio_db \
  --data-only \
  --table='"Project"' \
  --table='"Publication"' \
  --table='"ProjectImage"' \
  --table='"ProjectTag"' \
  --table='"PublicationTag"' \
  --table='"Tag"' \
  > /tmp/portfolio_data_export.sql

# Verify export
ls -lh /tmp/portfolio_data_export.sql
```

**Note**: We export Tags because they may be referenced by Projects/Publications. We do NOT export Users because production already has admin user.

### Step 4: Remap Foreign Keys

```bash
# Replace local admin user ID with production admin user ID
sed 's/LOCAL_ADMIN_ID/PRODUCTION_ADMIN_ID/g' \
  /tmp/portfolio_data_export.sql > /tmp/portfolio_data_updated.sql

# Example (use YOUR actual IDs from Step 2):
sed 's/cmica6w7v0000j8ixt0o1koju/cmj13gi640000ec5zhbyaz1wg/g' \
  /tmp/portfolio_data_export.sql > /tmp/portfolio_data_updated.sql
```

**Verify the replacement**:
```bash
# Check that old ID doesn't exist in new file
grep 'LOCAL_ADMIN_ID' /tmp/portfolio_data_updated.sql
# Should return nothing

# Check that new ID exists
grep 'PRODUCTION_ADMIN_ID' /tmp/portfolio_data_updated.sql
# Should show multiple matches
```

### Step 5: Import to Production

```bash
# Import updated data to production
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -f /tmp/portfolio_data_updated.sql
```

**Expected Output**:
```
COPY 3   # Projects
COPY 0   # ProjectImages (if none exist)
COPY 0   # ProjectTags (if none exist)
COPY 2   # Publications
COPY 0   # PublicationTags (if none exist)
ERROR: duplicate key value violates unique constraint "Tag_pkey"
```

**The Tag error is EXPECTED** if production already has Tags. This is fine - the important data (Projects, Publications) imported successfully.

### Step 6: Verify Migration

```bash
# Check production data counts
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "SELECT
    (SELECT COUNT(*) FROM \"Project\") as projects,
    (SELECT COUNT(*) FROM \"Publication\") as publications;"

# Should match your local counts

# Verify projects have correct author
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "SELECT id, title, \"authorId\" FROM \"Project\" LIMIT 3;"

# authorId should be PRODUCTION admin ID
```

### Step 7: Test Production

```bash
# Test API endpoint
curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects

# Should return your projects

# Test frontend
# Visit: https://aravindbharathy.com/projects
# Should display all projects

# Test admin dashboard
# Login at: https://aravindbharathy.com/admin/login
# Should see projects and publications
```

## Troubleshooting

### Error: "relation does not exist"

**Cause**: Schema not deployed to production yet.

**Fix**: Deploy backend with migrations first, then run data migration.

### Error: Foreign key violation

**Cause**: User ID remapping didn't work correctly.

**Fix**:
1. Check Step 2 - verify you got correct IDs
2. Check Step 4 - verify sed command ran correctly
3. Re-export and try again

### Error: Duplicate key violations

**Expected for**: Tags (production already has seed tags)

**Unexpected for**: Projects, Publications

**Fix for unexpected duplicates**:
```bash
# Clear production data first
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "DELETE FROM \"Project\"; DELETE FROM \"Publication\";"

# Re-import
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -f /tmp/portfolio_data_updated.sql
```

### Data imported but not visible in frontend

**Possible causes**:
1. Projects/Publications have `published = false`
2. Frontend is cached
3. Backend hasn't restarted to pick up new data

**Fix**:
```bash
# Check published status
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "SELECT id, title, published FROM \"Project\";"

# If published = false, update:
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -c "UPDATE \"Project\" SET published = true;"
```

## Best Practices

### Before Migration
- ✅ Always backup production database first
- ✅ Verify production truly has no data (not just different data)
- ✅ Confirm admin user exists in production
- ✅ Test on backup copy first if unsure

### During Migration
- ✅ Save User IDs in a text file before starting
- ✅ Keep terminal output to verify counts
- ✅ Don't panic at Tag duplicate errors (expected)

### After Migration
- ✅ Verify data counts match expectations
- ✅ Test API endpoints immediately
- ✅ Login to admin dashboard to verify
- ✅ Keep local and production backups for 7 days
- ✅ Document what was migrated in changelog

## When NOT to Use This Process

**Don't use this migration if**:
- Production has existing data you want to keep
- You're trying to merge data from multiple sources
- You need to update existing records (use update queries instead)
- Production and local have diverged significantly
- **This is a regular deployment with schema changes** ← Use backup-and-restore instead

For regular deployments with schema changes:
- Production is the source of truth
- Backup production data before migration
- If migration corrupts data, restore from backup
- See: [Production Update Workflow - Scenario 4](/Docs/03-how/implementation/deployment/production-update-workflow.md#scenario-4-database-schema-change)

For other scenarios, consider:
- Manual SQL updates
- Custom migration scripts
- Data reconciliation process

## Related Documentation

- [Production Update Workflow](/Docs/03-how/implementation/deployment/production-update-workflow.md)
- [Database Backup Scripts](/Docs/scripts/README.md)
- [GCP Deployment Guide](/Docs/03-how/implementation/deployment/gcp-deployment.impl.md)

---

**Document Owner**: Technical Lead
**Review Frequency**: After each data migration
**Last Updated**: 2025-12-10
