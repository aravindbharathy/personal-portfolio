---
implements: specs/markdown-support.spec.md
type: feature
modules:
  - frontend/src/components/admin/MarkdownEditor.tsx
  - frontend/src/components/admin/ProjectForm.tsx
  - frontend/src/pages/ProjectDetail.tsx
  - frontend/tailwind.config.ts
dependencies:
  - "@uiw/react-md-editor"
  - "react-markdown"
  - "remark-gfm"
  - "@tailwindcss/typography"
last_updated: 2025-11-23
---

# Markdown Support Implementation

## Architecture

The markdown support feature uses a client-side approach with:

1. **Editor Layer**: React-based markdown editor with live preview
2. **Rendering Layer**: React component for converting markdown to HTML
3. **Styling Layer**: Tailwind Typography plugin for consistent prose styles
4. **Data Layer**: Plain text markdown stored in existing database fields

**Key Design Decision**: Store markdown as plain text in existing content fields rather than creating separate fields. This maintains backward compatibility and simplifies the data model.

## Dependencies

### @uiw/react-md-editor
**Purpose**: Markdown editor component with syntax highlighting

**Features Used**:
- Split editor/preview modes
- Syntax highlighting
- Customizable height
- Toolbar for common markdown operations
- Dark mode support

**Configuration**:
```typescript
<MDEditor
  value={value}
  onChange={onChange}
  preview="edit"  // Edit mode only (no split view)
  height={minHeight}
  visibleDragbar={false}
  hideToolbar={false}
  enableScroll={true}
/>
```

### react-markdown
**Purpose**: Convert markdown to React components

**Why Chosen**:
- Renders markdown as React components (not innerHTML)
- Secure by default (no XSS vulnerabilities)
- Extensible with plugins
- Small bundle size

**Usage Pattern**:
```typescript
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {markdownContent}
</ReactMarkdown>
```

### remark-gfm
**Purpose**: GitHub Flavored Markdown support

**Features Enabled**:
- Tables with column alignment
- Strikethrough text
- Task lists
- Autolinks
- Footnotes

### @tailwindcss/typography
**Purpose**: Beautiful typography for rendered markdown

**Classes Applied**:
- `prose` - Base typography styles
- `prose-lg` - Larger text size for readability
- `prose-slate` - Slate color palette
- `dark:prose-invert` - Inverted colors for dark mode
- `max-w-none` - Remove max-width constraint

## Frontend Components

### MarkdownEditor Component
**Location**: `frontend/src/components/admin/MarkdownEditor.tsx`

**Purpose**: Reusable markdown editor for form fields

**Props**:
```typescript
interface MarkdownEditorProps {
  id: string;              // Field identifier
  label: string;           // Display label
  value: string;           // Markdown content
  onChange: (value: string) => void;  // Update handler
  placeholder?: string;    // Placeholder text
  required?: boolean;      // Show required indicator
  error?: string;          // Validation error message
  minHeight?: number;      // Editor height in pixels
}
```

**State Management**:
- Controlled component (value from parent)
- onChange callback for updates
- No internal state

**Styling**:
```typescript
<div data-color-mode="light">  // Force light mode in editor
  <MDEditor {...props} />
</div>
```

**User Experience**:
- Label with optional required indicator
- Full-featured markdown toolbar
- Helpful hint about markdown capabilities
- Error message display below editor

### ProjectForm Integration
**Location**: `frontend/src/components/admin/ProjectForm.tsx`

**Changes Made**:

1. **Import MarkdownEditor**:
```typescript
import { MarkdownEditor } from './MarkdownEditor';
```

2. **Replace Textarea Components**:

**Before**:
```typescript
<Textarea
  id="overview"
  {...register('overview')}
  rows={3}
/>
```

**After**:
```typescript
<MarkdownEditor
  id="overview"
  label="Overview"
  value={watch('overview') || ''}
  onChange={(value) => setValue('overview', value)}
  minHeight={150}
  required
  error={errors.overview?.message}
/>
```

3. **Fields Updated**:
- Overview (150px height)
- Objectives (200px height)
- Methodology (250px height)
- Findings (250px height)
- Impact (200px height)

**Form Validation**: Works unchanged - markdown is plain text that passes Zod string validation

