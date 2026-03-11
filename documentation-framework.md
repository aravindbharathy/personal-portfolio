# Documentation Framework
**A systematic approach to organizing product and technical documentation**

_Last updated: Oct 20, 2025_

---

## Core Principle

**Separate strategic thinking from systematic execution.**

Product documentation (Why/What) informs business decisions. Development documentation (Specs/Architecture/Implementation) enables systematic building using backwards build methodology.

---

## Documentation Structure

```
docs/
├── 01-why/              # Strategic Vision & Market Context
├── 02-what/             # Product Definition & Features
├── 03-how/              # Systematic Development (Backwards Build)
│   ├── specs/           # WHAT to build (requirements)
│   ├── architecture/    # WHY decisions were made (ADRs)
│   ├── tests/           # HOW to verify (test plans)
│   ├── implementation/  # HOW it's built (technical docs)
│   │   ├── bug-fixes/   # Bug fix documentation
│   │   └── *.impl.md    # Feature implementation docs
│   └── sync/            # Drift detection logs
├── 04-guides/           # Usage & Onboarding
└── 05-project-mgmt/     # Planning & Coordination
```

---

## Document Types Explained

### 1. Vision Documents (01-why/)
**Purpose:** Explain market opportunity, competitive positioning, strategic rationale

**Contains:**
- Problem statements with data
- Market analysis and timing
- Competitive landscape
- Strategic advantages
- Philosophy and methodology

**Example:** `02-vision.md` - The AI slop crisis, backwards build philosophy, why KAPI will win

**Not Specs Because:** No acceptance criteria, no requirements, no implementation details

---

### 2. Product Definitions (02-what/)
**Purpose:** Define product features, scope, user stories, and boundaries

**Contains:**
- Core product overview
- Feature descriptions
- User personas and journeys
- MVP scope (in/out)
- Success metrics
- User stories

**Example:** `core-product.md` - Tech stack, key features, target users, competitive positioning

**Not Specs Because:** High-level feature lists, not detailed requirements with acceptance criteria

**When Something Is a Feature:**
1. Feature is a core differentiator (Brutal Analysis, Blueprints)
2. Feature is complex with multiple sub-capabilities
3. Sales/marketing needs to understand it deeply
4. New team members need product context
5. Feature appears in competitive positioning

❌ Don't Create Feature Doc When:

1. Feature is simple/obvious (file operations, basic UI)
2. Feature is purely infrastructure (tokenization, sampling)
3. Feature is adequately covered in core-product.md
4. Feature is a minor utility

**Recommended Structure**
```
├── 01-core-product.md
├── features/                    # NEW
│   ├── README.md               # Feature catalog/index
│   ├── brutal-analysis.md      # Major feature
...
└── product/
    ├── 05-user-stories.md
    └── ...
---
```

### 3. Living Specifications (03-how/specs/)
**Purpose:** Define WHAT to build with testable acceptance criteria

**Format:**
```yaml
---
feature_id: FEAT-XXX
status: draft | in_progress | implemented
owner: Name
implements: user-stories.md#story-2.1
verified: YYYY-MM-DD
---

# Feature Name

## Purpose
One sentence: what problem this solves

## Requirements
- Must do X
- Must complete in Y seconds
- Must support Z use cases

## Acceptance Criteria
- ✅ Criterion 1 (testable)
- ✅ Criterion 2 (measurable)
- ✅ Criterion 3 (observable)

## Out of Scope
- Explicitly NOT included
```

**When Something Is a Spec:**
✅ User-facing feature with observable behavior  
✅ Has acceptance criteria that can be tested  
✅ Answers "what success looks like"  
✅ Needed BEFORE implementation begins  

**Examples:**
- `brutal-analysis.spec.md` - A-F grading feature
- `blueprint-deployment.spec.md` - Deploy blueprints in 2-5 min
- `rescue-mode.spec.md` - Fix troubled codebases

---

### 4. Architecture Decisions (03-how/architecture/)
**Purpose:** Document WHY technical decisions were made

**Format (ADR):**
```yaml
---
adr_id: ADR-XXX
status: accepted | superseded
date: YYYY-MM-DD
---

# ADR XXX: Decision Title

## Context
What situation forced this decision?

## Decision
What did we decide to do?

## Rationale
Why is this the best choice?

## Consequences
- Positive: Benefits gained
- Negative: Trade-offs accepted

## Alternatives Considered
- Option A: Why rejected
- Option B: Why rejected
```

**When Something Is an ADR:**
✅ Technical choice between alternatives  
✅ Impacts architecture/infrastructure  
✅ Needs rationale for future reference  
✅ Not obvious to new team members  

**Examples:**
- `ADR-001-cli-first.md` - Why CLI before GUI
- `ADR-002-backwards-build.md` - Why specs before code
- `ADR-003-dual-path.md` - Why start-fresh + rescue paths

---

### 5. Implementation Documentation (03-how/implementation/)
**Purpose:** Explain HOW features are technically built

