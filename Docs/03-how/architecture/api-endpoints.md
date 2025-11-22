# API Reference

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Protected endpoints require JWT token in HTTP-only cookie.

```http
Cookie: auth-token=<JWT_TOKEN>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* if applicable */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": [ /* validation errors */ ]
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., slug) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Authentication Endpoints

### POST /api/auth/login

Admin authentication.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clx123456",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "ADMIN"
  }
}
```

### POST /api/auth/logout

End admin session.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/session

Check authentication status.

**Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": "clx123456",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "ADMIN"
  }
}
```

## Project Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | No | List all published projects |
| GET | `/api/projects/featured` | No | Get featured projects |
| GET | `/api/projects/:slug` | No | Get single project |
| POST | `/api/projects` | Yes | Create project |
| PUT | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| PATCH | `/api/projects/:id/publish` | Yes | Toggle publish status |

### GET /api/projects

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| researchType | enum | - | FOUNDATIONAL, EVALUATIVE, GENERATIVE, MIXED |
| industry | string | - | Filter by industry |
| tag | string | - | Filter by tag slug |
| featured | boolean | - | Filter featured |
| sort | string | createdAt | createdAt, updatedAt, title |
| order | string | desc | asc or desc |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123456",
      "title": "E-commerce User Journey Study",
      "slug": "ecommerce-user-journey",
      "overview": "Brief summary...",
      "researchType": "EVALUATIVE",
      "industry": "E-commerce",
      "timeframe": "3 months",
      "role": "Lead User Researcher",
      "featured": true,
      "tags": [
        { "id": "tag1", "name": "Usability Testing", "slug": "usability-testing" }
      ],
      "createdAt": "2024-10-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### POST /api/projects (Admin)

**Request:**
```json
{
  "title": "Mobile App Usability Testing",
  "overview": "Led moderated testing...",
  "objectives": "## Research Objectives...",
  "methodology": "## Approach...",
  "findings": "## Key Findings...",
  "impact": "## Business Impact...",
  "timeframe": "2 months",
  "role": "Senior UX Researcher",
  "researchType": "EVALUATIVE",
  "industry": "Mobile Apps",
  "methodsUsed": ["Usability Testing", "Think-Aloud Protocol"],
  "featured": false,
  "published": false,
  "tagIds": ["tag1", "tag2"],
  "images": [
    {
      "url": "https://cdn.example.com/image.png",
      "alt": "Description",
      "caption": "Optional caption",
      "order": 1
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx789012",
    "slug": "mobile-app-usability-testing",
    /* ... full project object */
  }
}
```

## Publication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/publications` | No | List all publications |
| GET | `/api/publications/featured` | No | Get featured publications |
| GET | `/api/publications/:slug` | No | Get single publication |
| POST | `/api/publications` | Yes | Create publication |
| POST | `/api/publications/sync` | Yes | Sync from external platforms |
| PUT | `/api/publications/:id` | Yes | Update publication |
| DELETE | `/api/publications/:id` | Yes | Delete publication |

### GET /api/publications

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| platform | enum | MEDIUM, SUBSTACK, EXTERNAL, INTERNAL |
| tag | string | Filter by tag slug |
| featured | boolean | Filter featured |
| search | string | Search in title and excerpt |
| sort | string | publishedAt, createdAt, title |
| order | string | asc or desc (default: desc) |

### POST /api/publications/sync (Admin)

Sync publications from external platforms.

**Request:**
```json
{
  "platforms": ["MEDIUM", "SUBSTACK"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "synced": 12,
    "updated": 3,
    "errors": 0,
    "details": {
      "MEDIUM": { "synced": 8, "updated": 2 },
      "SUBSTACK": { "synced": 4, "updated": 1 }
    }
  }
}
```

## Guidebook Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/guidebooks` | No | List all guidebooks |
| GET | `/api/guidebooks/featured` | No | Get featured guidebooks |
| GET | `/api/guidebooks/:slug` | No | Get guidebook with articles |
| POST | `/api/guidebooks` | Yes | Create guidebook |
| POST | `/api/guidebooks/:id/articles` | Yes | Add article to guidebook |
| PUT | `/api/guidebooks/:id` | Yes | Update guidebook |
| DELETE | `/api/guidebooks/:id` | Yes | Delete guidebook |

### GET /api/guidebooks/:slug

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "guide123",
    "title": "Complete Guide to Usability Testing",
    "slug": "complete-guide-usability-testing",
    "description": "A comprehensive collection...",
    "purpose": "Help UX professionals...",
    "targetAudience": "UX Researchers, Product Designers",
    "coverImage": "https://cdn.example.com/cover.png",
    "totalReadTime": 45,
    "featured": true,
    "published": true,
    "articles": [
      {
        "id": "art1",
        "order": 1,
        "publication": {
          "id": "pub1",
          "title": "Introduction to Usability Testing",
          "slug": "intro-usability-testing",
          "excerpt": "Learn the basics...",
          "platform": "MEDIUM",
          "externalUrl": "https://medium.com/article",
          "publishedAt": "2024-10-01T10:00:00Z",
          "readTime": 5,
          "tags": [...]
        }
      }
    ]
  }
}
```

## Timeline Endpoint

### GET /api/timeline

Get unified content timeline for homepage.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Items to return (default: 15, max: 50) |
| offset | number | Skip items (default: 0) |
| contentType | enum | PUBLICATION, GUIDEBOOK, PROJECT |
| tags | string[] | Filter by tag slugs |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "timeline1",
      "contentType": "PUBLICATION",
      "contentId": "pub123",
      "title": "Introduction to User Research",
      "excerpt": "Learn the basics...",
      "date": "2024-11-15T10:00:00Z",
      "url": "/publications/intro-user-research",
      "tags": ["User Research", "UX"],
      "readTime": 8,
      "platform": "MEDIUM"
    }
  ],
  "pagination": {
    "limit": 15,
    "offset": 0,
    "hasMore": true
  }
}
```

