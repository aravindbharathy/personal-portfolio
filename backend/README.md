# Portfolio Backend API

Backend API for the portfolio website built with Next.js, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod
- **Language**: TypeScript

## Prerequisites

- Node.js 20.0.0 or higher
- PostgreSQL 15 or higher
- npm 10.0.0 or higher

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- Other API keys and configuration as needed

### 3. Set Up Database

Initialize Prisma and create the database schema:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create database schema
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Database Management

### Run Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

### Create a New Migration

After modifying `prisma/schema.prisma`:

```bash
npm run db:migrate
```

### Reset Database

Warning: This will delete all data:

```bash
npm run db:reset
```

## API Documentation

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Authentication

Protected endpoints require a valid JWT token in an HTTP-only cookie. Obtain a token by logging in:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### Main Endpoints

#### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:slug` - Get project by slug
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

#### Publications
- `GET /api/publications` - List all publications
- `GET /api/publications/:slug` - Get publication by slug
- `POST /api/publications` - Create publication (admin)
- `POST /api/publications/sync` - Sync from external platforms (admin)

#### Guidebooks
- `GET /api/guidebooks` - List all guidebooks
- `GET /api/guidebooks/:slug` - Get guidebook with articles

#### Timeline
- `GET /api/timeline` - Get content timeline

#### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/categories` - Get tags grouped by category

#### Contact
- `POST /api/contact` - Send contact form message

For detailed API documentation, see `/Docs/architecture/api-architecture.md`

## Project Structure

```
backend/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API routes
│   │   └── layout.tsx  # Root layout
│   ├── lib/            # Shared utilities
│   ├── middleware/     # Custom middleware
│   ├── services/       # Business logic
│   ├── schemas/        # Zod validation schemas
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── tests/              # Test files
└── scripts/            # Utility scripts
```

## Development Workflow

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:

- `DATABASE_URL` - Production database connection
- `JWT_SECRET` - Secure random string
- `NODE_ENV=production`
- API keys for external services

### Database Migrations

Run migrations in production:

```bash
npm run db:migrate:prod
```

### Recommended Platforms

- **Vercel**: Zero-config deployment for Next.js
- **Railway**: Includes PostgreSQL database
- **Render**: Full-stack hosting
- **Fly.io**: Container-based deployment

## Sync External Content

Manually sync publications from Medium/Substack:

```bash
npm run sync:content
```

Or use the API endpoint (admin authenticated):

```bash
POST /api/publications/sync
```

## Common Tasks

### Add a New Admin User

```bash
# Using Prisma Studio
npm run db:studio
# Navigate to User table and add manually
```

Or use the API:

```bash
POST /api/auth/register
# (If you implement registration endpoint)
```

### Backup Database

```bash
# Using pg_dump
pg_dump -U username -d portfolio_db > backup.sql
```

### Restore Database

```bash
psql -U username -d portfolio_db < backup.sql
```

## Troubleshooting

### Prisma Client Not Found

```bash
npm run db:generate
```

### Migration Issues

```bash
# Reset and re-migrate
npm run db:reset
```

### Port Already in Use

Change the port in `package.json` dev script:

```json
"dev": "next dev -p 3001"
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Submit a pull request

## License

Private - All rights reserved

## Support

For issues and questions, contact the development team or create an issue in the repository.
