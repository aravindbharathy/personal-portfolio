# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-10

### Added
- Comprehensive GCP deployment documentation (`Docs/03-how/implementation/deployment/gcp-deployment.impl.md`)
- Production update workflow documentation (`Docs/03-how/implementation/deployment/production-update-workflow.md`)
- Automated deployment scripts:
  - `Docs/scripts/deploy-backend.sh` - Backend deployment automation
  - `Docs/scripts/deploy-frontend.sh` - Frontend deployment automation
  - `Docs/scripts/backup-production-db.sh` - Database backup automation
  - `Docs/scripts/deploy-all.sh` - Full deployment automation
  - `Docs/scripts/setup-gcp.sh` - Initial GCP setup
- Deployment scripts README with usage documentation
- Deployment documentation section in documentation-framework.md

### Changed
- Updated documentation framework to include deployment documentation guidelines
- Consolidated all deployment scripts under `Docs/scripts/` directory
- Improved `backend/Dockerfile` to regenerate Prisma client in runner stage for Alpine Linux compatibility
- Updated `frontend/cloudbuild.yaml` to pass VITE_API_URL as build argument

### Fixed
- Prisma binary compatibility issue with Alpine Linux (added `linux-musl-openssl-3.0.x` binary target)
- DATABASE_URL connection string format for Cloud SQL Unix sockets (URL-encoded password)
- CORS configuration by setting ALLOWED_ORIGINS environment variable
- Missing DATABASE_URL when using `--env-vars-file` (now includes all required env vars)

### Deployment
- **Backend**: `portfolio-backend-00017-7v7`
- **Frontend**: `portfolio-frontend-00002-qxk`
- **Database**: Production data restored from local database (3 projects, 2 publications)
- **Infrastructure**: Google Cloud Run + Cloud SQL + Artifact Registry

### Documentation
- Created comprehensive deployment implementation docs
- Documented all critical deployment issues and solutions
- Added production update workflow with rollback procedures
- Consolidated deployment scripts with proper documentation

---

## [1.0.0] - 2025-11-23

### Added
- Initial portfolio website with admin dashboard
- Projects management (CRUD operations)
- Publications management with external platform sync
- Guidebooks feature with article collections
- Project picture grids
- Markdown support for content
- JWT-based authentication
- Tag system for content categorization
- Content timeline view

### Infrastructure
- Next.js backend (API routes)
- Vite/React frontend
- PostgreSQL database with Prisma ORM
- Google Cloud Platform deployment
  - Cloud Run for frontend and backend
  - Cloud SQL for PostgreSQL
  - Artifact Registry for Docker images
  - Secret Manager for sensitive data

### Documentation
- Comprehensive documentation framework
- Architecture Decision Records (ADRs)
- Feature specifications
- Implementation documentation
- User guides
- Bug fix documentation

---

## Future

### Planned Features
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Automated monitoring and alerting
- [ ] Staging environment
- [ ] Custom domain with Cloud CDN
- [ ] Automated daily backups to Cloud Storage
- [ ] Performance monitoring dashboard
- [ ] Email notifications for critical events

### Infrastructure Improvements
- [ ] Separate production branch with protection rules
- [ ] Automated database migration testing
- [ ] Blue-green deployment strategy
- [ ] Disaster recovery automation
- [ ] Cost optimization analysis

---

**Format Guide**:
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
- `Deployment` for deployment-specific information
- `Documentation` for documentation changes
