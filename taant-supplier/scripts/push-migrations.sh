#!/bin/bash

# Script to push migrations using Supabase CLI
# Set environment variables first

export SUPABASE_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10C"
export PGPASSWORD="d\$z#6W&K@8pL!qR3"

echo "Pushing migrations to Supabase..."
echo "Project ID: lyteoxnqkjrpilrfcimc"

# Try using the linked project approach
supabase db push --linked --yes

echo "Migration push completed."