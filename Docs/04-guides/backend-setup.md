# Backend Folder Structure

## Overview

This document outlines the recommended folder structure for the Next.js backend with Prisma ORM.

## Directory Structure

```
portfolio/
├── backend/                          # Backend Next.js application
│   ├── .env                          # Environment variables (not in git)
│   ├── .env.example                  # Example environment variables
│   ├── .gitignore                    # Git ignore rules
│   ├── package.json                  # Dependencies and scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.js                # Next.js configuration
│   ├── .eslintrc.json                # ESLint configuration
│   ├── prettier.config.js            # Prettier configuration
│   │
│   ├── prisma/                       # Prisma ORM files
│   │   ├── schema.prisma             # Database schema definition
│   │   ├── seed.ts                   # Database seeding script
│   │   └── migrations/               # Database migrations
│   │       └── [timestamp]_init/     # Initial migration
│   │           └── migration.sql
│   │
│   ├── public/                       # Static assets
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/                          # Source code
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── globals.css           # Global styles
│   │   │   │
│   │   │   ├── api/                  # API routes
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── route.ts  # POST /api/auth/login
│   │   │   │   │   ├── logout/
│   │   │   │   │   │   └── route.ts  # POST /api/auth/logout
│   │   │   │   │   └── session/
│   │   │   │   │       └── route.ts  # GET /api/auth/session
│   │   │   │   │
│   │   │   │   ├── projects/
│   │   │   │   │   ├── route.ts      # GET, POST /api/projects
│   │   │   │   │   ├── featured/
│   │   │   │   │   │   └── route.ts  # GET /api/projects/featured
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── route.ts  # GET /api/projects/:slug
│   │   │   │   │
│   │   │   │   ├── publications/
│   │   │   │   │   ├── route.ts      # GET, POST /api/publications
│   │   │   │   │   ├── featured/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── sync/
│   │   │   │   │   │   └── route.ts  # POST /api/publications/sync
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── guidebooks/
│   │   │   │   │   ├── route.ts      # GET, POST /api/guidebooks
│   │   │   │   │   ├── featured/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── route.ts
│   │   │   │   │       └── articles/
│   │   │   │   │           └── route.ts
│   │   │   │   │
│   │   │   │   ├── timeline/
│   │   │   │   │   └── route.ts      # GET /api/timeline
│   │   │   │   │
│   │   │   │   ├── tags/
│   │   │   │   │   ├── route.ts      # GET, POST /api/tags
│   │   │   │   │   └── categories/
│   │   │   │   │       └── route.ts  # GET /api/tags/categories
│   │   │   │   │
│   │   │   │   ├── contact/
│   │   │   │   │   └── route.ts      # POST /api/contact
│   │   │   │   │
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts      # POST /api/upload
│   │   │   │   │
│   │   │   │   └── admin/
│   │   │   │       ├── stats/
│   │   │   │       │   └── route.ts  # GET /api/admin/stats
│   │   │   │       └── recent-activity/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── admin/                # Admin pages (optional)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   ├── projects/
│   │   │   │   ├── publications/
│   │   │   │   └── guidebooks/
│   │   │   │
│   │   │   └── (frontend-routes)/   # Optional: Server components for frontend
│   │   │       ├── projects/
│   │   │       ├── publications/
│   │   │       └── guidebooks/
│   │   │
│   │   ├── lib/                      # Shared utilities and configurations
│   │   │   ├── prisma.ts             # Prisma client singleton
│   │   │   ├── auth.ts               # Authentication utilities
│   │   │   ├── jwt.ts                # JWT token helpers
│   │   │   ├── bcrypt.ts             # Password hashing
│   │   │   ├── slugify.ts            # Slug generation
│   │   │   ├── validation.ts         # Common validation utilities
│   │   │   ├── cache.ts              # Caching utilities
│   │   │   ├── rate-limit.ts         # Rate limiting
│   │   │   └── logger.ts             # Logging configuration
│   │   │
│   │   ├── middleware/               # Express-style middleware
│   │   │   ├── auth.middleware.ts    # Authentication middleware
│   │   │   ├── error.middleware.ts   # Error handling middleware
│   │   │   ├── cors.middleware.ts    # CORS configuration
│   │   │   └── validation.middleware.ts # Request validation
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── project.service.ts    # Project-related business logic
│   │   │   ├── publication.service.ts # Publication business logic
│   │   │   ├── guidebook.service.ts  # Guidebook business logic
│   │   │   ├── timeline.service.ts   # Timeline aggregation
│   │   │   ├── tag.service.ts        # Tag management
│   │   │   ├── sync.service.ts       # External content sync
│   │   │   ├── email.service.ts      # Email sending
│   │   │   └── upload.service.ts     # File upload handling
│   │   │
│   │   ├── repositories/             # Data access layer (optional pattern)
│   │   │   ├── project.repository.ts
│   │   │   ├── publication.repository.ts
│   │   │   ├── guidebook.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── tag.repository.ts
│   │   │
│   │   ├── schemas/                  # Zod validation schemas
│   │   │   ├── auth.schema.ts        # Auth request schemas
│   │   │   ├── project.schema.ts     # Project schemas
│   │   │   ├── publication.schema.ts # Publication schemas
│   │   │   ├── guidebook.schema.ts   # Guidebook schemas
│   │   │   ├── tag.schema.ts         # Tag schemas
│   │   │   └── contact.schema.ts     # Contact form schema
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── index.ts              # Exported types
│   │   │   ├── api.types.ts          # API request/response types
│   │   │   ├── auth.types.ts         # Auth-related types
│   │   │   ├── prisma.types.ts       # Extended Prisma types
│   │   │   └── env.d.ts              # Environment variable types
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── api-response.ts       # Standard API response helpers
│   │   │   ├── error-handler.ts      # Error handling utilities
│   │   │   ├── pagination.ts         # Pagination helpers
│   │   │   ├── date.ts               # Date formatting utilities
│   │   │   └── string.ts             # String manipulation
│   │   │
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.ts           # Database configuration
│   │   │   ├── cors.ts               # CORS configuration
│   │   │   ├── jwt.ts                # JWT configuration
│   │   │   └── constants.ts          # App-wide constants
│   │   │
│   │   └── integrations/             # Third-party integrations
│   │       ├── medium.ts             # Medium API client
│   │       ├── substack.ts           # Substack RSS parser
│   │       ├── cloudinary.ts         # Image upload (if using Cloudinary)
│   │       ├── sendgrid.ts           # Email service (if using SendGrid)
│   │       └── vercel-blob.ts        # Vercel Blob storage
│   │
│   ├── tests/                        # Test files
│   │   ├── unit/                     # Unit tests
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── lib/
│   │   │
│   │   ├── integration/              # Integration tests
│   │   │   └── api/
│   │   │       ├── auth.test.ts
│   │   │       ├── projects.test.ts
│   │   │       └── publications.test.ts
│   │   │
│   │   ├── e2e/                      # End-to-end tests
│   │   │   └── flows/
│   │   │
│   │   ├── fixtures/                 # Test data
│   │   │   ├── projects.ts
│   │   │   ├── publications.ts
│   │   │   └── users.ts
│   │   │
│   │   └── setup.ts                  # Test configuration
│   │
│   └── scripts/                      # Utility scripts
│       ├── setup-db.ts               # Database setup script
│       ├── migrate-data.ts           # Data migration scripts
│       ├── sync-content.ts           # Manual content sync
│       └── generate-sitemap.ts       # Sitemap generation
│
├── frontend/                         # Existing frontend (Vite + React)
│   └── ... (your existing structure)
│
└── Docs/                             # Documentation
    ├── What/
    │   └── vision.md
    └── architecture/
        ├── system-architecture.md
        ├── database-schema.md
        ├── api-architecture.md
        ├── data-flow.md
        └── backend-structure.md
```

