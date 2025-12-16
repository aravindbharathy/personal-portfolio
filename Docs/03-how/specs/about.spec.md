---
feature_id: FEAT-006
status: implemented
owner: Aravind Bharathy
implements: features/about.md
verified: 2025-12-15
related_specs: [authentication.spec.md, admin-dashboard.spec.md]
---

# About Page Specification

## Purpose

Provide a single-record content management system for displaying professional profile information including biography, contact details, and social media links, accessible to public visitors and editable by authenticated admins.

---

## Data Model

### About Entity

```typescript
{
  id: string           // CUID primary key
  name: string         // Full name (required, max 200 chars)
  title: string        // Professional title (required, max 200 chars)
  bio: string          // Markdown-formatted biography (required, min 10 chars)
  profilePic?: string  // URL to profile picture (optional, must be valid URL)
  email?: string       // Email address (optional, must be valid email)
  phone?: string       // Phone number (optional, no format validation)
  location?: string    // Physical location (optional, max 200 chars)
  socialLinks?: Array<{
    platform: string   // Platform name (required, min 1 char)
    url: string        // Profile URL (required, must be valid URL)
  }>
  updatedAt: DateTime  // Auto-managed
  createdAt: DateTime  // Auto-managed
}
```

---

## Requirements

### Functional Requirements

#### FR1: Single Record Constraint
- MUST maintain exactly one About record in the database
- MUST create record if none exists on first update
- MUST update existing record on subsequent updates
- MUST NOT allow multiple About records

#### FR2: Public Display
- MUST display About page at `/about` route
- MUST show name and title prominently in hero section
- MUST render bio with markdown formatting support
- MUST display profile picture if provided
- MUST show social media links if provided
- MUST show contact information if provided

#### FR3: Markdown Rendering
- MUST support GitHub-flavored markdown in bio
- MUST support:
  - Headings
  - Bold/italic text
  - Links
  - Lists (ordered and unordered)
  - Blockquotes
  - Code blocks
- MUST sanitize rendered HTML to prevent XSS
- MUST apply consistent typography styling

#### FR4: Contact Links
- MUST render email as mailto: link when clicked
- MUST render phone as tel: link when clicked
- MUST render location as static text (no link)

#### FR5: Social Media Links
- MUST detect platform from name/URL and display appropriate icon:
  - LinkedIn → LinkedIn icon
  - GitHub → GitHub icon
  - Twitter/X → Twitter icon
  - Others → Generic external link icon
- MUST open social links in new tab (target="_blank")
- MUST include rel="noopener noreferrer" for security

#### FR6: Admin Management
- MUST provide admin interface at `/admin/about`
- MUST require authentication to access admin page
- MUST load existing About data into form on page load
- MUST provide markdown editor for bio field
- MUST allow adding unlimited social links
- MUST allow removing social links
- MUST validate all fields before submission

#### FR7: Data Validation
- MUST validate on frontend and backend
- MUST enforce:
  - Name: Required, 1-200 characters
  - Title: Required, 1-200 characters
  - Bio: Required, minimum 10 characters
  - Profile Pic: Optional, valid URL format
  - Email: Optional, valid email format
  - Phone: Optional, no format restrictions
  - Location: Optional, max 200 characters
  - Social Links:
    - Platform: Required, min 1 character
    - URL: Required, valid URL format

---

## API Endpoints

### GET /api/about
**Purpose:** Retrieve About information for public display

**Auth:** None (public endpoint)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "Aravind Bharathy",
    "title": "UX Researcher",
    "bio": "# About Me\n\n...",
    "profilePic": "https://...",
    "email": "aravind@example.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "socialLinks": [
      {
        "platform": "LinkedIn",
        "url": "https://linkedin.com/in/..."
      }
    ],
    "updatedAt": "2025-12-15T10:00:00Z",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Error Cases:**
- 404: About information not found (no record exists)
- 500: Server error

---

### PUT /api/about
**Purpose:** Create or update About information

**Auth:** Required (admin only)

**Request Body:**
```json
{
  "name": "Aravind Bharathy",
  "title": "UX Researcher",
  "bio": "# About Me\n\nProfessional bio...",
  "profilePic": "https://example.com/photo.jpg",
  "email": "aravind@example.com",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "socialLinks": [
    {
      "platform": "LinkedIn",
      "url": "https://linkedin.com/in/username"
    },
    {
      "platform": "GitHub",
      "url": "https://github.com/username"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Updated About object */ }
}
```

**Error Cases:**
- 400: Validation failed (with error details)
- 401: Unauthorized (not authenticated)
- 500: Server error

---

## Acceptance Criteria

### Public Page (Visitor Experience)

✅ **AC1: Page Load**
- When I navigate to `/about`
- Then I see the About page with all content
- And the page loads in under 2 seconds

✅ **AC2: Profile Display**
- Given About information exists
- When I view the About page
- Then I see name and title in the hero section
- And I see the bio rendered with markdown formatting
- And I see the profile picture (if provided)

✅ **AC3: Markdown Rendering**
- Given the bio contains markdown
- When I view the About page
- Then headings are rendered as HTML headings
- And links are clickable
- And lists are properly formatted
- And emphasis (bold/italic) is styled correctly

