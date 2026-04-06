-- Migration 016: Create challenge-photos storage bucket
--
-- For participant progress photos (front/side/back).
-- Organized as: {participant_id}/week-{n}/{position}.{ext}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'challenge-photos',
  'challenge-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for challenge photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'challenge-photos');

CREATE POLICY "Authenticated upload challenge photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'challenge-photos');

CREATE POLICY "Authenticated update challenge photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'challenge-photos');

CREATE POLICY "Authenticated delete challenge photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'challenge-photos');
