# ADR-002: Prisma ORM for Database Layer

**Status:** Accepted
**Date:** 2025-11-21
**Decision Makers:** Development Team
**Context Review Date:** 2026-11-21

## Context

We need a database access layer for the portfolio backend to handle:

- CRUD operations for 8 data models (User, Project, Publication, Guidebook, Tag, etc.)
- Complex relationships (many-to-many tags, one-to-many images)
- Type-safe database queries
- Database migrations
- Query optimization with indexes
- Connection pooling for serverless
- PostgreSQL as the database

### Requirements

**Functional:**
- Type-safe database queries
- Relationship handling (1:many, many:many)
- Transaction support
- Migration management
- Seed data support

**Non-Functional:**
- Excellent TypeScript integration
- Good performance (query execution <100ms typical)
- Serverless-friendly (connection pooling)
- Developer-friendly (clear errors, autocomplete)
- Active maintenance and community

### Constraints

- Using PostgreSQL database
- TypeScript codebase
- Serverless deployment (connection limits)
- Team familiar with SQL but wants type safety

## Decision

**We will use Prisma ORM v5.22+ as our database access layer.**

### Implementation Details

**Version:** Prisma 5.22.0+
**Database:** PostgreSQL 15+
**Client:** @prisma/client
**CLI:** prisma

**Schema Definition:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Project {
  id           String        @id @default(cuid())
  title        String
  slug         String        @unique
  published    Boolean       @default(false)
  authorId     String

  author       User          @relation(fields: [authorId], references: [id])
  tags         ProjectTag[]
  images       ProjectImage[]

  @@index([slug])
  @@index([published])
}
```

**Usage Pattern:**
```typescript
import { prisma } from '@/lib/prisma';

// Type-safe queries with autocomplete
const projects = await prisma.project.findMany({
  where: { published: true },
  include: {
    tags: {
      include: {
        tag: true
      }
    },
    images: {
      orderBy: { order: 'asc' }
    }
  },
  orderBy: { createdAt: 'desc' }
});

// Transactions
await prisma.$transaction([
  prisma.project.create({ data: projectData }),
  prisma.contentTimeline.create({ data: timelineData })
]);
```

## Rationale

### Why Prisma Over Alternatives

**Key Advantages:**
1. **Type Safety:** Auto-generated TypeScript types from schema
2. **Developer Experience:** Best-in-class autocomplete and error messages
3. **Schema-First:** Declarative schema is source of truth
4. **Migrations:** Powerful migration system with history
5. **Relationships:** Elegant handling of complex relationships
6. **Prisma Studio:** Built-in GUI for database inspection
7. **Connection Pooling:** Built-in support for serverless (Accelerate)
8. **Query Optimization:** Intelligent query planning
9. **Active Development:** Regular updates, large community
10. **Documentation:** Excellent guides and examples

**Serverless Benefits:**
- Connection pooling via Prisma Accelerate (optional)
- Efficient connection management
- Fast cold starts
- Works well with Vercel/AWS Lambda

**TypeScript Integration:**
```typescript
// Fully typed, catches errors at compile time
const project: Project = await prisma.project.findUnique({
  where: { slug: 'my-project' }
});

