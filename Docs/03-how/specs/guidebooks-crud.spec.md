---
feature_id: FEAT-008
status: implemented
owner: Aravind Bharathy
implements: features/guidebooks.md
verified: 2025-12-15
related_specs: [publications-crud.spec.md, tags.spec.md]
---

# Guidebooks CRUD Specification

## Purpose

Provide curated collections of publications organized by theme, enabling structured learning paths on specific research and product development topics.

---

## Data Model

```typescript
{
  id: string
  title: string               // Guidebook title (required, max 200 chars)
  slug: string                // Auto-generated, unique
  area: string                // High-level category for grouping (required, max 100 chars)
  description: string         // Overview (required, Text)
  purpose: string             // Learning objectives (required, Text)
  targetAudience: string      // Who it's for (required, max 200 chars)
  coverImage?: string         // Optional cover image URL
  totalReadTime?: number      // Sum of all article read times (auto-calculated)
  featured: boolean           // Highlight in featured section (default: false)
  published: boolean          // Visibility toggle (default: false)
  lastUpdated: DateTime       // Auto-updated when articles change
  createdAt: DateTime         // Auto-managed
  updatedAt: DateTime         // Auto-managed
  authorId: string            // FK to User (required)
  articles: GuidebookArticle[] // Ordered list of publications
  tags: GuidebookTag[]        // Many-to-many with Tags
}

// Join table for guidebook → publication relationships
{
  id: string
  guidebookId: string         // FK to Guidebook
  publicationId: string       // FK to Publication
  order: number               // Chapter ordering (required)
  customTitle?: string        // Override publication title (optional)
  customExcerpt?: string      // Override publication excerpt (optional)
}
```

---

## Requirements

### Functional Requirements

**FR1: Guidebook CRUD**
- Create: Admin creates guidebook with metadata
- Read: Public retrieves guidebooks (filtered by published=true)
- Update: Admin updates guidebook metadata
- Delete: Admin deletes guidebook (cascade deletes article associations)
- Publish Toggle: Admin toggles published status

**FR2: Article Management**
- Add publication to guidebook with custom order
- Remove publication from guidebook
- Reorder articles (update order field)
- Override title/excerpt per guidebook (custom fields)

**FR3: Auto-Calculations**
- Sum totalReadTime from all articles
- Update lastUpdated when articles added/removed
- Recalculate on article order changes

**FR4: Area-Based Grouping**
- Group guidebooks by area on listing page
- Filter by area
- Alphabetically sort areas

**FR5: Target Audience Filtering**
- Support comma-separated audiences
- Filter by specific audience
- Display audience counts

**FR6: Featured & Published Status**
- Featured guidebooks appear on homepage
- Unpublished guidebooks hidden from public
- Admin sees all guidebooks regardless of status

---

## API Endpoints

### GET /api/guidebooks
**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `featured` (true | false)
- `published` (true | false)
- `sort` (lastUpdated | title, default: lastUpdated)
- `order` (asc | desc, default: desc)

**Response:** Paginated guidebooks with article count

---

### GET /api/guidebooks/featured
**Purpose:** Retrieve featured guidebooks for homepage

**Response:** Up to 4 most recent featured guidebooks

---

### GET /api/guidebooks/[slug]
**Purpose:** Retrieve single guidebook with all articles

**Response:** Guidebook with ordered articles (includes publication data)

---

### POST /api/guidebooks (Admin)
**Purpose:** Create new guidebook

**Request:**
```json
{
  "title": "Guidebook Title",
  "area": "User Research",
  "description": "Overview...",
  "purpose": "Learning objectives...",
  "targetAudience": "Researchers, Product Managers",
  "tagIds": ["tag1", "tag2"]
}
```

---

### PUT /api/guidebooks/[slug] (Admin)
**Purpose:** Update guidebook metadata

---

### PATCH /api/guidebooks/[slug]/publish (Admin)
**Purpose:** Toggle published status

---

### DELETE /api/guidebooks/[slug] (Admin)
**Purpose:** Delete guidebook (cascade delete articles)

---

