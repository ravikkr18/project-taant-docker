-- Create review_media table for storing review images and videos
CREATE TABLE IF NOT EXISTS review_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- Duration in seconds for videos
  position INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_media_review_id ON review_media(review_id);
CREATE INDEX IF NOT EXISTS idx_review_media_position ON review_media(review_id, position);

-- Enable RLS
ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view review media for approved reviews"
  ON review_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM product_reviews
      WHERE product_reviews.id = review_media.review_id
      AND product_reviews.is_approved = true
    )
  );

CREATE POLICY "Users can insert review media"
  ON review_media FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_review_media_updated_at
    BEFORE UPDATE ON review_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();