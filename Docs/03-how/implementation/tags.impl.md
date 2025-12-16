---
implements: specs/tags.spec.md
type: infrastructure
modules:
  - backend/src/app/api/tags/route.ts
  - backend/src/app/api/tags/categories/route.ts
  - backend/src/services/tag.service.ts
  - backend/src/schemas/tag.schema.ts
  - backend/prisma/schema.prisma
  - frontend/src/hooks/useTags.ts
dependencies:
  - prisma
  - zod
  - react-query
last_updated: 2025-12-15
---

# Tags System Implementation

## Architecture

Three-layer architecture for categorized tag management:

1. **Data Layer:** Prisma managing Tag, ProjectTag, PublicationTag models
2. **API Layer:** Two endpoints (GET tags, POST create) with category filtering
3. **Frontend Layer:** React hooks for tag querying

**Key Design:** Many-to-many relationships via join tables enable flexible content tagging.

---

## Data Model

### Prisma Schema
**Location:** `backend/prisma/schema.prisma`

```prisma
enum TagCategory {
  RESEARCH_METHOD
  INDUSTRY
  TOPIC
  TOOL
  SKILL
}

model Tag {
  id        String      @id @default(cuid())
  name      String
  slug      String      @unique
  category  TagCategory
  createdAt DateTime    @default(now())

  projects     ProjectTag[]
  publications PublicationTag[]

  @@index([slug])
  @@index([category])
}

model ProjectTag {
  projectId String
  tagId     String

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])
  @@index([projectId])
  @@index([tagId])
}

model PublicationTag {
  publicationId String
  tagId         String

  publication Publication @relation(fields: [publicationId], references: [id], onDelete: Cascade)
  tag         Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([publicationId, tagId])
  @@index([publicationId])
  @@index([tagId])
}
```

**Design Decisions:**
- Enum for TagCategory ensures data integrity
- Composite primary keys on join tables prevent duplicates
- Cascade deletes maintain referential integrity
- Indexes optimize filtering and relationship queries

---

## Backend Implementation

### 1. API Routes

#### GET /api/tags
**Location:** `backend/src/app/api/tags/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = tagQuerySchema.parse(searchParams);

    const tags = await tagService.getTags(query);

    return successResponse(tags);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
```

**Flow:**
1. Extract query params from URL
2. Validate with Zod schema (category optional)
3. Call service layer
4. Return tags with usage counts

---

#### POST /api/tags
**Location:** `backend/src/app/api/tags/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    const body = await request.json();
    const data = createTagSchema.parse(body);

    const tag = await tagService.createTag(data);

    return successResponse(tag);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
```

**Flow:**
1. Authenticate request
2. Verify admin role
3. Validate request body
4. Create tag with auto-generated slug
5. Return created tag

---

#### GET /api/tags/categories
**Location:** `backend/src/app/api/tags/categories/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const tagsByCategory = await tagService.getTagsByCategory();
    return successResponse(tagsByCategory);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
```

**Flow:**
1. Call service to fetch all tags
2. Group by category
3. Return structured object with 5 category keys

---

### 2. Service Layer
**Location:** `backend/src/services/tag.service.ts`

#### getTags()
```typescript
async getTags(query: TagQueryInput) {
  const { category } = query;

  const tags = await prisma.tag.findMany({
    where: {
      ...(category && { category }),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  // Add usage count for each tag
  const tagsWithCount = await Promise.all(
    tags.map(async (tag) => {
      const [projectCount, publicationCount] = await Promise.all([
        prisma.projectTag.count({ where: { tagId: tag.id } }),
        prisma.publicationTag.count({ where: { tagId: tag.id } }),
      ]);

      return {
        ...tag,
        count: projectCount + publicationCount,
      };
    })
  );

  return tagsWithCount;
}
```

**Usage Count Calculation:**
- Parallel queries for ProjectTag and PublicationTag counts
- Sum both counts for total usage
- Runs for each tag (N+1 query pattern, acceptable for small tag sets)

**Optimization Opportunity:**
Could use Prisma's `_count` feature or raw SQL join for better performance at scale.

---

