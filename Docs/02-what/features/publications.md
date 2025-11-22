# Feature: Publications Aggregation

## Overview

Publications feature aggregates articles from external platforms (Medium, Substack, and others) into a centralized, searchable catalog with rich metadata and filtering capabilities.

## Purpose

Provide a unified view of all published writing, making it easy for visitors to discover articles across platforms while maintaining links to original publication sources.

## Target Users

### Primary: Content Readers
- Following published articles and insights
- Discovering content by topic or theme
- Accessing full content library in one place

### Secondary: Admin
- Managing publication metadata
- Syncing content from external platforms
- Featuring important articles
- Organizing with tags

## Key Capabilities

### 1. Multi-Platform Aggregation

**Supported Platforms:**
- Medium articles
- Substack newsletters
- External guest posts
- Internal blog posts (future)

**Content Sync:**
- Automatic sync from Medium API
- RSS feed parsing for Substack
- Manual entry for external publications
- Deduplication by external ID

### 2. Publications Browsing (Public)

**Display Features:**
- Article title and excerpt
- Publication date
- Platform badge (Medium, Substack, etc.)
- Read time estimate
- Topic tags
- Featured articles section
- Direct links to original articles

**Filtering & Discovery:**
- Filter by platform
- Filter by tags (topics, tools, skills)
- Search by title and excerpt
- Sort by date, popularity, or platform
- Pagination for large catalogs

### 3. Publication Management (Admin)

**Content Operations:**
- Create new publication entries
- Edit metadata (title, excerpt, tags)
- Delete publications
- Set featured status
- Assign tags and categories

**Sync Operations:**
- Trigger manual sync from platforms
- View sync status and history
- Handle sync errors
- Preview before publishing

### 4. Publication Detail View

**Rich Display:**
- Full article metadata
- Cover image (if available)
- Complete excerpt
- Platform attribution
- Publication date and read time
- Tagged topics
- "Read on [Platform]" CTA button

**Related Content:**
- Other articles with similar tags
- Guidebooks containing this article
- Author's other publications

## User Flows

### Visitor Discovering Content

1. Navigate to Publications page
2. View featured articles at top
3. Browse recent publications
4. Filter by topic of interest (e.g., "Usability Testing")
5. Click on article
6. Read excerpt and metadata
7. Click "Read on Medium" to view full article
8. Return to explore related content

### Admin Syncing Publications

1. Log into admin panel
2. Navigate to Publications management
3. Click "Sync from Platforms"
4. Select platforms (Medium, Substack)
5. Review sync results (new, updated, errors)
6. Edit metadata for new articles
7. Assign tags to categorize
8. Set featured status for highlights
9. Publish to public site

## Business Value

### For Portfolio Owner
- Centralizes thought leadership in one place
- Increases discoverability of published work
- Demonstrates consistent content creation
- Provides analytics on popular topics

### For Visitors
- Single source for all articles
- Easy topic-based discovery
- No need to follow multiple platforms
- Curated, high-quality content

## Integration Points

- **Medium API:** Automatic article import with metadata
- **Substack RSS:** Feed parsing for newsletter content
- **Tags System:** Multi-tag categorization
- **Guidebooks:** Articles can be included in curated collections
- **Timeline Feed:** Publications appear in homepage activity stream

## Technical Features

### Automatic Synchronization

**Medium Integration:**
- OAuth authentication with Medium
- Fetch user's published articles
- Extract title, excerpt, publication date, tags
- Store external Medium article ID
- Check for updates on subsequent syncs

**Substack Integration:**
- Parse RSS feed URL
- Extract post metadata
- Handle newsletter-specific formatting
- Map tags from Substack categories

**Deduplication:**
- Check by external ID before creating
- Update existing entries on re-sync
- Track last sync timestamp
- Handle deleted articles gracefully

### Metadata Management

**Stored Information:**
- Title, slug, excerpt
- Full content (cached, optional)
- Platform source
- External URL and ID
- Publication date
- Read time estimate
- Cover image URL
- Sync status and timestamp

## Success Metrics

- Publication page views as % of total traffic
- Click-through rate to external platforms
- Average articles viewed per session
- Tag filter usage rates
- Featured article engagement
- Sync success rate (>95%)

## Content Guidelines

### Manual Entry Best Practices

**Required Fields:**
- Title (as published)
- Excerpt (first 2-3 sentences or custom summary)
- Platform (accurate badge)
- External URL (direct link to article)
- Publication date (original publish date)

**Optional But Recommended:**
- Read time (estimate 200 words/minute)
- Cover image (for visual appeal)
- Tags (2-5 relevant topics)
- Featured flag (for exceptional articles)

### Tag Assignment

**Effective Tagging:**
- 2-5 tags per article
- Mix of topics, methods, and tools
- Consistent terminology
- Avoid over-tagging

## Related Documentation

- **Spec:** [03-how/specs/publications-crud.spec.md](../../03-how/specs/publications-crud.spec.md) - Requirements
- **Implementation:** [03-how/implementation/publications-api.impl.md](../../03-how/implementation/publications-api.impl.md) - Technical details
- **Guidebooks:** [guidebooks.md](./guidebooks.md) - How publications are curated into collections

---

**Feature Type:** Content Aggregation
**Status:** Implemented
**Last Updated:** 2025-01-21
