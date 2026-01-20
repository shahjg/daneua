-- D(ane)ua V3-FIX8 Database Setup
-- Run this in Supabase SQL Editor

-- Daily Answers (for Today's Question)
CREATE TABLE IF NOT EXISTS daily_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Love Notes
CREATE TABLE IF NOT EXISTS love_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Date Ideas
CREATE TABLE IF NOT EXISTS date_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  time TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Countdowns
CREATE TABLE IF NOT EXISTS countdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target INTEGER DEFAULT 100,
  progress INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moods
CREATE TABLE IF NOT EXISTS moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Voice Notes
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Love Letters
CREATE TABLE IF NOT EXISTS love_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Photos
CREATE TABLE IF NOT EXISTS daily_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  photo_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea Folders
CREATE TABLE IF NOT EXISTS idea_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea Documents
CREATE TABLE IF NOT EXISTS idea_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES idea_folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE daily_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (allow all for authenticated/anon)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'daily_answers', 'love_notes', 'date_ideas', 'calendar_events', 
    'countdowns', 'goals', 'moods', 'voice_notes', 'love_letters', 
    'daily_photos', 'idea_folders', 'idea_documents'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Allow all" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
