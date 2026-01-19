-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- 1. CREATE VOICE NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user TEXT NOT NULL CHECK (from_user IN ('shah', 'dane')),
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

-- Allow all access (since this is a private couples app)
CREATE POLICY "Allow all" ON voice_notes FOR ALL USING (true);


-- 2. STORAGE BUCKET POLICIES
-- ============================================
-- First create buckets manually in Supabase Storage UI:
-- - Create bucket named "audio" and set it to Public
-- - Create bucket named "photos" and set it to Public

-- Then run these policies:

-- Audio bucket policies
CREATE POLICY "Public Audio Read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Public Audio Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Public Audio Update" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'audio');

-- Photos bucket policies  
CREATE POLICY "Public Photos Read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Public Photos Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Public Photos Update" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'photos');


-- 3. UPDATE USER NAMES
-- ============================================
UPDATE users SET name = 'Shahjahan' WHERE role = 'shah';
UPDATE users SET name = 'Dane' WHERE role = 'dane';


-- 4. IF YOU GET POLICY ERRORS, RUN THIS FIRST:
-- ============================================
-- DROP POLICY IF EXISTS "Public Audio Read" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Audio Upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Audio Update" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Photos Read" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Photos Upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Photos Update" ON storage.objects;
