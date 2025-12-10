#!/bin/bash

# Deploy Backend to Google Cloud Run
# Usage: ./deploy-backend.sh

set -e

# Configuration
PROJECT_ID="personal-website-480707"
REGION="us-central1"
SERVICE="portfolio-backend"
IMAGE="us-central1-docker.pkg.dev/${PROJECT_ID}/portfolio-repo/backend:latest"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[INFO]${NC} Deploying backend to Google Cloud Run..."

# Navigate to backend directory
cd "$(dirname "$0")/../../backend" || exit 1

# Build and push image
echo -e "${GREEN}[INFO]${NC} Building Docker image..."
gcloud builds submit --tag "${IMAGE}" --project="${PROJECT_ID}"

# Deploy to Cloud Run
echo -e "${GREEN}[INFO]${NC} Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --platform=managed \
  --allow-unauthenticated \
  --add-cloudsql-instances="${PROJECT_ID}:${REGION}:portfolio-db" \
  --memory=512Mi \
  --cpu=1 \
  --port=8080 \
  --min-instances=0 \
  --max-instances=10

# Get service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format='value(status.url)')

echo -e "${GREEN}[SUCCESS]${NC} Backend deployed successfully!"
echo -e "${GREEN}[INFO]${NC} Service URL: ${SERVICE_URL}"

# Test endpoint
echo -e "${GREEN}[INFO]${NC} Testing /api/projects endpoint..."
if curl -s "${SERVICE_URL}/api/projects" | grep -q "success"; then
  echo -e "${GREEN}[SUCCESS]${NC} Backend is responding correctly"
else
  echo -e "${YELLOW}[WARN]${NC} Backend may not be responding as expected"
fi

echo -e "${GREEN}[INFO]${NC} Deployment complete!"