## Key File Purposes

### Configuration Files

**package.json**
- Dependencies (Prisma, Next.js, Zod, bcrypt, jsonwebtoken, etc.)
- Scripts (dev, build, start, migrate, seed, test)
- Type declarations

**tsconfig.json**
- TypeScript compiler options
- Path aliases (@/ for src/)
- Strict mode enabled

**next.config.js**
- API routes configuration
- Environment variables
- Image optimization
- CORS settings

**prisma/schema.prisma**
- Database schema
- Models and relations
- Prisma client configuration

### Core Files

**src/lib/prisma.ts**
- Singleton Prisma client instance
- Connection pooling configuration
- Development vs production setup

**src/lib/auth.ts**
- JWT token generation/verification
- Password hashing/comparison
- Session management

**src/middleware/auth.middleware.ts**
- Protected route authentication
- JWT token validation
- User context injection

**src/utils/api-response.ts**
- Standard response formatters
- Success/error response helpers
- Consistent API responses

### Service Layer Pattern

Services contain business logic and orchestrate data access:

```typescript
// src/services/project.service.ts
export class ProjectService {
  async createProject(data: CreateProjectInput, userId: string) {
    // Business logic
    // Validation
    // Data transformation
    // Database operations via Prisma
  }

  async publishProject(projectId: string) {
    // Update project status
    // Add to timeline
    // Invalidate caches
  }
}
```

