# Deployment Guide

## Architecture Overview

The portfolio runs on a split architecture: static frontend on Cloudflare Pages and a containerized backend on Railway with a managed PostgreSQL database.

```
                    Cloudflare DNS
                         |
          +--------------+--------------+
          |                             |
   @ / www CNAME                  api CNAME
   (Proxied)                      (DNS only)
          |                             |
          v                             v
  Cloudflare Pages                   Railway
  (Static SPA)                    (Docker container)
  - Vite/React build              - Next.js API server
  - Global CDN                    - Prisma ORM
  - deploy-frontend.yml           - Auto-deploy from GitHub
          |                             |
          |                             v
          |                      Railway PostgreSQL
          |                      (Managed database)
          |                      - Auto-injected DATABASE_URL
          +--------> API calls -------->+
```

### Services

| Component | Platform | Plan | Cost |
|-----------|----------|------|------|
| Frontend | Cloudflare Pages | Free | $0/month |
| Backend | Railway | Hobby ($5/mo + $5 credit) | ~$0-5/month |
| Database | Railway PostgreSQL | Included with Hobby | $0 (included) |
| DNS | Cloudflare | Free | $0/month |
| CI/CD (frontend) | GitHub Actions | Free tier | $0/month |
| **Total** | | | **$0-5/month** |

### Production URLs

- **Frontend**: https://aravindbharathy.com
- **Backend API**: https://api.aravindbharathy.com
- **Railway service domain**: portfolio-backend-production-c015.up.railway.app

---

## Prerequisites

