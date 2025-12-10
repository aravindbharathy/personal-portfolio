#!/bin/bash

# Deploy Frontend to Google Cloud Run
# Usage: ./deploy-frontend.sh

set -e

# Configuration
PROJECT_ID="personal-website-480707"
REGION="us-central1"
SERVICE="portfolio-frontend"
IMAGE="us-central1-docker.pkg.dev/${PROJECT_ID}/portfolio-repo/frontend:latest"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[INFO]${NC} Deploying frontend to Google Cloud Run..."

# Navigate to frontend directory
cd "$(dirname "$0")/../../frontend" || exit 1

# Build using Cloud Build with build args
echo -e "${GREEN}[INFO]${NC} Building Docker image with Cloud Build..."
gcloud builds submit \
  --config=cloudbuild.yaml \
  --region="${REGION}" \
  --project="${PROJECT_ID}"

# Deploy to Cloud Run
echo -e "${GREEN}[INFO]${NC} Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=256Mi \
  --cpu=1 \
  --port=8080 \
  --min-instances=0 \
  --max-instances=10

# Get service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format='value(status.url)')

echo -e "${GREEN}[SUCCESS]${NC} Frontend deployed successfully!"
echo -e "${GREEN}[INFO]${NC} Service URL: ${SERVICE_URL}"

# Test endpoint
echo -e "${GREEN}[INFO]${NC} Testing frontend..."
if curl -s -I "${SERVICE_URL}" | grep -q "200\|301\|302"; then
  echo -e "${GREEN}[SUCCESS]${NC} Frontend is accessible"
else
  echo -e "${YELLOW}[WARN]${NC} Frontend may not be accessible"
fi

echo -e "${GREEN}[INFO]${NC} Deployment complete!"
