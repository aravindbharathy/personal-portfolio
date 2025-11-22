---
implements: N/A (Feature documentation)
type: feature
modules:
  - backend/src/app/api/guidebooks
  - backend/src/services/guidebook.service.ts
  - backend/src/schemas/guidebook.schema.ts
  - frontend/src/pages/Guidebooks.tsx
  - frontend/src/pages/admin/Guidebooks.tsx
  - frontend/src/components/admin/GuidebookForm.tsx
  - frontend/src/components/admin/GuidebookArticlesManager.tsx
  - frontend/src/hooks/useGuidebooks.ts
dependencies:
  - prisma
  - zod
  - @tanstack/react-query
  - shadcn/ui
last_updated: 2025-01-21
---

# Guidebooks Implementation

## Architecture Overview

Guidebooks follow a hierarchical content organization pattern with three levels:
1. **Area** - High-level topic categorization (string field)
2. **Guidebook** - Collection with metadata
3. **Chapters** - Many-to-many relationship with Publications via GuidebookArticle junction table

## Database Schema

### Guidebook Model
```prisma
model Guidebook {
  id             String   @id @default(cuid())
  title          String
  slug           String   @unique
  area           String   // Category/topic for grouping
  description    String   @db.Text
  purpose        String   @db.Text
  targetAudience String
  coverImage     String?
  totalReadTime  Int?     @default(0)
  featured       Boolean  @default(false)
  published      Boolean  @default(false)
  createdAt      DateTime @default(now())
  lastUpdated    DateTime @default(now())
  
  authorId       String
  author         User     @relation(fields: [authorId], references: [id])
  articles       GuidebookArticle[]
  
  @@index([area])
  @@index([slug])
}

model GuidebookArticle {
  id              String   @id @default(cuid())
  guidebookId     String
  publicationId   String
  order           Int
  customTitle     String?
  customExcerpt   String?  @db.Text
  createdAt       DateTime @default(now())
  
  guidebook       Guidebook   @relation(fields: [guidebookId], references: [id], onDelete: Cascade)
  publication     Publication @relation(fields: [publicationId], references: [id], onDelete: Cascade)
  
  @@unique([guidebookId, publicationId])
  @@index([guidebookId, order])
}
```

## Backend Implementation

### API Routes

**Base Routes:**
- `GET /api/guidebooks` - List guidebooks (supports filtering by published, featured)
- `POST /api/guidebooks` - Create guidebook (admin only)
- `GET /api/guidebooks/:slug` - Get single guidebook with chapters
- `PUT /api/guidebooks/:slug` - Update guidebook (admin only)
- `DELETE /api/guidebooks/:slug` - Delete guidebook (admin only)
- `PATCH /api/guidebooks/:slug/publish` - Toggle publish status (admin only)

**Chapter Management Routes:**
- `POST /api/guidebooks/:slug/articles` - Add chapter
- `DELETE /api/guidebooks/:slug/articles/:articleId` - Remove chapter
- `PATCH /api/guidebooks/:slug/articles/reorder` - Reorder chapters

### Service Layer (`guidebook.service.ts`)

**Key Methods:**

```typescript
class GuidebookService {
  // Fetches guidebooks with pagination, transforms articles
  async getGuidebooks(query: GuidebookQueryInput)
  
  // Fetches single guidebook, transforms article data
  async getGuidebookBySlug(slug: string)
  
  // Creates guidebook with unique slug generation
  async createGuidebook(data: CreateGuidebookInput, authorId: string)
  
  // Updates guidebook, regenerates slug if title changes
  async updateGuidebook(id: string, data: UpdateGuidebookInput)
  
  // Deletes guidebook (cascade deletes articles via Prisma)
  async deleteGuidebook(id: string)
  
  // Adds publication as chapter, recalculates total read time
  async addArticleToGuidebook(guidebookId: string, data: AddArticleInput)
  
  // Removes chapter, recalculates total read time
  async removeArticleFromGuidebook(articleId: string)
}
```

**Data Transformation:**

The service transforms the nested Prisma result to flatten article data:

```typescript
// Before transformation (Prisma result):
{
  articles: [{
    publication: { id, title, slug, excerpt, readTime, ... },
    order: 0,
    customTitle: null,
    customExcerpt: null
  }]
}

// After transformation (API response):
{
  articles: [{
    id: publication.id,
    title: customTitle || publication.title,
    slug: publication.slug,
    excerpt: customExcerpt || publication.excerpt,
    readTime: publication.readTime,
    order: 0
  }]
}
```

