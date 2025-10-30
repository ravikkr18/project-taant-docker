-- Create storage bucket for supplier uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'supplier-uploads',
    'supplier-uploads',
    false, -- Private bucket (requires signed URLs)
    5242880, -- 5MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Suppliers can upload to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'supplier-uploads' AND
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Suppliers can view their own uploads" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'supplier-uploads' AND
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Suppliers can update their own uploads" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'supplier-uploads' AND
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Suppliers can delete their own uploads" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'supplier-uploads' AND
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );