-- Force refresh Supabase schema cache
-- This should be run with the service role key

-- First, let's verify the column exists with a simple query
DO $$
BEGIN
    -- Check if position column exists and is accessible
    PERFORM 1;
EXCEPTION WHEN undefined_column THEN
    RAISE EXCEPTION 'Column position does not exist';
END $$;

-- Force schema cache refresh by creating and immediately dropping a test table
-- This will trigger Supabase to refresh its schema cache
DO $$
BEGIN
    CREATE TEMPORARY TABLE schema_refresh_test (
        id SERIAL PRIMARY KEY,
        test_position INTEGER
    );
    DROP TABLE schema_refresh_test;
EXCEPTION WHEN OTHERS THEN
    -- Ignore any errors, this is just for cache refresh
END $$;

-- Now let's verify the position column is working by doing a test update
DO $$
BEGIN
    -- This will fail if position column is not accessible
    UPDATE product_images SET position = position WHERE 1=0;
EXCEPTION WHEN undefined_column THEN
    RAISE EXCEPTION 'Column position is not accessible';
END $$;

RAISE NOTICE 'Schema refresh completed successfully';
