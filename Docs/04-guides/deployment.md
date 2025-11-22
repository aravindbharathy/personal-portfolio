# Deployment Architecture & Guide

## Overview

This document provides comprehensive deployment strategies and configurations for the portfolio website, covering both frontend and backend deployment across various platforms.

---

## Deployment Options

### Recommended Stack

```
┌─────────────────────────────────────────────┐
│           Production Architecture            │
└─────────────────────────────────────────────┘

Frontend (React/Vite)
├─ Vercel / Netlify / CloudFlare Pages
├─ CDN: Global edge network
└─ Static assets: Optimized and cached

Backend (Next.js)
├─ Vercel (recommended)
├─ Railway / Render (alternatives)
└─ Serverless functions

Database (PostgreSQL)
├─ Vercel Postgres (integrated)
├─ Supabase (free tier available)
├─ Neon (serverless PostgreSQL)
└─ Railway (included with backend)

File Storage
├─ Vercel Blob Storage
├─ Cloudinary
└─ AWS S3
```

---

## Option 1: Vercel (Recommended)

### Why Vercel?

- Zero-config Next.js deployment
- Integrated PostgreSQL database
- Automatic HTTPS and CDN
- Serverless functions
- Preview deployments for PRs
- Built-in analytics

### Frontend Deployment (Vite/React)

**1. Install Vercel CLI**

```bash
npm install -g vercel
```

**2. Configure vercel.json**

Create `/frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.vercel.app/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**3. Deploy**

```bash
cd frontend
vercel --prod
```

### Backend Deployment (Next.js)

**1. Configure vercel.json**

Create `/backend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  },
  "regions": ["iad1"]
}
```

**2. Set Environment Variables**

Via Vercel Dashboard or CLI:

```bash
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
```

**3. Deploy**

```bash
cd backend
vercel --prod
```

### Database Setup (Vercel Postgres)

**1. Create Database**

```bash
# Via Vercel Dashboard
# Storage → Create Database → Postgres

# Or via CLI
vercel postgres create portfolio-db
```

**2. Get Connection String**

```bash
vercel env pull .env.local
```

**3. Run Migrations**

```bash
npm run db:migrate:prod
```

**4. Seed Database**

```bash
npm run db:seed
```

### Complete Vercel Deployment Flow

```
Local Development
       │
       │ git push to GitHub
       ▼
┌─────────────────────────────────────┐
│         GitHub Repository            │
└────────────┬────────────────────────┘
             │
             │ Webhook trigger
             ▼
┌─────────────────────────────────────┐
│         Vercel Platform              │
│                                      │
│  1. Detect changes                  │
│  2. Install dependencies            │
│  3. Run build command               │
│  4. Run Prisma migrations           │
│  5. Deploy to edge network          │
│  6. Assign preview URL              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Production Deployment           │
│                                      │
│  Frontend: portfolio.vercel.app     │
│  Backend: portfolio-api.vercel.app  │
│  Database: Vercel Postgres          │
└─────────────────────────────────────┘
```

---

## Option 2: Railway

### Why Railway?

- Simple PostgreSQL integration
- Affordable pricing
- Easy environment management
- Automatic deployments from GitHub

### Setup

**1. Install Railway CLI**

```bash
npm install -g @railway/cli
```

**2. Initialize Project**

```bash
railway init
```

**3. Add PostgreSQL**

```bash
railway add postgresql
```

**4. Deploy Backend**

```bash
cd backend
railway up
```

**5. Configure Environment**

Railway automatically injects `DATABASE_URL`. Add other variables:

```bash
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

### Database Migrations on Railway

Add to `package.json`:

```json
{
  "scripts": {
    "railway:deploy": "npm run db:migrate:prod && npm run build && npm start"
  }
}
```

Configure in `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run railway:deploy",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Option 3: Render

### Backend Deployment

**1. Create `render.yaml`**

```yaml
services:
  - type: web
    name: portfolio-backend
    env: node
    buildCommand: npm install && npm run db:generate && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: portfolio-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production

databases:
  - name: portfolio-db
    databaseName: portfolio
    user: portfolio_user
    plan: free
```

**2. Deploy**

Connect GitHub repository in Render dashboard.

### Frontend Deployment

**1. Create Static Site**

- Build command: `npm run build`
- Publish directory: `dist`

**2. Environment Variables**

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## Environment Variables Management

### Required Variables

**Backend (.env)**

```env
# Critical
DATABASE_URL=
JWT_SECRET=
NODE_ENV=production

# External APIs
MEDIUM_API_KEY=
SUBSTACK_RSS_URL=

# File Upload
BLOB_READ_WRITE_TOKEN=

# Email
SENDGRID_API_KEY=
CONTACT_EMAIL=

# CORS
ALLOWED_ORIGINS=https://your-frontend.com
```

**Frontend (.env)**

```env
VITE_API_URL=https://your-backend.com
```

### Security Best Practices

1. **Never commit `.env` files**
2. **Use platform-specific secret management**:
   - Vercel: Environment Variables dashboard
   - Railway: `railway variables`
   - Render: Environment tab
3. **Rotate secrets regularly**
4. **Use different values per environment**

---

## Database Migration Strategy

### Development → Production

**1. Test Migration Locally**

```bash
# Create migration
npm run db:migrate

