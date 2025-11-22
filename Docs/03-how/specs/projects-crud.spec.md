---
title: Projects CRUD Specification
type: Feature Specification
status: Implemented
version: 1.0
created: 2025-11-21
updated: 2025-11-21
owner: Development Team
related:
  - feature: 02-what/features/projects.md
  - implementation: 03-how/implementation/projects-api.impl.md
  - adr: 03-how/architecture/ADR-002-prisma-orm.md
---

# Projects CRUD Specification

## Purpose

Define the complete requirements for creating, reading, updating, and deleting research project case studies, including data model, validation rules, API endpoints, and acceptance criteria.

## Scope

### In Scope
- Project data model with all fields
- Public API for reading published projects
- Admin API for full CRUD operations
- Project images management
- Tag relationships
- Publishing workflow
- Filtering and sorting
- Slug generation

### Out of Scope
- Project versioning/history
- Draft auto-save
- Project templates
- Collaborative editing
- Comment system
- Project analytics
- Export to PDF

## Data Model

### Project Entity

```typescript
interface Project {
  id: string;                  // CUID
  title: string;               // Required, 3-200 chars
  slug: string;                // Auto-generated, unique
  overview: string;            // Required, 50-5000 chars
  objectives: string;          // Required, 50-5000 chars
  methodology: string;         // Required, 50-10000 chars
  findings: string;            // Required, 50-10000 chars
  impact: string;              // Required, 50-5000 chars
  visuals: Json | null;        // Optional, legacy field
  timeframe: string;           // Required, e.g., "3 months", "Q1 2024"
  role: string;                // Required, e.g., "Lead Researcher"
  researchType: ResearchType;  // Enum: FOUNDATIONAL | EVALUATIVE | GENERATIVE | MIXED
  industry: string | null;     // Optional, e.g., "Healthcare", "E-commerce"
  methodsUsed: Json;           // Array of strings, e.g., ["Usability Testing", "Interviews"]
  featured: boolean;           // Default: false
  published: boolean;          // Default: false
  order: number;               // Display order, default: 0
  createdAt: DateTime;         // Auto
  updatedAt: DateTime;         // Auto
  authorId: string;            // Foreign key to User

  // Relations
  author: User;
  tags: ProjectTag[];          // Many-to-many
  images: ProjectImage[];      // One-to-many
}

interface ProjectImage {
  id: string;
  projectId: string;
  url: string;                 // Full URL to image
  alt: string;                 // Required for accessibility
  caption: string | null;      // Optional
  order: number;               // Display order
  createdAt: DateTime;
}

interface ProjectTag {
  projectId: string;
  tagId: string;
  project: Project;
  tag: Tag;
}
```

## API Endpoints

### Public Endpoints

