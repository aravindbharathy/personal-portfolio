# Professional Portfolio Website Template

> **The first AI-friendly portfolio template.** A modern, full-stack portfolio website built with Next.js, React, and PostgreSQL. Set up and customize your entire portfolio using AI coding agents like Claude Code - no manual configuration needed. Showcase your research, publications, projects, and expertise with a fully-featured content management system.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://aravindbharathy.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![AI-Friendly](https://img.shields.io/badge/AI-Friendly-purple.svg)](https://claude.com/claude-code)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

**Perfect for:** UX Researchers, Data Scientists, Engineers, Designers, Academics, and any professional wanting to showcase their work with a modern, manageable portfolio.

---

## 🤖 AI-First Development - Set Up Your Portfolio in Minutes

**This is the first portfolio template designed to work seamlessly with AI coding agents like Claude Code, Cursor, and GitHub Copilot.**

Simply open this project in your AI coding assistant and say:

> "Set up my portfolio with my information. Use my name [Your Name], title [Your Title], and deploy it to production."

**What makes this AI-development-friendly:**

- **📖 2,800+ Lines of Documentation** - Your AI assistant understands the entire codebase structure, architecture, and implementation patterns
- **🎯 Clear, Modular Architecture** - Services, schemas, and components follow consistent patterns that AI can easily navigate and modify
- **✅ Automated Scripts** - Database setup, migrations, deployment, and syncing are all scriptable - no manual configuration needed
- **🔧 Well-Commented Code** - Every component, function, and API endpoint is documented inline for AI comprehension
- **📋 Comprehensive Specifications** - Detailed specs for every feature help AI make informed changes
- **🚀 One-Command Deployment** - AI can deploy your entire stack to production with a single script

### Zero-Configuration Setup with AI

**Traditional setup:** Hours of reading docs, configuring environment variables, setting up databases, deploying infrastructure.

**With an AI coding agent:**

1. Clone this repository
2. Open in Claude Code, Cursor, or your preferred AI coding assistant
3. Say: "Set up my portfolio for [Your Name]. I'm a [Your Role]. Deploy it to [Vercel/GCP/your platform]."
4. Your AI assistant will:
   - Configure all environment variables
   - Set up the PostgreSQL database
   - Run migrations and seed data
   - Customize branding and content
   - Deploy to production
   - Give you the live URL

**No manual configuration. No hours reading docs. Just conversation.**

### Example AI Prompts That Work

```
"Add a new blog section to my portfolio with RSS feed support"
"Update the about page with my latest bio and achievements"
"Change the color scheme to use my brand colors: #FF6B6B and #4ECDC4"
"Deploy a new version with my 3 latest research projects"
"Create a new page showcasing my speaking engagements"
"Sync my Medium articles automatically every week"
```

The comprehensive documentation and clear architecture mean your AI assistant can handle complex requests without breaking existing functionality.

---

## 🌟 Why Use This Template?

- **🤖 AI-Friendly Architecture** - First portfolio template designed for AI coding agents - set up and customize entirely through conversation
- **🎨 Production-Ready Design** - Modern, responsive UI that looks professional out of the box
- **📝 Full Content Management** - Admin panel to manage all content without touching code
- **🚀 Easy Customization** - Well-documented codebase with clear separation of concerns
- **📊 Rich Content Types** - Projects, Publications, Guidebooks, Tags, Timeline, About page
- **🔒 Secure by Default** - JWT authentication, CORS protection, input validation
- **📱 Mobile-First** - Fully responsive design that works on all devices
- **⚡ Modern Stack** - Built with latest technologies and best practices
- **📖 Comprehensive Docs** - 2,800+ lines of documentation that AI assistants can understand and navigate

---

## ✨ Features

### For Visitors (Public Site)

