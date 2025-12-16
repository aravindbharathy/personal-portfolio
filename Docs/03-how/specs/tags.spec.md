---
feature_id: FEAT-007
status: implemented
owner: Aravind Bharathy
implements: features/tags.md
verified: 2025-12-15
related_specs: [projects-crud.spec.md, publications-crud.spec.md]
---

# Tags System Specification

## Purpose

Provide a categorized tagging system for organizing and discovering Projects and Publications across five dimensions: research methods, industries, topics, tools, and skills.

---

## Data Model

### Tag Entity
```typescript
{
  id: string              // CUID primary key
  name: string            // Display name (required, 1-50 chars)
  slug: string            // Auto-generated, unique, URL-safe
  category: TagCategory   // Required enum value
  createdAt: DateTime     // Auto-managed
}
```

### TagCategory Enum
```typescript
enum TagCategory {
  RESEARCH_METHOD  // Research methodologies
  INDUSTRY         // Domain/vertical markets
  TOPIC            // Subject matter/themes
  TOOL             // Technologies/software
  SKILL            // Core competencies
}
```

### Join Tables
```typescript
ProjectTag {
  projectId: string     // FK to Project
  tagId: string         // FK to Tag
  // Composite primary key [projectId, tagId]
}

PublicationTag {
  publicationId: string // FK to Publication
  tagId: string         // FK to Tag
  // Composite primary key [publicationId, tagId]
}
```

---

## Requirements

### FR1: Tag CRUD Operations
- **Create:** Admin can create tags with name and category
- **Read:** Anyone can view tags (public endpoint)
- **Delete:** Admin can delete unused tags only
- **Update:** Not supported (delete and recreate instead)

### FR2: Automatic Slug Generation
- MUST auto-generate slug from name on creation
- MUST ensure slug uniqueness
- MUST throw error if name produces duplicate slug

### FR3: Category Filtering
- MUST support filtering tags by category
- MUST return tags grouped by category
- MUST order tags alphabetically within category

### FR4: Usage Tracking
- MUST calculate usage count for each tag
- MUST count ProjectTag associations
- MUST count PublicationTag associations
- MUST return total count with tag data

### FR5: Deletion Protection
- MUST prevent deletion if tag has associations
- MUST check both ProjectTag and PublicationTag tables
- MUST return clear error message if in use

### FR6: Many-to-Many Relationships
- Projects can have 0-N tags
- Publications can have 0-N tags
- Tags can be used by 0-N projects/publications
- Cascade delete tag associations when content deleted

---

## API Endpoints

### GET /api/tags
**Purpose:** Retrieve all tags or filter by category

**Auth:** None (public)

**Query Params:**
- `category` (optional): TagCategory enum value

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123",
      "name": "User Interviews",
      "slug": "user-interviews",
      "category": "RESEARCH_METHOD",
      "count": 5,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### GET /api/tags/categories
**Purpose:** Retrieve tags grouped by category

**Auth:** None (public)

**Response:**
```json
{
  "success": true,
  "data": {
    "RESEARCH_METHOD": [
      {
        "id": "cuid123",
        "name": "User Interviews",
        "slug": "user-interviews",
        "category": "RESEARCH_METHOD",
        "count": 5,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "INDUSTRY": [ /* ... */ ],
    "TOPIC": [ /* ... */ ],
    "TOOL": [ /* ... */ ],
    "SKILL": [ /* ... */ ]
  }
}
```

---

### POST /api/tags
**Purpose:** Create new tag

**Auth:** Required (admin only)

