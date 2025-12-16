---
feature_id: FEAT-002
status: implemented
owner: Aravind Bharathy
implements: features/publications.md
verified: 2025-12-15
related_specs: [tags.spec.md, authentication.spec.md]
---

# Publications CRUD Specification

## Purpose

Provide content management and public display for articles published across external platforms (Medium, Substack, guest posts), with metadata management, tagging, and platform-based organization.

---

## Data Model

```typescript
{
  id: string
  title: string               // Article title (required, max 500 chars)
  slug: string                // Auto-generated, unique, URL-safe
  excerpt: string             // Article summary (required, Text)
  content?: string            // Optional full content storage (Text)
  platform: Platform          // MEDIUM | SUBSTACK | EXTERNAL | INTERNAL
  externalUrl: string         // Link to original article (required, valid URL)
  publishedAt: DateTime       // Publication date (required)
  readTime?: number           // Estimated minutes to read (optional)
  featured: boolean           // Highlight in featured section (default: false)
  externalId?: string         // Platform-specific ID for sync (optional, unique)
  imageUrl?: string           // Cover image URL (optional)
  synced: boolean             // Auto-synced from platform (default: false)
  lastSyncAt?: DateTime       // Last sync timestamp (optional)
  createdAt: DateTime         // Auto-managed
  updatedAt: DateTime         // Auto-managed
  authorId: string            // FK to User (required)
  tags: PublicationTag[]      // Many-to-many with Tags
}

enum Platform {
  MEDIUM    // Medium.com articles
  SUBSTACK  // Substack newsletters
  EXTERNAL  // Guest posts on other sites
  INTERNAL  // Self-hosted blog (future)
}
```

---

## Requirements

### Functional Requirements

**FR1: CRUD Operations**
- Create: Admin creates publication with metadata
- Read: Public retrieves publications with filtering/pagination
- Update: Admin updates publication metadata
- Delete: Admin deletes publication (cascade deletes tags)
- Publish Toggle: Admin toggles featured status

**FR2: Auto-Slugification**
- Generate unique slug from title on creation
- Handle conflicts with numeric suffixes (e.g., "article-1", "article-2")
- Update slug if title changes

**FR3: Tag Management**
- Assign multiple tags to publication
- Remove/update tag associations
- Include tags in publication queries

**FR4: Platform Organization**
- Filter publications by platform
- Display platform badge on listings
- Support mixed platform portfolios

**FR5: Featured Content**
- Mark publications as featured
- Retrieve featured publications separately
- Limit featured list (e.g., top 4)

**FR6: Pagination & Filtering**
- Paginate publication lists (default: 20 per page)
- Filter by: platform, featured status, tags
- Sort by: publishedAt (default desc), title, readTime

**FR7: External Sync (Future)**
- Sync from Medium API (externalId tracking)
- Parse RSS feeds (Substack)
- Deduplicate by externalId
- Update synced publications automatically

---

## API Endpoints

### GET /api/publications
**Query Params:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `platform` (MEDIUM | SUBSTACK | EXTERNAL | INTERNAL)
- `featured` (true | false)
- `sort` (publishedAt | title | readTime, default: publishedAt)
- `order` (asc | desc, default: desc)

**Response:** Paginated list with total count

---

### GET /api/publications/featured
**Purpose:** Retrieve featured publications for homepage

**Response:** Up to 4 most recent featured publications

---

### GET /api/publications/[slug]
**Purpose:** Retrieve single publication by slug

**Response:** Publication with tags, author name

---

### POST /api/publications (Admin)
**Purpose:** Create new publication

**Request:**
```json
{
  "title": "Article Title",
  "excerpt": "Article summary...",
  "externalUrl": "https://medium.com/article",
  "platform": "MEDIUM",
  "publishedAt": "2025-01-15T00:00:00Z",
  "readTime": 5,
  "imageUrl": "https://...",
  "tagIds": ["tag1", "tag2"]
}
```

---

### PUT /api/publications/[slug] (Admin)
**Purpose:** Update publication metadata

---

### PATCH /api/publications/[slug]/publish (Admin)
**Purpose:** Toggle featured status

---

### DELETE /api/publications/[slug] (Admin)
**Purpose:** Delete publication (cascade delete tags)

---

### POST /api/publications/sync (Admin, Future)
**Purpose:** Trigger sync from external platforms

---

## Acceptance Criteria

✅ **AC1: Public Listing**
- GET /api/publications returns paginated results
- Results sorted by publishedAt desc by default
- Each publication includes platform, readTime, excerpt

✅ **AC2: Featured Publications**
- GET /api/publications/featured returns max 4 items
- Only returns featured=true publications
- Sorted by publishedAt desc

✅ **AC3: Create Publication**
- Admin can POST with required fields
- Slug auto-generated from title
- Tags assigned via tagIds array
- Returns created publication

✅ **AC4: Unique Slugs**
- Duplicate title → slug with numeric suffix
- Example: "Article" → "article", "article-1", "article-2"

✅ **AC5: Platform Filtering**
- Filter by platform returns only matching publications
- Platform badge displays correctly on frontend

✅ **AC6: Tag Associations**
- Publications returned with nested tag details
- Tag changes persist correctly
- Deleting publication removes tag associations

✅ **AC7: Pagination**
- Page 1 returns items 1-20
- Page 2 returns items 21-40
- Total count accurate for filtered results

✅ **AC8: Update Slug on Title Change**
- Updating title regenerates slug
- Old slug no longer resolves
- External links may break (acceptable tradeoff)

✅ **AC9: Admin Authorization**
- POST/PUT/DELETE require authentication
- Non-admin users receive 401/403

---

## Validation Rules

- **Title:** Required, 1-500 characters
- **Excerpt:** Required, minimum 10 characters
- **ExternalUrl:** Required, valid URL format
- **Platform:** Required, must match Platform enum
- **PublishedAt:** Required, valid ISO 8601 date
- **ReadTime:** Optional, positive integer
- **ImageUrl:** Optional, valid URL format
- **TagIds:** Optional, array of valid tag CUIDs

---

## Out of Scope

❌ **Full Content Storage:** No in-app article reading (link to external)
❌ **Comments:** No user discussion features
❌ **Analytics:** No view count or engagement metrics
❌ **Draft Status:** All publications are published (no draft workflow)
❌ **Scheduling:** No future publish dates
❌ **Multi-Author:** Single author per publication (always Aravind)

---

## Non-Functional Requirements

- **Performance:** List queries < 500ms, single publication < 200ms
- **Security:** Admin endpoints require JWT authentication
- **SEO:** Slugs optimized for URLs, external links properly attributed
- **Scalability:** Pagination required for lists over 20 items

---

## Related Documentation

- Feature: [publications.md](../../02-what/features/publications.md)
- Implementation: [publications-timeline.impl.md](../implementation/publications-timeline.impl.md)
- Tags Spec: [tags.spec.md](tags.spec.md)
- API Reference: [api-endpoints.md](../architecture/api-endpoints.md)
