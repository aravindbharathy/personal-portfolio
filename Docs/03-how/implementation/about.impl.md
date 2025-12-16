---
implements: specs/about.spec.md
type: feature
modules:
  - backend/src/app/api/about/route.ts
  - backend/src/services/about.service.ts
  - backend/src/schemas/about.schema.ts
  - backend/prisma/schema.prisma
  - frontend/src/pages/About.tsx
  - frontend/src/pages/admin/About.tsx
  - frontend/src/hooks/useAbout.ts
  - frontend/src/components/admin/MarkdownEditor.tsx
dependencies:
  - prisma
  - zod
  - react-query
  - react-hook-form
  - react-markdown
  - remark-gfm
  - lucide-react
last_updated: 2025-12-15
---

# About Feature Implementation

## Architecture

The About feature implements a single-record content management system with three main layers:

1. **Data Layer:** Prisma ORM managing a single About record in PostgreSQL
2. **API Layer:** Next.js API routes exposing GET (public) and PUT (admin) endpoints
3. **UI Layer:** Public About page and Admin management interface

**Key Design Decision:** Single-record pattern enforced at service layer - upsert logic automatically creates or updates the single About record.

---

## Data Model Implementation

### Prisma Schema
**Location:** `backend/prisma/schema.prisma` (lines 294-306)

```prisma
model About {
  id          String   @id @default(cuid())
  name        String
  title       String   // e.g., "UX Researcher"
  bio         String   @db.Text
  profilePic  String?  // URL to profile picture
  email       String?
  phone       String?
  location    String?
  socialLinks Json?    // Array of {platform: string, url: string}
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())
}
```

**Design Notes:**
- `@db.Text` for bio allows unlimited length markdown content
- `Json` type for socialLinks provides flexible array storage
- All contact fields optional except name, title, bio
- CUID for globally unique IDs
- Auto-managed timestamps

---

## Backend Implementation

### 1. API Routes
**Location:** `backend/src/app/api/about/route.ts`

#### GET /api/about (Public)
```typescript
export async function GET() {
  try {
    const about = await aboutService.getAbout();

    if (!about) {
      return NextResponse.json(
        { success: false, error: 'About information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error) {
    // Error handling
  }
}
```

**Flow:**
1. Call service layer to fetch About record
2. Return 404 if no record exists
3. Return record in standardized API response format
4. Handle errors with proper status codes

#### PUT /api/about (Admin Only)
```typescript
export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate
    await authenticate(request);

    // 2. Validate
    const body = await request.json();
    const validatedData = updateAboutSchema.parse(body);

    // 3. Update
    const about = await aboutService.updateAbout(validatedData);

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error: any) {
    // Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    // Other errors
  }
}
```

**Flow:**
1. Verify JWT authentication (throws if not authenticated)
2. Parse and validate request body with Zod schema
3. Call service layer to upsert record
4. Return updated record
5. Handle validation errors distinctly from other errors

---

### 2. Service Layer
**Location:** `backend/src/services/about.service.ts`

```typescript
export class AboutService {
  async getAbout() {
    // Get the first (and should be only) About record
    const about = await prisma.about.findFirst();

    if (!about) {
      return null;
    }

    return about;
  }

  async updateAbout(data: UpdateAboutInput) {
    // Check if an About record exists
    const existing = await prisma.about.findFirst();

    if (existing) {
      // Update existing record
      return await prisma.about.update({
        where: { id: existing.id },
        data,
      });
    } else {
      // Create new record
      return await prisma.about.create({
        data,
      });
    }
  }
}

export const aboutService = new AboutService();
```

**Single-Record Pattern:**
- `findFirst()` returns the only record (or null)
- `updateAbout()` uses upsert logic:
  - If record exists → UPDATE
  - If no record → CREATE
- Enforces single-record constraint at application layer

**Why Not Upsert?**
Prisma's `upsert` requires a unique field for the `where` clause. Since we don't have a natural unique key (other than `id`), we manually implement upsert logic.

---

### 3. Validation Schema
**Location:** `backend/src/schemas/about.schema.ts`

```typescript
import { z } from 'zod';

export const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
});

export const updateAboutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  title: z.string().min(1, 'Title is required').max(200),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  profilePic: z.string().url('Invalid profile picture URL').optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  location: z.string().max(200).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
});

export type UpdateAboutInput = z.infer<typeof updateAboutSchema>;
```

**Validation Rules:**
- Required: name, title, bio
- Optional: all contact fields and social links
- Constraints:
  - Name/title: 1-200 chars
  - Bio: minimum 10 chars (no max)
  - URLs: must be valid URL format
  - Email: must be valid email format
  - Phone: no format validation (international flexibility)

