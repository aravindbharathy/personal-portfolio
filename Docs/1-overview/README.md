# Portfolio Project Overview

> A full-stack portfolio website showcasing user research expertise, professional projects, publications, and curated guidebooks.

## Quick Links

| Section | Description |
|---------|-------------|
| [Getting Started](./getting-started.md) | Set up and run the project in 5 minutes |
| [Tech Stack](./tech-stack.md) | Technology decisions and rationale |
| [Project Status](./project-status.md) | Current status, features, and roadmap |

## What is This?

This is a complete full-stack portfolio website designed for user research professionals to showcase their work, aggregate publications from external platforms (Medium, Substack), and create curated learning guides.

### Key Features

- **Research Projects** - Detailed case studies with methodology, findings, and impact
- **Publications** - Auto-sync articles from Medium and Substack
- **Guidebooks** - Curated collections of articles organized by theme
- **Admin Panel** - Complete content management system
- **Timeline Feed** - Unified activity stream on homepage
- **Tag System** - Categorized taxonomy for filtering and discovery

## Project Status

**Current Status**: Ready for Production

- Backend: 34 API endpoints
- Frontend: Complete admin panel and public pages
- Database: 11 models with full relationships
- Authentication: JWT with HTTP-only cookies
- Deployment: Vercel-ready with one-command deploy

## Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Shadcn/UI |
| Backend | Next.js 14 App Router + Prisma ORM |
| Database | PostgreSQL 15+ |
| Authentication | JWT (HTTP-only cookies) + bcrypt |
| Deployment | Vercel (frontend & backend) |

## Quick Start

```bash
# 1. Backend
cd backend && npm install && npm run dev

# 2. Frontend (new terminal)
cd frontend && npm install && npm run dev

# 3. Login at http://localhost:5173/login
# Email: admin@example.com | Password: changethispassword
```

Full setup instructions: [Getting Started Guide](./getting-started.md)

## Documentation Structure

### 1. Overview (You are here)
- [Getting Started](./getting-started.md)
- [Tech Stack](./tech-stack.md)
- [Project Status](./project-status.md)

### 2. Architecture
- [System Architecture](../2-architecture/README.md)
- [Database Schema](../2-architecture/database-schema.md)
- [API Design](../2-architecture/api-design.md)

### 3. Development
- [Setup Guide](../3-development/setup-local.md)
- [Coding Standards](../3-development/coding-standards.md)
- [Testing Guide](../3-development/testing-guide.md)

### 4. Features
- [Projects Feature](../4-features/projects-feature.md)
- [Publications Feature](../4-features/publications-feature.md)
- [Admin Panel](../4-features/admin-panel.md)

### 5. API Reference
- [Authentication](../5-api/authentication.md)
- [Projects API](../5-api/projects.md)
- [Publications API](../5-api/publications.md)

### 6. Deployment
- [Vercel Deployment](../6-deployment/vercel-deployment.md)
- [Environment Variables](../6-deployment/environment-variables.md)

### 7. Maintenance
- [Monitoring](../7-maintenance/monitoring.md)
- [Updates & Migrations](../7-maintenance/updates-migrations.md)

## Core Concepts

### Content Types

1. **Projects** - Your original research work
   - Full case study format
   - Methodology and findings
   - Business impact metrics
   - Visual artifacts support

2. **Publications** - External articles
   - Auto-sync from Medium/Substack
   - Manual entry for other sources
   - Tag-based organization

3. **Guidebooks** - Curated collections
   - Thematic article groups
   - Learning path creation
   - Target audience specification

### User Roles

- **Admin** - Full access to CMS, all CRUD operations
- **Public** - Read-only access to published content

### Data Flow

```
Content Creation → Admin Panel → API → Database → Public Site
```

## Security Features

- JWT authentication with HTTP-only cookies (XSS prevention)
- Password hashing with bcrypt
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- Rate limiting on sensitive endpoints
- CORS configuration

## Performance

- React Query caching (5-60 min based on content type)
- Database indexing on frequent queries
- Denormalized timeline table for fast homepage
- CDN edge caching for static assets
- Optimistic UI updates

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Project Statistics

- **Total Lines of Code**: ~10,000+
- **API Endpoints**: 34
- **Database Models**: 11
- **Services**: 6 (Project, Publication, Guidebook, Tag, Timeline, Email)
- **Validation Schemas**: 7
- **Admin Pages**: 5
- **Public Pages**: 3 (Home, Projects List, Project Detail)

## Development Team

- **Architecture**: Full-stack TypeScript
- **Design System**: Shadcn/UI + Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Hosting**: Vercel platform

## License

Private - All rights reserved

---

**Last Updated**: 2025-01-21
**Version**: 2.0
**Status**: Production Ready
