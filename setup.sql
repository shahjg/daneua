-- ============================================
-- D(ANE)UA V3 - COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Voice Notes Table
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user TEXT NOT NULL CHECK (from_user IN ('shah', 'dane')),
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared Ideas Table (legacy)
CREATE TABLE IF NOT EXISTS shared_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  color TEXT DEFAULT 'yellow',
  image_url TEXT,
  audio_url TEXT,
  added_by TEXT NOT NULL CHECK (added_by IN ('shah', 'dane')),
  is_pinned BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idea Documents Table (Google Docs style)
CREATE TABLE IF NOT EXISTS idea_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id TEXT NOT NULL DEFAULT 'other',
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  created_by TEXT NOT NULL CHECK (created_by IN ('shah', 'dane')),
  last_edited_by TEXT CHECK (last_edited_by IN ('shah', 'dane')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quick Notes Table (Post-it style)
CREATE TABLE IF NOT EXISTS quick_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  added_by TEXT NOT NULL CHECK (added_by IN ('shah', 'dane')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "Allow all" ON voice_notes;
DROP POLICY IF EXISTS "Allow all ideas" ON shared_ideas;
DROP POLICY IF EXISTS "Allow all docs" ON idea_documents;
DROP POLICY IF EXISTS "Allow all notes" ON quick_notes;
DROP POLICY IF EXISTS "Public Audio Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Audio Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Audio Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Photos Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Photos Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Photos Update" ON storage.objects;

-- ============================================
-- 4. CREATE POLICIES
-- ============================================

CREATE POLICY "Allow all" ON voice_notes FOR ALL USING (true);
CREATE POLICY "Allow all ideas" ON shared_ideas FOR ALL USING (true);
CREATE POLICY "Allow all docs" ON idea_documents FOR ALL USING (true);
CREATE POLICY "Allow all notes" ON quick_notes FOR ALL USING (true);

-- Storage policies
CREATE POLICY "Public Audio Read" ON storage.objects FOR SELECT USING (bucket_id = 'audio');
CREATE POLICY "Public Audio Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio');
CREATE POLICY "Public Audio Update" ON storage.objects FOR UPDATE USING (bucket_id = 'audio');

CREATE POLICY "Public Photos Read" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public Photos Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Public Photos Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');

-- ============================================
-- 5. ENABLE REALTIME
-- ============================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE shared_ideas;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE idea_documents;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE quick_notes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 6. UPDATE USER NAMES
-- ============================================

UPDATE users SET name = 'Shahjahan' WHERE role = 'shah';
UPDATE users SET name = 'Dane' WHERE role = 'dane';

-- ============================================
-- DONE! 
-- 
-- IMPORTANT: Create storage buckets manually:
-- 1. Go to Storage in Supabase
-- 2. Create bucket "audio" - set to PUBLIC
-- 3. Create bucket "photos" - set to PUBLIC
-- ============================================