# Test rollback
npm run db:reset
npm run db:migrate
```

**2. Backup Production Database**

```bash
# For Postgres
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

**3. Run Migration in Production**

```bash
# Via deployment script
npm run db:migrate:prod

# Or manually
prisma migrate deploy
```

**4. Verify Migration**

```bash
prisma studio
```

### Rollback Strategy

If migration fails:

```bash
# Restore from backup
psql $DATABASE_URL < backup_20250120_120000.sql

# Or use Prisma migration rollback
prisma migrate resolve --rolled-back "20250120120000_migration_name"
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run type check
        run: |
          cd backend
          npm run type-check

      - name: Run tests
        run: |
          cd backend
          npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./backend
          vercel-args: '--prod'

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_FRONTEND_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'
```

---

## Performance Optimization

### Frontend Optimization

**1. Build Configuration**

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**2. Image Optimization**

- Use WebP format
- Implement lazy loading
- Serve via CDN
- Responsive images with `srcset`

**3. Caching Strategy**

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Backend Optimization

**1. Database Connection Pooling**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // For migrations
  relationMode = "prisma"
}
```

**2. API Response Caching**

```typescript
// src/app/api/projects/route.ts
export const revalidate = 300; // 5 minutes

export async function GET() {
  // Cache for 5 minutes
}
```

**3. Database Indexes**

Ensure all frequently queried fields have indexes (see `schema.prisma`).

---

## Monitoring & Logging

### Application Monitoring

**1. Vercel Analytics**

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**2. Sentry for Error Tracking**

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Database Monitoring

- Enable slow query logging
- Monitor connection pool usage
- Set up alerts for errors
- Track query performance

### Log Management

**Development**:
```typescript
console.log, console.error
```

**Production**:
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId });
logger.error('Database error', { error });
```

---

## Backup Strategy

### Automated Backups

**Vercel Postgres**:
- Automatic daily backups (included)
- Point-in-time recovery

**Railway**:
- Automatic backups on Pro plan
- Manual export via CLI

**Custom Solution**:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/

# Clean old backups (keep last 30 days)
find . -name "backup_*.sql" -mtime +30 -delete
```

Run as cron job:
```cron
0 2 * * * /path/to/backup.sh
```

---

## Disaster Recovery

### Recovery Checklist

1. **Database Corruption**:
   - Restore from latest backup
   - Verify data integrity
   - Re-run migrations if needed

2. **Deployment Failure**:
   - Rollback to previous version
   - Check logs for errors
   - Fix issues and redeploy

3. **Data Loss**:
   - Restore from backup
   - Identify missing transactions
   - Manual data recovery if needed

### Rollback Procedure

**Vercel**:
```bash
vercel rollback
```

**Railway**:
```bash
railway rollback
```

**Manual**:
```bash
git revert <commit-hash>
git push
```

---

## SSL/TLS Configuration

### Automatic SSL (Recommended)

- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- Railway: Automatic HTTPS
- Render: Automatic HTTPS

### Custom Domain

**1. Add Domain in Platform Dashboard**

**2. Configure DNS**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

**3. Verify SSL Certificate**

Check at: `https://www.ssllabs.com/ssltest/`

---

## Cost Estimation

### Free Tier Options

**Vercel**:
- Hobby: Free (1 user, 100 GB bandwidth/month)
- Pro: $20/month per user

**Railway**:
- Free: $5 credit/month
- Developer: $10/month

**Supabase**:
- Free: 500 MB database, 1 GB file storage
- Pro: $25/month

### Recommended Setup (Budget-Friendly)

- Frontend: Vercel Free
- Backend: Railway Developer ($10/month)
- Database: Included with Railway
- File Storage: Vercel Blob Free tier

**Total**: ~$10/month

### Production Setup

- Frontend: Vercel Pro ($20/month)
- Backend: Vercel Pro ($20/month)
- Database: Vercel Postgres ($20/month)
- File Storage: Cloudinary Pro ($89/month)
- Monitoring: Sentry Team ($26/month)

**Total**: ~$175/month

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Monitoring set up

### Deployment

- [ ] Database backup created
- [ ] Run migrations in production
- [ ] Deploy backend
- [ ] Verify backend health
- [ ] Deploy frontend
- [ ] Verify frontend-backend connection
- [ ] Test critical flows
- [ ] Check monitoring dashboards

### Post-Deployment

- [ ] Verify all pages load
- [ ] Test API endpoints
- [ ] Check error rates
- [ ] Monitor performance metrics
- [ ] Set up alerts
- [ ] Document deployment
- [ ] Notify team

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
# Prisma logs
```

**2. Build Failures**

```bash
# Clear cache
vercel --force

# Check build logs
vercel logs

# Local build test
npm run build
```

**3. Environment Variable Issues**

```bash
# List all variables
vercel env ls

# Pull latest
vercel env pull

# Verify in code
console.log(process.env.DATABASE_URL ? 'Set' : 'Not set')
```

---

## Conclusion

This deployment architecture provides:

- **Flexibility**: Multiple platform options
- **Scalability**: Serverless functions auto-scale
- **Reliability**: Automatic backups and monitoring
- **Security**: HTTPS, environment variables, secret management
- **Performance**: CDN, caching, optimizations
- **Cost-Effective**: Free tier options available

Choose the deployment strategy that best fits your budget, technical requirements, and team expertise.
