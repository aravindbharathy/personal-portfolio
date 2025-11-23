---
implements: specs/project-picture-grids.spec.md
type: feature
modules:
  - backend/prisma/schema.prisma
  - backend/src/schemas/project.schema.ts
  - backend/src/services/project.service.ts
  - frontend/src/hooks/useProjects.ts
  - frontend/src/components/admin/PictureGridManager.tsx
  - frontend/src/components/admin/ProjectForm.tsx
  - frontend/src/components/PictureGrid.tsx
  - frontend/src/pages/ProjectDetail.tsx
dependencies:
  - @prisma/client
  - zod
  - react-hook-form
last_updated: 2025-11-23
---

# Project Picture Grids Implementation

## Architecture

The picture grids feature uses a relational database structure with two models (`ProjectPictureGrid` and `ProjectGridPicture`) connected to the main `Project` model. The implementation follows a full-stack approach with:

1. **Database Layer**: Prisma ORM with PostgreSQL
2. **Validation Layer**: Zod schemas for API input validation
3. **Service Layer**: Business logic in project service
4. **API Layer**: Next.js API routes with authentication
5. **Frontend Layer**: React components with TypeScript
6. **UI Layer**: Reusable components for admin and public display

## Database Schema

### ProjectPictureGrid Model
```prisma
model ProjectPictureGrid {
  id          String   @id @default(cuid())
  projectId   String
  position    String   // Enum: before_objectives, after_objectives, etc.
  columns     Int      // 1, 2, or 3
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  project Project              @relation(fields: [projectId], references: [id], onDelete: Cascade)
  pictures ProjectGridPicture[]

  @@index([projectId])
  @@index([position])
}
```

### ProjectGridPicture Model
```prisma
model ProjectGridPicture {
  id      String @id @default(cuid())
  gridId  String
  url     String
  alt     String
  caption String?
  order   Int    @default(0)

  grid ProjectPictureGrid @relation(fields: [gridId], references: [id], onDelete: Cascade)

  @@index([gridId])
}
```

**Key Design Decisions:**
- Cascade deletes ensure referential integrity
- Separate `order` fields on both grids and pictures for flexible positioning
- Position stored as string for flexibility (could be enum in future)
- Indexed foreign keys for query performance

**Migration:**
`prisma/migrations/20251122213136_add_project_picture_grids/migration.sql`

## Backend Validation

### Zod Schemas
Located in `src/schemas/project.schema.ts`:

```typescript
export const projectGridPictureSchema = z.object({
  url: z.string().url('Invalid picture URL'),
  alt: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  order: z.number().int().min(0),
});

export const projectPictureGridSchema = z.object({
  position: z.enum([
    'before_objectives', 'after_objectives',
    'before_methodology', 'after_methodology',
    'before_findings', 'after_findings',
    'before_impact', 'after_impact',
  ]),
  columns: z.number().int().min(1).max(3),
  order: z.number().int().min(0).default(0),
  pictures: z.array(projectGridPictureSchema).min(1),
});
```

**Validation Rules:**
- URLs must be valid
- Alt text is required (accessibility)
- Columns constrained to 1-3
- At least one picture per grid
- Position must match enum values

## Service Layer

### Project Service Updates
Located in `src/services/project.service.ts`:

**Query Enhancements:**
All project queries now include:
```typescript
pictureGrids: {
  include: {
    pictures: {
      orderBy: { order: 'asc' },
    },
  },
  orderBy: { order: 'asc' },
}
```

**Create Project:**
```typescript
// After creating project in transaction
if (pictureGrids && pictureGrids.length > 0) {
  for (const grid of pictureGrids) {
    const { pictures, ...gridData } = grid;
    const createdGrid = await tx.projectPictureGrid.create({
      data: {
        projectId: newProject.id,
        ...gridData,
      },
    });
    if (pictures && pictures.length > 0) {
      await tx.projectGridPicture.createMany({
        data: pictures.map((pic) => ({
          gridId: createdGrid.id,
          ...pic,
        })),
      });
    }
  }
}
```