**Request Body:**
```json
{
  "name": "User Interviews",
  "category": "RESEARCH_METHOD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "User Interviews",
    "slug": "user-interviews",
    "category": "RESEARCH_METHOD",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Error Cases:**
- 400: Validation failed (invalid category, missing name)
- 401: Unauthorized
- 409: Tag with this name already exists (slug conflict)

---

### DELETE /api/tags/[id]
**Purpose:** Delete unused tag

**Auth:** Required (admin only)

**Response:**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

**Error Cases:**
- 401: Unauthorized
- 404: Tag not found
- 409: Cannot delete tag in use (provides count)

---

## Acceptance Criteria

### Public Tag Browsing

✅ **AC1: View All Tags**
- When I call GET /api/tags
- Then I receive all tags sorted by category then name
- And each tag includes usage count

✅ **AC2: Filter by Category**
- When I call GET /api/tags?category=RESEARCH_METHOD
- Then I receive only RESEARCH_METHOD tags
- And results are alphabetically sorted

✅ **AC3: Tags Grouped by Category**
- When I call GET /api/tags/categories
- Then I receive object with 5 category keys
- And each category contains array of tags
- And empty categories return empty arrays

✅ **AC4: Usage Count Accuracy**
- Given a tag used by 3 projects and 2 publications
- When I retrieve that tag
- Then count field equals 5

---

### Admin Tag Management

✅ **AC5: Create Tag**
- Given I am authenticated as admin
- When I POST /api/tags with valid data
- Then tag is created with auto-generated slug
- And tag is immediately queryable

✅ **AC6: Slug Auto-generation**
- When I create tag with name "User Interviews"
- Then slug is automatically set to "user-interviews"
- And slug follows lowercase kebab-case pattern

✅ **AC7: Prevent Duplicate Slugs**
- Given tag "User Interviews" exists
- When I try to create another "User Interviews"
- Then I receive 409 Conflict error
- And error message indicates duplicate

✅ **AC8: Delete Unused Tag**
- Given a tag with count = 0
- When I DELETE /api/tags/[id]
- Then tag is permanently deleted
- And no error occurs

✅ **AC9: Prevent Deletion of Used Tag**
- Given a tag with count > 0
- When I DELETE /api/tags/[id]
- Then I receive 409 Conflict error
- And error message includes usage count
- And tag is not deleted

✅ **AC10: Authentication Required**
- Given I am not authenticated
- When I POST or DELETE to /api/tags/*
- Then I receive 401 Unauthorized

---

### Data Integrity

✅ **AC11: Cascade Delete Associations**
- Given Project X has Tag Y
- When Project X is deleted
- Then ProjectTag association is deleted
- But Tag Y still exists

✅ **AC12: Many-to-Many Relationships**
- When I assign 5 tags to Project X
- And assign Tag Y to 10 projects
- Then all associations are stored correctly
- And counts reflect accurate totals

✅ **AC13: Unique Composite Keys**
- When I try to add same tag to same project twice
- Then I receive database constraint error
- And only one association exists

---

## Out of Scope

❌ **Tag Updates**
- No editing tag name or category
- Must delete and recreate instead

❌ **Tag Hierarchies**
- No parent/child relationships
- Flat structure only

❌ **Custom Categories**
- Categories are fixed enum
- Cannot add new categories without schema change

❌ **Tag Descriptions**
- No metadata or descriptions for tags
- Name and category only

❌ **User-Specific Tags**
- Tags are global, not per-user
- All users see same tag vocabulary

❌ **Tag Popularity Trends**
- No historical tracking of usage over time

---

## Non-Functional Requirements

### Performance
- Tag list retrieval: < 200ms
- Tag creation: < 500ms
- Usage count calculation: < 1000ms

### Security
- Public read access (GET)
- Admin-only write access (POST, DELETE)
- Input validation on name and category
- SQL injection protection via Prisma

### Scalability
- Efficient indexing on slug and category
- Composite indexes on join tables
- Optimized usage count queries

---

## Validation Rules

### Tag Name
- Required: Yes
- Min length: 1 character
- Max length: 50 characters
- Allowed characters: Any (unicode support)

### Category
- Required: Yes
- Must be one of: RESEARCH_METHOD, INDUSTRY, TOPIC, TOOL, SKILL
- Case-sensitive enum matching

### Slug
- Auto-generated, not user-provided
- Lowercase only
- Alphanumeric + hyphens
- Must be unique across all tags

---

## Database Indexes

```prisma
model Tag {
  @@index([slug])      // Fast lookup by slug
  @@index([category])  // Filter by category
}

model ProjectTag {
  @@id([projectId, tagId])  // Composite primary key
  @@index([projectId])       // Fetch tags for project
  @@index([tagId])           // Fetch projects for tag
}

model PublicationTag {
  @@id([publicationId, tagId])  // Composite primary key
  @@index([publicationId])       // Fetch tags for publication
  @@index([tagId])               // Fetch publications for tag
}
```

---

## Error Scenarios

### Validation Errors
- Empty name → "Name is required"
- Name > 50 chars → "Name must be 50 characters or less"
- Invalid category → "Invalid category. Must be one of: ..."
- Missing category → "Category is required"

### Conflict Errors
- Duplicate slug → "A tag with this name already exists"
- Delete tag in use → "Cannot delete tag that is currently in use. Remove it from all projects and publications first."

### Not Found Errors
- Delete non-existent tag → "Tag not found"

---

## Migration Notes

**Existing Schema:**
- Tag, ProjectTag, PublicationTag models already exist
- TagCategory enum already defined
- No migration needed

**Seed Data:**
- Provide seed script with common tags for each category
- Include 20-30 starter tags across all categories

---

## Related Documentation

- Feature: [tags.md](../../02-what/features/tags.md)
- Implementation: [tags.impl.md](../implementation/tags.impl.md)
- Projects Spec: [projects-crud.spec.md](projects-crud.spec.md)
- Publications Spec: [publications-crud.spec.md](publications-crud.spec.md)
- Database Schema: [database-schema.md](../architecture/database-schema.md)
