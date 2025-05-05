#!/bin/bash

# Exit on error
set -e

# Set variables
BACKUP_DIR="/backup"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_CONTAINER="bakery-db"
DB_NAME="${MYSQL_DATABASE:-ec}"
DB_USER="${MYSQL_USER:-bakery_user}"
DB_PASSWORD="${MYSQL_PASSWORD:-secure_password}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup MySQL database
echo "Backing up MySQL database..."
docker exec $DB_CONTAINER /usr/bin/mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > "$BACKUP_DIR/mysql_backup_$DATE.sql.gz"

# Backup volumes
echo "Backing up Docker volumes..."
docker run --rm -v bakery-mysql-data:/source:ro -v $BACKUP_DIR:/backup alpine tar -czf /backup/mysql_data_$DATE.tar.gz -C /source .
docker run --rm -v bakery-backend-data:/source:ro -v $BACKUP_DIR:/backup alpine tar -czf /backup/backend_data_$DATE.tar.gz -C /source .
docker run --rm -v bakery-backend-logs:/source:ro -v $BACKUP_DIR:/backup alpine tar -czf /backup/backend_logs_$DATE.tar.gz -C /source .

# Backup configuration files
echo "Backing up configuration files..."
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" ./nginx ./mysql/conf ./ecspring/.env ./ecfront/ec-front/.env

echo "Backup completed: $DATE"
