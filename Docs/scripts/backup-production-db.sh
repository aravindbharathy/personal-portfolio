#!/bin/bash

# Backup Production Database
# Usage: ./backup-production-db.sh

set -e

# Configuration
PROJECT_ID="personal-website-480707"
REGION="us-central1"
INSTANCE="portfolio-db"
DATABASE="portfolio"
DB_PASSWORD="@Atr2xLtdda9EfdsXdky"
BACKUP_DIR="/tmp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/portfolio_backup_${TIMESTAMP}.sql"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[INFO]${NC} Starting production database backup..."

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Check if Cloud SQL Proxy is installed
if ! command -v cloud-sql-proxy &> /dev/null; then
  echo -e "${RED}[ERROR]${NC} cloud-sql-proxy not found. Install with: brew install cloud-sql-proxy"
  exit 1
fi

# Start Cloud SQL Proxy
echo -e "${GREEN}[INFO]${NC} Starting Cloud SQL Proxy..."
cloud-sql-proxy "${PROJECT_ID}:${REGION}:${INSTANCE}" --port=5433 &
PROXY_PID=$!

# Wait for proxy to be ready
sleep 5

# Backup database
echo -e "${GREEN}[INFO]${NC} Backing up database to ${BACKUP_FILE}..."
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h localhost \
  -p 5433 \
  -U postgres \
  -d "${DATABASE}" \
  --no-owner \
  --no-acl \
  > "${BACKUP_FILE}"

# Kill proxy
kill "${PROXY_PID}" 2>/dev/null || true

# Verify backup
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
  FILE_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
  echo -e "${GREEN}[SUCCESS]${NC} Backup created successfully!"
  echo -e "${GREEN}[INFO]${NC} File: ${BACKUP_FILE}"
  echo -e "${GREEN}[INFO]${NC} Size: ${FILE_SIZE}"

  # Clean old backups (keep last 7 days)
  find "${BACKUP_DIR}" -name "portfolio_backup_*.sql" -mtime +7 -delete
  echo -e "${GREEN}[INFO]${NC} Old backups cleaned (kept last 7 days)"
else
  echo -e "${RED}[ERROR]${NC} Backup failed"
  exit 1
fi