#### getTagsByCategory()
```typescript
async getTagsByCategory() {
  const tags = await this.getTags({});

  const grouped: Record<TagCategory, typeof tags> = {
    RESEARCH_METHOD: [],
    INDUSTRY: [],
    TOPIC: [],
    TOOL: [],
    SKILL: [],
  };

  tags.forEach((tag) => {
    grouped[tag.category].push(tag);
  });

  return grouped;
}
```

**Grouping Logic:**
- Initialize object with all 5 categories
- Populate each category array by iterating tags
- Ensures all categories present even if empty

---

#### createTag()
```typescript
async createTag(data: CreateTagInput) {
  const slug = slugify(data.name);

  // Check if slug already exists
  const existing = await prisma.tag.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new ConflictError('A tag with this name already exists');
  }

  const tag = await prisma.tag.create({
    data: {
      ...data,
      slug,
    },
  });

  return tag;
}
```

**Slug Generation:**
- Uses shared `slugify()` utility function
- Converts to lowercase kebab-case (e.g., "User Interviews" → "user-interviews")
- Checks uniqueness before creation
- Throws ConflictError if duplicate detected

---

#### deleteTag()
```typescript
async deleteTag(id: string) {
  const tag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!tag) {
    throw new NotFoundError('Tag');
  }

  // Check if tag is in use
  const [projectCount, publicationCount] = await Promise.all([
    prisma.projectTag.count({ where: { tagId: id } }),
    prisma.publicationTag.count({ where: { tagId: id } }),
  ]);

  if (projectCount > 0 || publicationCount > 0) {
    throw new ConflictError(
      'Cannot delete tag that is currently in use. Remove it from all projects and publications first.'
    );
  }

  await prisma.tag.delete({
    where: { id },
  });
}
```

**Deletion Protection:**
- Counts usage before deletion
- Prevents accidental deletion of active tags
- Provides clear error message with reason
- Hard delete (no soft delete mechanism)

---

### 3. Validation Schemas
**Location:** `backend/src/schemas/tag.schema.ts`

```typescript
export const tagCategoryEnum = z.enum([
  'RESEARCH_METHOD',
  'INDUSTRY',
  'TOPIC',
  'TOOL',
  'SKILL',
]);

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  category: tagCategoryEnum,
});

export const tagQuerySchema = z.object({
  category: tagCategoryEnum.optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type TagQueryInput = z.infer<typeof tagQuerySchema>;
```

**Validation:**
- Enum ensures category is valid
- Name length constrained to 1-50 chars
- TypeScript types auto-generated from schemas

---

## Frontend Implementation

### Data Fetching Hooks
**Location:** `frontend/src/hooks/useTags.ts`

```typescript
export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: string;
  count?: number;
}

export function useTags(category?: string) {
  const queryString = category ? `?category=${category}` : '';

  return useQuery({
    queryKey: ['tags', category],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Tag[]>>(`/api/tags${queryString}`);
      return response.data;
    },
  });
}

export function useTagsByCategory() {
  return useQuery({
    queryKey: ['tags', 'categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Record<string, Tag[]>>>('/api/tags/categories');
      return response.data;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; category: string }) => {
      const response = await api.post<ApiResponse<Tag>>('/api/tags', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
```

**React Query Integration:**
- `useTags(category)`: Fetch all tags or filter by category
- `useTagsByCategory()`: Fetch tags grouped by category
- `useCreateTag()`: Mutation for creating new tags
- Automatic cache invalidation on creation

---

## Data Flow

### Tag Creation Flow
```
1. Admin fills tag creation form
   ↓
2. Submit calls useCreateTag() mutation
   ↓
3. POST /api/tags with {name, category}
   ↓
4. Authenticate and verify admin
   ↓
5. Validate input with Zod
   ↓
6. tagService.createTag()
   ↓
7. Generate slug from name
   ↓
8. Check for duplicate slug
   ↓
9. If unique: INSERT INTO Tag
10. If duplicate: throw ConflictError
   ↓
11. Return created tag
   ↓
12. React Query invalidates cache
   ↓
13. All tag queries refetch automatically
```

