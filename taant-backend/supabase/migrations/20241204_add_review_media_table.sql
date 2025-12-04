-- Create review_media table for storing uploaded images and videos
CREATE TABLE IF NOT EXISTS review_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
    file_name TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- For videos in seconds
    position INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_media_review_id ON review_media(review_id);
CREATE INDEX IF NOT EXISTS idx_review_media_media_type ON review_media(media_type);
CREATE INDEX IF NOT EXISTS idx_review_media_position ON review_media(review_id, position);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_media_updated_at
    BEFORE UPDATE ON review_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;

-- Allow users to see media for approved reviews
CREATE POLICY "Users can view review media" ON review_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM product_reviews pr
            WHERE pr.id = review_media.review_id
            AND pr.is_approved = true
        )
    );

-- Allow authenticated users to insert media for their own reviews
CREATE POLICY "Users can insert media for their reviews" ON review_media
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM product_reviews pr
            WHERE pr.id = review_media.review_id
            AND pr.customer_id = auth.uid()
        )
    );

-- Allow users to update media for their own reviews
CREATE POLICY "Users can update their review media" ON review_media
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM product_reviews pr
            WHERE pr.id = review_media.review_id
            AND pr.customer_id = auth.uid()
        )
    );

-- Allow users to delete media for their own reviews
CREATE POLICY "Users can delete their review media" ON review_media
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM product_reviews pr
            WHERE pr.id = review_media.review_id
            AND pr.customer_id = auth.uid()
        )
    );