- [Railway CLI](https://docs.railway.com/guides/cli): `npm install -g @railway/cli`
- GitHub repository connected to Railway
- Cloudflare account with domain configured
- GitHub Actions secrets configured (see Environment Variables below)

---

## Setup Steps

### 1. Railway Backend + Database

1. Create a new project at https://railway.com
2. Add a **PostgreSQL** service to the project
3. Add a new service from GitHub, point it to the repository with root directory set to `backend`
4. Railway auto-detects the Dockerfile and builds from `backend/Dockerfile`
5. Set environment variables (see below)
6. Add a custom domain (`api.aravindbharathy.com`) in the Railway service settings

### 2. Cloudflare Pages Frontend

1. The GitHub Actions workflow at `.github/workflows/deploy-frontend.yml` handles deployment
2. Configure the required GitHub Actions secrets (see below)
3. On push to `main` with changes in `frontend/**`, the workflow:
   - Checks out the code
   - Installs dependencies
   - Builds with `VITE_API_URL` injected
   - Deploys to Cloudflare Pages via `wrangler`

### 3. Cloudflare DNS

Configure DNS records in the Cloudflare dashboard:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `@` | `portfolio-frontend-6bs.pages.dev` | Proxied |
| CNAME | `www` | `portfolio-frontend-6bs.pages.dev` | Proxied |
| CNAME | `api` | `w8etu6qr.up.railway.app` | DNS only |
| TXT | `_railway-verify.api` | Railway verification token | - |

The `api` subdomain must be **DNS only** (not proxied) because Railway handles its own SSL termination.

---

## Environment Variables

### Railway Backend

Set these in the Railway dashboard under the backend service's Variables tab:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Railway reference variable, auto-injected |
| `JWT_SECRET` | (secret value) | Used for authentication tokens |
| `NODE_ENV` | `production` | |
| `ALLOWED_ORIGINS` | `https://aravindbharathy.com,https://www.aravindbharathy.com` | CORS whitelist |
| `PORT` | `8080` | Port the container listens on |

Optional variables: `SENDGRID_API_KEY`, `RESEND_API_KEY`, `CONTACT_EMAIL` (for contact form).

### GitHub Actions Secrets

Set these in the GitHub repository under Settings > Secrets and variables > Actions:

| Secret | Purpose |
|--------|---------|
| `VITE_API_URL` | Backend API URL (e.g., `https://api.aravindbharathy.com`) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

---

## Database Migrations

Migrations run automatically on container startup. The backend Dockerfile CMD is:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy || true && node server.js"]
```

The `|| true` ensures the container starts even if migrations fail (e.g., on a fresh deploy with no pending migrations). The trade-off is that migration failures can be silently ignored.

**If migrations fail:**

1. Check Railway dashboard logs for Prisma migration errors
2. Run migrations manually using the Railway public DATABASE_URL:

```bash
cd backend
DATABASE_URL="<railway-public-database-url>" npx prisma migrate deploy
```

3. You can get the public DATABASE_URL from the Railway dashboard under the PostgreSQL service's Variables tab (use the public URL, not the internal one)

### Creating New Migrations

```bash
# Local development
cd backend
npx prisma migrate dev --name your_migration_name

# Commit the migration files, push to main
# Railway will auto-deploy and run migrations on startup
```

---

## Deployment Workflows

### Backend Deployment

The backend auto-deploys when changes are pushed to `main` on GitHub. Railway watches the connected repository and rebuilds from the `backend/` directory.

**Manual deployment (fallback):**
```bash
./deploy-railway.sh backend
```

### Frontend Deployment

The frontend deploys via GitHub Actions when:
- Changes are pushed to `main` in the `frontend/**` path
- The workflow is manually triggered via `workflow_dispatch`

**The workflow** (`.github/workflows/deploy-frontend.yml`):
1. Checks out the repository
2. Sets up Node.js
3. Installs frontend dependencies
4. Builds with `VITE_API_URL` from secrets
5. Deploys `frontend/dist` to Cloudflare Pages

---

## Monitoring

### Railway Dashboard

- View real-time logs: Railway dashboard > Service > Deployments > View logs
- Monitor resource usage (CPU, memory) in the Metrics tab
- Deployment history with rollback capability

### Checking Backend Health

```bash
curl https://api.aravindbharathy.com/api/timeline
```

### Database Access

```bash
# Connect via Railway's public URL
psql "<railway-public-database-url>"

# Or use Prisma Studio locally
cd backend
DATABASE_URL="<railway-public-database-url>" npx prisma studio
```

---

## Backup Strategy

### Manual Backup

```bash
# Export using Railway's public DATABASE_URL
pg_dump "$RAILWAY_DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup

```bash
psql "$RAILWAY_DATABASE_URL" < backup_20260311_120000.sql
```

### Sync Production to Local

```bash
# Dump production data
pg_dump "$RAILWAY_DATABASE_URL" > /tmp/prod_backup.sql

# Restore to local database
psql -U yourusername -d portfolio_db < /tmp/prod_backup.sql
```

---

## Rollback

### Backend (Railway)

1. Go to the Railway dashboard > Service > Deployments
2. Click on a previous successful deployment
3. Select "Rollback to this deployment"

Or revert the commit and push:
```bash
git revert <commit-hash>
git push origin main
```

### Frontend (Cloudflare Pages)

1. Go to the Cloudflare dashboard > Pages > Project > Deployments
2. Find the previous production deployment
3. Click "Rollback to this deployment"

---

## Troubleshooting

### CORS Errors

- **Symptom**: Browser console shows `Access-Control-Allow-Origin` errors
- **Cause**: `ALLOWED_ORIGINS` on Railway does not include the frontend domain
- **Fix**: Update `ALLOWED_ORIGINS` in Railway to include `https://aravindbharathy.com`
- **Note**: Cannot use wildcard `*` when credentials (cookies) are included

### SSL/TLS Issues

- Railway provides automatic SSL for custom domains
- Cloudflare provides SSL for the frontend via its proxy
- The `api` CNAME must be **DNS only** (grey cloud in Cloudflare) to avoid double-proxying and certificate conflicts

### Migration Failures

- **Symptom**: API returns 500 errors mentioning missing tables or columns
- **Check**: Railway logs for Prisma migration errors
- **Fix**: Run migrations manually:
  ```bash
  cd backend
  DATABASE_URL="<railway-public-database-url>" npx prisma migrate deploy
  ```

### Backend Not Responding

1. Check Railway dashboard for deployment status
2. Review logs for startup errors
3. Verify environment variables are set correctly
4. Ensure `PORT=8080` is configured

### Frontend Shows Stale Content

1. Cloudflare may be caching old content
2. Purge the Cloudflare cache: Dashboard > Caching > Purge Everything
3. Or wait for the TTL to expire

---

## Cost Breakdown

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Cloudflare Pages | $0 | Free plan, 500 builds/month |
| Cloudflare DNS | $0 | Free with Cloudflare |
| GitHub Actions | $0 | Free tier for public repos, 2000 min/month for private |
| Railway Hobby Plan | $5 | Includes $5 usage credit |
| Railway PostgreSQL | $0 (included) | Shared with Hobby Plan credit |
| **Total** | **$0-5/month** | Effectively free within Railway credits |

Previous GCP architecture cost $11-16/month. This setup saves $11+/month.

---

**Last Updated**: March 2026
