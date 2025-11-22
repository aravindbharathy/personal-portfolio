# Core Product Definition

## Overview

A full-stack personal portfolio website for showcasing user research expertise, professional contributions, and thought leadership across multiple platforms. Built with modern technologies and designed for both professional visitors and content discovery.

## Product Identity

**Name:** Portfolio Website
**Type:** Personal professional portfolio & content aggregation platform
**Target Users:** Recruiters, employers, industry peers, content readers, professional network

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite + TypeScript | Modern, fast UI |
| **Backend** | Next.js 14 App Router | Serverless API |
| **Database** | PostgreSQL 15+ + Prisma ORM | Type-safe data layer |
| **Styling** | Tailwind CSS + Shadcn/UI | Beautiful, accessible components |
| **State Management** | React Query + Context API | Server state & client state |
| **Authentication** | JWT (HTTP-only cookies) | Secure admin access |
| **Validation** | Zod schemas | Type-safe validation |

## Core Value Propositions

1. **Centralized Professional Hub** - Single source of truth for all professional work and content
2. **Dynamic Content Aggregation** - Automatically syncs content from Medium, Substack, GitHub
3. **Curated Guidebooks** - Unique thematic collections of published articles
4. **Research Portfolio Showcase** - Detailed case studies with methodology and impact
5. **Easy Content Discovery** - Timeline-based feed, filtering, tagging, and search

## Key Features

### 1. Homepage Timeline Feed
- Unified content stream (projects, publications, guidebooks)
- Reverse chronological display
- Filtering by content type and tags
- Read time estimates
- Platform badges (Medium, Substack)

### 2. Projects Management
- Research case study portfolio
- Detailed methodology documentation
- Impact and outcomes tracking
- Multi-image galleries
- Categorization by research type and industry
- Tag-based organization

### 3. Publications Aggregation
- Multi-platform content sync (Medium, Substack)
- Manual and automated imports
- Rich metadata (platform, read time, tags)
- External link preservation
- Featured articles highlighting

### 4. Guidebooks Collections
- Curated article groupings by theme
- Ordered reading sequences
- Custom descriptions and positioning
- Target audience specification
- Total read time calculation

### 5. Admin Panel
- Full CRUD operations for all content
- Publish/unpublish controls
- Tag management system
- Dashboard with statistics
- Secure authentication

### 6. Tagging System
5 category taxonomy:
- Research Methods
- Industries
- Topics
- Tools
- Skills

## MVP Scope

### In Scope (Implemented)
- ✅ Projects CRUD with publishing
- ✅ Publications CRUD
- ✅ Guidebooks CRUD with article ordering
- ✅ Tag management (5 categories)
- ✅ Admin authentication & dashboard
- ✅ Timeline feed
- ✅ Public content browsing
- ✅ Responsive design

### Out of Scope (Future Phases)
- ❌ User comments/engagement
- ❌ Newsletter subscriptions
- ❌ Full-text search
- ❌ Analytics dashboard
- ❌ Social sharing integrations
- ❌ Content versioning

## User Personas

### 1. Recruiter Rachel
**Goal:** Evaluate user research skills and experience
**Needs:** Quick access to project examples, clear methodology, measurable impact
**Key Pages:** Projects list, project details, about page

### 2. Peer Patrick (Industry Professional)
**Goal:** Learn from methodologies and insights
**Needs:** Deep-dive case studies, published articles, guidebooks
**Key Pages:** Projects, publications, guidebooks

### 3. Reader Rita
**Goal:** Follow published content across platforms
**Needs:** Centralized feed, easy navigation, topic filtering
**Key Pages:** Homepage timeline, publications page, guidebooks

### 4. Admin Alice (Portfolio Owner)
**Goal:** Manage and update content efficiently
**Needs:** Easy content creation, publishing controls, status overview
**Key Pages:** Admin dashboard, content management pages

## Success Metrics

### User Engagement
- Average session duration > 3 minutes
- Pages per session > 3
- Bounce rate < 60%
- Return visitor rate > 30%

### Content Performance
- Project detail page views
- Publication click-through rates to external platforms
- Guidebook completion rates
- Contact form submissions

### Technical Performance
- Page load time < 2 seconds
- API response time < 500ms
- Mobile responsiveness score > 90
- Accessibility score (WCAG AA)

## Competitive Positioning

### Differentiators

**vs. Traditional Portfolios (Behance, Dribbble)**
- Focus on user research (not visual design)
- Detailed methodology documentation
- Content aggregation from external platforms

**vs. Personal Blogs**
- Structured project case studies
- Curated guidebook collections
- Professional portfolio emphasis

**vs. LinkedIn**
- Richer project documentation
- Unified content from multiple sources
- Custom-designed experience

## Content Strategy

### Content Types

1. **Projects** - Detailed case studies (~5-10 featured)
2. **Publications** - Aggregated articles (50-100+)
3. **Guidebooks** - Curated collections (5-8 thematic guides)
4. **Tags** - 20-30 tags across 5 categories

### Update Cadence

- **Projects:** Monthly (as new work completes)
- **Publications:** Auto-sync weekly
- **Guidebooks:** Quarterly (new themes)
- **Tags:** As needed (new topics emerge)

## Technical Architecture

**Pattern:** Stateless RESTful API + React SPA

### Backend (Next.js)
- 34 API endpoints
- 6 core services (Project, Publication, Guidebook, Tag, Timeline, Email)
- JWT authentication middleware
- Zod validation on all inputs
- Prisma ORM for type-safe queries

### Frontend (React + Vite)
- Component-based architecture
- React Query for data fetching and caching
- Optimistic UI updates
- Responsive Tailwind styling
- Shadcn/UI component library

### Database (PostgreSQL)
- 8 core tables
- Many-to-many tag relationships
- Denormalized timeline table for performance
- Indexed queries on common filters

See [03-how/architecture/system-architecture.md](../03-how/architecture/system-architecture.md) for detailed architecture.

## Security & Privacy

- JWT tokens in HTTP-only cookies (XSS prevention)
- bcrypt password hashing (10+ rounds)
- Input validation on all endpoints
- CORS configuration
- Rate limiting (100 req/15min public, 500 req/15min admin)
- SQL injection prevention via Prisma ORM

## Deployment Architecture

**Platform:** Vercel (recommended)
- Frontend: Static site with CDN
- Backend: Serverless functions
- Database: Vercel Postgres or Supabase
- File Storage: Vercel Blob or Cloudinary

**Estimated Costs:** $10-20/month (hobby) to $175/month (production)

## Future Roadmap

### Phase 2 (Q2 2025)
- Full-text search (PostgreSQL tsvector)
- Advanced analytics dashboard
- Newsletter subscription integration
- Contact submission management

### Phase 3 (Q3 2025)
- Content versioning
- Image optimization pipeline
- Real-time updates for admin
- GraphQL API layer (optional)

### Phase 4 (Q4 2025)
- User engagement features (likes, bookmarks)
- Comment system
- Social sharing optimizations
- A/B testing framework

---

**Document Type:** Product Definition
**Last Updated:** 2025-01-21
**Owner:** Development Team

**Related Documents:**
- [Vision](../01-why/vision.md) - Strategic context
- [Features](./features/README.md) - Detailed feature descriptions
- [Architecture](../03-how/architecture/system-architecture.md) - Technical architecture