**Update Project:**
```typescript
// Delete existing grids (cascade deletes pictures)
await tx.projectPictureGrid.deleteMany({
  where: { projectId: id },
});

// Recreate grids with updated data
// (same logic as create)
```

**Key Patterns:**
- Nested creation in transactions for atomicity
- Separation of grid and picture creation for proper FK references
- Cascade deletes on update to avoid orphaned records
- Ordering applied at query time

## Frontend Types

Located in `src/hooks/useProjects.ts`:

```typescript
export interface ProjectGridPicture {
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface ProjectPictureGrid {
  id?: string;
  position: 'before_objectives' | 'after_objectives' | ...;
  columns: 1 | 2 | 3;
  order: number;
  pictures: ProjectGridPicture[];
}

export interface Project {
  // ... existing fields
  pictureGrids?: ProjectPictureGrid[];
}
```

## Admin UI Components

### PictureGridManager Component
Located in `frontend/src/components/admin/PictureGridManager.tsx`

**Purpose:** Comprehensive UI for managing picture grids in project forms

**State Management:**
```typescript
const [editingGridIndex, setEditingGridIndex] = useState<number | null>(null);
```

**Key Functions:**
- `addGrid()` - Creates new grid with defaults
- `removeGrid(index)` - Deletes grid from state
- `updateGrid(index, updates)` - Partial updates to grid
- `moveGrid(index, direction)` - Reorders grids
- `addPicture(gridIndex)` - Adds picture to specific grid
- `removePicture(gridIndex, pictureIndex)` - Removes picture
- `updatePicture(gridIndex, pictureIndex, updates)` - Updates picture data

**UI Sections:**
1. Grid list with position and column count badges
2. Expandable grid editor when editing
3. Position selector dropdown (8 options)
4. Column count selector (1-3)
5. Picture list with URL, alt, caption inputs
6. Add/remove buttons for pictures

**Styling:**
- Card-based layout with borders
- Badges for visual indicators
- Responsive grid previews
- Clear action buttons

### ProjectForm Integration
Located in `frontend/src/components/admin/ProjectForm.tsx`

**State Addition:**
```typescript
const [pictureGrids, setPictureGrids] = useState<ProjectPictureGrid[]>([]);
```

**Initialization:**
```typescript
useEffect(() => {
  if (project?.pictureGrids) {
    setPictureGrids(project.pictureGrids);
  }
}, [project]);
```

**Form Submission:**
```typescript
const payload = {
  // ... other fields
  pictureGrids: pictureGrids.length > 0 ? pictureGrids : undefined,
};
```

**Placement:**
Added after main content fields, before tags section

## Public Display Components

### PictureGrid Component
Located in `frontend/src/components/PictureGrid.tsx`

**Purpose:** Reusable component for rendering picture grids on public pages

**Column Layout Mapping:**
```typescript
const getColumnClass = (columns: number) => {
  switch (columns) {
    case 1: return 'grid-cols-1';
    case 2: return 'grid-cols-1 md:grid-cols-2';
    case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }
};
```

**Responsive Behavior:**
- 1 column: Always single column
- 2 columns: 1 column mobile, 2 columns desktop
- 3 columns: 1 column mobile, 2 tablet, 3 desktop

**Rendering:**
```tsx
<div className={`grid gap-6 my-12 ${getColumnClass(grid.columns)}`}>
  {sortedPictures.map((picture) => (
    <div key={picture.id} className="space-y-2">
      <img src={picture.url} alt={picture.alt} className="..." />
      {picture.caption && <p className="...">{picture.caption}</p>}
    </div>
  ))}
</div>
```

### ProjectDetail Integration
Located in `frontend/src/pages/ProjectDetail.tsx`

**Helper Function:**
```typescript
const getGridsForPosition = (position: ProjectPictureGrid['position']) => {
  if (!project?.pictureGrids) return [];
  return project.pictureGrids
    .filter((grid) => grid.position === position)
    .sort((a, b) => a.order - b.order);
};
```

