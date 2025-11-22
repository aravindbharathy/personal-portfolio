# Feature: Admin Panel

## Overview

The Admin Panel provides a secure, comprehensive content management system for creating, editing, publishing, and organizing all portfolio content including projects, publications, guidebooks, and tags.

## Purpose

Enable efficient content management with full CRUD operations, publishing workflows, and dashboard analytics, allowing the portfolio owner to maintain and update content without touching code or databases directly.

## Target Users

### Primary: Portfolio Owner (Admin)
- Creating and managing portfolio content
- Publishing and unpublishing content
- Organizing content with tags
- Monitoring portfolio statistics
- Maintaining content quality and freshness

## Key Capabilities

### 1. Admin Dashboard

**Overview Statistics:**
- Total projects (published vs. drafts)
- Total publications (by platform)
- Total guidebooks
- Total tags (by category)
- Recent activity timeline
- Content status summary

**Quick Actions:**
- Create new project
- Create new publication
- Create new guidebook
- Sync publications from platforms
- View all draft content

**Visualizations:**
- Content growth over time
- Most popular tags
- Publication distribution by platform
- Project types breakdown

### 2. Projects Management

**List View:**
- View all projects (published and drafts)
- Filter by status (published/draft)
- Filter by research type
- Search by title
- Sort by date, title, or custom order
- Bulk actions (future)

**Project Operations:**
- Create new project
- Edit existing project
- Delete project (with confirmation)
- Publish/unpublish toggle
- Set featured status
- Reorder projects
- Preview before publishing

**Project Editor:**
- Rich text fields for all content sections
- Image upload and management
- Tag assignment interface
- Metadata fields (timeframe, role, industry, research type)
- Methods used selection
- Slug generator
- Save draft / Publish controls

### 3. Publications Management

**List View:**
- View all publications
- Filter by platform (Medium, Substack, External)
- Filter by featured status
- Search by title
- Sort by publication date
- Sync status indicators

**Publication Operations:**
- Create new publication manually
- Edit publication metadata
- Delete publication
- Set featured status
- Assign/remove tags
- Sync from external platforms

**Sync Interface:**
- Trigger manual sync from Medium
- Trigger manual sync from Substack
- View sync history and status
- Review sync conflicts
- Preview new publications before importing

### 4. Guidebooks Management

**List View:**
- View all guidebooks
- Filter by published/draft status
- Filter by featured status
- Sort by title or last updated
- See article counts

**Guidebook Operations:**
- Create new guidebook
- Edit guidebook details
- Delete guidebook
- Publish/unpublish toggle
- Set featured status
- Manage article collections

**Guidebook Editor:**
- Basic info (title, description, purpose, audience)
- Cover image upload
- Add articles from publications catalog
- Reorder articles (drag-and-drop)
- Override article titles/excerpts
- View calculated total read time
- Save draft / Publish controls

### 5. Tags Management

**Tag Categories:**
- Research Methods
- Industries
- Topics
- Tools
- Skills

**Tag Operations:**
- Create new tags (with category)
- Edit tag names and slugs
- Delete tags (with usage warnings)
- View tag usage counts
- See which content uses each tag

**Tag Interface:**
- List all tags grouped by category
- Filter by category
- Search tags
- Bulk tag operations (future)

### 6. Content Timeline

**Unified Activity Feed:**
- All published content chronologically
- Filter by content type
- View recent updates
- See publishing history
- Quick edit links

## User Flows

### Admin Daily Workflow

1. Log into admin panel
2. View dashboard for quick status overview
3. Check recent activity
4. Review any draft content
5. Make updates as needed
6. Publish completed content
7. Log out

### Creating and Publishing a Project

1. Navigate to Projects management
2. Click "Create New Project"
3. Fill in all required fields:
   - Title and overview
   - Objectives, methodology, findings, impact
   - Timeframe, role, research type, industry
4. Upload project images
5. Assign relevant tags (methods, topics, tools)
6. Save as draft
7. Preview on staging/public site
8. Make refinements
9. Toggle "Published" status
10. Optionally set "Featured" for homepage
11. Verify live on public site

### Weekly Publication Sync

1. Navigate to Publications management
2. Click "Sync Publications"
3. Select platforms to sync (Medium, Substack)
4. Review sync results:
   - New articles found
   - Updated articles
   - Any errors
5. Edit metadata for new articles
6. Assign tags to categorize
7. Set featured status for highlights
8. Publish new publications
9. Verify on public publications page

### Curating a New Guidebook

1. Navigate to Guidebooks management
2. Click "Create New Guidebook"
3. Enter title, description, purpose, target audience
4. Upload cover image
5. Click "Add Articles"
6. Search/filter publications catalog
7. Select articles to include
8. Reorder articles into logical sequence
9. Optionally customize titles/excerpts for flow
10. Review auto-calculated read time
11. Save as draft and preview
12. Toggle "Published" when ready
13. Optionally set "Featured"

## Business Value

### Efficiency
- Manage all content in one place
- No need for database access or code changes
- Streamlined publishing workflows
- Quick content updates

### Quality
- Preview before publishing
- Draft system for work-in-progress
- Consistent content structure
- Tag-based organization

### Insights
- Dashboard analytics for content overview
- Track content growth and status
- Identify gaps in content coverage
- Monitor tag usage

## Security Features

**Authentication Required:**
- All admin routes protected
- JWT token validation
- HTTP-only cookie security

**Authorization:**
- Admin role required
- Role-based access control
- Session timeout (7 days)

**Data Protection:**
- Input validation on all forms
- XSS prevention
- CSRF protection
- SQL injection prevention (via Prisma)

## User Experience Principles

1. **Intuitive Navigation:** Clear menu structure, breadcrumbs
2. **Responsive Design:** Works on desktop and tablet
3. **Consistent UI:** Shadcn/UI components throughout
4. **Helpful Feedback:** Success/error messages, loading states
5. **Efficient Workflows:** Keyboard shortcuts, quick actions
6. **Forgiving:** Confirmation dialogs for destructive actions

## Technical Architecture

**Frontend (React + Vite):**
- Protected routes with authentication
- React Query for data fetching/caching
- Form validation with React Hook Form + Zod
- Optimistic UI updates
- Toast notifications for feedback

**Backend (Next.js API):**
- RESTful endpoints for all operations
- Authentication middleware on all admin routes
- Validation schemas
- Error handling and logging

**Data Management:**
- CRUD operations via Prisma ORM
- Transaction support for complex operations
- Soft deletes (optional, future)
- Audit logging (future)

## Related Documentation

- **Authentication:** [authentication.md](./authentication.md) - How admin access works
- **Specs:** [03-how/specs/admin-dashboard.spec.md](../../03-how/specs/admin-dashboard.spec.md) - Detailed requirements
- **Implementation:** [03-how/implementation/admin-panel.impl.md](../../03-how/implementation/admin-panel.impl.md) - Technical details
- **User Guide:** [04-guides/admin-user-guide.md](../../04-guides/admin-user-guide.md) - Step-by-step usage instructions

---

**Feature Type:** Content Management System
**Status:** Implemented
**Last Updated:** 2025-11-21