## Tag Endpoints

### GET /api/tags

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| category | enum | RESEARCH_METHOD, INDUSTRY, TOPIC, TOOL, SKILL |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tag1",
      "name": "Usability Testing",
      "slug": "usability-testing",
      "category": "RESEARCH_METHOD",
      "count": 12
    }
  ]
}
```

### GET /api/tags/categories

Get tags grouped by category.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "RESEARCH_METHOD": [
      { "id": "tag1", "name": "Usability Testing", "slug": "usability-testing", "count": 12 }
    ],
    "INDUSTRY": [
      { "id": "tag3", "name": "E-commerce", "slug": "ecommerce", "count": 8 }
    ]
  }
}
```

## Contact Endpoint

### POST /api/contact

Send contact form message.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Collaboration Opportunity",
  "message": "Hi, I'd like to discuss..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Rate Limit:** 5 requests per hour per IP

## Admin Endpoints

### GET /api/admin/stats (Admin)

Get dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": {
      "total": 45,
      "published": 42,
      "drafts": 3,
      "featured": 8
    },
    "publications": {
      "total": 87,
      "byPlatform": {
        "MEDIUM": 52,
        "SUBSTACK": 35
      },
      "featured": 12
    },
    "guidebooks": {
      "total": 8,
      "published": 7,
      "drafts": 1
    }
  }
}
```

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 requests | 15 minutes |
| Authenticated | 500 requests | 15 minutes |
| Contact Form | 5 requests | 1 hour |

## Caching

| Endpoint | Cache Duration | Strategy |
|----------|---------------|----------|
| GET /api/projects | 5 minutes | stale-while-revalidate |
| GET /api/publications | 10 minutes | stale-while-revalidate |
| GET /api/guidebooks | 15 minutes | stale-while-revalidate |
| GET /api/timeline | 5 minutes | stale-while-revalidate |
| GET /api/tags | 1 hour | rarely changes |

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Invalid input data |
| INVALID_CREDENTIALS | Wrong email/password |
| TOKEN_EXPIRED | JWT token expired |
| TOKEN_INVALID | Invalid JWT token |
| INSUFFICIENT_PERMISSIONS | User lacks permissions |
| RESOURCE_NOT_FOUND | Resource doesn't exist |
| DUPLICATE_SLUG | Slug already exists |
| INTERNAL_ERROR | Unexpected server error |
| DATABASE_ERROR | Database operation failed |
| EXTERNAL_SERVICE_ERROR | Third-party service failed |

---

**Last Updated:** 2025-01-21
**Version:** 2.0
