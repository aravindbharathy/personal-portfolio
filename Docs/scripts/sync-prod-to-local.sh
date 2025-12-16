#!/bin/bash

# Sync Production Database to Local (READ-ONLY on Production)
# Downloads production data and replaces local database
# DOES NOT modify production database

set -e

# Configuration
PROD_HOST="localhost"
PROD_PORT="5433"
PROD_USER="postgres"
PROD_DB="portfolio"
PROD_PASSWORD="@Atr2xLtdda9EfdsXdky"

LOCAL_HOST="localhost"
LOCAL_PORT="5432"
LOCAL_USER="aravind"
LOCAL_DB="portfolio_db"

BACKUP_DIR="/tmp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="${BACKUP_DIR}/prod_sync_${TIMESTAMP}.sql"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_section "Production to Local Database Sync (READ-ONLY)"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Check if Cloud SQL Proxy is running
log_info "Checking Cloud SQL Proxy connection..."
if ! nc -z localhost 5433 2>/dev/null; then
    log_error "Cloud SQL Proxy not running on port 5433"
    log_info "Start it with: cloud-sql-proxy personal-website-480707:us-central1:portfolio-db --port=5433 &"
    exit 1
fi

log_info "Cloud SQL Proxy is running ✓"

# Step 1: Dump production database (READ-ONLY operation)
log_section "Step 1: Backing Up Production Data"
log_info "Dumping production database to ${DUMP_FILE}..."
log_warn "This is READ-ONLY - production database will NOT be modified"

PGPASSWORD="${PROD_PASSWORD}" pg_dump \
  -h "${PROD_HOST}" \
  -p "${PROD_PORT}" \
  -U "${PROD_USER}" \
  -d "${PROD_DB}" \
  --no-owner \
  --no-acl \
  > "${DUMP_FILE}"

if [ ! -f "${DUMP_FILE}" ] || [ ! -s "${DUMP_FILE}" ]; then
    log_error "Production dump failed"
    exit 1
fi

FILE_SIZE=$(ls -lh "${DUMP_FILE}" | awk '{print $5}')
log_info "Production backup created: ${DUMP_FILE} (${FILE_SIZE})"

# Step 2: Backup local database (safety)
log_section "Step 2: Backing Up Local Database"
LOCAL_BACKUP="${BACKUP_DIR}/local_backup_${TIMESTAMP}.sql"

log_info "Creating safety backup of local database..."
pg_dump \
  -h "${LOCAL_HOST}" \
  -p "${LOCAL_PORT}" \
  -U "${LOCAL_USER}" \
  -d "${LOCAL_DB}" \
  --no-owner \
  --no-acl \
  > "${LOCAL_BACKUP}" 2>/dev/null || {
    log_warn "Local backup skipped (database may not exist yet)"
  }

if [ -f "${LOCAL_BACKUP}" ] && [ -s "${LOCAL_BACKUP}" ]; then
    LOCAL_SIZE=$(ls -lh "${LOCAL_BACKUP}" | awk '{print $5}')
    log_info "Local backup saved: ${LOCAL_BACKUP} (${LOCAL_SIZE})"
else
    log_warn "No local backup created"
fi

# Step 3: Drop and recreate local database
log_section "Step 3: Resetting Local Database"

log_info "Terminating active connections to ${LOCAL_DB}..."
psql -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${LOCAL_DB}' AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true

log_info "Dropping local database: ${LOCAL_DB}"
dropdb -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" --if-exists "${LOCAL_DB}"

log_info "Creating fresh local database: ${LOCAL_DB}"
createdb -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" "${LOCAL_DB}"

# Step 4: Import production data to local
log_section "Step 4: Importing Production Data to Local"

log_info "Importing production data..."
psql \
  -h "${LOCAL_HOST}" \
  -p "${LOCAL_PORT}" \
  -U "${LOCAL_USER}" \
  -d "${LOCAL_DB}" \
  -f "${DUMP_FILE}" \
  > /dev/null 2>&1

log_info "Production data imported successfully ✓"

# Step 5: Verify import
log_section "Step 5: Verification"

log_info "Verifying database structure..."

# Count tables
TABLE_COUNT=$(psql \
  -h "${LOCAL_HOST}" \
  -p "${LOCAL_PORT}" \
  -U "${LOCAL_USER}" \
  -d "${LOCAL_DB}" \
  -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" | xargs)

log_info "Tables in local database: ${TABLE_COUNT}"

# Count some key records
PROJECTS=$(psql -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" -d "${LOCAL_DB}" -t -c "SELECT COUNT(*) FROM \"Project\";" 2>/dev/null | xargs || echo "0")
PUBLICATIONS=$(psql -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" -d "${LOCAL_DB}" -t -c "SELECT COUNT(*) FROM \"Publication\";" 2>/dev/null | xargs || echo "0")
GUIDEBOOKS=$(psql -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" -d "${LOCAL_DB}" -t -c "SELECT COUNT(*) FROM \"Guidebook\";" 2>/dev/null | xargs || echo "0")
TAGS=$(psql -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" -d "${LOCAL_DB}" -t -c "SELECT COUNT(*) FROM \"Tag\";" 2>/dev/null | xargs || echo "0")
USERS=$(psql -h "${LOCAL_HOST}" -p "${LOCAL_PORT}" -U "${LOCAL_USER}" -d "${LOCAL_DB}" -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | xargs || echo "0")

echo ""
echo "Content Summary:"
echo "  - Projects: ${PROJECTS}"
echo "  - Publications: ${PUBLICATIONS}"
echo "  - Guidebooks: ${GUIDEBOOKS}"
echo "  - Tags: ${TAGS}"
echo "  - Users: ${USERS}"
echo ""

# Cleanup old dumps (keep last 3)
log_info "Cleaning up old dump files..."
find "${BACKUP_DIR}" -name "prod_sync_*.sql" -type f | sort -r | tail -n +4 | xargs rm -f 2>/dev/null || true
find "${BACKUP_DIR}" -name "local_backup_*.sql" -type f | sort -r | tail -n +4 | xargs rm -f 2>/dev/null || true

log_section "Sync Complete! 🎉"

echo "✓ Production database backed up (unchanged)"
echo "✓ Local database updated with production data"
echo ""
echo "Production backup: ${DUMP_FILE}"
if [ -f "${LOCAL_BACKUP}" ] && [ -s "${LOCAL_BACKUP}" ]; then
    echo "Local backup: ${LOCAL_BACKUP}"
fi
echo ""
echo "Your local dev server now has production data."
echo ""