✅ **AC4: Social Links**
- Given social links are provided
- When I view the social links section
- Then I see each platform with its appropriate icon
- And clicking a link opens in a new tab
- And links have rel="noopener noreferrer"

✅ **AC5: Contact Information**
- Given contact information is provided
- When I view the contact section
- Then I see email, phone, and location
- And clicking email opens my email client
- And clicking phone opens my phone app (on mobile)
- And location is displayed as text only

✅ **AC6: Optional Fields**
- Given some optional fields are not provided
- When I view the About page
- Then only provided sections are displayed
- And missing sections are not shown (no empty states)

✅ **AC7: Responsive Design**
- When I view the page on mobile
- Then the layout adapts to single column
- And the profile picture is centered
- And all content remains readable

✅ **AC8: Loading State**
- When the About data is loading
- Then I see a loading indicator
- And the navigation and footer remain visible

✅ **AC9: Not Found State**
- Given no About record exists
- When I navigate to `/about`
- Then I see "About information not available" message
- And the navigation and footer remain visible

---

### Admin Interface

✅ **AC10: Admin Access**
- Given I am not authenticated
- When I navigate to `/admin/about`
- Then I am redirected to login page

✅ **AC11: Form Population**
- Given I am authenticated as admin
- When I navigate to `/admin/about`
- Then the form is populated with existing About data
- And the markdown editor shows the current bio
- And all social links are displayed

✅ **AC12: Markdown Editor**
- Given I am editing the bio
- When I type markdown syntax
- Then I can preview the rendered output
- And I can toggle between edit and preview modes

✅ **AC13: Social Link Management**
- When I click "Add Social Link"
- Then a new empty social link form appears
- And when I click remove on a social link
- Then that link is removed from the form

✅ **AC14: Form Validation**
- When I submit with missing required fields
- Then I see validation errors
- And the form is not submitted

✅ **AC15: Successful Update**
- Given I fill out valid About information
- When I click Save
- Then I see a success message
- And the About data is updated in the database
- And the public page reflects the changes

✅ **AC16: Validation Errors**
- When I enter an invalid email format
- Then I see "Invalid email" error
- When I enter an invalid URL
- Then I see "Invalid URL" error
- When bio is less than 10 characters
- Then I see "Bio must be at least 10 characters" error

---

## Out of Scope

### Explicitly NOT Included

❌ **Multiple Profiles**
- System supports exactly one About record
- No multi-user profile management
- No profile switching

❌ **File Upload**
- Profile picture must be a URL
- No direct image upload functionality
- Image hosting is external

❌ **Advanced Formatting**
- No custom HTML in bio (only markdown)
- No embedded media (videos, audio)
- No custom CSS styling

❌ **Social Media Integration**
- No social media feed embedding
- No live follower counts
- No social media authentication

❌ **Versioning**
- No history of changes
- No rollback capability
- No audit log of updates

❌ **Public Editing**
- No visitor comments
- No user-submitted content
- Admin-only editing

---

## Non-Functional Requirements

### Performance
- Page load time: < 2 seconds
- API response time: < 500ms
- Markdown rendering: < 100ms

### Security
- Admin endpoints require JWT authentication
- Input validation on frontend and backend
- XSS protection via markdown sanitization
- CSRF protection via SameSite cookies
- External links use rel="noopener noreferrer"

### Usability
- Mobile-responsive design
- Clear error messages
- Intuitive form layout
- Live markdown preview

### Reliability
- Single record constraint enforced at service layer
- Graceful handling of missing data
- Proper error states for network failures

---

## Dependencies

### Frontend
- React Query (data fetching)
- React Hook Form (form management)
- Zod (validation)
- react-markdown (markdown rendering)
- remark-gfm (GitHub-flavored markdown)
- Lucide React (icons)

### Backend
- Prisma ORM (database access)
- Zod (validation)
- Next.js API Routes
- JWT authentication middleware

---

## Test Scenarios

### Happy Path
1. Admin updates About with all fields → Success
2. Admin updates with only required fields → Success
3. Visitor views About page → See all content
4. Visitor clicks email link → Opens email client
5. Visitor clicks social link → Opens in new tab

### Edge Cases
1. First-time setup (no About record exists) → Create new
2. Bio with complex markdown → Renders correctly
3. Social link with unknown platform → Shows generic icon
4. Mobile device view → Responsive layout
5. Very long bio text → Scrollable, no overflow

### Error Cases
1. Invalid email format → Validation error
2. Invalid URL format → Validation error
3. Bio less than 10 chars → Validation error
4. Unauthenticated PUT request → 401 error
5. Network failure → Error state displayed

---

## Migration Notes

**Database Schema:**
- About table already exists in schema.prisma
- No migration needed

**Data Seeding:**
- Provide seed script for initial About record
- Include sample bio, contact info, and social links

---

## Related Documentation

- Feature: [about.md](../../02-what/features/about.md)
- Implementation: [about.impl.md](../implementation/about.impl.md)
- Architecture: [database-schema.md](../architecture/database-schema.md)
- API Reference: [api-endpoints.md](../architecture/api-endpoints.md)
