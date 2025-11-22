# Feature: Projects Portfolio

## Overview

The Projects feature enables display and management of user research case studies with rich methodology documentation, visual artifacts, and impact tracking.

## Purpose

Showcase professional user research work in depth, providing potential employers, peers, and collaborators with comprehensive examples of research expertise, approach, and outcomes.

## Target Users

### Primary: Public Visitors
- **Recruiters/Employers:** Evaluating research skills and experience
- **Industry Peers:** Learning from methodologies and insights
- **Potential Collaborators:** Assessing expertise fit

### Secondary: Admin
- Creating and managing project case studies
- Publishing and featuring projects
- Organizing with tags and metadata

## Key Capabilities

### 1. Project Display (Public)

**Comprehensive Case Study Format:**
- Title and overview
- Research objectives
- Methodology and approach
- Key findings and insights
- Business impact and outcomes
- Timeframe and role
- Visual artifacts (screenshots, diagrams, journey maps)

**Organization:**
- Filter by research type (Foundational, Evaluative, Generative, Mixed)
- Filter by industry domain
- Filter by methods used
- Filter by tags
- Featured projects section
- Chronological or custom ordering

### 2. Project Management (Admin)

**Content Creation:**
- Rich markdown editor support
- Multi-image upload and ordering
- Tag assignment (methods, industries, topics, tools, skills)
- Metadata management (timeframe, role, research type)

**Publishing Controls:**
- Draft/Published status toggle
- Featured flag for homepage highlighting
- Custom display order
- Slug generation for URLs

**Operations:**
- Create new projects
- Edit existing projects
- Delete projects (with confirmation)
- Publish/unpublish toggle
- View all projects (drafts and published)

### 3. Project Detail View

**Rich Content Display:**
- Hero image or visual
- Structured sections with clear hierarchy
- Image galleries with captions
- Tag display with category badges
- Metadata sidebar (type, industry, timeframe, role)

**Navigation:**
- Previous/Next project links
- Related projects by tag
- Back to projects list

## User Flows

### Visitor Exploring Projects

1. Land on Projects page
2. Browse featured projects at top
3. Filter by research type or industry
4. Click on project of interest
5. Read full case study
6. View methodology and findings
7. Check related projects by tag
8. Navigate to other projects or home

### Admin Creating Project

1. Log into admin panel
2. Navigate to Projects management
3. Click "Create New Project"
4. Fill in all project fields:
   - Title, overview, objectives
   - Methodology, findings, impact
   - Timeframe, role, research type
   - Industry, methods used
5. Upload and order images
6. Assign relevant tags
7. Set featured/published status
8. Save as draft or publish immediately
9. Preview on public site
10. Edit and refine as needed

## Business Value

### For Portfolio Owner
- Demonstrates depth of research expertise
- Shows variety of methods and industries
- Provides concrete evidence of impact
- Differentiates from generic portfolios

### For Visitors
- Quickly assess relevant experience
- Learn from detailed methodologies
- Understand approach and thinking
- Evaluate potential fit for opportunities

## Integration Points

- **Tags System:** Multi-category tagging for organization
- **Timeline Feed:** Featured projects appear in homepage timeline
- **Image Storage:** Integration with Vercel Blob or Cloudinary
- **Search (Future):** Full-text search across project content

## Success Metrics

- Average time on project detail pages > 2 minutes
- Project detail page views as % of total traffic
- Click-through from projects to contact form
- Featured project engagement rates

## Design Principles

1. **Story-Driven:** Emphasize narrative over bullet points
2. **Visual:** Support rich imagery for engagement
3. **Scannable:** Clear headings and sections for quick reading
4. **Professional:** Balance detail with readability
5. **Accessible:** WCAG AA compliance for all content

## Content Guidelines

### Required Fields
- Title (concise, descriptive)
- Overview (2-3 sentences)
- Objectives (what you set out to learn)
- Methodology (how you approached it)
- Findings (what you discovered)
- Impact (business outcomes)
- Timeframe (project duration)
- Role (your specific role)

### Optional But Recommended
- Industry context
- Team composition
- Methods used (specific techniques)
- Visual artifacts
- Client quotes or testimonials (if permitted)
- Related publications or presentations

### Confidentiality Considerations
- Anonymize client names if needed
- Obscure sensitive data in visuals
- Focus on approach over proprietary details
- Seek permission for client references

## Related Documentation

- **Spec:** [03-how/specs/projects-crud.spec.md](../../03-how/specs/projects-crud.spec.md) - Detailed requirements
- **Implementation:** [03-how/implementation/projects-api.impl.md](../../03-how/implementation/projects-api.impl.md) - Technical details
- **Database:** [03-how/architecture/database-schema.md](../../03-how/architecture/database-schema.md) - Data model

---

**Feature Type:** Core Portfolio Capability
**Status:** Implemented
**Last Updated:** 2025-01-21
