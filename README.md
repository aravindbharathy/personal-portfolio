# Portfolio Website

> A full-stack portfolio website showcasing user research expertise, professional projects, publications, and curated guidebooks.

**Status**: ✅ **Implementation Complete** - Backend and frontend integrated, ready for use!

## Quick Start

```bash
# 1. Start backend
cd backend && npm install && npm run dev

# 2. Start frontend (new terminal)
cd frontend && npm install && npm run dev

# 3. Login to admin panel
# Visit: http://localhost:5173/login
# Email: admin@example.com
# Password: changethispassword
```

📖 **[Full Getting Started Guide](./Docs/guides/getting-started.md)**

## What's Built

### ✅ Backend (Next.js + Prisma + PostgreSQL)
- **34 API endpoints** - Complete RESTful API
- **JWT Authentication** - Secure admin access
- **6 Services** - Projects, Publications, Guidebooks, Tags, Timeline, Email
- **11 Database Models** - Full relational schema with indexes
- **Zod Validation** - Type-safe input validation
- **Rate Limiting** - Protection on sensitive endpoints
- **Database Seeding** - Sample data included

### ✅ Frontend (React + Vite + TypeScript)
- **Admin Panel** - Complete content management system
- **Custom Hooks** - React Query integration for all entities
- **Protected Routes** - Authentication-based access control
- **Responsive UI** - Mobile-first design with Shadcn/UI
- **Real-time Updates** - Optimistic updates and caching
- **Toast Notifications** - User feedback for all actions

### ✅ Integration Complete
- Frontend ↔️ Backend communication working
- Authentication with HTTP-only cookies
- CORS configured correctly
- Environment variables set up
- Database migrated and seeded

## Project Structure

```
portfolio/
├── backend/                   # Next.js API + Prisma ORM
│   ├── src/
│   │   ├── app/api/          # 34 API endpoints
│   │   ├── services/         # Business logic layer
│   │   ├── schemas/          # Zod validation schemas
│   │   └── lib/              # Auth, database, utilities
│   └── prisma/
│       ├── schema.prisma     # Database schema (11 models)
│       └── seed.ts           # Sample data
│
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/            # Public pages + Admin panel
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # Auth context
│   │   └── lib/              # API client
│   └── .env                  # API URL config
│
└── Docs/                      # Documentation
    ├── architecture/         # Technical architecture
    │   ├── README.md         # Documentation hub
    │   ├── system-architecture.md
    │   └── database-schema.md
    ├── reference/            # API reference
    │   └── api-endpoints.md
    └── guides/               # Setup & deployment
        ├── getting-started.md
        ├── backend-setup.md
        ├── deployment.md
        └── implementation-guide.md
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18 · Vite 5 · TypeScript · Tailwind CSS · Shadcn/UI |
| **State Management** | React Query · Context API |
| **Backend** | Next.js 14 App Router · TypeScript |
| **Database** | PostgreSQL 15 · Prisma ORM 5 |
| **Authentication** | JWT (HTTP-only cookies) · bcrypt |
| **Validation** | Zod schemas |
| **Deployment** | Vercel (recommended) |

## Key Features

### Admin Panel
- **Dashboard** - Statistics overview
- **Projects** - Create, edit, delete, publish/unpublish research case studies
- **Publications** - Manage articles from Medium/Substack
- **Guidebooks** - Curate article collections
- **Tags** - Organize content by categories

### Public Site
- **Timeline** - Latest activity across all content
- **Featured Projects** - Highlighted research work
- **Publications** - Articles with external links
- **Guidebooks** - Curated learning paths
- **Responsive Design** - Mobile and desktop optimized

## API Endpoints

| Category | Endpoints |
|----------|-----------|
| **Auth** | Login, Logout, Session |
| **Projects** | List, Create, Read, Update, Delete, Publish, Featured |
| **Publications** | List, Create, Read, Update, Delete, Featured, Sync |
| **Guidebooks** | List, Create, Read, Update, Delete, Articles |
| **Tags** | List, Create, By Category |
| **Timeline** | Get unified content timeline |
| **Admin** | Dashboard statistics |
| **Contact** | Submit contact form |

📖 **[Complete API Reference](./Docs/reference/api-endpoints.md)**

## Documentation

### Start Here
- 📘 **[Getting Started Guide](./Docs/guides/getting-started.md)** - Quick start in 5 minutes
- 🏗️ **[System Architecture](./Docs/architecture/system-architecture.md)** - System design with Mermaid diagrams
- 🗄️ **[Database Schema](./Docs/architecture/database-schema.md)** - Complete ERD and data model
- 🚀 **[Deployment Guide](./Docs/guides/deployment.md)** - Production deployment instructions

### All Documentation
- **[Documentation Hub](./Docs/architecture/README.md)** - Complete documentation index
- **[API Reference](./Docs/reference/api-endpoints.md)** - All 34 endpoints documented
- **[Backend Setup](./Docs/guides/backend-setup.md)** - Folder structure and configuration
- **[Implementation Guide](./Docs/guides/implementation-guide.md)** - Implementation checklist
- **[Vision Document](./Docs/What/vision.md)** - Product requirements and goals

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Environment Setup

**Backend `.env`:**
```bash
DATABASE_URL="postgresql://username@localhost:5432/portfolio_db"
JWT_SECRET="your-secret-key"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:8081"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="changethispassword"
```

**Frontend `.env`:**
```bash
VITE_API_URL=http://localhost:3000
```

### Run Development Servers

```bash
# Backend (Terminal 1)
cd backend
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
# → http://localhost:3000

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Useful Commands

