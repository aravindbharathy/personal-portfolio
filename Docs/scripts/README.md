# Deployment Scripts

This directory contains scripts for deploying and managing the portfolio website on Google Cloud Platform.

## Scripts Overview

### Deployment Scripts

**`deploy-backend.sh`**
- Builds backend Docker image
- Pushes to Artifact Registry
- Deploys to Cloud Run
- Tests the deployment

Usage:
```bash
./Docs/scripts/deploy-backend.sh
```

**`deploy-frontend.sh`**
- Builds frontend Docker image with build args
- Pushes to Artifact Registry
- Deploys to Cloud Run
- Tests the deployment

Usage:
```bash
./Docs/scripts/deploy-frontend.sh
```

**`deploy-all.sh`**
- Deploys both backend and frontend
- Complete deployment workflow

Usage:
```bash
./Docs/scripts/deploy-all.sh all
```

### Database Scripts

**`backup-production-db.sh`**
- Connects to Cloud SQL via proxy
- Creates timestamped backup
- Stores in `/tmp/backups/`
- Cleans backups older than 7 days

Usage:
```bash
./Docs/scripts/backup-production-db.sh
```

### Setup Scripts

**`setup-gcp.sh`**
- Initial GCP project setup
- Creates Cloud SQL instance
- Sets up Artifact Registry
- Configures Secret Manager
- Creates service accounts

Usage:
```bash
./Docs/scripts/setup-gcp.sh
```

## Prerequisites

### Required Tools
- gcloud CLI
- Docker (optional for local builds)
- PostgreSQL client (for backups)
- cloud-sql-proxy (for database operations)

### Installation
```bash
# gcloud CLI
brew install google-cloud-sdk

# PostgreSQL client
brew install postgresql

# Cloud SQL Proxy
brew install cloud-sql-proxy
```

### Authentication
```bash
# Login to gcloud
gcloud auth login

# Set project
gcloud config set project personal-website-480707

# Configure Docker
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## Environment Setup

### Required Environment Variables

Create `/tmp/backend-env.yaml`:
```yaml
ALLOWED_ORIGINS: "https://portfolio-frontend-1017578449720.us-central1.run.app,https://aravindbharathy.com,http://localhost:5173,http://localhost:3000"
DATABASE_URL: "postgresql://postgres:%40Atr2xLtdda9EfdsXdky@localhost/portfolio?host=/cloudsql/personal-website-480707:us-central1:portfolio-db"
```

### Secrets in Secret Manager
- `jwt-secret`: JWT signing key
- `db-password`: Database password

## Common Workflows

### Full Deployment
```bash
# 1. Backup database
./Docs/scripts/backup-production-db.sh

# 2. Deploy backend
./Docs/scripts/deploy-backend.sh

# 3. Deploy frontend
./Docs/scripts/deploy-frontend.sh
```

### Backend Only Update
```bash
./Docs/scripts/deploy-backend.sh
```

### Frontend Only Update
```bash
./Docs/scripts/deploy-frontend.sh
```

### Database Backup
```bash
./Docs/scripts/backup-production-db.sh
```

## Script Permissions

Make scripts executable:
```bash
chmod +x Docs/scripts/*.sh
```

## Troubleshooting

### Permission Denied
```bash
chmod +x Docs/scripts/[script-name].sh
```

### gcloud Not Found
```bash
brew install google-cloud-sdk
gcloud init
```

### Build Failures
Check Cloud Build logs:
```bash
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

### Deployment Failures
Check service logs:
```bash
gcloud run services logs read portfolio-backend --limit=50
```

## Related Documentation

- [GCP Deployment Implementation](../03-how/implementation/deployment/gcp-deployment.impl.md)
- [Production Update Workflow](../03-how/implementation/deployment/production-update-workflow.md)
- [Deployment Guide](../04-guides/deployment.md)

---

**Last Updated**: 2025-12-10
