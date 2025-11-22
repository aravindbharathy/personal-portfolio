# Backend Setup Guide

This guide will help you set up and run the portfolio backend.

## Prerequisites

Before you begin, make sure you have installed:

- **Node.js** 20.0.0 or higher
- **npm** 10.0.0 or higher
- **PostgreSQL** 15 or higher

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` and configure the following variables:

### Required Variables

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_db"

# JWT Secret - Generate a secure random string
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

### How to Generate JWT_SECRET

On macOS/Linux:
```bash
openssl rand -base64 32
```

On Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Optional Variables

```env
# Admin credentials for initial setup
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="changethispassword"

# External API integrations (optional)
MEDIUM_API_KEY=""
SUBSTACK_RSS_URL=""

# Email service (optional)
SENDGRID_API_KEY=""
CONTACT_EMAIL="your-email@example.com"
```

## Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL:
   - **macOS**: `brew install postgresql@15`
   - **Ubuntu**: `sudo apt-get install postgresql-15`
   - **Windows**: Download from postgresql.org

2. Start PostgreSQL:
   - **macOS**: `brew services start postgresql@15`
   - **Ubuntu**: `sudo systemctl start postgresql`

3. Create a database:
```bash
createdb portfolio_db
```

4. Update `DATABASE_URL` in `.env` with your connection string

### Option B: Cloud Database (Recommended for Production)

Use one of these managed PostgreSQL services:

- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app (Includes database)

## Step 4: Initialize Database

Run the automated setup script:

```bash
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed initial data
```

Or use the all-in-one setup script:

```bash
npx tsx scripts/setup-db.ts
```

This will:
- Generate the Prisma Client
- Create database tables
- Seed with initial data (admin user, sample tags, sample project)

## Step 5: Start Development Server

```bash
npm run dev
```

The API will be available at: **http://localhost:3000**

Visit http://localhost:3000 to see the API documentation page.

## Step 6: Test the API

### Using the Admin Credentials

The seeded database includes an admin user:

- **Email**: `admin@example.com` (or your `ADMIN_EMAIL`)
- **Password**: `changethispassword` (or your `ADMIN_PASSWORD`)

### Login Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changethispassword"}'
```

### Get Projects

```bash
curl http://localhost:3000/api/projects
```

### Get Timeline

```bash
curl http://localhost:3000/api/timeline
```

## Database Management

### View Database (Prisma Studio)

```bash
npm run db:studio
```

This opens a visual database browser at http://localhost:5555

### Create a New Migration

After modifying `prisma/schema.prisma`:

```bash
npm run db:migrate
```

### Reset Database (⚠️ Deletes All Data)

```bash
npm run db:reset
```

## Common Issues & Solutions

### Issue: "DATABASE_URL environment variable not found"

**Solution**: Make sure you have a `.env` file with `DATABASE_URL` configured.

### Issue: "Cannot connect to database"

**Solutions**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify connection string in `.env`
3. Ensure database exists: `createdb portfolio_db`
4. Check PostgreSQL logs for errors

### Issue: Prisma Client errors

**Solution**: Regenerate the Prisma Client:
```bash
npm run db:generate
```

### Issue: Port 3000 already in use

**Solution**: Change the port:
```bash
# In package.json, update dev script:
"dev": "next dev -p 3001"
```

## Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Homepage
│   ├── lib/              # Core utilities
│   ├── services/         # Business logic
│   ├── middleware/       # Auth, rate limiting
│   ├── schemas/          # Zod validation
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── scripts/              # Utility scripts
```

## Next Steps

1. **Change Admin Password**: After first login, update the admin password
2. **Configure Email**: Set up email service for contact form (SendGrid/Resend)
3. **Add Content**: Create projects, publications, and guidebooks
4. **Deploy**: Follow `/Docs/architecture/deployment.md` for production deployment

## Documentation

- **API Documentation**: `/Docs/architecture/api-architecture.md`
- **Database Schema**: `/Docs/architecture/database-schema.md`
- **Deployment Guide**: `/Docs/architecture/deployment.md`
- **Full Architecture**: `/Docs/architecture/README.md`

## Getting Help

1. Check the documentation in `/Docs/architecture/`
2. Review the code comments
3. Check Prisma logs: `npm run db:studio`
4. Verify environment variables

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Update `ADMIN_PASSWORD`
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up email service
- [ ] Enable HTTPS
- [ ] Configure CORS (`ALLOWED_ORIGINS`)
- [ ] Set up monitoring (Sentry)
- [ ] Configure backups
- [ ] Review security headers in `next.config.js`

## Support

For issues or questions:
1. Check this setup guide
2. Review documentation in `/Docs/`
3. Check backend README.md
4. Contact the development team

---

**Happy coding! 🚀**
