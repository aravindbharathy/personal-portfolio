# Tags System Feature

**Feature Type:** Organizational Infrastructure
**Status:** Implemented
**Target Users:** Website visitors, content admins
**Last Updated:** 2025-12-15

---

## Overview

The Tags System provides categorized labeling for Projects and Publications, enabling content organization, discovery, and filtering. Tags are organized into five distinct categories to create structured, meaningful metadata that helps visitors find relevant content by research methods, industries, topics, tools, and skills.

---

## Purpose

**Problem Statement:**
Portfolio content (projects and publications) needs to be:
- Discoverable across multiple dimensions (methods, industries, topics, tools, skills)
- Browsable by related themes
- Searchable by specific interests
- Organized beyond simple chronological ordering

**Solution:**
A centralized tagging system with predefined categories that:
- Provides consistent vocabulary across all content
- Enables filtering and navigation
- Shows expertise areas at a glance
- Supports cross-content recommendations

---

## Key Capabilities

### 1. Categorized Tag System
Five distinct tag categories:
- **RESEARCH_METHOD**: User interviews, usability testing, A/B testing, ethnography, etc.
- **INDUSTRY**: Healthcare, FinTech, E-commerce, Education, etc.
- **TOPIC**: Accessibility, AI/ML, Mobile UX, Enterprise, etc.
- **TOOL**: Figma, React, Python, SPSS, etc.
- **SKILL**: Qualitative analysis, prototyping, statistical modeling, etc.

### 2. Many-to-Many Relationships
- Projects can have multiple tags
- Publications can have multiple tags
- Tags can be assigned to multiple projects/publications
- Join tables (ProjectTag, PublicationTag) manage relationships

### 3. Usage Tracking
- Automatically count how many projects use each tag
- Automatically count how many publications use each tag
- Display total usage count for each tag
- Prevent deletion of tags currently in use

### 4. Admin Management
- Create new tags with category assignment
- Delete unused tags
- View tags grouped by category
- Filter tags by specific category

---

## User Stories

### Content Visitors
1. **As a recruiter looking for specific expertise**, I want to filter projects by research method so I can see examples of specific methodologies
2. **As a potential client**, I want to browse projects by industry so I can see relevant case studies for my domain
3. **As a collaborator**, I want to see which tools and skills are used so I can assess technical capabilities
4. **As a curious visitor**, I want to explore content by topic so I can learn about specific areas of interest

### Content Admin
5. **As an admin**, I want to create new tags when adding projects so I can accurately categorize content
6. **As an admin**, I want to assign multiple tags to each project/publication so I can capture all relevant dimensions
7. **As an admin**, I want to see usage counts for tags so I know which categorizations are most common
8. **As an admin**, I want to be prevented from deleting active tags so I don't break existing content
9. **As an admin**, I want to browse tags by category so I can choose appropriate labels

---

## Business Value

### For Content Creator (Aravind)
- **Discoverability:** Makes expertise and experience easily browsable
- **SEO:** Structured metadata improves search engine indexing
- **Positioning:** Clearly communicates areas of expertise
- **Scalability:** Easy to organize growing content library

### For Visitors
- **Efficiency:** Find relevant content quickly
- **Context:** Understand scope and methods used
- **Exploration:** Discover related content across categories
- **Clarity:** Clear categorization of skills and expertise

---

## Tag Categories Explained

### RESEARCH_METHOD
**Purpose:** Methodologies and research techniques employed

**Examples:**
- User Interviews
- Usability Testing
- A/B Testing
- Ethnographic Research
- Surveys
- Diary Studies
- Card Sorting
- Heuristic Evaluation

**Use Case:** "Show me all projects that used user interviews"

---

### INDUSTRY
**Purpose:** Domain or vertical market

**Examples:**
- Healthcare
- FinTech
- E-commerce
- Education (EdTech)
- SaaS
- Enterprise Software
- Government
- Non-profit

**Use Case:** "Show me all healthcare projects"

---

### TOPIC
**Purpose:** Subject matter or theme

**Examples:**
- Accessibility (a11y)
- AI/ML Integration
- Mobile UX
- Enterprise Workflows
- Data Visualization
- Onboarding
- Search Experience
- Design Systems

**Use Case:** "Show me everything related to accessibility"

---

### TOOL
**Purpose:** Technologies, software, and platforms used

**Examples:**
- Figma
- React
- Next.js
- Python
- R
- SPSS
- Miro
- UserTesting.com

**Use Case:** "Show me projects where React was used"

---

### SKILL
**Purpose:** Core competencies demonstrated

**Examples:**
- Qualitative Analysis
- Quantitative Analysis
- Prototyping
- User Journey Mapping
- Information Architecture
- Visual Design
- Frontend Development
- Statistical Modeling

