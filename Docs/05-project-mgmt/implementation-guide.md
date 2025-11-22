# Portfolio Website - Implementation Checklist

This checklist provides a step-by-step guide to implementing the portfolio website based on the architecture documentation.

---

## Phase 1: Project Setup & Configuration

### Backend Setup
- [ ] Initialize Next.js project
  ```bash
  npx create-next-app@latest backend --typescript --app --no-src
  ```
- [ ] Install dependencies
  ```bash
  cd backend
  npm install @prisma/client prisma zod bcrypt jsonwebtoken
  npm install -D @types/bcrypt @types/jsonwebtoken tsx
  ```
- [ ] Copy Prisma schema from `/backend/prisma/schema.prisma`
- [ ] Initialize Prisma
  ```bash
  npx prisma init
  ```
- [ ] Create `.env` file from `.env.example`
- [ ] Configure `DATABASE_URL` in `.env`
- [ ] Copy configuration files:
  - [ ] `tsconfig.json`
  - [ ] `next.config.js`
  - [ ] `.gitignore`

### Database Setup
- [ ] Set up PostgreSQL database (local or cloud)
- [ ] Run initial migration
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] Generate Prisma Client
  ```bash
  npx prisma generate
  ```
- [ ] Create seed file (`prisma/seed.ts`)
- [ ] Run seed to populate initial data
  ```bash
  npm run db:seed
  ```

### Frontend Setup (Already Exists)
- [ ] Verify existing frontend at `/frontend`
- [ ] Update environment variables
- [ ] Configure API base URL to point to backend

---

## Phase 2: Core Backend Implementation

### Infrastructure Layer

#### Create Prisma Client Singleton
- [ ] Create `/src/lib/prisma.ts`
  ```typescript
  import { PrismaClient } from '@prisma/client';

  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['query', 'error', 'warn'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  ```

#### Authentication Utilities
- [ ] Create `/src/lib/auth.ts`
  - [ ] `hashPassword()` function using bcrypt
  - [ ] `comparePassword()` function
  - [ ] `generateToken()` function using JWT
  - [ ] `verifyToken()` function

#### Helper Utilities
- [ ] Create `/src/lib/slugify.ts` - Generate URL-friendly slugs
- [ ] Create `/src/utils/api-response.ts` - Standard response formatters
- [ ] Create `/src/utils/error-handler.ts` - Error handling utilities
- [ ] Create `/src/utils/pagination.ts` - Pagination helpers

### Validation Schemas (Zod)

- [ ] Create `/src/schemas/auth.schema.ts`
  - [ ] Login schema
  - [ ] Session validation

- [ ] Create `/src/schemas/project.schema.ts`
  - [ ] Create project schema
  - [ ] Update project schema
  - [ ] Query parameters schema

- [ ] Create `/src/schemas/publication.schema.ts`
  - [ ] Create publication schema
  - [ ] Sync request schema

- [ ] Create `/src/schemas/guidebook.schema.ts`
  - [ ] Create guidebook schema
  - [ ] Add article schema

- [ ] Create `/src/schemas/tag.schema.ts`
- [ ] Create `/src/schemas/contact.schema.ts`

### Middleware

- [ ] Create `/src/middleware/auth.middleware.ts`
  - [ ] Extract JWT from cookie
  - [ ] Verify token
  - [ ] Attach user to request
  - [ ] Handle unauthorized access

- [ ] Create `/src/middleware/error.middleware.ts`
  - [ ] Global error handler
  - [ ] Error logging
  - [ ] Consistent error responses

---

## Phase 3: API Endpoints Implementation

### Authentication Endpoints

- [ ] `POST /api/auth/login`
  - [ ] Validate credentials
  - [ ] Generate JWT token
  - [ ] Set HTTP-only cookie
  - [ ] Return user data

- [ ] `POST /api/auth/logout`
  - [ ] Clear auth cookie
  - [ ] Return success response

- [ ] `GET /api/auth/session`
  - [ ] Check authentication
  - [ ] Return user data if authenticated

### Project Endpoints

- [ ] `GET /api/projects`
  - [ ] List all published projects
  - [ ] Implement filtering (researchType, industry, tag)
  - [ ] Implement pagination
  - [ ] Implement sorting

