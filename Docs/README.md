# Portfolio Website Documentation

_Last updated: 2025-01-21_

## Quick Navigation

- [Core Product](./02-what/01-core-product.md) - Product overview, features, tech stack
- [Guidebooks Feature](./02-what/features/guidebooks.md) - Curated learning paths feature  
- [Guidebooks Implementation](./03-how/implementation/guidebooks.impl.md) - Technical details
- [Publications Timeline](./03-how/implementation/publications-timeline.impl.md) - Timeline display implementation

## Documentation Structure

This project follows the [Documentation Framework](../documentation-framework.md) for systematic organization:

```
docs/
├── 01-why/              # Strategic Vision (not yet created)
├── 02-what/             # Product Definition & Features
│   ├── 01-core-product.md
│   └── features/
│       └── guidebooks.md
├── 03-how/              # Development Documentation
│   ├── architecture/    # Architecture Decision Records
│   ├── implementation/  # Technical implementation details
│   │   ├── guidebooks.impl.md
│   │   └── publications-timeline.impl.md
│   ├── specs/           # Feature specifications
│   └── tests/           # Test plans
├── 04-guides/           # User guides (not yet created)
└── 05-project-mgmt/     # Project planning (not yet created)
```

## Key Features Documented

### 1. Guidebooks (Curated Learning Paths)

**What:** Collections of publications organized into thematic learning paths

**Documentation:**
- Feature: [`02-what/features/guidebooks.md`](./02-what/features/guidebooks.md)
- Implementation: [`03-how/implementation/guidebooks.impl.md`](./03-how/implementation/guidebooks.impl.md)

**Key Highlights:**
- Hierarchical structure: Area → Guidebook → Chapters
- Many-to-many relationship with Publications
- Admin chapter management interface
- Automatic read time calculation
- Real-time UI updates with React Query

### 2. Publications Timeline

**What:** Chronological display of research articles and writings

**Documentation:**
- Implementation: [`03-how/implementation/publications-timeline.impl.md`](./03-how/implementation/publications-timeline.impl.md)

**Key Highlights:**
- Timeline visualization with month grouping
- Excerpt/description display
- Responsive layout
- Consistent visual hierarchy

### 3. Projects Showcase

**What:** Portfolio of work projects with details and media

**Status:** Implementation complete, documentation pending

### 4. Admin Panel

**What:** Content management system for all portfolio content

**Status:** Implementation complete, documentation pending

## Recent Changes (2025-01-21)

### Guidebooks Enhancement
- Added `area` field for hierarchical organization
- Implemented chapter management (add/remove/display)
- Created GuidebookArticlesManager component
- Added DELETE route for removing chapters
- Data transformation in backend for simplified frontend consumption
- Real-time UI updates via React Query refetching

### Publications Timeline Improvements
- Fixed timeline alignment and spacing
- Added proper excerpt display (prioritized over description)
- Enhanced visual hierarchy with dots and markers
- Improved mobile responsiveness

### UI/UX Improvements
- Better hover states and transitions
- Toast notifications for user feedback
- Loading states for async operations
- Optimistic UI updates where appropriate
- Consistent spacing and typography

## Tech Stack Overview

### Frontend
- **React 18** + **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **TanStack Query** for server state management
- **Lucide React** for icons

### Backend
- **Next.js 14 API Routes**
- **PostgreSQL** database
- **Prisma** ORM
- **Zod** validation
- Session-based authentication

## Getting Started with Documentation

### For New Team Members
1. Start with [Core Product](./02-what/01-core-product.md) for high-level overview
2. Review feature docs in `02-what/features/` for specific capabilities
3. Check implementation docs in `03-how/implementation/` for technical details

### For Developers
1. Implementation docs show code structure and data flow
2. Module paths reference actual files in codebase
3. Architecture decisions (ADRs) explain key technical choices

### For Product/Design
1. Feature docs explain user value and capabilities
2. Core product doc shows competitive positioning
3. User stories define requirements

## Contributing to Documentation

When adding new features:

1. **Feature Documentation** (`02-what/features/`)
   - User value proposition
   - Core capabilities
   - User stories
   - Design considerations

2. **Implementation Documentation** (`03-how/implementation/`)
   - Technical approach
   - Code structure
   - Data models
   - API endpoints
   - Key patterns

3. **Update Core Product** (`02-what/01-core-product.md`)
   - Add to feature list
   - Update tech stack if needed
   - Note any architectural changes

## Status Legend

- ✅ Implemented and Documented
- 🚧 Implemented, Documentation Pending
- 📝 Documented, Implementation Pending
- ❌ Not Started

## Current Status

| Feature | Implementation | Documentation |
|---------|----------------|---------------|
| Guidebooks | ✅ | ✅ |
| Publications Timeline | ✅ | ✅ |
| Projects Showcase | ✅ | 🚧 |
| Admin Panel | ✅ | 🚧 |
| Authentication | ✅ | 🚧 |
| Tag Management | ✅ | 🚧 |
| Medium Sync | ✅ | 🚧 |

## Next Steps

### Documentation Priorities
1. Create architecture decision records (ADRs)
2. Document admin panel implementation
3. Document authentication flow
4. Create user guides for admin panel
5. Document deployment process

### Feature Priorities
1. Implement drag-and-drop chapter reordering
2. Add custom chapter titles/excerpts support
3. Create guidebook search/filter
4. Add analytics tracking
5. Improve SEO with structured data

## Questions?

For questions about the documentation framework, see [documentation-framework.md](../documentation-framework.md).

For questions about specific features, check the relevant implementation docs or create an issue.