### Repository Layer Pattern (Optional)

Repositories handle data access only:

```typescript
// src/repositories/project.repository.ts
export class ProjectRepository {
  async findBySlug(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      include: { tags: true, images: true }
    });
  }

  async create(data: ProjectData) {
    return prisma.project.create({ data });
  }
}
```

## Environment Variables

**.env.example**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"

# External APIs
MEDIUM_API_KEY="your-medium-api-key"
SUBSTACK_RSS_URL="your-substack-rss-url"

# File Upload
UPLOAD_MAX_SIZE="5242880" # 5MB
VERCEL_BLOB_READ_WRITE_TOKEN="your-token"

# Email
SENDGRID_API_KEY="your-sendgrid-api-key"
CONTACT_EMAIL="your-email@example.com"

# Rate Limiting
RATE_LIMIT_PUBLIC="100"
RATE_LIMIT_AUTH="500"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## Scripts in package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",

    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:push": "prisma db push",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",

    "sync:content": "tsx scripts/sync-content.ts",
    "generate:sitemap": "tsx scripts/generate-sitemap.ts"
  }
}
```

## Import Path Aliases

**tsconfig.json**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/services/*": ["./src/services/*"],
      "@/schemas/*": ["./src/schemas/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/middleware/*": ["./src/middleware/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

## Testing Structure

- **Unit tests**: Test individual functions and utilities
- **Integration tests**: Test API endpoints with test database
- **E2E tests**: Test complete user flows

## Best Practices

1. **Separation of Concerns**:
   - Routes handle HTTP requests/responses only
   - Services contain business logic
   - Repositories handle data access
   - Utilities are pure functions

2. **Type Safety**:
   - Use Zod for runtime validation
   - Generate types from Prisma schema
   - Define API types explicitly

3. **Error Handling**:
   - Use custom error classes
   - Centralized error middleware
   - Consistent error responses

4. **Security**:
   - Environment variables for secrets
   - JWT for authentication
   - Rate limiting on all endpoints
   - Input validation on all routes

5. **Performance**:
   - Database connection pooling
   - Query optimization
   - Caching strategies
   - Pagination for lists

## Next Steps

1. Initialize Next.js project: `npx create-next-app@latest backend --typescript`
2. Install dependencies: `npm install prisma @prisma/client zod bcrypt jsonwebtoken`
3. Initialize Prisma: `npx prisma init`
4. Copy database schema to `prisma/schema.prisma`
5. Create initial migration: `npx prisma migrate dev --name init`
6. Set up folder structure as outlined
7. Implement core API routes
8. Add authentication middleware
9. Create service layer
10. Set up testing infrastructure
