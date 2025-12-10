---
implements: ../../../04-guides/deployment.md
type: infrastructure
modules:
  - backend/Dockerfile
  - frontend/Dockerfile
  - frontend/cloudbuild.yaml
  - deploy.sh
  - setup-gcp.sh
dependencies:
  - Google Cloud Run
  - Google Cloud SQL (PostgreSQL)
  - Google Artifact Registry
  - Google Cloud Build
  - Google Secret Manager
last_updated: 2025-12-10
---

# Google Cloud Platform Deployment Implementation

## Overview

This document describes the complete implementation of the portfolio website deployment on Google Cloud Platform (GCP), including infrastructure setup, deployment processes, and production update workflows.

## Architecture

```
┌─────────────────────────────────────────────┐
│       Production Architecture (GCP)         │
└─────────────────────────────────────────────┘

Domain: aravindbharathy.com
       │
       ├─> Cloud Run (Frontend)
       │   └─ portfolio-frontend-1017578449720.us-central1.run.app
       │      ├─ Docker Container (Vite/React)
       │      ├─ Port 8080
       │      ├─ Build Arg: VITE_API_URL
       │      └─ Memory: 256Mi, CPU: 1
       │
       └─> Cloud Run (Backend)
           └─ portfolio-backend-1017578449720.us-central1.run.app
              ├─ Docker Container (Next.js)
              ├─ Port 8080
              ├─ Connected to Cloud SQL via Unix Socket
              ├─ Memory: 512Mi, CPU: 1
              └─ Env: DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS

Cloud SQL (PostgreSQL 15)
└─ portfolio-db (us-central1)
   ├─ Instance: personal-website-480707:us-central1:portfolio-db
   ├─ Connection: Unix Socket (/cloudsql/...)
   ├─ Database: portfolio
   └─ User: postgres

Artifact Registry
└─ portfolio-repo (us-central1)
   ├─ backend:latest
   └─ frontend:latest

Secret Manager
├─ jwt-secret
└─ db-password
```

## Current Production Configuration

### Project Details
- **Project ID**: `personal-website-480707`
- **Region**: `us-central1`
- **Domain**: `aravindbharathy.com`

### Backend Service
- **Name**: `portfolio-backend`
- **Image**: `us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/backend:latest`
- **URL**: `https://portfolio-backend-1017578449720.us-central1.run.app`
- **Current Revision**: `portfolio-backend-00017-7v7` (2025-12-10)

**Environment Variables**:
```yaml
DATABASE_URL: "postgresql://postgres:%40Atr2xLtdda9EfdsXdky@localhost/portfolio?host=/cloudsql/personal-website-480707:us-central1:portfolio-db"
JWT_SECRET: (from Secret Manager)
ALLOWED_ORIGINS: "https://portfolio-frontend-1017578449720.us-central1.run.app,https://aravindbharathy.com,http://localhost:5173,http://localhost:3000"
```

**Cloud SQL Connection**:
- Uses Unix socket: `/cloudsql/personal-website-480707:us-central1:portfolio-db`
- Password URL-encoded in connection string: `%40` for `@`

### Frontend Service
- **Name**: `portfolio-frontend`
- **Image**: `us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/frontend:latest`
- **URL**: `https://portfolio-frontend-1017578449720.us-central1.run.app`
- **Current Revision**: `portfolio-frontend-00002-qxk` (2025-12-10)

**Build Configuration** (`cloudbuild.yaml`):
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_API_URL=https://portfolio-backend-1017578449720.us-central1.run.app'
      - '-t'
      - 'us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/frontend:latest'
      - '.'
images:
  - 'us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/frontend:latest'
```

### Database Configuration
- **Instance**: `portfolio-db`
- **Type**: PostgreSQL 15
- **Tier**: `db-f1-micro`
- **Connection Name**: `personal-website-480707:us-central1:portfolio-db`
- **IP**: `34.46.39.83` (public IP for management)
- **Database**: `portfolio`

**Current Data**:
- 3 Projects
- 2 Publications
- Multiple guidebooks
- User accounts
- Tags and relationships

## Docker Implementation

### Backend Dockerfile

Located at: `/backend/Dockerfile`

**Key Features**:
1. **Multi-stage build** (deps, builder, runner)
2. **Prisma binary compatibility** for Alpine Linux
3. **OpenSSL 3.0.x** support for Prisma
4. **Prisma client regeneration** in runner stage
5. **Automatic migrations** on startup

**Critical Configuration**:
```dockerfile
# In runner stage
RUN apk add --no-cache openssl

