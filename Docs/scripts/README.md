# Deployment Scripts

This directory previously contained GCP deployment scripts which have been removed. The portfolio now uses Railway (backend) and Cloudflare Pages (frontend).

## Current Deployment Setup

### Backend: Railway

Deployed using the `deploy-railway.sh` script in the repository root.

```bash
# Show setup instructions
./deploy-railway.sh setup

# Deploy backend to Railway
./deploy-railway.sh backend

# Show architecture overview
./deploy-railway.sh info
```

The backend auto-deploys from GitHub when connected via the Railway dashboard. Manual CLI deployment is available as a fallback.

**Prerequisites:**
- Railway CLI: `npm install -g @railway/cli`
- Railway account linked to project: `railway login && cd backend && railway link`

### Frontend: Cloudflare Pages via GitHub Actions

The frontend is deployed automatically by the GitHub Actions workflow at `.github/workflows/deploy-frontend.yml`.

**Triggers:**
- Push to `main` branch (when `frontend/**` files change)
- Manual trigger via `workflow_dispatch`

**GitHub Actions Secrets Required:**
- `VITE_API_URL` - Backend API URL (e.g., `https://api.aravindbharathy.com`)
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

No local scripts are needed for frontend deployment.

## Common Workflows

### Full Deployment

Backend and frontend deploy independently:

1. **Backend** - Push changes to `main`; Railway auto-deploys from the `backend/` directory
2. **Frontend** - Push changes to `main` with `frontend/**` path changes; GitHub Actions deploys to Cloudflare Pages

### Backend Only

```bash
# Option 1: Push to GitHub (auto-deploy via Railway)
git push origin main

# Option 2: Manual CLI deploy
./deploy-railway.sh backend
```

### Frontend Only

```bash
# Option 1: Push frontend changes to GitHub (auto-deploy via GitHub Actions)
git push origin main

# Option 2: Manual trigger via GitHub Actions UI (workflow_dispatch)
```

### Database Backup

```bash
# Use Railway's public DATABASE_URL to create a backup
pg_dump "$RAILWAY_DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Related Documentation

- [Deployment Guide](../04-guides/deployment.md)
- [GitHub Actions Workflow](../../.github/workflows/deploy-frontend.yml)
- [Railway Deploy Script](../../deploy-railway.sh)

---

**Last Updated**: March 2026
