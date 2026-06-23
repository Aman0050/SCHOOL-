#!/bin/bash
# EduXeno Automated Database Backup Script (Disaster Recovery Phase 9)
# Requires pg_dump and AWS CLI installed

# Configuration
DB_NAME="eduxeno_prod"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/tmp/db_backups"
S3_BUCKET="s3://eduxeno-enterprise-backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/eduxeno_$DATE.sql.gz"

echo "[INFO] Starting EduXeno Database Backup ($DATE)"

# 1. Ensure directory exists
mkdir -p "$BACKUP_DIR"

# 2. Run pg_dump with compression
PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "[SUCCESS] Database dumped successfully to $BACKUP_FILE"
else
  echo "[ERROR] Database dump failed!"
  exit 1
fi

# 3. Upload to AWS S3
echo "[INFO] Uploading to S3 Bucket ($S3_BUCKET)..."
aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/eduxeno_$DATE.sql.gz"

if [ $? -eq 0 ]; then
  echo "[SUCCESS] Backup uploaded to S3"
  
  # 4. Clean up local file to save disk space
  rm "$BACKUP_FILE"
  echo "[INFO] Local backup file removed."
else
  echo "[ERROR] S3 Upload failed!"
  exit 1
fi

echo "[INFO] Backup Process Completed Successfully."
