# Admin Guide: Managing Picture Grids in Projects

## Overview

Picture grids allow you to insert responsive image galleries at strategic positions within your project case studies. You can showcase research artifacts, design mockups, user testing sessions, and visual outcomes to enhance your storytelling.

## Key Features

- **Flexible Layouts**: Choose 1, 2, or 3 column grid layouts
- **Strategic Positioning**: Insert grids before or after any content section
- **Multiple Grids**: Add as many grids as needed per project
- **Accessibility**: Required alt text for all images
- **Responsive Design**: Automatically adapts to mobile, tablet, and desktop

## Getting Started

### Prerequisites

1. Admin account access (email: `admin@example.com`)
2. Project created or being edited
3. Image URLs ready (hosted externally)

### Accessing the Admin Panel

1. Navigate to `http://localhost:8081/admin/login`
2. Enter your admin credentials
3. Click "Projects" in the sidebar
4. Click "New Project" or edit an existing project

## Adding Picture Grids

### Step 1: Locate Picture Grids Section

Scroll down in the project form to the "Picture Grids" section, located after the main content fields and before tags.

### Step 2: Add a New Grid

1. Click the **"Add Picture Grid"** button
2. A new grid card appears with default settings

### Step 3: Configure Grid Position

Click the **"Position"** dropdown and select where the grid should appear:

**Before Sections:**
- Before Research Objectives
- Before Methodology & Approach
- Before Key Findings
- Before Impact & Outcomes

**After Sections:**
- After Research Objectives *(recommended for planning/setup images)*
- After Methodology & Approach *(good for process documentation)*
- After Key Findings *(ideal for results visualization)*
- After Impact & Outcomes *(perfect for final outcomes)*

### Step 4: Choose Column Layout

Select the number of columns:

- **1 Column**: Full-width images, ideal for:
  - Hero shots
  - Detailed screenshots
  - Large infographics
  - Before/after comparisons (stacked)

- **2 Columns**: Side-by-side layout, ideal for:
  - Comparisons
  - Paired examples
  - Alternative designs
  - Process steps

- **3 Columns**: Gallery layout, ideal for:
  - Multiple examples
  - Photo galleries
  - Research sessions
  - User interface variations

### Step 5: Add Pictures

1. Click **"Add Picture"** within the grid
2. Fill in the picture details:
   - **URL**: External image URL (e.g., Unsplash, Cloudinary, etc.)
   - **Alt Text**: Required - describe the image for screen readers
   - **Caption**: Optional - appears below the image

3. Repeat for additional pictures in the grid

### Step 6: Reorder Pictures (Optional)

Each picture has an **order number**. The system automatically sorts by this number. To reorder:

1. Click on a picture to edit
2. Update the order number (starts at 0)
3. Lower numbers appear first

### Step 7: Add More Grids (Optional)

Repeat steps 2-6 to add additional grids at different positions.

## Managing Picture Grids

### Editing a Grid

1. Click the **pencil icon** on the grid card
2. Update position, columns, or pictures
3. Changes save when you submit the form

### Removing a Grid

1. Click the **trash icon** on the grid card
2. The grid and all its pictures are removed
3. Confirm by submitting the form

### Removing a Picture

1. Expand the grid being edited
2. Click the **"Remove"** button next to the picture
3. The picture is removed from the grid

## Best Practices

### Image Guidelines

**URL Requirements:**
- Use HTTPS URLs for security
- Ensure images are publicly accessible
- Recommended hosting: Unsplash, Cloudinary, Imgur, AWS S3

**Image Dimensions:**
- 1 column: 1200-1600px wide minimum
- 2 columns: 800-1000px wide minimum
- 3 columns: 600-800px wide minimum
- Maintain consistent aspect ratios within a grid

**File Formats:**
- JPG for photographs
- PNG for screenshots/graphics
- WebP for optimized performance (if supported)

### Accessibility

**Alt Text Best Practices:**
- Be descriptive but concise
- Describe what's visible, not just the filename
- Include relevant context
- Example: "User interview session with participant reviewing prototype"

