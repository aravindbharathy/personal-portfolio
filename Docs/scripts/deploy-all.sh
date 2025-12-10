#!/bin/bash

# Portfolio Deployment Script for Google Cloud Platform
# Usage: ./deploy.sh [frontend|backend|all]

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-portfolio-production}"
REGION="${GCP_REGION:-us-central1}"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/portfolio-repo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install it first."
    exit 1
fi

# Set project
log_info "Setting GCP project to ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}

deploy_backend() {
    log_info "Deploying backend..."

    cd backend

    # Build Docker image
    log_info "Building backend Docker image..."
    docker build -t ${REGISTRY}/backend:latest .

    # Push to Artifact Registry
    log_info "Pushing backend image to Artifact Registry..."
    docker push ${REGISTRY}/backend:latest

    # Deploy to Cloud Run
    log_info "Deploying backend to Cloud Run..."

    # Get SQL connection name
    SQL_CONNECTION=$(gcloud sql instances describe portfolio-db \
        --format='value(connectionName)' 2>/dev/null || echo "")

    if [ -z "$SQL_CONNECTION" ]; then
        log_error "Cloud SQL instance not found. Please create it first."
        exit 1
    fi

    # Read secrets
    DB_PASSWORD=$(gcloud secrets versions access latest --secret="db-password" 2>/dev/null || echo "")
    JWT_SECRET=$(gcloud secrets versions access latest --secret="jwt-secret" 2>/dev/null || echo "")

    if [ -z "$DB_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
        log_error "Secrets not found in Secret Manager. Please create them first."
        exit 1
    fi

    gcloud run deploy portfolio-backend \
        --image ${REGISTRY}/backend:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --add-cloudsql-instances ${SQL_CONNECTION} \
        --set-env-vars "NODE_ENV=production" \
        --set-env-vars "DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@localhost:5432/portfolio?host=/cloudsql/${SQL_CONNECTION}" \
        --set-env-vars "JWT_SECRET=${JWT_SECRET}" \
        --set-env-vars "ALLOWED_ORIGINS=https://aravindbharathy.com,https://www.aravindbharathy.com" \
        --memory 512Mi \
        --cpu 1 \
        --port 8080 \
        --min-instances 0 \
        --max-instances 10

    BACKEND_URL=$(gcloud run services describe portfolio-backend \
        --region ${REGION} \
        --format 'value(status.url)')

    log_info "Backend deployed successfully!"
    log_info "Backend URL: ${BACKEND_URL}"

    cd ..
}

deploy_frontend() {
    log_info "Deploying frontend..."

    cd frontend

    # Get backend URL for API calls
    BACKEND_URL=$(gcloud run services describe portfolio-backend \
        --region ${REGION} \
        --format 'value(status.url)' 2>/dev/null || echo "https://api.aravindbharathy.com")

    log_info "Using backend URL: ${BACKEND_URL}"

    # Build Docker image with backend URL
    log_info "Building frontend Docker image..."
    docker build \
        --build-arg VITE_API_URL=${BACKEND_URL} \
        -t ${REGISTRY}/frontend:latest .

    # Push to Artifact Registry
    log_info "Pushing frontend image to Artifact Registry..."
    docker push ${REGISTRY}/frontend:latest

    # Deploy to Cloud Run
    log_info "Deploying frontend to Cloud Run..."
    gcloud run deploy portfolio-frontend \
        --image ${REGISTRY}/frontend:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --memory 256Mi \
        --cpu 1 \
        --port 8080 \
        --min-instances 0 \
        --max-instances 10

    FRONTEND_URL=$(gcloud run services describe portfolio-frontend \
        --region ${REGION} \
        --format 'value(status.url)')

    log_info "Frontend deployed successfully!"
    log_info "Frontend URL: ${FRONTEND_URL}"

    cd ..
}

# Main script
case "${1}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        log_error "Usage: $0 {backend|frontend|all}"
        exit 1
        ;;
esac

log_info "Deployment completed successfully! ✅"