**Integration Pattern:**
```tsx
{/* Before Section */}
{getGridsForPosition('before_objectives').map((grid, index) => (
  <PictureGrid key={`before-obj-${index}`} grid={grid} />
))}

{/* Section Content */}
<h2>Research Objectives</h2>
<p>{project.objectives}</p>

{/* After Section */}
{getGridsForPosition('after_objectives').map((grid, index) => (
  <PictureGrid key={`after-obj-${index}`} grid={grid} />
))}
```

**Applied to all 4 sections:**
- Research Objectives
- Methodology & Approach
- Key Findings & Insights
- Impact & Outcomes

## Data Flow

### Creating a Project with Picture Grids

1. **Admin fills form** → PictureGridManager manages state
2. **Form submits** → ProjectForm includes pictureGrids in payload
3. **API validates** → Zod schemas validate structure
4. **Service creates** → Transaction creates project, grids, pictures
5. **Database stores** → Relational data with proper FKs
6. **Response returns** → Full project with nested grids

### Displaying Picture Grids

1. **Page loads** → useProject hook fetches project by slug
2. **API queries** → Includes pictureGrids with pictures
3. **Data transforms** → TypeScript interfaces ensure type safety
4. **Component filters** → getGridsForPosition extracts relevant grids
5. **PictureGrid renders** → Responsive layout with images
6. **User views** → Fully rendered case study with visual artifacts

## Performance Considerations

**Database:**
- Indexed foreign keys for fast joins
- Order sorting done in database query
- Cascade deletes avoid orphaned records

**API:**
- Single query fetches all grids and pictures (no N+1)
- Validation happens before database operations
- Transactions ensure data consistency

**Frontend:**
- Grids filtered client-side (already fetched)
- Images lazy-loaded by browser
- Responsive classes avoid duplicate renders

## Testing Utilities

### Sample Data Script
Located in `backend/scripts/create-sample-project.ts`

Creates a full project with:
- 2-column grid with 2 pictures after objectives
- 3-column grid with 3 pictures after findings
- Uses Unsplash images for realistic preview
- Includes all project metadata

**Usage:**
```bash
npx ts-node scripts/create-sample-project.ts
```

### Admin User Scripts

**Reset Admin:**
```bash
npx ts-node scripts/reset-admin.ts
```
Creates fresh admin user with known credentials

**Create Admin:**
```bash
npx ts-node scripts/create-admin-user.ts
```
Creates admin if doesn't exist (idempotent)

## Example Usage

### Creating a Project with Picture Grids (API)

```typescript
POST /api/projects
{
  "title": "UX Research Project",
  "slug": "ux-research",
  "overview": "...",
  "objectives": "...",
  // ... other fields
  "pictureGrids": [
    {
      "position": "after_objectives",
      "columns": 2,
      "order": 0,
      "pictures": [
        {
          "url": "https://example.com/image1.jpg",
          "alt": "Research planning session",
          "caption": "Initial hypothesis formation",
          "order": 0
        },
        {
          "url": "https://example.com/image2.jpg",
          "alt": "User interview",
          "caption": "Participant feedback collection",
          "order": 1
        }
      ]
    }
  ]
}
```

### Admin UI Workflow

1. Navigate to `/admin/projects/new`
2. Scroll to "Picture Grids" section
3. Click "Add Picture Grid"
4. Select position: "After Objectives"
5. Select columns: 2
6. Click "Add Picture" for each image
7. Enter URL, alt text, optional caption
8. Reorder using up/down buttons if needed
9. Add more grids at different positions
10. Submit form

### Public Display Result

Project detail page shows:
- Hero section with title and metadata
- Objectives section content
- **→ 2-column picture grid appears here**
- Methodology section content
- Findings section content
- **→ 3-column picture grid appears here**
- Impact section content

## Future Enhancements

Potential improvements (out of current scope):
- Image upload to cloud storage
- Drag-and-drop reordering
- Lightbox viewer for fullscreen images
- Lazy loading optimization
- Image optimization/CDN integration
- Variable column layouts (e.g., 2-1-2 pattern)
- Grid templates/presets
- Bulk image import
