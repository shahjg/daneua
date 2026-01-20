-- D(ane)ua V3 Complete Database Setup
-- Run this in Supabase SQL Editor

-- Enable realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
EXCEPTION WHEN OTHERS THEN NULL;
COMMIT;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT UNIQUE NOT NULL CHECK (role IN ('shah', 'dane')),
  pin TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default users
INSERT INTO users (role, pin, name) VALUES ('shah', '1111', 'Shahjahan') ON CONFLICT (role) DO NOTHING;
INSERT INTO users (role, pin, name) VALUES ('dane', '2222', 'Dane') ON CONFLICT (role) DO NOTHING;

-- Status updates
CREATE TABLE IF NOT EXISTS status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role TEXT NOT NULL REFERENCES users(role),
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_role)
);

-- Daily questions
CREATE TABLE IF NOT EXISTS daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question answers
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES daily_questions(id),
  user_role TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_role)
);

-- Dua requests
CREATE TABLE IF NOT EXISTS dua_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  category TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Love messages
CREATE TABLE IF NOT EXISTS love_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Countdowns
CREATE TABLE IF NOT EXISTS countdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  time TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Date ideas
CREATE TABLE IF NOT EXISTS date_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moments (photos)
CREATE TABLE IF NOT EXISTS moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 6),
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slot)
);

-- Voice notes
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea folders (NEW)
CREATE TABLE IF NOT EXISTS idea_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea documents (NEW)
CREATE TABLE IF NOT EXISTS idea_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES idea_folders(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  sketches JSONB DEFAULT '[]',
  created_by TEXT NOT NULL,
  last_edited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick notes
CREATE TABLE IF NOT EXISTS quick_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Word recordings for Learn page (NEW)
CREATE TABLE IF NOT EXISTS word_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_key TEXT NOT NULL,
  user_role TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_recordings ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for simplicity - private app)
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON status_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON daily_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON question_answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON dua_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON love_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON countdowns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON date_ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON moments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON voice_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON idea_folders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON idea_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON quick_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON word_recordings FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE status_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE question_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE dua_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE love_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE idea_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE voice_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE moments;

-- Insert a sample daily question
INSERT INTO daily_questions (date, question) 
VALUES (CURRENT_DATE, 'What is one thing you are grateful for today?')
ON CONFLICT (date) DO NOTHING;

-- IMPORTANT: Create storage buckets manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create bucket named 'audio' - set to PUBLIC
-- 3. Create bucket named 'photos' - set to PUBLIC
