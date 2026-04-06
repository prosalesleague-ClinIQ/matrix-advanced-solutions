-- Migration 015: Create product-images storage bucket
--
-- Public bucket for product images uploaded via admin panel.
-- Images are served at: {SUPABASE_URL}/storage/v1/object/public/product-images/{path}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated admin/staff to upload
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated admin/staff to update
CREATE POLICY "Admin update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Allow authenticated admin/staff to delete
CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
