-- Add status column to profiles table
-- This script should be run in your Supabase SQL editor

-- Add status column with default value 'active'
ALTER TABLE profiles
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Update existing records to have 'active' status
UPDATE profiles
SET status = 'active'
WHERE status IS NULL;

-- Add index for better performance on status queries
CREATE INDEX idx_profiles_status ON profiles(status);