**Use Case:** "What skills are demonstrated across the portfolio?"

---

## Content Model

### Tag Entity
```
{
  id: string           // Unique identifier
  name: string         // Display name (e.g., "User Interviews")
  slug: string         // URL-safe version (e.g., "user-interviews")
  category: TagCategory // One of the 5 categories
  createdAt: DateTime  // Creation timestamp
}
```

### Join Tables
```
ProjectTag {
  projectId: string
  tagId: string
}

PublicationTag {
  publicationId: string
  tagId: string
}
```

---

## User Journeys

### Visitor Browsing by Tags
```
1. Land on Projects or Publications page
   ↓
2. See tag filters (grouped by category)
   ↓
3. Click on tag (e.g., "User Interviews")
   ↓
4. View filtered results showing only content with that tag
   ↓
5. See count of matching items
   ↓
6. Click additional tags to refine further (AND/OR logic)
```

### Admin Tagging Content
```
1. Create or edit Project/Publication
   ↓
2. View tag selector (grouped by category)
   ↓
3. Search for existing tags or create new
   ↓
4. Select multiple tags across categories
   ↓
5. Save content with tag associations
   ↓
6. Tags immediately available for filtering
```

### Admin Tag Management
```
1. Navigate to Tags management (Admin panel)
   ↓
2. View all tags grouped by category
   ↓
3. See usage count for each tag
   ↓
4. Option to:
   - Create new tag (choose category)
   - Delete unused tag
   - View all content using specific tag
```

---

## Design Principles

1. **Categorized Organization:** Tags must belong to one category
2. **Reusability:** Tags can be used across multiple content items
3. **Consistency:** Same tag applies universally (no per-content variations)
4. **Slug-based Uniqueness:** URLs and API use slugs, not names
5. **Usage Protection:** Cannot delete tags currently in use
6. **Auto-slugification:** Slugs automatically generated from names

---

## Success Metrics

**Measured by:**
- Number of tags created and used
- Distribution across categories
- Tag usage counts (which tags are most popular)
- Filter engagement (how often visitors use tag filters)
- Content with no tags (should be minimal)

**Success Criteria:**
- All projects have at least 3 tags (covering method, topic, skill/tool)
- All publications have at least 2 tags
- Tag categories relatively balanced in usage
- Tag filters result in meaningful result sets (not too narrow/broad)

---

## Integration Points

### Connected Features
- **Projects:** Tag assignment and filtering
- **Publications:** Tag assignment and filtering
- **Timeline:** Potential filtering by tags
- **Admin Panel:** Tag management interface

### Technical Integration
- Many-to-many relationships via join tables
- Cascading deletes (remove tag → remove associations)
- Automatic slug generation on tag creation
- Usage count aggregation across both content types

---

## Rules and Constraints

### Validation Rules
- Tag name: 1-50 characters, required
- Category: Must be one of 5 valid categories, required
- Slug: Auto-generated, must be unique
- Cannot delete tag if in use (projectCount + publicationCount > 0)

### Business Rules
- One tag can appear in only one category (no duplicates)
- Tags are shared across Projects and Publications
- Tags are global (not per-user or per-project)
- Soft delete not supported (hard delete only)

---

## Content Examples

### Example Project Tags
**Project:** "Healthcare Patient Portal Redesign"
- RESEARCH_METHOD: User Interviews, Usability Testing
- INDUSTRY: Healthcare
- TOPIC: Accessibility, Enterprise Workflows
- TOOL: Figma, React
- SKILL: User Journey Mapping, Prototyping

### Example Publication Tags
**Publication:** "Designing for Accessibility in Healthcare Apps"
- TOPIC: Accessibility, Mobile UX
- INDUSTRY: Healthcare
- SKILL: Visual Design, Interaction Design

---

## Future Enhancements

**Potential Additions:**
- Tag relationships (parent/child hierarchies)
- Tag synonyms or aliases
- Tag popularity trends over time
- Smart tag suggestions based on content analysis
- Tag-based content recommendations ("You viewed X, see also...")
- Tag clouds with visual size based on usage
- Multi-tag AND/OR filter logic
- Tag descriptions or definitions

**Not Planned:**
- User-submitted tags (admin-only curation)
- Tag voting or crowdsourcing
- Tag colors or custom styling
- Cross-referencing between tag categories
- Tag versioning or history

---

## Related Documentation

- Spec: [tags.spec.md](../../03-how/specs/tags.spec.md)
- Implementation: [tags.impl.md](../../03-how/implementation/tags.impl.md)
- Projects Feature: [projects.md](projects.md)
- Publications Feature: [publications.md](publications.md)