# Regenerate Prisma Client for Alpine Linux runtime
RUN npx prisma generate

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy || true && node server.js"]
```

**Prisma Binary Targets** (`schema.prisma`):
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

### Frontend Dockerfile

Located at: `/frontend/Dockerfile`

**Build Argument**:
```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

This allows the backend URL to be injected during build time.

## Deployment Process

### Manual Deployment (Current Method)

**Backend Deployment**:
```bash
cd /Users/aravind/Projects/portfolio/backend

# Build and submit to Cloud Build
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/backend:latest

# Deploy to Cloud Run
gcloud run deploy portfolio-backend \
  --image us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances personal-website-480707:us-central1:portfolio-db \
  --env-vars-file /tmp/backend-env.yaml \
  --update-secrets=JWT_SECRET=jwt-secret:latest
```

**Frontend Deployment**:
```bash
cd /Users/aravind/Projects/portfolio/frontend

# Build using Cloud Build with build args
gcloud builds submit \
  --config cloudbuild.yaml \
  --region us-central1

# Deploy to Cloud Run
gcloud run deploy portfolio-frontend \
  --image us-central1-docker.pkg.dev/personal-website-480707/portfolio-repo/frontend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

### Database Operations

**Backup Database**:
```bash
# Start Cloud SQL Proxy
cloud-sql-proxy personal-website-480707:us-central1:portfolio-db --port=5433 &

# Export data
PGPASSWORD="@Atr2xLtdda9EfdsXdky" pg_dump \
  -h localhost \
  -p 5433 \
  -U postgres \
  -d portfolio \
  --data-only \
  > /tmp/portfolio_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore Database**:
```bash
# Start Cloud SQL Proxy
cloud-sql-proxy personal-website-480707:us-central1:portfolio-db --port=5433 &

# Import data
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost \
  -p 5433 \
  -U postgres \
  -d portfolio \
  -f /tmp/portfolio_backup.sql
```

**Run Migrations**:
```bash
# Using DATABASE_URL
DATABASE_URL="postgresql://postgres:%40Atr2xLtdda9EfdsXdky@localhost:5433/portfolio" \
  npx prisma migrate deploy
```

## Critical Deployment Issues & Solutions

### Issue 1: Prisma Binary Mismatch

**Problem**: Prisma client binary generated during Docker build didn't match Alpine Linux runtime.

**Error**:
```
Error loading shared library libssl.so.1.1: No such file or directory
```

**Solution**:
1. Added `linux-musl-openssl-3.0.x` to `binaryTargets` in `schema.prisma`
2. Added `RUN npx prisma generate` in Docker runner stage
3. Installed OpenSSL in runner stage: `RUN apk add --no-cache openssl`

**Files Modified**:
- `backend/Dockerfile` (lines 37, 54)
- `backend/prisma/schema.prisma` (line 6)

### Issue 2: DATABASE_URL Empty Host Error

**Problem**: Password containing `@` symbol caused parsing issues.

**Initial Attempt**:
```
postgresql://postgres:@Atr2xLtdda9EfdsXdky@/portfolio?host=/cloudsql/...
```

**Error**: `Error parsing connection string: empty host in database URL`

**Solution**: URL-encode password and add explicit localhost:
```
postgresql://postgres:%40Atr2xLtdda9EfdsXdky@localhost/portfolio?host=/cloudsql/personal-website-480707:us-central1:portfolio-db
```

### Issue 3: CORS Configuration

**Problem**: Environment variables replaced instead of added.

**What Happened**: Using `--env-vars-file` replaced ALL env vars, removing `DATABASE_URL`.

**Solution**: Created complete env file with all required variables:
```yaml
# /tmp/backend-env.yaml
ALLOWED_ORIGINS: "https://portfolio-frontend-1017578449720.us-central1.run.app,https://aravindbharathy.com,http://localhost:5173,http://localhost:3000"
DATABASE_URL: "postgresql://postgres:%40Atr2xLtdda9EfdsXdky@localhost/portfolio?host=/cloudsql/personal-website-480707:us-central1:portfolio-db"
```

**Learning**: Always include ALL environment variables when using `--env-vars-file`.

## Production Update Workflow

### Pre-Deployment Checklist

- [ ] All changes tested locally
- [ ] Database migrations tested locally
- [ ] TypeScript compilation successful
- [ ] No breaking changes in API
- [ ] Environment variables reviewed
- [ ] Dependencies updated if needed
- [ ] Backup plan ready

### Deployment Steps

