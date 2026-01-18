-- ============================================
-- D(ane)ua - Supabase Database Schema
-- Private PWA for Shahjahan & Dane
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. MOOD MESSAGES
-- Messages/media triggered by mood buttons
-- ============================================
CREATE TABLE mood_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood VARCHAR(50) NOT NULL CHECK (mood IN ('sad', 'unmotivated', 'working_hard', 'missing_you')),
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'audio', 'video', 'image')),
  content TEXT NOT NULL, -- Text message or storage path for media
  title VARCHAR(255), -- Optional title for the message
  storage_url TEXT, -- Supabase storage URL for media files
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher = shown more often
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick mood lookups
CREATE INDEX idx_mood_messages_mood ON mood_messages(mood) WHERE is_active = true;

-- Sample data
INSERT INTO mood_messages (mood, message_type, content, title) VALUES
  ('sad', 'text', 'Hey love, I know today feels heavy. But you''re stronger than any storm. I''m proud of you for pushing through. 💚', 'You''re Not Alone'),
  ('sad', 'text', 'Close your eyes. Breathe. Remember: this feeling is temporary, but my love for you isn''t.', 'Breathe'),
  ('unmotivated', 'text', 'Babe, even on your worst day, you''re still incredible. Start small. One thing. You got this.', 'One Step'),
  ('unmotivated', 'text', 'Remember why you started. I believe in you more than you know.', 'Remember'),
  ('working_hard', 'text', 'I see you grinding. I''m so proud of you. Don''t forget to drink water and take breaks! 💪', 'Keep Going'),
  ('working_hard', 'text', 'Your work ethic is inspiring. Future you will thank present you. I love watching you grow.', 'Future You'),
  ('missing_you', 'text', 'I miss you too. Every moment apart makes the time together sweeter. Can''t wait to hold you again.', 'Soon'),
  ('missing_you', 'text', 'No distance is too far when you''re on my mind 24/7. Thinking of you always.', 'Always');


-- ============================================
-- 2. URDU/TAGALOG WORDS
-- Word of the day with audio support
-- ============================================
CREATE TABLE language_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language VARCHAR(20) NOT NULL CHECK (language IN ('urdu', 'tagalog')),
  word_native TEXT NOT NULL, -- Urdu script or Tagalog
  word_romanized TEXT NOT NULL, -- Roman Urdu/Tagalog
  meaning_english TEXT NOT NULL,
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT, -- Your voice recording URL
  category VARCHAR(50), -- e.g., 'greetings', 'love', 'daily', 'food', 'family'
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT true,
  shown_on DATE, -- Track when it was shown
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for daily word selection
CREATE INDEX idx_language_words_active ON language_words(language, is_active, shown_on);

-- Sample Urdu words
INSERT INTO language_words (language, word_native, word_romanized, meaning_english, example_sentence, example_translation, category, difficulty) VALUES
  ('urdu', 'جان', 'Jaan', 'Life / Term of endearment (like "my love")', 'تم میری جان ہو', 'Tum meri jaan ho (You are my life)', 'love', 1),
  ('urdu', 'شکریہ', 'Shukriya', 'Thank you', 'بہت شکریہ', 'Bohat shukriya (Thank you very much)', 'greetings', 1),
  ('urdu', 'میں تم سے پیار کرتا ہوں', 'Main tumse pyaar karta hoon', 'I love you', NULL, NULL, 'love', 2),
  ('urdu', 'کیا حال ہے؟', 'Kya haal hai?', 'How are you?', NULL, NULL, 'greetings', 1),
  ('urdu', 'خوبصورت', 'Khoobsurat', 'Beautiful', 'تم بہت خوبصورت ہو', 'Tum bohat khoobsurat ho (You are very beautiful)', 'compliments', 1),
  ('urdu', 'انشاءاللہ', 'Inshallah', 'God willing / If God wills', 'انشاءاللہ ہم جلد ملیں گے', 'Inshallah hum jald milenge (God willing, we will meet soon)', 'islamic', 1);

