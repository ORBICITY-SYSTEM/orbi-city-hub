#!/bin/bash

# ORBI City Hub - Database Backup Script
# Runs daily at 3:00 AM via cron
# Backs up TiDB database to S3 storage

set -e  # Exit on error

# Configuration
BACKUP_DIR="/tmp/orbi-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="orbi-city-hub-backup-${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}[$(date)] Starting ORBI City Hub database backup...${NC}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Get database connection string from environment
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL environment variable not set${NC}"
    exit 1
fi

# Parse DATABASE_URL to extract connection details
# Format: mysql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo -e "${YELLOW}Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}${NC}"

# Create backup using mysqldump
echo -e "${YELLOW}Creating database dump...${NC}"
mysqldump \
  --host=${DB_HOST} \
  --port=${DB_PORT} \
  --user=${DB_USER} \
  --password=${DB_PASS} \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  ${DB_NAME} > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip ${BACKUP_DIR}/${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get backup size
BACKUP_SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)
echo -e "${GREEN}Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})${NC}"

# Upload to S3 using storage helper
echo -e "${YELLOW}Uploading to S3...${NC}"
S3_KEY="backups/database/${BACKUP_FILE}"

# Use Node.js script to upload via storage helper
node -e "
const { storagePut } = require('../storage/index.ts');
const fs = require('fs');

async function upload() {
  const fileBuffer = fs.readFileSync('${BACKUP_DIR}/${BACKUP_FILE}');
  const result = await storagePut('${S3_KEY}', fileBuffer, 'application/gzip');
  console.log('Uploaded to S3:', result.url);
}

upload().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup uploaded successfully to S3${NC}"
else
    echo -e "${RED}✗ Failed to upload backup to S3${NC}"
    exit 1
fi

# Clean up local backup
rm -f ${BACKUP_DIR}/${BACKUP_FILE}
echo -e "${YELLOW}Local backup file removed${NC}"

# Clean up old backups from S3 (older than RETENTION_DAYS)
echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
# This would require listing S3 objects and deleting old ones
# For now, we'll implement this in a separate maintenance script

echo -e "${GREEN}[$(date)] Backup completed successfully!${NC}"

# Send notification to owner (optional)
# curl -X POST /api/trpc/system.notifyOwner \
#   -H "Content-Type: application/json" \
#   -d '{"title":"Database Backup Success","content":"Daily backup completed: '${BACKUP_FILE}' ('${BACKUP_SIZE}')"}'

exit 0
