#!/bin/bash

# Run Production Database Migrations
# Usage: ./run-prod-migrations.sh

set -e

# Configuration
PROJECT_ID="personal-website-480707"
REGION="us-central1"
DB_INSTANCE="portfolio-db"
DB_NAME="portfolio"
DB_USER="postgres"
PROXY_PORT="5433"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[INFO]${NC} Running production database migrations..."

# Navigate to backend directory
cd "$(dirname "$0")/../../backend" || exit 1

# Check if Cloud SQL proxy is already running
if lsof -Pi :${PROXY_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${GREEN}[INFO]${NC} Cloud SQL proxy already running on port ${PROXY_PORT}"
else
  echo -e "${GREEN}[INFO]${NC} Starting Cloud SQL proxy..."
  cloud-sql-proxy ${PROJECT_ID}:${REGION}:${DB_INSTANCE} --port=${PROXY_PORT} &
  PROXY_PID=$!
  sleep 3

  # Check if proxy started successfully
  if ! lsof -Pi :${PROXY_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Failed to start Cloud SQL proxy"
    exit 1
  fi
  echo -e "${GREEN}[SUCCESS]${NC} Cloud SQL proxy started (PID: ${PROXY_PID})"
fi

# Get database password from user
echo -e "${YELLOW}[INPUT]${NC} Enter the production database password for user '${DB_USER}':"
read -s DB_PASSWORD
echo ""

# Construct DATABASE_URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${PROXY_PORT}/${DB_NAME}"

# Run migrations
echo -e "${GREEN}[INFO]${NC} Running Prisma migrations..."
if DATABASE_URL="${DATABASE_URL}" npx prisma migrate deploy; then
  echo -e "${GREEN}[SUCCESS]${NC} Migrations completed successfully!"
else
  echo -e "${RED}[ERROR]${NC} Migration failed"
  if [ -n "$PROXY_PID" ]; then
    echo -e "${GREEN}[INFO]${NC} Stopping Cloud SQL proxy..."
    kill $PROXY_PID 2>/dev/null || true
  fi
  exit 1
fi

# Clean up proxy if we started it
if [ -n "$PROXY_PID" ]; then
  echo -e "${GREEN}[INFO]${NC} Stopping Cloud SQL proxy..."
  kill $PROXY_PID 2>/dev/null || true
fi

echo -e "${GREEN}[INFO]${NC} Done!"