### ProjectDetail Rendering
**Location**: `frontend/src/pages/ProjectDetail.tsx`

**Changes Made**:

1. **Import Dependencies**:
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
```

2. **Replace Plain Text Rendering**:

**Before**:
```typescript
<p className="text-lg text-muted-foreground">
  {project.overview}
</p>
```

**After**:
```typescript
<div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {project.overview}
  </ReactMarkdown>
</div>
```

3. **Applied to All Content Sections**:
- Overview (hero section)
- Research Objectives
- Methodology & Approach
- Key Findings & Insights
- Impact & Outcomes

**Responsive Behavior**:
- `prose-lg` provides consistent large text
- Responsive breakpoints handled by prose classes
- Lists stack properly on mobile
- Tables scroll horizontally if needed

## Tailwind Configuration

### tailwind.config.ts Updates

**Added Plugin**:
```typescript
plugins: [
  require("tailwindcss-animate"),
  require("@tailwindcss/typography"),  // NEW
],
```

**Typography Defaults**:
The plugin provides sensible defaults for all prose elements:

- Paragraphs: 1.25rem line height
- Lists: Proper bullets, numbering, indentation
- Headings: Size hierarchy (h1-h6)
- Links: Underline, color, hover state
- Code: Background, border, monospace font
- Blockquotes: Left border, italic
- Tables: Borders, header styling

**Customization**: Uses project's existing color tokens via CSS variables

## Data Flow

### Creating/Editing Project with Markdown

1. **Admin writes markdown** → MarkdownEditor captures input
2. **Form state updates** → React Hook Form setValue called
3. **Validation runs** → Zod validates as string (markdown is text)
4. **Form submits** → Plain markdown text sent to API
5. **Database stores** → Stored as TEXT in existing columns
6. **No migration needed** → Existing fields work as-is

### Displaying Project with Markdown

1. **Page loads** → useProject hook fetches data
2. **Data includes markdown** → Plain text from database
3. **ReactMarkdown parses** → Converts to React components
4. **prose classes style** → Typography plugin applies CSS
5. **User sees formatted content** → Lists, bold, links, etc. rendered

## Performance Considerations

**Bundle Size**:
- react-markdown: ~6KB gzipped
- remark-gfm: ~3KB gzipped
- @uiw/react-md-editor: ~40KB gzipped
- Total addition: ~49KB (acceptable for admin panel)

**Rendering Performance**:
- Markdown parsing is fast (< 1ms for typical content)
- No re-parsing on scroll or resize
- Components memoized by React

**Database Impact**:
- No schema changes required
- No additional queries
- Plain text storage efficient

## Accessibility

**Editor**:
- Proper label association
- Keyboard navigation in editor
- Error messages announced to screen readers
- Required fields indicated

**Rendered Content**:
- Semantic HTML from ReactMarkdown
- Proper heading hierarchy
- List structure preserved
- Link text descriptive (user responsibility)

## Browser Compatibility

**Editor**:
- Modern browsers (ES6+ required)
- Chrome, Firefox, Safari, Edge latest versions
- No IE11 support (admin panel only)

**Rendered Content**:
- All browsers (plain HTML output)
- Graceful degradation

## Migration Path

**Existing Content**:
1. Plain text content renders as single paragraph
2. No data migration needed
3. Admins can gradually add markdown to existing projects

**Backward Compatibility**:
- Markdown without any special syntax renders as plain text
- Old content continues to work
- Non-markdown content displays normally

## Testing Approach

**Manual Testing**:
1. Create project with markdown in all content fields
2. Verify lists render with bullets/numbers
3. Test bold, italic, links, code
4. Check dark mode rendering
5. Verify mobile responsiveness
6. Test form validation still works

**Content Examples**:
```markdown
## Key Findings

Our research revealed:

- **65% cart abandonment** during payment stage
- Users concerned about security
- Shipping costs unclear until late

### Recommendations

1. Add security badges
2. Show shipping costs earlier
3. Simplify payment form
```

## Future Enhancements

Potential improvements (out of current scope):
- Custom markdown toolbar buttons
- Markdown snippets/templates
- Image upload integrated with markdown
- Markdown preview tab in editor
- Export projects to markdown files
- Import markdown from files
- Collaborative editing with conflict resolution
- Markdown linting/validation
