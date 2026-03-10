#!/bin/bash

# Portfolio Deployment Script for Railway
# Usage: ./deploy-railway.sh [setup|backend|info]
#
# Prerequisites:
#   1. Install Railway CLI: npm install -g @railway/cli
#   2. Login: railway login
#   3. Create a project on https://railway.com dashboard
#   4. Link project: railway link
#
# Frontend is deployed separately on Cloudflare Pages / Vercel / Netlify (free static hosting)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    log_error "Railway CLI is not installed."
    log_info "Install it with: npm install -g @railway/cli"
    log_info "Then login with: railway login"
    exit 1
fi

setup_project() {
    log_info "=== Railway Project Setup ==="
    log_info ""
    log_info "Follow these steps in the Railway dashboard (https://railway.com):"
    log_info ""
    log_info "1. Create a new project"
    log_info "2. Add a PostgreSQL database service"
    log_info "3. Note the DATABASE_URL from the PostgreSQL service variables"
    log_info ""
    log_info "Then set these environment variables on the backend service:"
    log_info "  DATABASE_URL     -> Auto-injected via Railway PostgreSQL reference (\${{Postgres.DATABASE_URL}})"
    log_info "  JWT_SECRET       -> Your JWT secret key"
    log_info "  NODE_ENV         -> production"
    log_info "  ALLOWED_ORIGINS  -> https://aravindbharathy.com,https://www.aravindbharathy.com"
    log_info "  PORT             -> 8080"
    log_info ""
    log_info "Optional variables:"
    log_info "  SENDGRID_API_KEY, RESEND_API_KEY  -> For contact form emails"
    log_info "  CONTACT_EMAIL                      -> Email to receive contact form messages"
    log_info ""
    log_info "After setup, link this directory to the project:"
    log_info "  cd backend && railway link"
    log_info ""
    log_info "Then deploy with:"
    log_info "  ./deploy-railway.sh backend"
}

deploy_backend() {
    log_info "Deploying backend to Railway..."

    cd backend

    # Deploy using Railway CLI
    railway up --detach

    log_info "Backend deployment initiated!"
    log_info "Check status at: https://railway.com/dashboard"
    log_info ""
    log_info "After deployment, get your backend URL and update:"
    log_info "  1. ALLOWED_ORIGINS env var if using a Railway-provided domain"
    log_info "  2. Frontend's VITE_API_URL to point to the Railway backend"

    cd ..
}

show_info() {
    log_info "=== Railway Deployment Architecture ==="
    log_info ""
    log_info "Backend (Railway - Hobby Plan):"
    log_info "  - Next.js API server + Prisma ORM"
    log_info "  - PostgreSQL database (Railway plugin)"
    log_info "  - Auto-migrations on container startup"
    log_info "  - Cost: ~\$0-5/month (within free credit)"
    log_info ""
    log_info "Frontend (Static Hosting - FREE):"
    log_info "  - Vite + React SPA → static files"
    log_info "  - Deploy to Cloudflare Pages, Vercel, or Netlify"
    log_info "  - Build command: cd frontend && npm install && npm run build"
    log_info "  - Output directory: frontend/dist"
    log_info "  - Set VITE_API_URL to your Railway backend URL"
    log_info ""
    log_info "Data Migration:"
    log_info "  1. Export: pg_dump -h <cloud-sql-ip> -U postgres -d portfolio > backup.sql"
    log_info "  2. Import: psql \$RAILWAY_DATABASE_URL < backup.sql"
    log_info ""
    log_info "Custom Domain Setup:"
    log_info "  - aravindbharathy.com → Static host (Cloudflare/Vercel)"
    log_info "  - api.aravindbharathy.com → Railway backend"
}

# Main script
case "${1}" in
    setup)
        setup_project
        ;;
    backend)
        deploy_backend
        ;;
    info)
        show_info
        ;;
    *)
        echo "Usage: $0 {setup|backend|info}"
        echo ""
        echo "Commands:"
        echo "  setup    - Show setup instructions for Railway"
        echo "  backend  - Deploy backend to Railway"
        echo "  info     - Show deployment architecture overview"
        exit 1
        ;;
esac