---

### Tag Retrieval with Usage Counts
```
1. Frontend calls useTags()
   ↓
2. GET /api/tags
   ↓
3. tagService.getTags()
   ↓
4. SELECT * FROM Tag ORDER BY category, name
   ↓
5. For each tag in parallel:
   - COUNT ProjectTag WHERE tagId = tag.id
   - COUNT PublicationTag WHERE tagId = tag.id
   ↓
6. Attach count to each tag object
   ↓
7. Return enriched tags
   ↓
8. React Query caches result
```

---

## Tag Assignment to Content

### Projects Using Tags
**Location:** `backend/src/services/project.service.ts`

```typescript
// When creating/updating project
await prisma.project.update({
  where: { id: projectId },
  data: {
    tags: {
      deleteMany: {},  // Remove all existing tags
      create: tagIds.map(tagId => ({ tagId })),  // Add new tags
    },
  },
});
```

**Pattern:**
- Delete all existing associations
- Recreate from scratch
- Simpler than differential updates

---

### Publications Using Tags
**Location:** `backend/src/services/publication.service.ts`

```typescript
// Similar pattern for publications
await prisma.publication.update({
  where: { id: publicationId },
  data: {
    tags: {
      deleteMany: {},
      create: tagIds.map(tagId => ({ tagId })),
    },
  },
});
```

---

## Querying Content by Tags

### Fetch Project with Tags
```typescript
const project = await prisma.project.findUnique({
  where: { slug },
  include: {
    tags: {
      include: {
        tag: true,  // Include full tag details
      },
    },
  },
});

// Transform for frontend
const transformedProject = {
  ...project,
  tags: project.tags.map(pt => pt.tag),  // Flatten join table
};
```

### Filter Projects by Tag
```typescript
const projects = await prisma.project.findMany({
  where: {
    tags: {
      some: {
        tagId: { in: tagIds },  // Match any of these tags
      },
    },
  },
  include: {
    tags: {
      include: { tag: true },
    },
  },
});
```

**Query Logic:**
- `some`: Match projects with at least one of the tags (OR logic)
- `every`: Match projects with all tags (AND logic) - not commonly used
- `none`: Match projects without these tags (exclusion)

---

## Performance Considerations

### Current Implementation
- N+1 queries for usage counts (acceptable for ~100 tags)
- Sequential tag assignment operations
- No caching beyond React Query

### Optimization Opportunities

#### 1. Batch Usage Count Calculation
```typescript
// Instead of N queries, use 2 aggregate queries
const projectCounts = await prisma.projectTag.groupBy({
  by: ['tagId'],
  _count: { tagId: true },
});

const publicationCounts = await prisma.publicationTag.groupBy({
  by: ['tagId'],
  _count: { tagId: true },
});

// Merge counts in application code
```

#### 2. Materialized View (Future)
- Store pre-calculated counts in Tag table
- Update counts via database triggers or background job
- Trade write complexity for read performance

#### 3. Redis Caching (Future)
- Cache tag lists (rarely change)
- Invalidate on tag creation/deletion
- Reduce database load for public endpoints

---

## Security Implementation

### Authentication
```typescript
export async function POST(request: NextRequest) {
  const user = await authenticate(request);  // JWT verification
  requireAdmin(user);  // Role check
  // ... rest of implementation
}
```

### Input Validation
- Zod schemas validate all inputs
- Category restricted to enum values
- Name length constraints enforced
- Slug generation prevents injection

### Authorization
- Public: GET /api/tags (anyone)
- Admin: POST /api/tags (authenticated admins only)
- Admin: DELETE /api/tags/[id] (authenticated admins only)

---

## Error Handling

### Conflict Errors
```typescript
// Duplicate slug
if (existing) {
  throw new ConflictError('A tag with this name already exists');
}

// Tag in use
if (projectCount > 0 || publicationCount > 0) {
  throw new ConflictError(
    'Cannot delete tag that is currently in use. Remove it from all projects and publications first.'
  );
}
```

### Not Found Errors
```typescript
if (!tag) {
  throw new NotFoundError('Tag');
}
```

