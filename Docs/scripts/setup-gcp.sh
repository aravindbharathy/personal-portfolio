#!/bin/bash

# Initial GCP Setup Script for Portfolio
# This script sets up all required GCP resources

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-portfolio-production}"
REGION="${GCP_REGION:-us-central1}"
DB_INSTANCE_NAME="portfolio-db"
DB_NAME="portfolio"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

log_section "Portfolio GCP Setup"

# Set project
log_info "Setting GCP project to ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID} || {
    log_warn "Project does not exist. Create it first with:"
    log_warn "gcloud projects create ${PROJECT_ID}"
    exit 1
}

# Enable required APIs
log_section "Enabling Required APIs"
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    cloudresourcemanager.googleapis.com \
    compute.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com

log_info "APIs enabled successfully"

# Create Artifact Registry repository
log_section "Setting up Artifact Registry"
gcloud artifacts repositories create portfolio-repo \
    --repository-format=docker \
    --location=${REGION} \
    --description="Docker repository for portfolio application" \
    2>/dev/null || log_warn "Artifact Registry repository already exists"

log_info "Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Create Cloud SQL instance
log_section "Setting up Cloud SQL Database"

if gcloud sql instances describe ${DB_INSTANCE_NAME} &>/dev/null; then
    log_warn "Cloud SQL instance already exists"
else
    log_info "Creating Cloud SQL PostgreSQL instance..."
    log_warn "This may take several minutes..."

    # Prompt for database password
    read -sp "Enter database root password: " DB_PASSWORD
    echo

    gcloud sql instances create ${DB_INSTANCE_NAME} \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=${REGION} \
        --root-password="${DB_PASSWORD}" \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup-start-time=02:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=03

    log_info "Cloud SQL instance created successfully"

    # Create database
    log_info "Creating database..."
    gcloud sql databases create ${DB_NAME} \
        --instance=${DB_INSTANCE_NAME}

    # Store password in Secret Manager
    echo -n "${DB_PASSWORD}" | gcloud secrets create db-password --data-file=- \
        2>/dev/null || log_warn "db-password secret already exists"
fi

# Get SQL connection name
SQL_CONNECTION=$(gcloud sql instances describe ${DB_INSTANCE_NAME} \
    --format='value(connectionName)')
log_info "SQL Connection Name: ${SQL_CONNECTION}"

# Create JWT secret
log_section "Setting up Secrets"

if gcloud secrets describe jwt-secret &>/dev/null; then
    log_warn "jwt-secret already exists"
else
    log_info "Creating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo -n "${JWT_SECRET}" | gcloud secrets create jwt-secret --data-file=-
    log_info "JWT secret created"
fi

# Grant Cloud Run access to secrets
log_info "Granting Cloud Run access to secrets..."
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding db-password \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    2>/dev/null || true

gcloud secrets add-iam-policy-binding jwt-secret \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    2>/dev/null || true

# Create .env.production file
log_section "Creating Production Environment File"

cat > .env.production <<EOF
# GCP Configuration
PROJECT_ID=${PROJECT_ID}
REGION=${REGION}
SQL_CONNECTION=${SQL_CONNECTION}

# Database
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/${DB_NAME}?host=/cloudsql/${SQL_CONNECTION}

# Security
JWT_SECRET=\$(gcloud secrets versions access latest --secret=jwt-secret)
DB_PASSWORD=\$(gcloud secrets versions access latest --secret=db-password)

# CORS
ALLOWED_ORIGINS=https://aravindbharathy.com,https://www.aravindbharathy.com

# Frontend
VITE_API_URL=https://api.aravindbharathy.com
EOF

log_info "Created .env.production file"

# Summary
log_section "Setup Complete! 🎉"

echo "Project ID: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "SQL Instance: ${DB_INSTANCE_NAME}"
echo "SQL Connection: ${SQL_CONNECTION}"
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT.md for detailed deployment instructions"
echo "2. Set up your domain DNS records"
echo "3. Run ./deploy.sh all to deploy both frontend and backend"
echo ""
echo "Useful commands:"
echo "  - Deploy: ./deploy.sh all"
echo "  - View logs: gcloud run logs read portfolio-backend --region ${REGION}"
echo "  - View database: gcloud sql instances describe ${DB_INSTANCE_NAME}"
echo ""