// TypeScript knows exact return type
const titles: string[] = projects.map(p => p.title);
```

### Comparison with Alternatives

#### vs. TypeORM
**TypeORM Advantages:**
- More ORM-like (Active Record pattern)
- Decorators for entity definition
- More similar to Java/C# ORMs

**Why Prisma Instead:**
- Better TypeScript inference
- Simpler schema definition
- Better performance
- More active development
- Superior DX (autocomplete, errors)
- Better serverless support

#### vs. Drizzle ORM
**Drizzle Advantages:**
- Lighter weight
- SQL-like syntax
- Performance (slightly faster)
- Full TypeScript (no codegen)

**Why Prisma Instead:**
- More mature and stable
- Better documentation
- Larger community
- Migration system more robust
- Team familiar with Prisma patterns
- Prisma Studio included

#### vs. Sequelize
**Sequelize Advantages:**
- Older, more established
- Supports more databases
- More middleware hooks

**Why Prisma Instead:**
- Much better TypeScript support
- Cleaner API
- Better performance
- More modern architecture
- Better error messages
- Active development (Sequelize slower updates)

#### vs. Knex.js (Query Builder)
**Knex Advantages:**
- More control over SQL
- Lighter weight
- No schema required

**Why Prisma Instead:**
- Type safety without manual typing
- Relationship handling built-in
- Migration system included
- Less boilerplate code
- Better DX overall

#### vs. Raw SQL
**Raw SQL Advantages:**
- Maximum control
- No abstraction overhead
- Can optimize every query

**Why Prisma Instead:**
- Type safety prevents SQL injection
- Much faster development
- Easier maintenance
- Handles relationships automatically
- Migration management
- Still can use raw SQL when needed: `prisma.$queryRaw`

## Consequences

### Positive

1. **Type Safety:** Compile-time error catching for database queries
2. **Productivity:** Fast development with autocomplete
3. **Maintainability:** Schema as single source of truth
4. **Quality:** Fewer runtime errors from typos/wrong types
5. **Migrations:** Reliable schema evolution
6. **Debugging:** Clear error messages, Prisma Studio for inspection
7. **Onboarding:** New developers understand schema quickly
8. **Testing:** Easy to mock Prisma client

### Negative

1. **Learning Curve:** Team must learn Prisma patterns
2. **Bundle Size:** Prisma client adds ~1-2MB to deployment
3. **Flexibility:** Less control than raw SQL for complex queries
4. **Code Generation:** Must run `prisma generate` after schema changes
5. **Query Complexity:** Very complex queries may require raw SQL
6. **Vendor Lock-in:** Tight coupling to Prisma (but can migrate)
7. **Connection Pooling:** May need Prisma Accelerate for high traffic

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Performance issues | Medium | Use indexes, raw SQL for complex queries, Prisma Accelerate |
| Connection limits (serverless) | Medium | Implement connection pooling, use Accelerate |
| Breaking changes in Prisma | Low | Prisma stable, follow migration guides |
| Complex queries not possible | Low | Fall back to `$queryRaw` when needed |
| Bundle size too large | Low | Code splitting, tree shaking (client is modular) |

### Best Practices Adopted

**Schema Organization:**
- Clear naming conventions
- Comprehensive indexes
- Proper relationship definitions
- Comments for complex fields

**Query Optimization:**
- Use `select` to fetch only needed fields
- Proper `include` depth (avoid N+1)
- Indexes on frequently queried fields
- Batch queries when possible

**Error Handling:**
```typescript
try {
  const project = await prisma.project.findUniqueOrThrow({
    where: { slug }
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      throw new NotFoundError('Project not found');
    }
  }
  throw error;
}
```

**Transactions:**
```typescript
// Use transactions for multi-table operations
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({ data: projectData });
  await tx.contentTimeline.create({
    data: { ...timelineData, contentId: project.id }
  });
});
```

## Implemented Optimizations

### Indexes Added
```prisma
model Project {
  @@index([slug])
  @@index([published])
  @@index([featured])
  @@index([researchType])
  @@index([createdAt])
}

model Publication {
  @@index([slug])
  @@index([platform])
  @@index([publishedAt])
  @@index([externalId])
}

model ContentTimeline {
  @@index([date])
  @@index([contentType])
  @@index([contentId])
}
```

### Connection Management
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|----------------|
| TypeORM | Less mature TypeScript support, weaker DX |
| Drizzle | Less mature, smaller community, learning curve |
| Sequelize | Poor TypeScript support, slower updates |
| Knex.js | No type safety, more boilerplate |
| Raw SQL | No type safety, slower development, maintenance burden |
| MikroORM | Less popular, smaller ecosystem |

## Related Decisions

- **ADR-001:** Next.js backend (Prisma integrates seamlessly)
- Database choice: PostgreSQL (Prisma supports excellently)
- TypeScript: Prisma's primary strength

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Performance Benchmarks

**Typical Query Performance:**
- Simple findUnique: 10-30ms
- findMany with includes: 50-150ms
- Complex queries with joins: 100-300ms
- Write operations: 20-80ms

**Database:** PostgreSQL on Vercel
**Connection:** Pooled via Prisma
**Data Size:** ~100 projects, ~50 publications, ~30 tags

## Review Notes

**Last Reviewed:** 2025-11-21
**Next Review:** 2026-11-21

**Review Criteria:**
- Has query performance degraded?
- Are there queries Prisma can't handle?
- Has bundle size become problematic?
- Has Drizzle/other ORMs matured significantly?
- Are connection limits causing issues?

**Decision Still Valid?** Yes
**Changes Needed?** Consider Prisma Accelerate if traffic increases 10x

---

**ADR Status:**  Accepted and Implemented
**Last Updated:** 2025-11-21