### Validation Errors
```typescript
// Zod automatically throws ZodError
const data = createTagSchema.parse(body);  // May throw
```

**Global Error Handler** (`handleError` utility) converts these to appropriate HTTP responses.

---

## Testing Considerations

### Unit Tests
```typescript
describe('TagService', () => {
  it('should create tag with auto-generated slug', async () => {
    const tag = await tagService.createTag({
      name: 'User Interviews',
      category: 'RESEARCH_METHOD',
    });

    expect(tag.slug).toBe('user-interviews');
  });

  it('should prevent duplicate slugs', async () => {
    await tagService.createTag({ name: 'UX Research', category: 'TOPIC' });

    await expect(
      tagService.createTag({ name: 'UX Research', category: 'SKILL' })
    ).rejects.toThrow('already exists');
  });

  it('should calculate usage counts correctly', async () => {
    // Create tag, projects, publications, and associations
    // Verify count matches expected value
  });

  it('should prevent deletion of used tags', async () => {
    // Create tag and associations
    await expect(tagService.deleteTag(tagId)).rejects.toThrow('in use');
  });
});
```

### Integration Tests
```typescript
describe('GET /api/tags', () => {
  it('should return all tags with counts', async () => {
    const response = await api.get('/api/tags');

    expect(response.data).toBeInstanceOf(Array);
    expect(response.data[0]).toHaveProperty('count');
  });

  it('should filter by category', async () => {
    const response = await api.get('/api/tags?category=RESEARCH_METHOD');

    expect(response.data.every(tag => tag.category === 'RESEARCH_METHOD')).toBe(true);
  });
});

describe('POST /api/tags', () => {
  it('should require authentication', async () => {
    const response = await api.post('/api/tags', { name: 'Test', category: 'TOPIC' });

    expect(response.status).toBe(401);
  });

  it('should create tag with valid data', async () => {
    const response = await authenticatedApi.post('/api/tags', {
      name: 'New Tag',
      category: 'INDUSTRY',
    });

    expect(response.status).toBe(200);
    expect(response.data.slug).toBe('new-tag');
  });
});
```

---

## Deployment Notes

### Environment Variables
None specific to tags (uses shared DATABASE_URL, JWT_SECRET)

### Database Migrations
Schema already exists, no migration needed for existing deployments

### Seed Data
```typescript
// backend/prisma/seed.ts
const tagSeeds = [
  { name: 'User Interviews', category: 'RESEARCH_METHOD' },
  { name: 'Usability Testing', category: 'RESEARCH_METHOD' },
  { name: 'Healthcare', category: 'INDUSTRY' },
  { name: 'FinTech', category: 'INDUSTRY' },
  { name: 'Accessibility', category: 'TOPIC' },
  { name: 'Mobile UX', category: 'TOPIC' },
  { name: 'Figma', category: 'TOOL' },
  { name: 'React', category: 'TOOL' },
  { name: 'Qualitative Analysis', category: 'SKILL' },
  { name: 'Prototyping', category: 'SKILL' },
  // ... more tags
];

for (const tagData of tagSeeds) {
  await prisma.tag.upsert({
    where: { slug: slugify(tagData.name) },
    update: {},
    create: { ...tagData, slug: slugify(tagData.name) },
  });
}
```

---

## Future Enhancements

### Potential Improvements
1. **Batch Tag Assignment:** Accept array of tag names, auto-create if missing
2. **Tag Suggestions:** ML-based tag recommendations for new content
3. **Tag Aliases:** Support synonyms (e.g., "UX" → "User Experience")
4. **Tag Descriptions:** Add tooltip text explaining tag meaning
5. **Tag Analytics:** Track which tags drive most traffic/engagement

---

## Related Documentation

- Specification: [tags.spec.md](../specs/tags.spec.md)
- Feature: [tags.md](../../02-what/features/tags.md)
- Projects Implementation: [projects-api.impl.md](projects-api.impl.md)
- Database Schema: [database-schema.md](../architecture/database-schema.md)
- Slugification Utility: Shared utility in `backend/src/lib/slugify.ts`