#### GET /api/projects
**Purpose:** List published projects (public) or all projects (admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 50) |
| researchType | string | No | Filter by research type |
| industry | string | No | Filter by industry |
| tags | string | No | Comma-separated tag IDs |
| featured | boolean | No | Filter featured projects |
| published | boolean | No | Filter by status (admin only) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123",
      "title": "Improving Onboarding for SaaS Platform",
      "slug": "improving-onboarding-saas-platform",
      "overview": "Research project to identify friction points...",
      "objectives": "Understand where users drop off...",
      "methodology": "Mixed-methods approach combining...",
      "findings": "Users struggled with...",
      "impact": "Implemented changes resulted in 35% increase...",
      "timeframe": "3 months",
      "role": "Lead UX Researcher",
      "researchType": "EVALUATIVE",
      "industry": "SaaS",
      "methodsUsed": ["Usability Testing", "Analytics Review"],
      "featured": true,
      "published": true,
      "order": 1,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z",
      "tags": [
        { "id": "tag1", "name": "Usability Testing", "category": "RESEARCH_METHOD" }
      ],
      "images": [
        {
          "id": "img1",
          "url": "https://...",
          "alt": "User journey map",
          "caption": "Current state journey",
          "order": 0
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET /api/projects/featured
**Purpose:** Get featured projects for homepage

**Response:** Same as GET /api/projects but filtered to featured=true

#### GET /api/projects/[slug]
**Purpose:** Get single project by slug

**Response:** Single project object (same structure as list item)

**Error Cases:**
- 404 if project not found
- 404 if project not published (for public users)
- 200 if admin viewing unpublished project

### Admin Endpoints (Authentication Required)

#### POST /api/projects
**Purpose:** Create new project

**Request Body:**
```json
{
  "title": "Project Title",
  "overview": "Brief overview...",
  "objectives": "Research objectives...",
  "methodology": "Methods and approach...",
  "findings": "Key findings...",
  "impact": "Business impact...",
  "timeframe": "3 months",
  "role": "Lead Researcher",
  "researchType": "EVALUATIVE",
  "industry": "Healthcare",
  "methodsUsed": ["Interviews", "Usability Testing"],
  "featured": false,
  "published": false,
  "tagIds": ["tag1", "tag2"],
  "images": [
    {
      "url": "https://...",
      "alt": "Description",
      "caption": "Optional caption",
      "order": 0
    }
  ]
}
```

**Validation Rules:**
- title: 3-200 characters, required
- slug: Auto-generated from title, must be unique
- overview: 50-5000 characters, required
- objectives: 50-5000 characters, required
- methodology: 50-10000 characters, required
- findings: 50-10000 characters, required
- impact: 50-5000 characters, required
- timeframe: 1-100 characters, required
- role: 1-100 characters, required
- researchType: Must be valid enum value
- methodsUsed: Array of strings, at least 1 method
- tagIds: Array of valid tag IDs
- images: Each must have url and alt text

**Response:** Created project object (201 status)

#### PUT /api/projects/[slug]
**Purpose:** Update existing project

**Request Body:** Same as POST (all fields optional except those being updated)

**Response:** Updated project object (200 status)

#### DELETE /api/projects/[slug]
**Purpose:** Delete project

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

#### PATCH /api/projects/[slug]/publish
**Purpose:** Toggle publish status

**Request Body:**
```json
{
  "published": true
}
```

**Response:** Updated project object

## Business Rules

### Slug Generation
- Auto-generate from title on creation
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Ensure uniqueness (append number if needed)
- Example: "UX Research Project!" ’ "ux-research-project"

### Publishing Rules
- Draft projects (published=false) only visible to admin
- Published projects (published=true) visible to public
- Can toggle published status at any time
- Featured flag has no effect if not published

### Image Ordering
- Images ordered by `order` field (ascending)
- Admin can reorder images
- Order is independent (0, 1, 2, ... or 10, 20, 30, ...)

### Tag Relationships
- Projects can have 0 or more tags
- Tags must exist before assignment
- Deleting a tag removes relationship but not project
- Tags should span multiple categories (methods, topics, tools)

### Authorization
- Public users: Read only published projects
- Admin users: Full CRUD on all projects
- Project author tracked but not enforced (single admin)

## Acceptance Criteria

### AC1: Public can browse published projects
**Given** a visitor on the projects page
**When** they load the page
**Then** they see only published projects
**And** projects are sorted by custom order (or date)
**And** featured projects appear at the top

### AC2: Public can filter projects
**Given** a visitor viewing projects
**When** they select a research type filter
**Then** only projects of that type are displayed
**And** filter state is reflected in URL
**And** filters can be combined (research type + industry)

### AC3: Public can view project details
**Given** a visitor clicks on a project
**When** the project detail page loads
**Then** all project fields are displayed
**And** images are shown in correct order
**And** tags are displayed with category badges
**And** related projects are suggested

### AC4: Admin can create project
**Given** an authenticated admin
**When** they submit the create project form
**Then** a new project is created with all provided data
**And** slug is auto-generated from title
**And** project defaults to unpublished
**And** admin is redirected to project list or edit page

### AC5: Admin can edit project
**Given** an authenticated admin editing a project
**When** they update fields and save
**Then** project is updated with new data
**And** slug is NOT regenerated
**And** updatedAt timestamp is updated
**And** related tags and images are updated

### AC6: Admin can delete project
**Given** an authenticated admin
**When** they confirm deletion of a project
**Then** project is permanently deleted
**And** all related images are deleted
**And** all tag relationships are deleted
**And** admin is redirected to project list

### AC7: Admin can publish/unpublish
**Given** an authenticated admin
**When** they toggle the published status
**Then** status is updated immediately
**And** published projects appear on public site
**And** unpublished projects are hidden from public

### AC8: Image upload and ordering
**Given** an admin adding images to a project
**When** they upload multiple images
**Then** images are stored with URLs
**And** images can be reordered via drag-and-drop (UI)
**And** images display in correct order on public site

### AC9: Tag assignment
**Given** an admin editing a project
**When** they assign tags from multiple categories
**Then** tags are saved to project
**And** tags appear on public project view
**And** projects can be filtered by those tags

### AC10: Validation enforcement
**Given** an admin submitting a project form
**When** required fields are missing or invalid
**Then** form submission is rejected
**And** clear error messages are shown
**And** no partial data is saved

## Performance Requirements

- GET /api/projects: < 500ms for 50 projects
- GET /api/projects/[slug]: < 200ms
- POST /api/projects: < 1000ms
- Database queries use indexes on: slug, published, featured, researchType, createdAt

## Error Handling

| Scenario | Status Code | Error Message |
|----------|-------------|---------------|
| Project not found | 404 | "Project not found" |
| Unauthorized (no token) | 401 | "Authentication required" |
| Forbidden (not admin) | 403 | "Admin access required" |
| Validation error | 400 | "Validation failed" + details |
| Duplicate slug | 400 | "Project with this slug already exists" |
| Invalid tag ID | 400 | "Invalid tag ID: [id]" |
| Server error | 500 | "Internal server error" |

## Testing Requirements

### Unit Tests
- Slug generation logic
- Validation schemas
- Business rule enforcement

### Integration Tests
- All CRUD operations via API
- Authentication middleware
- Query filtering and sorting
- Tag relationship management

### E2E Tests
- Complete project creation workflow
- Publish/unpublish toggle
- Public filtering and viewing
- Image upload and display

## Related Documentation

- [Projects Feature](../../02-what/features/projects.md) - High-level feature description
- [Projects API Implementation](../implementation/projects-api.impl.md) - Technical implementation
- [Prisma ORM ADR](../architecture/ADR-002-prisma-orm.md) - Database layer decision

---

**Status:** Implemented
**Last Reviewed:** 2025-11-21