- [ ] `GET /api/projects/featured`
  - [ ] Return featured projects only

- [ ] `GET /api/projects/[slug]`
  - [ ] Get single project by slug
  - [ ] Include tags, images, author
  - [ ] Return 404 if not found

- [ ] `POST /api/projects` (Admin)
  - [ ] Validate request body
  - [ ] Generate slug from title
  - [ ] Create project with transaction
  - [ ] Create associated tags and images
  - [ ] Return created project

- [ ] `PUT /api/projects/[id]` (Admin)
  - [ ] Validate request body
  - [ ] Update project
  - [ ] Update tags and images
  - [ ] Return updated project

- [ ] `DELETE /api/projects/[id]` (Admin)
  - [ ] Delete project (cascades to tags and images)
  - [ ] Return success response

- [ ] `PATCH /api/projects/[id]/publish` (Admin)
  - [ ] Toggle publish status
  - [ ] Add to/remove from timeline
  - [ ] Invalidate caches

### Publication Endpoints

- [ ] `GET /api/publications`
  - [ ] List all publications
  - [ ] Filter by platform, tags
  - [ ] Implement search
  - [ ] Pagination and sorting

- [ ] `GET /api/publications/featured`
  - [ ] Return featured publications

- [ ] `GET /api/publications/[slug]`
  - [ ] Get single publication
  - [ ] Include tags

- [ ] `POST /api/publications` (Admin)
  - [ ] Create publication
  - [ ] Handle tags

- [ ] `POST /api/publications/sync` (Admin)
  - [ ] Fetch from Medium API
  - [ ] Fetch from Substack RSS
  - [ ] Upsert publications
  - [ ] Return sync summary

- [ ] `PUT /api/publications/[id]` (Admin)
  - [ ] Update publication

- [ ] `DELETE /api/publications/[id]` (Admin)
  - [ ] Delete publication

### Guidebook Endpoints

- [ ] `GET /api/guidebooks`
  - [ ] List all guidebooks
  - [ ] Filter and sort

- [ ] `GET /api/guidebooks/featured`
  - [ ] Return featured guidebooks

- [ ] `GET /api/guidebooks/[slug]`
  - [ ] Get guidebook with articles
  - [ ] Include full publication data
  - [ ] Order articles correctly

- [ ] `POST /api/guidebooks` (Admin)
  - [ ] Create guidebook

- [ ] `POST /api/guidebooks/[id]/articles` (Admin)
  - [ ] Add article to guidebook
  - [ ] Handle ordering

- [ ] `PUT /api/guidebooks/[id]` (Admin)
  - [ ] Update guidebook

- [ ] `DELETE /api/guidebooks/[id]` (Admin)
  - [ ] Delete guidebook

### Timeline Endpoint

- [ ] `GET /api/timeline`
  - [ ] Fetch from ContentTimeline table
  - [ ] Filter by contentType, tags
  - [ ] Pagination
  - [ ] Sort by date descending

### Tag Endpoints

- [ ] `GET /api/tags`
  - [ ] List all tags
  - [ ] Filter by category
  - [ ] Include usage count

- [ ] `GET /api/tags/categories`
  - [ ] Return tags grouped by category

- [ ] `POST /api/tags` (Admin)
  - [ ] Create new tag

### Contact Endpoint

- [ ] `POST /api/contact`
  - [ ] Validate form data
  - [ ] Send email
  - [ ] Rate limiting (5 per hour per IP)
  - [ ] Return success response

### Admin Endpoints

- [ ] `GET /api/admin/stats` (Admin)
  - [ ] Count projects, publications, guidebooks
  - [ ] Group by various categories
  - [ ] Return dashboard statistics

- [ ] `GET /api/admin/recent-activity` (Admin)
  - [ ] Recent content updates
  - [ ] Return timeline of changes

### File Upload Endpoint (Optional)

- [ ] `POST /api/upload` (Admin)
  - [ ] Validate file type and size
  - [ ] Upload to cloud storage (Vercel Blob/Cloudinary)
  - [ ] Return file URL

---

## Phase 4: Service Layer Implementation

### Project Service
- [ ] Create `/src/services/project.service.ts`
  - [ ] `createProject()`
  - [ ] `updateProject()`
  - [ ] `publishProject()`
  - [ ] `deleteProject()`
  - [ ] `getProjects()` with filters
  - [ ] `getProjectBySlug()`

