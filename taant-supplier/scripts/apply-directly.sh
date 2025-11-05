#!/bin/bash

# Apply Supabase migrations directly using PostgreSQL connection
# Connection details for Supabase

SUPABASE_DB_HOST="lyteoxnqkjrpilrfcimc.supabase.co"
SUPABASE_DB_PORT="5432"
SUPABASE_DB_NAME="postgres"
SUPABASE_DB_USER="postgres"
SUPABASE_DB_PASSWORD="d\$z#6W&K@8pL!qR3"

# Use environment variables to avoid connection string issues
export PGPASSWORD="$SUPABASE_DB_PASSWORD"
CONN_STRING="postgresql://$SUPABASE_DB_USER@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require"

echo "Applying migrations to Supabase database..."
echo "Host: $SUPABASE_DB_HOST:$SUPABASE_DB_PORT"
echo "Database: $SUPABASE_DB_NAME"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not available"
    exit 1
fi

# Apply the combined migration file
COMBINED_FILE="scripts/combined_all_migrations.sql"

if [ ! -f "$COMBINED_FILE" ]; then
    echo "Error: Combined migration file not found: $COMBINED_FILE"
    exit 1
fi

echo "Applying migration from: $COMBINED_FILE"
echo ""

# Execute the migration
psql "$CONN_STRING" -f "$COMBINED_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Migration applied successfully!"
else
    echo ""
    echo "✗ Migration failed!"
    exit 1
fi