**Shared Validation:**
- Same schema used on frontend and backend
- TypeScript types auto-generated from Zod schema

---

## Frontend Implementation

### 1. Public About Page
**Location:** `frontend/src/pages/About.tsx`

#### Component Structure
```typescript
const About = () => {
  const { data: about, isLoading } = useAbout();

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Not found state
  if (!about) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left: Bio */}
        <div>
          <h1>{about.name}</h1>
          <p>{about.title}</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {about.bio}
          </ReactMarkdown>
        </div>

        {/* Right: Profile Picture */}
        {about.profilePic && (
          <img src={about.profilePic} alt={about.name} />
        )}
      </section>

      {/* Social Links */}
      {about.socialLinks?.length > 0 && (
        <Card>
          {about.socialLinks.map((link) => (
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {getSocialIcon(link.platform)}
              {link.platform}
            </a>
          ))}
        </Card>
      )}

      {/* Contact Info */}
      {(about.email || about.phone || about.location) && (
        <Card>
          {about.email && <a href={`mailto:${about.email}`}>{about.email}</a>}
          {about.phone && <a href={`tel:${about.phone}`}>{about.phone}</a>}
          {about.location && <span>{about.location}</span>}
        </Card>
      )}

      <Footer />
    </div>
  );
};
```

#### Markdown Rendering
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {about.bio}
</ReactMarkdown>
```

**Libraries:**
- `react-markdown`: Converts markdown to React components
- `remark-gfm`: Adds GitHub-flavored markdown support (tables, strikethrough, etc.)

**Styling:**
- Prose classes for typography
- Responsive layout with Tailwind grid
- Mobile-first approach

#### Social Icon Detection
```typescript
const getSocialIcon = (platform: string) => {
  const lowerPlatform = platform.toLowerCase();
  if (lowerPlatform.includes('linkedin')) return <Linkedin />;
  if (lowerPlatform.includes('github')) return <Github />;
  if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) return <Twitter />;
  return <ExternalLink />; // Generic fallback
};
```

**Logic:**
- Case-insensitive substring matching
- Supports platform name or URL-based detection
- Fallback to generic icon for unknown platforms

---

### 2. Admin Management Page
**Location:** `frontend/src/pages/admin/About.tsx`

#### Form Management
```typescript
const AdminAbout = () => {
  const { data: about, isLoading } = useAbout();
  const updateAbout = useUpdateAbout();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      socialLinks: [],
      // ... other fields
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (about) {
      reset({
        name: about.name || "",
        title: about.title || "",
        bio: about.bio || "",
        socialLinks: about.socialLinks || [],
        // ... other fields
      });
    }
  }, [about, reset]);

  const onSubmit = async (data: AboutFormData) => {
    // Filter out empty optional fields
    const filteredData = {
      name: data.name,
      title: data.title,
      bio: data.bio,
    };

    if (data.profilePic) filteredData.profilePic = data.profilePic;
    if (data.email) filteredData.email = data.email;
    // ... other optional fields

    await updateAbout.mutateAsync(filteredData);

    toast({
      title: "Success",
      description: "About information updated successfully",
    });
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </AdminLayout>
  );
};
```

**Key Features:**
- React Hook Form for form state management
- Zod resolver for validation
- Automatic form population from fetched data
- Optional field filtering before submission

#### Social Links Management
```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: "socialLinks",
});

// Add new social link
<Button onClick={() => append({ platform: "", url: "" })}>
  <Plus /> Add Social Link
</Button>

// Render existing social links
{fields.map((field, index) => (
  <div key={field.id}>
    <Input {...register(`socialLinks.${index}.platform`)} />
    <Input {...register(`socialLinks.${index}.url`)} />
    <Button onClick={() => remove(index)}>
      <X /> Remove
    </Button>
  </div>
))}
```

**Dynamic Array Management:**
- `useFieldArray` hook for array manipulation
- `append()` adds new empty social link
- `remove(index)` deletes social link
- Form validation applies to each array item

#### Markdown Editor
```typescript
<Controller
  name="bio"
  control={control}
  render={({ field }) => (
    <MarkdownEditor
      value={field.value}
      onChange={field.onChange}
    />
  )}
/>
```

**Location:** `frontend/src/components/admin/MarkdownEditor.tsx`

**Features:**
- Textarea for markdown input
- Live preview toggle
- Syntax highlighting (optional)
- Full-screen mode (optional)

---

### 3. Data Fetching Hooks
**Location:** `frontend/src/hooks/useAbout.ts`

```typescript
export interface About {
  id: string;
  name: string;
  title: string;
  bio: string;
  profilePic?: string;
  email?: string;
  phone?: string;
  location?: string;
  socialLinks?: SocialLink[];
  updatedAt: string;
  createdAt: string;
}