### POST /api/guidebooks/[slug]/articles (Admin)
**Purpose:** Add publication to guidebook

**Request:**
```json
{
  "publicationId": "pub123",
  "order": 1,
  "customTitle": "Chapter 1: Introduction",
  "customExcerpt": "Custom excerpt..."
}
```

---

### DELETE /api/guidebooks/[slug]/articles/[articleId] (Admin)
**Purpose:** Remove article from guidebook

---

### PATCH /api/guidebooks/[slug]/articles/reorder (Admin)
**Purpose:** Batch update article order

**Request:**
```json
{
  "articles": [
    { "id": "art1", "order": 1 },
    { "id": "art2", "order": 2 }
  ]
}
```

---

## Acceptance Criteria

✅ **AC1: Public Guidebook Listing**
- GET /api/guidebooks?published=true returns only published
- Results include area, targetAudience, totalReadTime
- Grouped by area on frontend

✅ **AC2: Guidebook Detail**
- GET /api/guidebooks/[slug] returns full article list
- Articles sorted by order ascending
- Each article includes publication data (title, slug, externalUrl, readTime)

✅ **AC3: Add Article to Guidebook**
- POST adds publication with order
- totalReadTime recalculates automatically
- lastUpdated updates to current timestamp

✅ **AC4: Custom Title/Excerpt**
- customTitle overrides publication title in guidebook context
- customExcerpt overrides publication excerpt
- Original publication data unchanged

✅ **AC5: Article Ordering**
- Articles display in order (1, 2, 3, ...)
- Reorder endpoint updates multiple articles atomically
- Frontend displays "Chapter N" based on order

✅ **AC6: Remove Article**
- DELETE removes association
- totalReadTime recalculates
- lastUpdated updates
- Publication itself not deleted

✅ **AC7: Target Audience Filtering**
- Comma-separated audiences parsed correctly
- Filter by single audience returns matching guidebooks
- Audience counts aggregate across guidebooks

✅ **AC8: Unique Slug Generation**
- Slug generated from title
- Conflicts resolved with numeric suffix

✅ **AC9: Publish Toggle**
- Unpublished guidebooks not returned to public
- Admin sees published and unpublished
- Featured requires published=true

✅ **AC10: Area Grouping**
- Guidebooks group by area field
- Areas sorted alphabetically
- Count displayed per area

---

## Validation Rules

- **Title:** Required, 1-200 characters
- **Area:** Required, 1-100 characters
- **Description:** Required, minimum 10 characters
- **Purpose:** Required, minimum 10 characters
- **TargetAudience:** Required, 1-200 characters
- **PublicationId:** Must reference existing publication
- **Order:** Required, positive integer
- **CustomTitle:** Optional, max 200 characters
- **CustomExcerpt:** Optional, Text

---

## Out of Scope

❌ **Multi-Author Guidebooks:** Single author only (Aravind)
❌ **Guidebook Nesting:** No sub-guidebooks or hierarchies
❌ **User Progress Tracking:** No "mark as read" or completion status
❌ **Comments/Discussion:** No collaborative features
❌ **Versioning:** No history of changes
❌ **Draft Articles:** All articles either included or not (no draft state)

---

## Non-Functional Requirements

- **Performance:** Guidebook detail < 500ms with all articles
- **Security:** Admin endpoints require JWT authentication
- **Data Integrity:** Prevent duplicate publication in same guidebook
- **UX:** External URL links open in new tab with externalUrl fallback

---

## Business Rules

- One publication can appear in multiple guidebooks
- Order must be unique within guidebook (no two articles at order=1)
- Deleting publication removes from all guidebooks (cascade)
- Deleting guidebook does not delete publications
- totalReadTime = SUM(article.publication.readTime)

---

## Related Documentation

- Feature: [guidebooks.md](../../02-what/features/guidebooks.md)
- Implementation: [guidebooks.impl.md](../implementation/guidebooks.impl.md)
- Publications Spec: [publications-crud.spec.md](publications-crud.spec.md)
- Tags Spec: [tags.spec.md](tags.spec.md)