- **🏠 Homepage** - Dynamic timeline of your latest work
- **💼 Projects Portfolio** - Showcase research projects with rich media and detailed case studies
- **📚 Publications** - Aggregate articles from Medium, Substack, or other platforms
- **📖 Guidebooks** - Create curated learning paths and thematic article collections
- **🏷️ Smart Tagging** - Organize content by research methods, industries, topics, tools, and skills
- **👤 About Page** - Professional profile with bio, contact info, and social links
- **📧 Contact Form** - Built-in contact form with rate limiting

### For You (Admin Panel)

- **📊 Dashboard** - Overview of all your content at a glance
- **✏️ Content Editor** - Markdown support for rich text formatting
- **🎯 Tag Management** - Categorize content across 5 dimensions
- **🔍 Draft/Publish Workflow** - Control visibility of your content
- **⭐ Featured Content** - Highlight your best work
- **📸 Media Management** - Add images and cover photos to projects
- **🔐 Secure Access** - JWT-based authentication with HTTP-only cookies

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

### 2. Set Up the Database

```bash
# Create a PostgreSQL database
createdb portfolio_db

# Or using psql:
psql -U postgres -c "CREATE DATABASE portfolio_db;"
```

### 3. Configure Environment Variables

**Backend (`.env` in `backend/` folder):**

```bash
# Database
DATABASE_URL="postgresql://yourusername@localhost:5432/portfolio_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"

# CORS (adjust for your frontend URL)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:8081"

# Admin Account (change these!)
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="YourSecurePassword123!"
```

**Frontend (`.env` in `frontend/` folder):**

```bash
VITE_API_URL=http://localhost:3000
```

### 4. Install Dependencies & Initialize

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run db:seed    # Optional: adds sample data
npm run dev        # Starts on http://localhost:3000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

### 5. Access Your Portfolio

- **Public Site:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/login
- **Login with:** The credentials you set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`

---

## 📋 Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18 · Vite 5 · TypeScript · Tailwind CSS · Shadcn/UI |
| **State** | TanStack Query (React Query) · Context API |
| **Backend** | Next.js 14 App Router · TypeScript |
| **Database** | PostgreSQL 15 · Prisma ORM 5 |
| **Auth** | JWT · HTTP-only Cookies · bcrypt |
| **Validation** | Zod Schemas |
| **Deployment** | Docker · Google Cloud Run (or Vercel) |

---

## 🎨 Customization Guide

### 1. **Branding & Styling**

**Colors & Theme:**
```typescript
// frontend/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: "#your-color",    // Change primary brand color
        secondary: "#your-color",  // Change secondary color
      }
    }
  }
}
```

**Site Information:**
```typescript
// frontend/index.html
<title>Your Name - Your Title</title>
<meta name="description" content="Your description" />
```

### 2. **About Page**

Update your professional information via the admin panel (`/admin/about`) or directly in the database.

### 3. **Navigation**

```typescript
// frontend/src/components/Navigation.tsx
// Modify navigation links, add/remove menu items
```

### 4. **Content**

Log into the admin panel and add your:
- Projects
- Publications
- Guidebooks
- Tags
- Profile information

### 5. **Features**

Enable/disable features by modifying:
- `backend/src/app/api/` - API routes
- `frontend/src/pages/` - Frontend pages
- Navigation links in `Navigation.tsx`

---

## 📁 Project Structure

```
portfolio/
├── backend/                   # Next.js API + Database
│   ├── src/
│   │   ├── app/api/          # 34 API endpoints
│   │   │   ├── auth/         # Authentication
│   │   │   ├── projects/     # Projects CRUD
│   │   │   ├── publications/ # Publications CRUD
│   │   │   ├── guidebooks/   # Guidebooks CRUD
│   │   │   ├── tags/         # Tag management
│   │   │   ├── about/        # About page data
│   │   │   ├── timeline/     # Unified timeline
│   │   │   └── contact/      # Contact form
│   │   ├── services/         # Business logic
│   │   ├── schemas/          # Zod validation
│   │   ├── middleware/       # Auth middleware
│   │   └── lib/              # Utilities
│   └── prisma/
│       ├── schema.prisma     # Database schema
│       └── seed.ts           # Sample data
│
├── frontend/                  # React Application
│   ├── src/
│   │   ├── pages/            # All pages
│   │   │   ├── Index.tsx     # Homepage
│   │   │   ├── Projects.tsx  # Projects listing
│   │   │   ├── About.tsx     # About page
│   │   │   └── admin/        # Admin panel
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React contexts
│   │   └── lib/              # API client
│   └── public/               # Static assets
│
└── Docs/                      # Comprehensive documentation
    ├── 02-what/              # Feature descriptions
    ├── 03-how/               # Technical specs & implementation
    ├── 04-guides/            # Setup & usage guides
    └── scripts/              # Deployment scripts