**1. Backup Production Database**:
```bash
./Docs/scripts/backup-production-db.sh
```

**2. Test Locally**:
```bash
# Backend
cd backend && npm run build && npm run type-check

# Frontend
cd frontend && npm run build
```

**3. Deploy Backend** (if changed):
```bash
./Docs/scripts/deploy-backend.sh
```

**4. Deploy Frontend** (if changed):
```bash
./Docs/scripts/deploy-frontend.sh
```

**5. Verify Deployment**:
```bash
# Check backend health
curl https://portfolio-backend-1017578449720.us-central1.run.app/api/projects

# Check frontend
curl -I https://portfolio-frontend-1017578449720.us-central1.run.app
```

**6. Monitor Logs**:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-backend" --limit 20
```

### Rollback Procedure

**If deployment fails**:

1. **Identify previous working revision**:
```bash
gcloud run revisions list \
  --service=portfolio-backend \
  --region=us-central1
```

2. **Route traffic to previous revision**:
```bash
gcloud run services update-traffic portfolio-backend \
  --to-revisions=portfolio-backend-00016-mst=100 \
  --region=us-central1
```

3. **Restore database** (if migrations ran):
```bash
PGPASSWORD="@Atr2xLtdda9EfdsXdky" psql \
  -h localhost -p 5433 -U postgres -d portfolio \
  -f /tmp/backups/portfolio_backup_[timestamp].sql
```

## Monitoring & Logs

### View Recent Logs
```bash
# Backend
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-backend" \
  --limit 50 \
  --format json

# Frontend
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-frontend" \
  --limit 50 \
  --format json
```

### Check Service Status
```bash
# Backend
gcloud run services describe portfolio-backend \
  --region us-central1 \
  --format="value(status.conditions)"

# Frontend
gcloud run services describe portfolio-frontend \
  --region us-central1 \
  --format="value(status.conditions)"
```

### Database Metrics
```bash
gcloud sql operations list \
  --instance=portfolio-db \
  --limit=10
```

## Security Considerations

### Environment Variables
- JWT_SECRET stored in Secret Manager
- DATABASE_URL contains encoded password
- ALLOWED_ORIGINS restricts CORS

### Network Security
- Cloud SQL accessed via Unix socket (more secure than IP)
- Cloud Run services require explicit unauthenticated access
- HTTPS enforced automatically

### Best Practices
1. Never commit credentials to git
2. Use Secret Manager for sensitive data
3. Rotate secrets regularly
4. Monitor access logs
5. Keep dependencies updated

## Cost Optimization

### Current Usage (Free Tier)
- **Cloud Run**: Pay per use, minimal with 0 min instances
- **Cloud SQL**: db-f1-micro tier
- **Artifact Registry**: Storage for 2 images
- **Cloud Build**: 120 free builds/day

### Cost Reduction Tips
1. Use `--min-instances=0` for Cloud Run
2. Schedule Cloud SQL instances to stop during low traffic
3. Clean old Docker images from Artifact Registry
4. Use Cloud Build cache for faster builds

## Future Improvements

### Recommended Enhancements
1. **CI/CD Pipeline**: GitHub Actions auto-deploy on merge
2. **Monitoring**: Set up Cloud Monitoring alerts
3. **Staging Environment**: Create separate staging services
4. **Database Backups**: Automated daily backups to Cloud Storage
5. **Custom Domain**: Direct mapping to aravindbharathy.com
6. **CDN**: Cloud CDN for static assets
7. **Load Balancer**: For custom domain and SSL

### Migration to Vercel (Alternative)
If GCP costs become prohibitive, migration path:
1. Export data from Cloud SQL
2. Import to Vercel Postgres
3. Update environment variables
4. Deploy using Vercel CLI
5. Update DNS records

## Troubleshooting

### Common Issues

**1. Cloud Run Service Won't Start**
```bash
# Check logs
gcloud run services logs read portfolio-backend --limit=50

# Common causes:
# - Missing environment variables
# - Database connection failure
# - Port mismatch (must be 8080)
# - Startup timeout
```

**2. Database Connection Errors**
```bash
# Verify Cloud SQL instance is running
gcloud sql instances describe portfolio-db

# Test connection locally
cloud-sql-proxy personal-website-480707:us-central1:portfolio-db
```

**3. Build Failures**
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]

# Common causes:
# - Missing dependencies
# - TypeScript errors
# - Prisma generation failure
```

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [Prisma with Cloud SQL](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

**Last Updated**: 2025-12-10
**Deployed By**: Claude Code
**Current Status**: ✅ Production Stable
