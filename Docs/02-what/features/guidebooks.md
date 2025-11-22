# Feature: Guidebooks (Curated Learning Paths)

_Last updated: 2025-01-21_

## Overview

Guidebooks are curated collections of publications organized into thematic learning paths. They provide structured ways for visitors to explore related content in a logical sequence.

## User Value

**For Learners:**
- Structured learning paths on specific topics
- Clear progression through chapters
- Estimated time commitment (total read time)
- Context on purpose and target audience

**For Content Creator:**
- Showcase expertise in specific areas
- Guide readers through complex topics
- Reuse existing publications in different contexts
- Demonstrate thought leadership

## Hierarchy

```
Area (e.g., "User Research")
  └── Guidebook (e.g., "AI Quality Evals for Product Builders")
        ├── Chapter 1 (Publication)
        ├── Chapter 2 (Publication)
        └── Chapter 3 (Publication)
```

## Core Capabilities

### 1. Guidebook Metadata
- **Title:** Name of the guidebook
- **Area:** High-level category/topic (e.g., "User Research", "Design Strategy")
- **Description:** Brief overview of the guidebook
- **Purpose:** What readers will learn
- **Target Audience:** Who this is for
- **Cover Image:** Optional visual
- **Featured:** Highlight on homepage
- **Published:** Control visibility

### 2. Chapter Management
- Add publications as chapters
- Remove chapters
- Reorder chapters (drag-and-drop or up/down arrows)
- Automatic read time calculation
- Chapter numbering
- Custom chapter titles and excerpts (future)

### 3. Public Display
- Organized by Area
- Chapter list with excerpts
- Links to original publications
- Total read time display
- Chapter count statistics

### 4. Admin Management
- Create/edit/delete guidebooks
- Manage chapters via dedicated interface
- Toggle published status
- Set featured status

## User Stories

### As a Visitor
- I want to see guidebooks organized by topic area
- I want to know what I'll learn and how long it will take
- I want to easily navigate to individual chapters
- I want to see which guidebooks are featured/recommended

### As an Admin
- I want to create guidebooks with descriptive metadata
- I want to add existing publications as chapters
- I want to reorder chapters to create logical flow
- I want to remove chapters that don't fit
- I want to preview before publishing

## Design Considerations

### Display
- Clean, card-based layout
- Hierarchical typography (Area > Guidebook > Chapters)
- Visual distinction for chapter numbering
- Hover states for interactivity
- Mobile-responsive design

### UX
- Immediate feedback on chapter add/remove
- Optimistic UI updates
- Loading states for async operations
- Toast notifications for success/error
- Chapter links open in same/new tab based on context

## Technical Notes

- Chapters reference existing publications (many-to-many relationship)
- Order field maintains chapter sequence
- Custom titles/excerpts optional (future enhancement)
- Total read time auto-calculated from chapters
- Supports custom area taxonomy (no predefined list)

## Future Enhancements

- [ ] Drag-and-drop chapter reordering
- [ ] Custom chapter titles (override publication title)
- [ ] Custom chapter excerpts
- [ ] Guidebook progress tracking (if user auth added)
- [ ] Guidebook completion certificates
- [ ] Social sharing for guidebooks
- [ ] Export guidebook as PDF
- [ ] Guidebook templates