```

---

## 🗄️ Database Schema

The portfolio uses PostgreSQL with the following main models:

- **User** - Admin authentication
- **Project** - Research projects and case studies
- **Publication** - Articles and blog posts
- **Guidebook** - Curated article collections
- **Tag** - Categorized labels (5 categories: Research Method, Industry, Topic, Tool, Skill)
- **About** - Professional profile information
- **ContentTimeline** - Unified activity feed

**See full schema:** [Database Schema Documentation](./Docs/03-how/architecture/database-schema.md)

---

## 🚢 Deployment

### Option 1: Google Cloud Platform (Recommended)

This template includes production-ready deployment scripts for GCP:

```bash
# Initial setup (one-time)
./Docs/scripts/setup-gcp.sh

# Deploy everything
./Docs/scripts/deploy-all.sh

# Or deploy individually
./Docs/scripts/deploy-backend.sh
./Docs/scripts/deploy-frontend.sh
```

**📖 Full Guide:** [GCP Deployment Documentation](./Docs/03-how/implementation/deployment/gcp-deployment.impl.md)

### Option 2: Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd backend && vercel --prod

# Deploy frontend
cd frontend && vercel --prod

# Add environment variables in Vercel dashboard
# Connect a PostgreSQL database (Vercel Postgres, Supabase, or Neon)
```

### Option 3: Docker

```bash
# Build images
docker build -t portfolio-backend ./backend
docker build -t portfolio-frontend ./frontend

# Run containers
docker-compose up -d
```

**Environment Setup:**
- Update `VITE_API_URL` to your backend URL
- Update `ALLOWED_ORIGINS` to your frontend URL
- Connect to a managed PostgreSQL instance
- Set secure `JWT_SECRET`

---

## 📖 Documentation

This project includes **2,800+ lines of comprehensive documentation**:

### Getting Started
- **[Quick Start Guide](./Docs/04-guides/getting-started.md)** - Get running in 5 minutes
- **[Backend Setup](./Docs/04-guides/backend-setup.md)** - Detailed backend configuration
- **[Deployment Guide](./Docs/04-guides/deployment.md)** - Production deployment

### Architecture
- **[System Architecture](./Docs/03-how/architecture/system-architecture.md)** - High-level design
- **[Database Schema](./Docs/03-how/architecture/database-schema.md)** - Complete data model
- **[API Endpoints](./Docs/03-how/architecture/api-endpoints.md)** - All 34 API routes

### Features
- **[Projects Feature](./Docs/02-what/features/projects.md)** - Projects showcase
- **[Publications Feature](./Docs/02-what/features/publications.md)** - Article aggregation
- **[Guidebooks Feature](./Docs/02-what/features/guidebooks.md)** - Curated collections
- **[Tags System](./Docs/02-what/features/tags.md)** - Content organization
- **[About Page](./Docs/02-what/features/about.md)** - Profile management
- **[Admin Panel](./Docs/02-what/features/admin-panel.md)** - CMS interface

### Implementation
- **[Projects Implementation](./Docs/03-how/implementation/projects-api.impl.md)**
- **[Guidebooks Implementation](./Docs/03-how/implementation/guidebooks.impl.md)**
- **[Tags Implementation](./Docs/03-how/implementation/tags.impl.md)**
- **[About Implementation](./Docs/03-how/implementation/about.impl.md)**
- **[Authentication Implementation](./Docs/03-how/implementation/authentication.impl.md)**

