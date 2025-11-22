---
implements: N/A
type: feature
modules:
  - frontend/src/pages/Publications.tsx
  - frontend/src/hooks/usePublications.ts
dependencies:
  - @tanstack/react-query
  - lucide-react
last_updated: 2025-01-21
---

# Publications Timeline Implementation

## Overview

The publications page displays research articles and writings in a chronological timeline format, organized by month and year.

## Design Pattern

### Timeline Structure

```
Timeline Line (vertical)
  ├── Month Header (with dot indicator)
  │     ├── Publication 1
  │     ├── Publication 2
  │     └── Publication 3
  ├── Month Header
  │     ├── Publication 4
  │     └── Publication 5
  └── ...
```

### Visual Hierarchy

1. **Timeline Line** - Continuous vertical line on the left
2. **Month Dots** - Circular indicators for each month
3. **Article Dots** - Smaller dots for individual articles
4. **Content** - Title, excerpt, metadata

## Layout Implementation

### Timeline Line
```tsx
<div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border"></div>
```
- Positioned absolutely at 11px from left
- Full height (top-0 to bottom-0)
- 0.5 pixel width for subtle appearance

### Month Header
```tsx
<div className="relative mb-8 flex items-center">
  <div className="absolute -left-4 w-6 h-6 bg-background border-2 border-border rounded-full flex items-center justify-center">
    <div className="w-2 h-2 rounded-full bg-secondary"></div>
  </div>
  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-8">
    {monthYear}
  </p>
</div>
```

**Key Details:**
- Outer circle: 6px diameter with border
- Inner dot: 2px diameter solid color
- Month label positioned with left margin

### Article Entry
```tsx
<div className="relative pl-8 mb-8">
  <div className="absolute left-0 w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center">
    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
  </div>
  
  {/* Article content */}
  <h3>{pub.title}</h3>
  <p>{pub.excerpt || pub.description}</p>
  {/* ... */}
</div>
```

## Data Grouping

Publications are grouped by month/year using `Intl.DateTimeFormat`:

```typescript
const groupedByMonth = publications.reduce((acc, pub) => {
  const date = new Date(pub.publishedAt);
  const monthYear = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date);
  
  if (!acc[monthYear]) {
    acc[monthYear] = [];
  }
  acc[monthYear].push(pub);
  return acc;
}, {} as Record<string, typeof publications>);
```

**Benefits:**
- Automatic localization support
- Handles month/year parsing
- Consistent formatting

## Content Display

### Excerpt vs Description

**Priority:**
1. Show `excerpt` if available (preferred)
2. Fall back to `description` if no excerpt
3. Truncate with CSS `line-clamp-3`

```tsx
<p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
  {pub.excerpt || pub.description}
</p>
```

**Rationale:**
- Excerpts are manually curated (better quality)
- Descriptions are auto-generated or generic
- Line clamp prevents layout breaks

### Metadata Display

```tsx
<div className="flex items-center gap-4 text-xs text-muted-foreground">
  <span className="flex items-center gap-1">
    <Calendar className="w-3 h-3" />
    {new Date(pub.publishedAt).toLocaleDateString('en-US', options)}
  </span>
  {pub.readTime && (
    <span className="flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {pub.readTime} min read
    </span>
  )}
  {pub.featured && (
    <Badge variant="outline" className="text-xs">Featured</Badge>
  )}
</div>
```

## Spacing and Alignment

### Vertical Spacing
- Timeline line: continuous (no gaps)
- Month sections: `mb-8` (2rem)
- Articles within month: `mb-8` (2rem)
- Content elements: `mb-3` or `mb-4`

### Horizontal Alignment
- Timeline at `left-[11px]`
- Dots at `left-0` or `-left-4` (relative to content)
- Content padding: `pl-8` (2rem left of dots)

## Responsive Behavior

- Timeline maintains consistent left position on all screens
- Content width adjusts with container
- Mobile: reduced padding, smaller fonts
- Desktop: max-width constraint for readability

## Styling Approach

### Color System
- Timeline line: `bg-border` (subtle)
- Month dots: `bg-secondary` (medium emphasis)
- Article dots: `bg-primary/40` (low emphasis)
- Text: semantic colors (`foreground`, `muted-foreground`)

### Typography
- Month headers: `text-xs uppercase tracking-widest`
- Titles: `text-xl font-semibold`
- Excerpts: `text-sm leading-relaxed`
- Metadata: `text-xs`

## Performance Considerations

- Client-side grouping (minimal computation)
- No virtualization (reasonable item count)
- Line-clamp for long text (no JS truncation)
- Image lazy loading (if cover images added)

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1 > h2 > h3)
- ARIA labels on icons
- Color contrast ratios meet WCAG AA
- Keyboard navigation support

## Future Enhancements

- [ ] Filter by tags
- [ ] Search functionality
- [ ] Infinite scroll or pagination
- [ ] Cover images for articles
- [ ] Social share buttons
- [ ] Reading progress indicator
- [ ] Sticky month headers