**Caption Guidelines:**
- Use captions to provide additional context
- Reference specific details or insights
- Keep under 2 sentences for readability

### Content Strategy

**Positioning Guidelines:**

1. **After Objectives**: Show planning, research setup, initial hypotheses
2. **After Methodology**: Display tools, processes, workshop photos
3. **After Findings**: Visualize data, user feedback, key insights
4. **After Impact**: Showcase final deliverables, results, outcomes

**Grid Layout Strategy:**

- Use **1 column** for key hero images or detailed views
- Use **2 columns** for comparisons or paired concepts
- Use **3 columns** for comprehensive galleries or multiple examples

**Multiple Grids:**
- Limit to 2-4 grids per project for optimal load times
- Distribute grids across different sections
- Use varying column counts for visual variety

### Performance Tips

- Optimize images before uploading to external host
- Use image compression tools (TinyPNG, ImageOptim)
- Consider lazy loading for grids below the fold
- Keep individual image files under 500KB when possible

## Examples

### Example 1: UX Research Project

**Grid 1 - After Objectives**
- Position: After Research Objectives
- Columns: 2
- Pictures:
  1. Planning session with sticky notes
  2. Analytics dashboard showing baseline metrics

**Grid 2 - After Findings**
- Position: After Key Findings
- Columns: 3
- Pictures:
  1. Redesigned checkout flow mockup
  2. Mobile payment interface
  3. User testing validation session

### Example 2: Design Case Study

**Grid 1 - After Methodology**
- Position: After Methodology & Approach
- Columns: 1
- Pictures:
  1. Full design system overview (large, detailed image)

**Grid 2 - After Impact**
- Position: After Impact & Outcomes
- Columns: 2
- Pictures:
  1. Before screenshot
  2. After screenshot

## Troubleshooting

### Images Not Displaying

**Problem**: Grid shows but images are broken

**Solutions:**
1. Verify image URLs are publicly accessible
2. Check URLs use HTTPS (not HTTP)
3. Test URL in browser address bar
4. Ensure no authentication required for images

### Grid Not Showing on Project Page

**Problem**: Grid configured but not visible on public project page

**Solutions:**
1. Ensure project is published
2. Verify position name is correct
3. Check that grid has at least one picture
4. Refresh the page to clear cache

### Layout Issues

**Problem**: Grid layout looks wrong on mobile

**Solutions:**
- This is expected - layouts automatically adapt
- 3 columns → 2 columns on tablet → 1 column on mobile
- 2 columns → 1 column on mobile
- Test on actual devices or use browser dev tools

### Order Not Working

**Problem**: Pictures appearing in wrong order

**Solutions:**
1. Check order numbers - should be 0, 1, 2, etc.
2. Ensure no duplicate order numbers
3. Re-save the project to re-sort

## Admin Credentials

**Development Environment:**
- Email: `admin@example.com`
- Password: `admin123`
- Login URL: `http://localhost:8081/admin/login`

**Production Environment:**
- Use secure credentials (see deployment docs)
- Change default password immediately
- Enable 2FA if available

## Utility Scripts

### Creating Sample Projects

To test picture grids functionality:

```bash
cd backend
npx ts-node scripts/create-sample-project.ts
```

This creates a sample project with:
- 2-column grid with 2 pictures
- 3-column grid with 3 pictures
- Populated with Unsplash images

### Resetting Admin User

If you forget admin credentials:

```bash
cd backend
npx ts-node scripts/reset-admin.ts
```

This resets to default credentials:
- Email: `admin@example.com`
- Password: `admin123`

### Creating Admin User

If no admin exists:

```bash
cd backend
npx ts-node scripts/create-admin-user.ts
```

## Support

For technical issues:
1. Check implementation docs: `Docs/03-how/implementation/project-picture-grids.impl.md`
2. Review specification: `Docs/03-how/specs/project-picture-grids.spec.md`
3. Check database schema: `backend/prisma/schema.prisma`
4. Review migration: `backend/prisma/migrations/20251122213136_add_project_picture_grids/`

## Version History

- **v1.0** (2025-11-23): Initial release with 8 position options and 1-3 column layouts