export function useAbout() {
  return useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<About>>('/api/about');
      return response.data;
    },
  });
}

export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<About>) => {
      const response = await api.put<ApiResponse<About>>('/api/about', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
    },
  });
}
```

**React Query Integration:**
- `useAbout()`: Fetches and caches About data
- `useUpdateAbout()`: Mutation hook for updates
- Automatic cache invalidation on successful update
- TypeScript interfaces for type safety

---

## Data Flow

### Public Page Load
```
1. User navigates to /about
   ↓
2. React component mounts
   ↓
3. useAbout() hook triggers
   ↓
4. React Query checks cache
   ↓
5. If cache miss: GET /api/about
   ↓
6. API route calls aboutService.getAbout()
   ↓
7. Prisma query: SELECT * FROM About LIMIT 1
   ↓
8. Data returned through layers
   ↓
9. React Query caches result
   ↓
10. Component renders with data
```

### Admin Update Flow
```
1. Admin fills out form
   ↓
2. Clicks "Save"
   ↓
3. React Hook Form validates (Zod)
   ↓
4. If valid: useUpdateAbout() mutation triggered
   ↓
5. PUT /api/about with validated data
   ↓
6. API route authenticates request
   ↓
7. API route validates again (Zod)
   ↓
8. aboutService.updateAbout() called
   ↓
9. Prisma checks if record exists
   ↓
10a. If exists: UPDATE About SET ... WHERE id = ?
10b. If not exists: INSERT INTO About ...
   ↓
11. Updated record returned through layers
   ↓
12. React Query cache invalidated
   ↓
13. useAbout() refetches automatically
   ↓
14. Public page updates (if open)
   ↓
15. Toast notification shown
```

---

## Security Implementation

### 1. Authentication
```typescript
// backend/src/app/api/about/route.ts
export async function PUT(request: NextRequest) {
  await authenticate(request);
  // ... rest of implementation
}
```

**Middleware:** `backend/src/middleware/auth.middleware.ts`
- Verifies JWT token in cookies
- Throws error if not authenticated
- Automatically handled by Next.js error boundaries

### 2. Input Validation
```typescript
// Validate on backend (server-side)
const validatedData = updateAboutSchema.parse(body);

// Validate on frontend (client-side)
const { resolver: zodResolver(aboutSchema) }
```

**Double Validation:**
- Frontend: UX - immediate feedback, prevent unnecessary requests
- Backend: Security - never trust client, enforce constraints

### 3. XSS Protection
```typescript
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {about.bio}
</ReactMarkdown>
```

**react-markdown automatically:**
- Sanitizes HTML output
- Prevents script injection
- Escapes dangerous characters

### 4. External Link Security
```tsx
<a
  href={link.url}
  target="_blank"
  rel="noopener noreferrer"
>
```

**rel="noopener noreferrer":**
- `noopener`: Prevents new page from accessing `window.opener`
- `noreferrer`: Doesn't send referrer information
- Protects against reverse tabnabbing attacks

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "clw1234567890",
    "name": "Aravind Bharathy",
    "title": "UX Researcher | Human-Computer Interaction Expert",
    "bio": "# About Me\n\nI'm a UX Researcher...",
    "profilePic": "https://example.com/profile.jpg",
    "email": "aravind@example.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "socialLinks": [
      {
        "platform": "LinkedIn",
        "url": "https://linkedin.com/in/aravindbharathy"
      },
      {
        "platform": "GitHub",
        "url": "https://github.com/aravindbharathy"
      }
    ],
    "updatedAt": "2025-12-15T10:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

---

## Testing Considerations

### Unit Tests
```typescript
// Service Layer
describe('AboutService', () => {
  it('should create About if none exists', async () => {
    // Test creation logic
  });

  it('should update About if exists', async () => {
    // Test update logic
  });

  it('should return null if no About exists', async () => {
    // Test getAbout when empty
  });
});

// Validation Schema
describe('updateAboutSchema', () => {
  it('should validate required fields', () => {
    // Test required validation
  });

  it('should validate email format', () => {
    // Test email validation
  });

  it('should validate URL formats', () => {
    // Test URL validation
  });
});
```

### Integration Tests
```typescript
describe('GET /api/about', () => {
  it('should return About data', async () => {
    // Test successful retrieval
  });

  it('should return 404 if not found', async () => {
    // Test not found case
  });
});

