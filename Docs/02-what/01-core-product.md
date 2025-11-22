# Core Product: Portfolio Website

_Last updated: 2025-01-21_

## Overview

A modern, full-stack portfolio website showcasing research work, publications, projects, and curated learning resources (guidebooks). Built with Next.js 14, TypeScript, and PostgreSQL.

## Target Users

- **Hiring managers** seeking to evaluate research and product expertise
- **Collaborators** exploring potential partnership opportunities
- **Learners** looking for curated resources on research methodologies
- **Recruiters** assessing candidate capabilities

## Core Features

### 1. Publications Management
Display and manage research articles, writings, and publications in a timeline format.

**Key Capabilities:**
- Timeline-based display organized by month/year
- Featured publications highlighting
- Rich metadata (excerpt, description, read time, tags)
- Admin CRUD operations
- Medium sync integration

### 2. Projects Showcase
Portfolio of work projects with detailed information and media.

**Key Capabilities:**
- Project cards with images and descriptions
- Featured projects section
- Technology tags
- External links to live demos/repositories
- Admin management interface

### 3. Guidebooks (Learning Resources)
Curated collections of publications organized into thematic learning paths.

**Key Capabilities:**
- Hierarchical structure: Area → Guidebook → Chapters (Publications)
- Chapter ordering and management
- Metadata: purpose, target audience, total read time
- Featured guidebooks
- Admin chapter management (add/remove/reorder)

### 4. Admin Panel
Complete content management system for authenticated administrators.

**Key Capabilities:**
- Publications CRUD with Medium sync
- Projects CRUD
- Guidebooks CRUD with chapter management
- Tag management
- Statistics dashboard

## Tech Stack

### Frontend
- **Framework:** React 18 with Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **State Management:** TanStack Query (React Query v5)
- **Icons:** Lucide React

### Backend
- **Framework:** Next.js 14 API Routes
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** Session-based auth

### Infrastructure
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** (TBD)
- **Dev Tools:** Prisma Studio, ESLint, TypeScript

## Key Design Principles

1. **Content-First:** Clean, readable typography and spacious layouts
2. **Progressive Disclosure:** Show essential info first, details on demand
3. **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation
4. **Performance:** Code splitting, lazy loading, optimized queries
5. **Maintainability:** Type safety, component reuse, clear file structure

## Success Metrics

- Fast page load times (< 2s)
- Accessible (WCAG 2.1 AA compliance)
- SEO optimized (structured data, meta tags)
- Mobile responsive (works on all screen sizes)
- Easy content updates (admin panel)

## Competitive Positioning

Unlike generic portfolio templates:
- ✅ Specialized for research/writing portfolios
- ✅ Built-in learning resource curation (guidebooks)
- ✅ Timeline-based content organization
- ✅ Medium integration for seamless publishing workflow
- ✅ Fully customized admin experience

## MVP Scope

### In Scope
- ✅ Publications with timeline display
- ✅ Projects showcase
- ✅ Guidebooks with hierarchical structure
- ✅ Admin panel with CRUD operations
- ✅ Basic authentication
- ✅ Responsive design

### Out of Scope (Future)
- ❌ User comments/interactions
- ❌ Newsletter subscriptions
- ❌ Multi-author support
- ❌ Analytics dashboard
- ❌ Content versioning
- ❌ Multi-language support
