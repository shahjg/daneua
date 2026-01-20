-- ============================================
-- D(ANE)UA V3-FIX11 - DATABASE SETUP
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- 1. LOVE NOTES TABLE (for HomePage)
-- ============================================
CREATE TABLE IF NOT EXISTS love_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user TEXT NOT NULL CHECK (from_user IN ('shah', 'dane')),
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all love notes" ON love_notes FOR ALL USING (true) WITH CHECK (true);


-- 2. VOICE NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user TEXT NOT NULL CHECK (from_user IN ('shah', 'dane')),
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all voice notes" ON voice_notes FOR ALL USING (true);


-- 3. IDEA FOLDERS TABLE (for Ideas feature)
-- ============================================
CREATE TABLE IF NOT EXISTS idea_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL CHECK (created_by IN ('shah', 'dane')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE idea_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all folders" ON idea_folders FOR ALL USING (true);


-- 4. IDEA DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS idea_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES idea_folders(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  content TEXT,
  sketches JSONB DEFAULT '[]',
  created_by TEXT NOT NULL CHECK (created_by IN ('shah', 'dane')),
  last_edited_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE idea_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all documents" ON idea_documents FOR ALL USING (true);

-- Enable realtime for idea_documents
ALTER PUBLICATION supabase_realtime ADD TABLE idea_documents;


-- 5. MOMENTS TABLE (for Pic of the Day)
-- ============================================
CREATE TABLE IF NOT EXISTS moments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_role TEXT NOT NULL CHECK (user_role IN ('shah', 'dane')),
  photo_url TEXT NOT NULL,
  caption TEXT,
  moment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all moments" ON moments FOR ALL USING (true);


-- 6. QUICK NOTES TABLE (for Ideas feature)
-- ============================================
CREATE TABLE IF NOT EXISTS quick_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  added_by TEXT NOT NULL CHECK (added_by IN ('shah', 'dane')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all quick notes" ON quick_notes FOR ALL USING (true);


-- 7. WORD RECORDINGS TABLE (for Learn page dual recordings)
-- ============================================
CREATE TABLE IF NOT EXISTS word_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word_key TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('shah', 'dane')),
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(word_key, user_role)
);

ALTER TABLE word_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all word recordings" ON word_recordings FOR ALL USING (true);


-- 8. ADD END_DATE TO CALENDAR_EVENTS (for multi-day events)
-- ============================================
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS end_date DATE;


-- 9. STORAGE BUCKET SETUP
-- ============================================
-- IMPORTANT: Create these buckets manually in Supabase Storage UI:
-- 
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Create bucket named "audio" 
--    - Check "Public bucket"
-- 4. Create bucket named "photos"
--    - Check "Public bucket"
--
-- Then run these policies:

-- Audio bucket policies
CREATE POLICY "Public Audio Read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Public Audio Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Public Audio Update" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'audio');

CREATE POLICY "Public Audio Delete" ON storage.objects 
  FOR DELETE USING (bucket_id = 'audio');

-- Photos bucket policies  
CREATE POLICY "Public Photos Read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Public Photos Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Public Photos Update" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'photos');

CREATE POLICY "Public Photos Delete" ON storage.objects 
  FOR DELETE USING (bucket_id = 'photos');


-- 10. UPDATE USER NAMES
-- ============================================
UPDATE users SET name = 'Shahjahan' WHERE role = 'shah';
UPDATE users SET name = 'Dane' WHERE role = 'dane';


-- 11. DUA MESSAGES TABLE (for Send a Dua feature)
-- ============================================
CREATE TABLE IF NOT EXISTS dua_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user TEXT NOT NULL CHECK (from_user IN ('shah', 'dane')),
  to_user TEXT NOT NULL CHECK (to_user IN ('shah', 'dane')),
  category TEXT NOT NULL,
  emoji TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dua_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all dua messages" ON dua_messages FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- IF YOU GET ERRORS, RUN THESE FIRST:
-- ============================================
-- 
-- DROP POLICY IF EXISTS "Allow all love notes" ON love_notes;
-- DROP TABLE IF EXISTS love_notes;
-- 
-- DROP POLICY IF EXISTS "Allow all voice notes" ON voice_notes;
-- DROP TABLE IF EXISTS voice_notes;
-- 
-- DROP POLICY IF EXISTS "Allow all word recordings" ON word_recordings;
-- DROP TABLE IF EXISTS word_recordings;
-- 
-- DROP POLICY IF EXISTS "Allow all quick notes" ON quick_notes;
-- DROP TABLE IF EXISTS quick_notes;
-- 
-- DROP POLICY IF EXISTS "Allow all documents" ON idea_documents;
-- DROP TABLE IF EXISTS idea_documents;
-- 
-- DROP POLICY IF EXISTS "Allow all folders" ON idea_folders;
-- DROP TABLE IF EXISTS idea_folders;
--
-- DROP POLICY IF EXISTS "Allow all dua messages" ON dua_messages;
-- DROP TABLE IF EXISTS dua_messages;
-- 
-- DROP POLICY IF EXISTS "Public Audio Read" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Audio Upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Audio Update" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Audio Delete" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Photos Read" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Photos Upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Photos Update" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Photos Delete" ON storage.objects;
