#!/bin/bash

# Script to apply Supabase migrations using psql
# This script connects to the Supabase PostgreSQL database and applies migration files

set -e

# Database connection details
SUPABASE_URL="https://lyteoxnqkjrpilrfcimc.supabase.co"
SUPABASE_DB_HOST="lyteoxnqkjrpilrfcimc.supabase.co"
SUPABASE_DB_PORT="5432"
SUPABASE_DB_NAME="postgres"
SUPABASE_DB_USER="postgres"
SUPABASE_DB_PASSWORD="d$z#6W&K@8pL!qR3"

# Directory containing migration files
MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"

echo "Applying Supabase migrations..."
echo "Database: $SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME"
echo "Migrations directory: $MIGRATIONS_DIR"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "Error: Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Create migrations table if it doesn't exist
echo "Creating migrations table if not exists..."
psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require" << 'EOF'
CREATE TABLE IF NOT EXISTS IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
EOF

# Get list of migration files sorted by filename
migration_files=$(ls -1 "$MIGRATIONS_DIR"/*.sql | sort)

echo "Found migration files:"
echo "$migration_files"
echo ""

# Apply each migration file
for migration_file in $migration_files; do
    filename=$(basename "$migration_file")

    # Check if migration has already been applied
    applied=$(psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE filename = '$filename'" | tr -d ' ')

    if [ "$applied" -gt 0 ]; then
        echo "Skipping already applied migration: $filename"
        continue
    fi

    echo "Applying migration: $filename"

    # Apply the migration
    if psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require" -f "$migration_file"; then
        # Record the migration as applied
        psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require" -c "INSERT INTO schema_migrations (filename) VALUES ('$filename')"
        echo "Successfully applied: $filename"
    else
        echo "Error applying migration: $filename"
        exit 1
    fi

    echo ""
done

echo "All migrations applied successfully!"
echo ""
echo "Current migrations in database:"
psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require" -c "SELECT filename, applied_at FROM schema_migrations ORDER BY applied_at"