### Publication Service
- [ ] Create `/src/services/publication.service.ts`
  - [ ] `createPublication()`
  - [ ] `updatePublication()`
  - [ ] `deletePublication()`
  - [ ] `getPublications()` with filters
  - [ ] `getPublicationBySlug()`

### Sync Service
- [ ] Create `/src/services/sync.service.ts`
  - [ ] `syncMedium()` - Fetch from Medium API
  - [ ] `syncSubstack()` - Parse RSS feed
  - [ ] `syncAll()` - Sync all platforms
  - [ ] Handle upserts and deduplication

### Guidebook Service
- [ ] Create `/src/services/guidebook.service.ts`
  - [ ] `createGuidebook()`
  - [ ] `addArticleToGuidebook()`
  - [ ] `updateGuidebook()`
  - [ ] `deleteGuidebook()`
  - [ ] `getGuidebooks()`
  - [ ] `getGuidebookBySlug()`

### Timeline Service
- [ ] Create `/src/services/timeline.service.ts`
  - [ ] `rebuildTimeline()` - Rebuild entire timeline
  - [ ] `addToTimeline()` - Add single item
  - [ ] `removeFromTimeline()` - Remove item
  - [ ] `getTimeline()` with filters

### Email Service
- [ ] Create `/src/services/email.service.ts`
  - [ ] Configure email provider (SendGrid/Resend/SMTP)
  - [ ] `sendContactEmail()`
  - [ ] Email templates

---

## Phase 5: Frontend Integration

### API Client Setup
- [ ] Create `/frontend/src/lib/api.ts`
  - [ ] Axios or fetch wrapper
  - [ ] Base URL configuration
  - [ ] Request interceptors
  - [ ] Response interceptors
  - [ ] Error handling

### React Query Setup
- [ ] Configure QueryClient
- [ ] Set up default options
- [ ] Configure cache times

### API Hooks

#### Project Hooks
- [ ] `useProjects()` - List projects with filters
- [ ] `useProject(slug)` - Get single project
- [ ] `useCreateProject()` - Mutation for create
- [ ] `useUpdateProject()` - Mutation for update
- [ ] `useDeleteProject()` - Mutation for delete

#### Publication Hooks
- [ ] `usePublications()` - List publications
- [ ] `usePublication(slug)` - Get single publication
- [ ] `useSyncPublications()` - Trigger sync

#### Guidebook Hooks
- [ ] `useGuidebooks()` - List guidebooks
- [ ] `useGuidebook(slug)` - Get guidebook with articles

#### Timeline Hook
- [ ] `useTimeline()` - Get content timeline

#### Tag Hooks
- [ ] `useTags()` - Get all tags
- [ ] `useTagsByCategory()` - Get tags by category

#### Contact Hook
- [ ] `useContactForm()` - Submit contact form

### Page Components

#### Update Homepage
- [ ] Fetch timeline data
- [ ] Display content cards
- [ ] Implement filters
- [ ] Add pagination

#### Projects Page
- [ ] List all projects
- [ ] Filter by research type, industry, tags
- [ ] Search functionality
- [ ] Pagination

#### Project Detail Page
- [ ] Fetch project by slug
- [ ] Display all project sections
- [ ] Image gallery
- [ ] Tags display
- [ ] Loading and error states

#### Publications Page
- [ ] List publications
- [ ] Filter by platform, tags
- [ ] Search functionality

#### Publication Detail Page
- [ ] Display publication details
- [ ] Link to external URL

#### Guidebooks Page
- [ ] List all guidebooks
- [ ] Featured guidebooks section

#### Guidebook Detail Page
- [ ] Display guidebook info
- [ ] List articles in order
- [ ] Progress tracking (optional)

#### About Page
- [ ] Professional summary
- [ ] Experience section
- [ ] Skills section
- [ ] Contact section

#### Contact Page
- [ ] Contact form
- [ ] Form validation
- [ ] Success/error messages

### Admin Pages (Optional)

- [ ] Admin dashboard
- [ ] Project management (CRUD)
- [ ] Publication management
- [ ] Guidebook management
- [ ] Analytics overview

---

## Phase 6: Testing