**Format:**
```yaml
---
implements: specs/feature-name.spec.md
modules:
  - path/to/code.go
  - path/to/other.go
last_updated: YYYY-MM-DD
---

# Feature Implementation

## Architecture
High-level technical approach

## Key Components
- Component A: Responsibility
- Component B: Responsibility

## APIs / Interfaces
Function signatures, endpoints

## Data Flow
How information moves through system

## Dependencies
External libraries, internal modules

## Example Usage
Code snippets showing integration
```

**When Something Is Implementation Doc:**
✅ Describes code structure
✅ Explains technical approach
✅ References actual files/modules
✅ Helps developers navigate codebase

**Examples:**
- `brutal-analysis.impl.md` - AST parsing, 12 analyzers, grading logic
- `permission-system.impl.md` - Learning algorithm, storage format

#### Deployment Documentation (03-how/implementation/deployment/)
**Purpose:** Document infrastructure, deployment processes, and operational procedures

**File Naming:** `[platform]-deployment.impl.md` or `[process]-workflow.md`

**Required Sections:**
1. **Architecture** - Infrastructure diagram and components
2. **Current Configuration** - Production settings and environment
3. **Deployment Process** - Step-by-step deployment procedures
4. **Critical Issues & Solutions** - Known problems and fixes
5. **Rollback Procedures** - Emergency recovery steps
6. **Monitoring & Logs** - How to view logs and metrics

**When to Create Deployment Doc:**
✅ Initial infrastructure setup completed
✅ Deployment process established
✅ Multiple deployment targets (staging, production)
✅ Complex infrastructure with multiple services

**Examples:**
- `railway-cloudflare-deployment.impl.md` - Railway + Cloudflare Pages deployment
- `production-update-workflow.md` - Safe production update process

#### Bug Fix Documentation (03-how/implementation/bug-fixes/)
**Purpose:** Document bug fixes with root cause analysis and solutions

**File Naming:** `bug-fixes-YYYY-MM-DD.impl.md` (date when fix was implemented)

**Required Sections:**
1. **Overview** - Summary of bugs fixed
2. **Problem Statement** - What was broken
3. **Root Cause Analysis** - Why it was broken
4. **Solution** - How it was fixed with code examples
5. **Files Modified** - Specific files and line numbers changed
6. **Testing** - How to verify the fix works
7. **Impact** - User and system impact

**When to Create Bug Fix Doc:**
✅ Non-trivial bugs requiring investigation
✅ Bugs affecting multiple components
✅ Issues with important business logic
✅ Fixes that future developers should understand

❌ Don't Create When:
- Typo fixes or one-line changes
- Dependency version updates
- Simple configuration changes

**Examples:**
- `bug-fixes-2025-12-09.impl.md` - Timeline date sync, scroll position reset
- `bug-fixes-2025-12-08.impl.md` - Guidebook draft visibility, date picker format

---

### 6. Test Plans (03-how/tests/)
**Purpose:** Define HOW to verify specs are implemented correctly

**Format:**
```yaml
---
tests: specs/feature-name.spec.md
status: planned | implemented
coverage_target: 80%
---

# Feature Test Plan

## Test Strategy
Unit, integration, E2E approach

## Test Cases
1. **Scenario**: Description
   - Given: Initial state
   - When: Action taken
   - Then: Expected outcome
   
## Edge Cases
Boundary conditions to test

## Performance Tests
Load, stress, response time targets
```

**When Something Is a Test Plan:**
✅ Written BEFORE implementation  
✅ Derives from spec acceptance criteria  
✅ Defines test scenarios and coverage  

---

## Decision Tree: Where Does This Document Go?

### Start Here: What Am I Documenting?

```
┌─ Strategic context (market, vision, philosophy)
│  └─> 01-why/
│
├─ Product features (high-level, user-facing)
│  └─> 02-what/
│
├─ Detailed requirement with acceptance criteria?
│  ├─ User-facing feature? ──> 03-how/specs/
│  ├─ Technical decision rationale? ──> 03-how/architecture/
│  ├─ Infrastructure component? ──> 03-how/implementation/
│  └─ Test scenarios? ──> 03-how/tests/
│
├─ Usage instructions for end users?
│  └─> 04-guides/
│
└─ Project planning, status, coordination?
   └─> 05-project-mgmt/
```

---

## Spec vs Implementation: The Critical Distinction

### Is This a Spec?

**YES if:**
- Users directly interact with it
- Has observable, testable behavior
- Needed BEFORE coding starts
- Answers "what does success look like?"

**NO if:**
- Users never see it (infrastructure)
- Enables other features but isn't one itself
- Only developers care about it
- Answers "how does it work internally?"

### Examples:

| Feature | Spec? | Why |
|---------|-------|-----|
| Brutal Analysis | ✅ YES | User-facing, A-F grading, testable criteria |
| Smart Sampling | ❌ NO | Infrastructure, enables analysis, token management |
| Blueprint Deployment | ✅ YES | User action, 2-5 min target, observable |
| BPE Tokenization | ❌ NO | Technical implementation detail |
| Rescue Mode | ✅ YES | User workflow, defined outcomes |
| File Triage System | ❌ NO | Internal prioritization logic |