This simplifies frontend consumption and supports future custom titles/excerpts.

### Validation (`guidebook.schema.ts`)

```typescript
createGuidebookSchema = z.object({
  title: z.string().min(1).max(200),
  area: z.string().min(1),
  description: z.string().min(10),
  purpose: z.string().min(10),
  targetAudience: z.string().min(1),
  coverImage: z.string().url().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
})

addArticleToGuidebookSchema = z.object({
  publicationId: z.string(),
  order: z.number().int().min(0),
  customTitle: z.string().optional(),
  customExcerpt: z.string().optional(),
})
```

## Frontend Implementation

### React Query Hooks (`useGuidebooks.ts`)

```typescript
// Fetch all guidebooks
useGuidebooks(params?: Record<string, any>)

// Fetch single guidebook with auto-refetch
useGuidebook(slug: string)

// Mutations
useCreateGuidebook()
useUpdateGuidebook()
useDeleteGuidebook()
useTogglePublishGuidebook()
useAddArticleToGuidebook()
useRemoveArticleFromGuidebook()
useReorderGuidebookArticles()
```

**Key Pattern:** Mutations automatically invalidate relevant queries:
```typescript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ['guidebooks'] })
  queryClient.invalidateQueries({ queryKey: ['guidebook', variables.slug] })
}
```

### Admin Components

**GuidebookForm** (`GuidebookForm.tsx`):
- Handles create/edit with all metadata fields
- Conditional coverImage inclusion (only if non-empty)
- Displays validation errors from backend

**GuidebookArticlesManager** (`GuidebookArticlesManager.tsx`):
- Fetches fresh guidebook data via `useGuidebook(slug)`
- Displays current chapters with excerpts
- Dropdown to select publications (filters out already-added)
- Add/Remove buttons with optimistic updates
- Placeholder up/down buttons for future reordering

**Key Implementation Detail:**
The component refetches guidebook data on mount and after mutations:

```typescript
const { data: guidebook } = useGuidebook(initialGuidebook.slug);
const currentGuidebook = guidebook || initialGuidebook;
```

This ensures the UI updates immediately after adding/removing chapters.

### Public Display (`Guidebooks.tsx`)

**Features:**
- Groups guidebooks by area
- Sorts areas alphabetically
- Displays guidebook cards with metadata
- Shows chapters in order with excerpts
- Links to publications
- Shows statistics (chapter count, total read time)

**Layout Structure:**
```
Hero Section (overview + stats)
  ↓
Areas (sorted alphabetically)
  ↓
Guidebooks (within each area)
  ↓
Chapters (within each guidebook)
  ↓
Links to Publications
```

## Data Flow

### Adding a Chapter

1. User selects publication from dropdown
2. Frontend calls `addArticle.mutateAsync()`
3. Backend validates input
4. Creates `GuidebookArticle` record
5. Recalculates `totalReadTime` on Guidebook
6. Returns transformed article data
7. React Query invalidates guidebook queries
8. Component refetches and updates UI

### Removing a Chapter

1. User clicks trash icon
2. Frontend calls `removeArticle.mutateAsync()`
3. Backend finds and deletes `GuidebookArticle`
4. Recalculates `totalReadTime` on Guidebook
5. React Query invalidates queries
6. Component refetches and updates UI

## Styling Approach

- Tailwind CSS utility classes
- Shadcn/UI components (Card, Button, Select, etc.)
- Responsive design with mobile-first approach
- Hover states for interactivity
- Loading states and skeletons
- Toast notifications for feedback

## Performance Considerations

- Pagination for guidebook lists
- Selective field loading (exclude unused relations)
- Query key invalidation (not full refetch)
- Optimistic UI updates where appropriate
- Memoization of derived data

## Future Improvements

1. **Drag-and-drop reordering** - Implement using dnd-kit
2. **Bulk operations** - Add/remove multiple chapters at once
3. **Custom chapter metadata** - Support title/excerpt overrides
4. **Chapter previews** - Show publication content inline
5. **Area management** - Admin interface to standardize areas
6. **Search/filter** - Find guidebooks by keyword
7. **Analytics** - Track guidebook views and engagement
