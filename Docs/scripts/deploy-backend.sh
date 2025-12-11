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

# Check for pending migrations
echo -e "${GREEN}[INFO]${NC} Checking for pending database migrations..."
MIGRATION_COUNT=$(ls -1 prisma/migrations | wc -l | tr -d ' ')
if [ "$MIGRATION_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}[WARN]${NC} Found ${MIGRATION_COUNT} migration(s). Make sure to run migrations after deployment!"
  echo -e "${YELLOW}[WARN]${NC} The Dockerfile runs 'npx prisma migrate deploy' on container startup."
  echo -e "${YELLOW}[WARN]${NC} If migrations fail, you may need to run them manually via Cloud SQL proxy."
fi

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

# Wait for deployment to stabilize
echo -e "${GREEN}[INFO]${NC} Waiting for deployment to stabilize..."
sleep 10

# Get service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format='value(status.url)')

echo -e "${GREEN}[SUCCESS]${NC} Backend deployed successfully!"
echo -e "${GREEN}[INFO]${NC} Service URL: ${SERVICE_URL}"

# Test endpoint
echo -e "${GREEN}[INFO]${NC} Testing /api/projects endpoint..."
RESPONSE=$(curl -s "${SERVICE_URL}/api/projects")
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}[SUCCESS]${NC} Backend is responding correctly"
elif echo "$RESPONSE" | grep -q "does not exist in the current database"; then
  echo -e "${RED}[ERROR]${NC} Database migration failed!"
  echo -e "${YELLOW}[ACTION REQUIRED]${NC} Run migrations manually:"
  echo -e "${YELLOW}  1. Start Cloud SQL proxy: cloud-sql-proxy ${PROJECT_ID}:${REGION}:portfolio-db --port=5433${NC}"
  echo -e "${YELLOW}  2. Run migrations: cd backend && DATABASE_URL='...' npx prisma migrate deploy${NC}"
  echo -e "${YELLOW}  3. Or run: ./Docs/scripts/run-prod-migrations.sh${NC}"
  exit 1
else
  echo -e "${YELLOW}[WARN]${NC} Backend may not be responding as expected"
  echo -e "${YELLOW}[WARN]${NC} Response: ${RESPONSE}"
fi

echo -e "${GREEN}[INFO]${NC} Deployment complete!"