---

## Grouping Guidelines

### When to Combine Specs:
- Similar interaction patterns (all "modes")
- Related utility features (navigation tools)
- Standard integrations (auth + billing)

**Example Groups:**
```
modes.spec.md
  - Fix Mode
  - Analysis Mode  
  - Test Mode
  - Docs Mode

navigation.spec.md
  - Chat Interface
  - Semantic Search
  - Slash Commands

platform-services.spec.md
  - Authentication (Clerk)
  - Billing (Stripe)
  - Token Management
```

### When to Keep Separate:
- Core differentiators (brutal analysis)
- Complex user journeys (rescue mode)
- Unique value props (blueprint deployment)
- Security-critical (permission system)

---

## Frontmatter Standards

### For Specs:
```yaml
---
feature_id: FEAT-XXX
status: draft | in_progress | implemented
owner: Name
implements: user-stories.md#story-X.X
related_specs: [other-spec.md]
verified: YYYY-MM-DD
---
```

### For Implementation Docs:
```yaml
---
implements: specs/feature-name.spec.md
type: feature | infrastructure | integration
modules:
  - path/to/code
  - path/to/other
dependencies:
  - external-lib-1
  - internal-module-2
last_updated: YYYY-MM-DD
---
```

### For Architecture Decisions:
```yaml
---
adr_id: ADR-XXX
status: accepted | superseded | deprecated
date: YYYY-MM-DD
supersedes: ADR-YYY
impacts:
  - component-1
  - component-2
---
```

---

## Backwards Build Workflow

**The methodology enforced by this structure:**

```
1. Spec (WHAT) ──> Define requirements & acceptance criteria
                   File: specs/feature.spec.md

2. Architecture (WHY) ──> Document key decisions
                          File: architecture/ADR-XXX.md

3. Tests (HOW to verify) ──> Write test plan
                             File: tests/feature.test-plan.md

4. Implementation (HOW) ──> Build the feature
                            File: implementation/feature.impl.md

5. Sync Check ──> Verify no drift between spec and code
                  File: sync/feature-drift.log
```

**Enforcement:**
- Cannot start implementation without spec
- Cannot deploy without tests
- Cannot merge with spec drift

---

## Common Mistakes to Avoid

### ❌ Wrong: Specs with Implementation Details
```markdown
# Auth Spec
Uses bcrypt cost 12, JWT with HS256...
```
**Fix:** Move to implementation doc

### ❌ Wrong: Implementation Docs Without Specs
```markdown
# Email Service Implementation
Sends emails using SendGrid...
```
**Fix:** First create email-notifications.spec.md

### ❌ Wrong: Everything Is a Spec
```markdown
# Database Connection Pooling Spec
```
**Fix:** Infrastructure → architecture/ADR or implementation doc

### ❌ Wrong: Vision in Product Docs
```markdown
# Core Product
We'll disrupt the market because...
```
**Fix:** Move strategic narrative to 01-why/

---

## Quick Reference

### "Where do I put...?"

| Content | Location |
|---------|----------|
| Market opportunity | 01-why/ |
| Competitive analysis | 01-why/ |
| Feature list | 02-what/ |
| User stories | 02-what/ |
| Detailed requirements | 03-how/specs/ |
| Technical decisions | 03-how/architecture/ |
| Code structure | 03-how/implementation/ |
| Deployment processes | 03-how/implementation/deployment/ |
| Deployment scripts | scripts/ |
| Test scenarios | 03-how/tests/ |
| User guide | 04-guides/ |
| Sprint planning | 05-project-mgmt/ |

### "Is this a spec?"

**Ask yourself:**
1. Do users directly interact with this? (YES → likely spec)
2. Can I write acceptance criteria? (YES → likely spec)
3. Is it infrastructure/internal? (YES → likely NOT spec)
4. Does it enable other features? (YES → likely NOT spec)

---

## For Your Customers

**This same framework applies to any software project:**

1. **Document your vision** (why this product exists)
2. **Define your product** (what features, who for)
3. **Write living specs** (what each feature does)
4. **Record decisions** (why you chose this approach)
5. **Document implementation** (how it actually works)
6. **Create test plans** (how to verify it works)

**The backwards build methodology prevents technical debt by forcing specification before implementation.**

---

## Success Metrics

**Your documentation is working if:**
- ✅ New team members understand product direction in <1 hour
- ✅ No feature starts without a spec
- ✅ Architecture decisions have documented rationale
- ✅ Specs and code stay synchronized
- ✅ "Why did we build it this way?" has answers

**Red flags:**
- ❌ Implementation docs but no specs
- ❌ Specs mixed with vision docs
- ❌ No one knows where to put new docs
- ❌ Drift between docs and code
- ❌ "This is documented somewhere..."