-- Sample Tagalog words
INSERT INTO language_words (language, word_native, word_romanized, meaning_english, example_sentence, example_translation, category, difficulty) VALUES
  ('tagalog', 'Mahal kita', 'Mahal kita', 'I love you', NULL, NULL, 'love', 1),
  ('tagalog', 'Salamat', 'Salamat', 'Thank you', 'Maraming salamat!', 'Thank you very much!', 'greetings', 1),
  ('tagalog', 'Kumusta', 'Kumusta', 'How are you?', 'Kumusta ka?', 'How are you?', 'greetings', 1),
  ('tagalog', 'Maganda', 'Maganda', 'Beautiful', 'Maganda ka', 'You are beautiful', 'compliments', 1),
  ('tagalog', 'Gutom', 'Gutom', 'Hungry', 'Gutom na ako', 'I''m hungry now', 'daily', 1);


-- ============================================
-- 3. DAILY DEEN (Islamic Insights)
-- Non-pushy, evergreen Islamic content
-- ============================================
CREATE TABLE daily_deen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('verse', 'hadith', 'insight', 'dua', 'fact')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  source TEXT, -- e.g., "Quran 2:286", "Sahih Bukhari"
  arabic_text TEXT, -- Optional Arabic
  reflection TEXT, -- Your personal note/reflection
  category VARCHAR(50), -- e.g., 'patience', 'gratitude', 'love', 'mercy'
  is_active BOOLEAN DEFAULT true,
  shown_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for daily selection
CREATE INDEX idx_daily_deen_active ON daily_deen(is_active, shown_on);

-- Sample content (non-pushy, universal themes)
INSERT INTO daily_deen (content_type, title, content, source, category, reflection) VALUES
  ('verse', 'No Soul Burdened Beyond Capacity', 'Allah does not burden a soul beyond that it can bear.', 'Quran 2:286', 'patience', 'Whatever you''re facing right now, you have the strength to handle it. This is a promise.'),
  ('insight', 'The Power of Intention', 'In Islam, your intention (niyyah) is everything. The same action can be worship or routine depending on why you do it.', NULL, 'mindfulness', 'Even drinking water can be an act of gratitude. It''s all about perspective.'),
  ('hadith', 'Smiling is Charity', 'Your smile for your brother is charity.', 'Tirmidhi', 'kindness', 'You don''t need money to make someone''s day better.'),
  ('dua', 'Morning Gratitude', 'Alhamdulillah (All praise is due to God) - said after waking, eating, or any blessing.', NULL, 'gratitude', 'Start small. Just say it when something good happens.'),
  ('fact', 'The Month of Mercy', 'Ramadan isn''t just about fasting from food. It''s about fasting from negativity, gossip, and anger too.', NULL, 'ramadan', 'It''s a full reset for mind, body, and soul.'),
  ('insight', 'Patience Has Two Types', 'Sabr (patience) in Islam is both enduring hardship AND restraining yourself from what''s wrong.', NULL, 'patience', 'Sometimes patience means waiting. Sometimes it means walking away.');


-- ============================================
-- 4. STATUS UPDATES
-- Real-time "where I am" ticker
-- ============================================
CREATE TABLE status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL, -- e.g., "At the Gym 💪", "In Pakistan 🇵🇰"
  emoji VARCHAR(10),
  location VARCHAR(100),
  is_current BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one current status at a time
CREATE UNIQUE INDEX idx_status_current ON status_updates(is_current) WHERE is_current = true;

-- Sample statuses
INSERT INTO status_updates (status, emoji, location, is_current) VALUES
  ('Coding 💻', '💻', 'Home', true);


-- ============================================
-- 5. SHARED TO-DO LIST
-- Reminders you set for her
-- ============================================
CREATE TABLE shared_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date DATE,
  due_time TIME,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_by VARCHAR(50) DEFAULT 'shahjahan',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active todos
CREATE INDEX idx_shared_todos_active ON shared_todos(is_completed, due_date);


-- ============================================
-- 6. SHARED CALENDAR
-- PPL schedule, travel dates, events
-- ============================================
CREATE TABLE shared_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('workout', 'travel', 'date', 'reminder', 'special', 'other')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule VARCHAR(50), -- e.g., 'weekly', 'monthly'
  color VARCHAR(20), -- For UI display
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date range queries
CREATE INDEX idx_shared_calendar_dates ON shared_calendar(start_date, end_date);