```bash
# Database
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:seed          # Seed sample data
npx prisma migrate dev   # Create migration

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
```

## Default Admin Credentials

```
Email: admin@example.com
Password: changethispassword
```

⚠️ **Change these immediately after first login!**

## Security Features

- ✅ JWT tokens in HTTP-only cookies (XSS prevention)
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Protected API routes with middleware
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Prisma
- ✅ Rate limiting on sensitive endpoints

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd backend && vercel --prod

# Deploy frontend
cd frontend && vercel --prod
```

**After deployment:**
1. Add environment variables in Vercel dashboard
2. Update `VITE_API_URL` to production backend URL
3. Update `ALLOWED_ORIGINS` to include production frontend URL
4. Connect PostgreSQL database (Vercel Postgres, Supabase, or Neon)

📖 **[Complete Deployment Guide](./Docs/guides/deployment.md)**

## Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` in backend `.env` includes frontend URL
- Restart backend after changing `.env`

### Authentication Issues
- Clear browser cookies
- Verify `JWT_SECRET` is set in backend `.env`

### Database Connection
- Check `DATABASE_URL` format in backend `.env`
- Ensure PostgreSQL is running: `psql -l`
- Run migrations: `npx prisma migrate dev`

### Data Not Loading
- Check browser console for errors
- Verify backend is running: http://localhost:3000/api/timeline
- Re-seed database: `npm run db:seed`

📖 **[Full Troubleshooting Guide](./Docs/guides/getting-started.md#troubleshooting)**

## What's Next

### Immediate Tasks
1. ✅ Backend implementation - **Complete**
2. ✅ Frontend integration - **Complete**
3. ✅ Admin panel - **Complete**
4. 🔄 Add your content via admin panel
5. 🎨 Customize styling and branding
6. 🚀 Deploy to production

### Optional Enhancements
- [ ] Implement Medium/Substack auto-sync
- [ ] Set up email service (SendGrid/Resend)
- [ ] Add file upload for project images
- [ ] Implement full-text search
- [ ] Add analytics integration
- [ ] Set up error monitoring (Sentry)

## Project Statistics

- **Lines of Code**: ~10,000+
- **API Endpoints**: 34
- **Database Models**: 11
- **Services**: 6
- **Validation Schemas**: 7
- **Admin Pages**: 5
- **Documentation Pages**: 10+

## Contributing

1. Review [Architecture Documentation](./Docs/architecture/)
2. Follow TypeScript and ESLint guidelines
3. Write tests for new features
4. Update documentation as needed

## License

Private - All rights reserved

---

## Support

- 📖 **Documentation**: [/Docs/architecture/README.md](./Docs/architecture/README.md)
- 🚀 **Getting Started**: [/Docs/guides/getting-started.md](./Docs/guides/getting-started.md)
- 🏗️ **Architecture**: [/Docs/architecture/system-architecture.md](./Docs/architecture/system-architecture.md)
- 📚 **API Reference**: [/Docs/reference/api-endpoints.md](./Docs/reference/api-endpoints.md)

---

**Built with ❤️ for User Research Professionals**

Last Updated: 2025-01-21 | Status: Ready for Production 🚀