### Unit Tests
- [ ] Test utility functions
- [ ] Test validation schemas
- [ ] Test service layer methods

### Integration Tests
- [ ] Test auth endpoints
- [ ] Test project CRUD
- [ ] Test publication CRUD
- [ ] Test guidebook CRUD
- [ ] Test timeline endpoint

### E2E Tests
- [ ] User registration/login flow
- [ ] Create and publish project flow
- [ ] Contact form submission
- [ ] Content browsing flow

---

## Phase 7: Deployment

### Pre-Deployment
- [ ] Run all tests
- [ ] Type check entire codebase
- [ ] Fix linting errors
- [ ] Optimize images
- [ ] Review environment variables

### Database
- [ ] Set up production database (Vercel Postgres/Supabase)
- [ ] Run migrations on production DB
- [ ] Seed production data (if needed)

### Backend Deployment
- [ ] Choose platform (Vercel recommended)
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Deploy backend
- [ ] Verify API endpoints

### Frontend Deployment
- [ ] Update API URL to production backend
- [ ] Build production bundle
- [ ] Deploy frontend
- [ ] Verify all pages load

### Post-Deployment
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure alerts
- [ ] Set up automated backups

---

## Phase 8: Optimization & Monitoring

### Performance
- [ ] Enable caching headers
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Implement CDN for assets
- [ ] Optimize images (WebP, lazy loading)

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Vercel Analytics)
- [ ] Set up uptime monitoring
- [ ] Database performance monitoring
- [ ] Set up alerts for errors

### Security
- [ ] Security headers configured
- [ ] CORS properly set up
- [ ] Rate limiting enabled
- [ ] Input validation everywhere
- [ ] HTTPS enforced

---

## Phase 9: Content Population

### Initial Content
- [ ] Create admin user
- [ ] Add 3-5 core projects
- [ ] Sync publications from Medium/Substack
- [ ] Create 1-2 guidebooks
- [ ] Populate tags

### Ongoing Content
- [ ] Set up sync schedule (daily/weekly)
- [ ] Monitor sync success
- [ ] Update projects regularly
- [ ] Create new guidebooks

---

## Phase 10: Launch

### Pre-Launch Checklist
- [ ] All features implemented and tested
- [ ] Content populated
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] SEO meta tags added
- [ ] robots.txt and sitemap.xml created

### Launch
- [ ] Announce to network
- [ ] Share on social media
- [ ] Submit to portfolio directories
- [ ] Monitor closely for issues

### Post-Launch
- [ ] Gather feedback
- [ ] Fix any reported issues
- [ ] Monitor analytics
- [ ] Plan future enhancements

---

## Optional Enhancements (Phase 11+)

### Advanced Features
- [ ] Full-text search (PostgreSQL or Algolia)
- [ ] Newsletter integration
- [ ] Comment system
- [ ] Like/bookmark functionality
- [ ] RSS feed for content
- [ ] Social sharing
- [ ] Download/export capabilities

### Admin Improvements
- [ ] Rich text editor for content
- [ ] Drag-and-drop image upload
- [ ] Bulk operations
- [ ] Content scheduling
- [ ] Version history
- [ ] Preview mode

### Analytics
- [ ] Custom analytics dashboard
- [ ] Content engagement tracking
- [ ] User journey analysis
- [ ] A/B testing

---

## Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check uptime
- [ ] Review new contact submissions

### Weekly
- [ ] Sync external content
- [ ] Review analytics
- [ ] Check backup status

### Monthly
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Database optimization
- [ ] Content audit

### Quarterly
- [ ] Security audit
- [ ] Major dependency updates
- [ ] Feature planning
- [ ] User feedback review

---

## Resources

- Architecture Documentation: `/Docs/architecture/`
- Vision Document: `/Docs/What/vision.md`
- Backend Structure: `/Docs/architecture/backend-structure.md`
- API Documentation: `/Docs/architecture/api-architecture.md`
- Deployment Guide: `/Docs/architecture/deployment.md`

---

## Notes

- Check off items as you complete them
- Refer to detailed documentation for implementation details
- Test thoroughly before moving to next phase
- Don't skip security measures
- Monitor production closely after deployment

**Estimated Timeline**: 4-8 weeks for full implementation (depending on team size and experience)