describe('PUT /api/about', () => {
  it('should require authentication', async () => {
    // Test auth requirement
  });

  it('should create About on first update', async () => {
    // Test creation
  });

  it('should update existing About', async () => {
    // Test update
  });

  it('should validate input', async () => {
    // Test validation errors
  });
});
```

### E2E Tests
```typescript
describe('About Page', () => {
  it('should display About information', () => {
    cy.visit('/about');
    cy.contains('Aravind Bharathy');
    cy.contains('UX Researcher');
  });

  it('should render markdown bio', () => {
    cy.visit('/about');
    cy.get('h1').should('exist'); // Markdown heading
  });

  it('should open social links in new tab', () => {
    cy.visit('/about');
    cy.get('a[target="_blank"]').should('exist');
  });
});

describe('Admin About Management', () => {
  beforeEach(() => {
    cy.login(); // Auth helper
  });

  it('should load existing About data', () => {
    cy.visit('/admin/about');
    cy.get('input[name="name"]').should('have.value', 'Aravind Bharathy');
  });

  it('should add social links', () => {
    cy.visit('/admin/about');
    cy.contains('Add Social Link').click();
    // ... test adding link
  });

  it('should update About successfully', () => {
    cy.visit('/admin/about');
    cy.get('input[name="title"]').clear().type('Senior UX Researcher');
    cy.contains('Save').click();
    cy.contains('Success');
  });
});
```

---

## Performance Optimizations

### 1. React Query Caching
```typescript
queryKey: ['about'],
```
- About data cached after first fetch
- Subsequent page loads use cache
- Auto-refetch on window focus (configurable)
- Reduces unnecessary API calls

### 2. Optimistic Updates (Optional Enhancement)
```typescript
export function useUpdateAbout() {
  return useMutation({
    mutationFn: updateAboutFn,
    onMutate: async (newAbout) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['about'] });

      // Snapshot previous value
      const previousAbout = queryClient.getQueryData(['about']);

      // Optimistically update
      queryClient.setQueryData(['about'], newAbout);

      // Return rollback context
      return { previousAbout };
    },
    onError: (err, newAbout, context) => {
      // Rollback on error
      queryClient.setQueryData(['about'], context?.previousAbout);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['about'] });
    },
  });
}
```

### 3. Single Database Query
```typescript
// Efficient: One query
await prisma.about.findFirst();

// Avoid: Multiple queries
const count = await prisma.about.count();
if (count > 0) {
  const about = await prisma.about.findFirst();
}
```

---

## Error Handling

### Frontend Error States
```typescript
const { data: about, isLoading, error } = useAbout();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!about) return <NotFoundMessage />;

return <AboutContent about={about} />;
```

### Backend Error Responses
```typescript
try {
  // ... operation
} catch (error: any) {
  // Zod validation errors
  if (error.name === 'ZodError') {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  // Authentication errors
  if (error.message?.includes('Unauthorized')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Generic errors
  console.error('Error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Deployment Considerations

### Environment Variables
None specific to About feature (uses shared DATABASE_URL, JWT_SECRET)

### Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name add_about_model

# Apply to production
npx prisma migrate deploy
```

### Seed Data
```typescript
// backend/prisma/seed.ts
async function seedAbout() {
  await prisma.about.create({
    data: {
      name: "Aravind Bharathy",
      title: "UX Researcher | HCI Expert",
      bio: "# About Me\n\n...",
      email: "aravind@example.com",
      location: "San Francisco, CA",
      socialLinks: [
        { platform: "LinkedIn", url: "https://linkedin.com/in/..." },
        { platform: "GitHub", url: "https://github.com/..." },
      ],
    },
  });
}
```

---

## Future Enhancements

### Potential Improvements
1. **Rich Text Editor:** Replace markdown editor with WYSIWYG
2. **Image Upload:** Direct upload instead of URL-only
3. **Multiple Profiles:** Support team members
4. **Versioning:** Track changes over time
5. **i18n:** Multi-language support
6. **SEO Optimization:** Structured data for About page

### Performance Monitoring
- Track About page load times
- Monitor API response times
- Measure cache hit rates
- Track form submission success rates

---

## Related Documentation

- Specification: [about.spec.md](../specs/about.spec.md)
- Feature: [about.md](../../02-what/features/about.md)
- Authentication: [authentication.impl.md](authentication.impl.md)
- Admin Panel: [admin-panel.impl.md](admin-panel.impl.md)
- Database Schema: [database-schema.md](../architecture/database-schema.md)
- API Endpoints: [api-endpoints.md](../architecture/api-endpoints.md)