### Specifications
- **[Publications Spec](./Docs/03-how/specs/publications-crud.spec.md)**
- **[Guidebooks Spec](./Docs/03-how/specs/guidebooks-crud.spec.md)**
- **[Tags Spec](./Docs/03-how/specs/tags.spec.md)**
- **[About Spec](./Docs/03-how/specs/about.spec.md)**

**📚 [Complete Documentation Index](./Docs/README.md)**

---

## 🔧 Common Tasks

### Managing Content

```bash
# Open Prisma Studio (Database GUI)
cd backend
npm run db:studio

# Reset database with fresh seed data
npm run db:seed
```

### Development

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Check TypeScript types
npm run type-check

# Lint code
npm run lint
```

### Database

```bash
# Create a new migration
cd backend
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate

# View database in browser
npm run db:studio
```

### Sync Production to Local

```bash
# Requires Cloud SQL Proxy running
./Docs/scripts/sync-prod-to-local.sh
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `psql -l`
- Verify `DATABASE_URL` in backend `.env`
- Try: `npx prisma migrate reset`

### "CORS error" in browser
- Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Restart backend server after changing `.env`

### "Invalid credentials" when logging in
- Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in backend `.env`
- Clear browser cookies
- Re-seed database: `npm run db:seed`

### Frontend shows loading forever
- Check backend is running: Visit http://localhost:3000/api/timeline
- Check browser console for errors
- Verify `VITE_API_URL` in frontend `.env`

**📖 [Full Troubleshooting Guide](./Docs/04-guides/troubleshooting.md)**

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please follow:
- TypeScript best practices
- Existing code style and patterns
- Update documentation for new features
- Add tests for new functionality

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

This means you can:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

**Attribution appreciated but not required!**

---

## 💝 Acknowledgments

**Originally built by:** [Aravind Bharathy](https://aravindbharathy.com)
**Built for:** UX Researchers, Product Researchers, and Research Professionals
**Inspired by:** The need for a modern, manageable portfolio for research practitioners

### Credits
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Fonts:** [Inter](https://fonts.google.com/specimen/Inter) by Google Fonts

---

## 🌟 Show Your Support

If you find this template useful:

- ⭐ **Star this repository** on GitHub
- 🐦 **Share it** with others who might benefit
- 🐛 **Report bugs** by opening issues
- 💡 **Suggest features** via discussions
- 🤝 **Contribute** by submitting pull requests

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/portfolio/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/portfolio/discussions)
- **Documentation:** [Full Docs](./Docs/README.md)

---

## 🗺️ Roadmap

### Current Version: 1.0.0

**Implemented ✅**
- Complete backend API (34 endpoints)
- Full admin panel
- All content types (Projects, Publications, Guidebooks, Tags, About)
- Authentication & security
- Responsive design
- Comprehensive documentation

**Planned Features 🚀**
- [ ] Drag-and-drop content reordering
- [ ] Image upload & management
- [ ] Medium/Substack auto-sync
- [ ] Email service integration
- [ ] Full-text search
- [ ] Analytics dashboard
- [ ] SEO optimization tools
- [ ] Multi-language support
- [ ] Dark mode toggle

---

## 📊 Project Statistics

- **Lines of Code:** 10,000+
- **API Endpoints:** 34
- **Database Models:** 15
- **React Components:** 50+
- **Documentation:** 2,800+ lines
- **Test Coverage:** In progress

---

## 🙏 Final Notes

This template represents hundreds of hours of development, testing, and documentation. It's built with modern best practices and production-ready code.

Whether you're a researcher, designer, engineer, or any professional looking to showcase your work, this template provides a solid foundation to build upon.

**Happy building! 🚀**

---

<div align="center">

**Built with ❤️ by professionals, for professionals**

[Documentation](./Docs/README.md) · [Report Bug](https://github.com/yourusername/portfolio/issues) · [Request Feature](https://github.com/yourusername/portfolio/discussions)

</div>

---

_Last Updated: December 2025 | Version 1.0.0_