-- Sample calendar entries (PPL Split)
INSERT INTO shared_calendar (title, event_type, start_date, start_time, is_recurring, recurrence_rule, color) VALUES
  ('Push Day 💪', 'workout', CURRENT_DATE, '06:00', true, 'weekly', 'evergreen'),
  ('Pull Day 🏋️', 'workout', CURRENT_DATE + 1, '06:00', true, 'weekly', 'evergreen'),
  ('Leg Day 🦵', 'workout', CURRENT_DATE + 2, '06:00', true, 'weekly', 'evergreen');


-- ============================================
-- 7. MEDIA VAULT
-- Pre-recorded messages (audio/video)
-- ============================================
CREATE TABLE media_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('audio', 'video', 'image')),
  storage_path TEXT NOT NULL, -- Supabase storage path
  storage_url TEXT, -- Full URL
  thumbnail_url TEXT, -- For video previews
  duration_seconds INTEGER,
  is_favorite BOOLEAN DEFAULT false,
  category VARCHAR(50), -- e.g., 'love', 'motivation', 'special_occasion'
  unlock_date DATE, -- Optional: only show after this date
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vault browsing
CREATE INDEX idx_media_vault_category ON media_vault(category, is_favorite);


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get random mood message
CREATE OR REPLACE FUNCTION get_random_mood_message(mood_type VARCHAR)
RETURNS TABLE (
  id UUID,
  message_type VARCHAR,
  content TEXT,
  title VARCHAR,
  storage_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.message_type, m.content, m.title, m.storage_url
  FROM mood_messages m
  WHERE m.mood = mood_type AND m.is_active = true
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get today's word (rotates daily)
CREATE OR REPLACE FUNCTION get_daily_word(lang VARCHAR)
RETURNS TABLE (
  id UUID,
  word_native TEXT,
  word_romanized TEXT,
  meaning_english TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT,
  category VARCHAR
) AS $$
DECLARE
  word_record RECORD;
BEGIN
  -- Try to get today's word
  SELECT * INTO word_record FROM language_words lw
  WHERE lw.language = lang AND lw.shown_on = CURRENT_DATE AND lw.is_active = true
  LIMIT 1;
  
  -- If no word for today, pick a random unshown one
  IF word_record IS NULL THEN
    SELECT * INTO word_record FROM language_words lw
    WHERE lw.language = lang AND lw.is_active = true AND (lw.shown_on IS NULL OR lw.shown_on < CURRENT_DATE - 30)
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Mark it as shown today
    IF word_record IS NOT NULL THEN
      UPDATE language_words SET shown_on = CURRENT_DATE WHERE language_words.id = word_record.id;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    word_record.id,
    word_record.word_native,
    word_record.word_romanized,
    word_record.meaning_english,
    word_record.example_sentence,
    word_record.example_translation,
    word_record.audio_url,
    word_record.category;
END;
$$ LANGUAGE plpgsql;

-- Function to set current status (auto-clears previous)
CREATE OR REPLACE FUNCTION set_current_status(new_status TEXT, new_emoji VARCHAR DEFAULT NULL, new_location VARCHAR DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- End previous status
  UPDATE status_updates SET is_current = false, ended_at = NOW() WHERE is_current = true;
  
  -- Insert new status
  INSERT INTO status_updates (status, emoji, location, is_current)
  VALUES (new_status, new_emoji, new_location, true)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- Since this is private, you can keep it simple
-- ============================================

-- Enable RLS on all tables
ALTER TABLE mood_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_deen ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_vault ENABLE ROW LEVEL SECURITY;

-- Simple policy: authenticated users can do everything
-- (Since it's just you two, this is fine)
CREATE POLICY "Allow all for authenticated users" ON mood_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON language_words FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON daily_deen FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON status_updates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON shared_todos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON shared_calendar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON media_vault FOR ALL USING (auth.role() = 'authenticated');
