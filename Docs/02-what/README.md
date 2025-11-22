# 02-what: Product Definition

This section defines **what** we're building - the product requirements, features, and user experiences.

## Overview

The product definition layer translates strategic vision into concrete product requirements. It describes features, user journeys, and success criteria without diving into technical implementation.

## Documents

### Core Product
- [core-product.md](./core-product.md) - Complete product overview including tech stack, user personas, MVP scope, and content strategy

### Features
- [features/README.md](./features/README.md) - Feature catalog index
- [features/projects.md](./features/projects.md) - Projects management system
- [features/publications.md](./features/publications.md) - Publications aggregation
- [features/guidebooks.md](./features/guidebooks.md) - Curated guidebooks
- [features/admin-panel.md](./features/admin-panel.md) - Admin capabilities
- [features/authentication.md](./features/authentication.md) - Auth system

## Key Concepts

### Content Types
1. **Projects** - Research case studies with detailed methodology
2. **Publications** - Articles from Medium, Substack, and other platforms
3. **Guidebooks** - Curated collections of publications
4. **Tags** - Cross-cutting categorization (5 categories)

### User Types
- **Public Visitors** - View published content, no authentication required
- **Admin Users** - Full CRUD access, content management

### Core Flows
1. **Content Discovery** - Browse timeline, filter by type/tags
2. **Project Exploration** - View case study details, methodology, impact
3. **Publication Reading** - Access aggregated articles, navigate to source
4. **Content Management** - Admin CRUD operations, publishing workflow

## Relationship to Other Sections

- **Informed by:** [01-why/](../01-why/) - Strategic vision drives feature priorities
- **Informs:** [03-how/](../03-how/) - Product requirements shape technical specifications
- **Enables:** [04-guides/](../04-guides/) - Feature definitions guide user documentation

## What This Section Contains

- Product requirements and features
- User personas and journeys
- MVP scope boundaries
- Success metrics
- Content strategy

## What This Section Does NOT Contain

- Technical implementation details (see [03-how/implementation/](../03-how/implementation/))
- Architecture decisions (see [03-how/architecture/](../03-how/architecture/))
- API specifications (see [03-how/specs/](../03-how/specs/))
- Code references or snippets

---

Last Updated: 2025-11-21
