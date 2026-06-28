-- ============================================================
-- KYMIZ Storage — post-images bucket (public)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder (userId/filename)
CREATE POLICY "auth_upload_post_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Public read (images are public)
CREATE POLICY "public_read_post_images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

-- Users can update their own images
CREATE POLICY "auth_update_own_post_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Users can delete their own images
CREATE POLICY "auth_delete_own_post_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
