-- ============================================
-- D(ane)ua V3 - Complete Database Schema
-- Private couples app with authentication
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS (PIN-based auth)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) UNIQUE NOT NULL CHECK (role IN ('shah', 'dane')),
  name VARCHAR(100) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default users (PINs: shah=1111, dane=2222 — change these)
-- In production, hash these properly
INSERT INTO users (role, name, pin_hash) VALUES
  ('shah', 'Shah', '1111'),
  ('dane', 'Dane', '2222');


-- ============================================
-- 2. STATUS UPDATES (Dynamic phases)
-- ============================================
CREATE TABLE status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_role VARCHAR(20) DEFAULT 'shah',
  status TEXT NOT NULL,
  status_type VARCHAR(30) DEFAULT 'general' CHECK (status_type IN ('general', 'recovery', 'travel', 'focus', 'available')),
  location VARCHAR(100),
  emoji VARCHAR(10),
  is_current BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_status_current ON status_updates(is_current) WHERE is_current = true;

INSERT INTO status_updates (status, status_type, emoji, is_current) VALUES
  ('Building something for you', 'focus', '💻', true);


-- ============================================
-- 3. COUNTDOWNS
-- ============================================
CREATE TABLE countdowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  target_date DATE NOT NULL,
  emoji VARCHAR(10),
  color VARCHAR(20) DEFAULT 'gold',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO countdowns (title, target_date, emoji) VALUES
  ('Summer Goals', '2026-06-01', '☀️'),
  ('Pakistan Trip', '2026-03-15', '🇵🇰');


-- ============================================
-- 4. DUA REQUESTS
-- ============================================
CREATE TABLE dua_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user VARCHAR(20) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 5. DAILY QUESTIONS
-- ============================================
CREATE TABLE daily_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  category VARCHAR(50),
  shown_on DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES daily_questions(id) ON DELETE CASCADE,
  user_role VARCHAR(20) NOT NULL,
  answer TEXT NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_role)
);

INSERT INTO daily_questions (question, category) VALUES
  ('What made you smile today?', 'reflection'),
  ('If we could go anywhere tomorrow, where?', 'dreams'),
  ('What''s one thing you appreciate about us?', 'love'),
  ('What''s on your mind right now?', 'connection'),
  ('Describe your perfect day together.', 'dreams'),
  ('What''s a goal you''re working toward?', 'growth'),
  ('What song reminds you of me?', 'love'),
  ('What''s something new you want to try?', 'adventure'),
  ('What''s your favorite memory of us?', 'love'),
  ('How can I support you better?', 'connection');


-- ============================================
-- 6. LANGUAGE LESSONS
-- ============================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language VARCHAR(20) NOT NULL CHECK (language IN ('urdu', 'tagalog')),
  word_native TEXT NOT NULL,
  word_romanized TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'basics',
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  is_couples_vocab BOOLEAN DEFAULT false,
  usage_context TEXT,
  shown_on DATE,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(20) DEFAULT 'shah',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_language ON lessons(language, is_active);
CREATE INDEX idx_lessons_shown ON lessons(shown_on);

-- Couples vocabulary - Urdu
INSERT INTO lessons (language, word_native, word_romanized, meaning, usage_context, category, is_couples_vocab) VALUES
  ('urdu', 'جان', 'Jaan', 'My life / My soul (term of endearment)', 'Call her this instead of "babe"', 'love', true),
  ('urdu', 'شکریہ جان', 'Shukriya jaan', 'Thank you, my love', 'When she does something nice for you', 'love', true),
  ('urdu', 'خدا حافظ', 'Khuda Hafiz', 'May God protect you (goodbye)', 'When Shah leaves for the gym or work', 'greetings', true),
  ('urdu', 'میں تم سے پیار کرتا ہوں', 'Main tumse pyaar karta hoon', 'I love you', 'Say it often', 'love', true),
  ('urdu', 'بہت خوبصورت', 'Bohat khoobsurat', 'Very beautiful', 'When she looks good', 'compliments', true),
  ('urdu', 'کیا حال ہے؟', 'Kya haal hai?', 'How are you?', 'Daily greeting', 'greetings', true),
  ('urdu', 'ٹھیک ہوں', 'Theek hoon', 'I''m fine/okay', 'Response to kya haal hai', 'greetings', true),
  ('urdu', 'بھوک لگی ہے', 'Bhook lagi hai', 'I''m hungry', 'When you want food', 'daily', true),
  ('urdu', 'مجھے نیند آ رہی ہے', 'Mujhe neend aa rahi hai', 'I''m sleepy', 'Bedtime', 'daily', true),
  ('urdu', 'چلو', 'Chalo', 'Let''s go', 'When leaving somewhere', 'daily', true);

-- Couples vocabulary - Tagalog
INSERT INTO lessons (language, word_native, word_romanized, meaning, usage_context, category, is_couples_vocab) VALUES
  ('tagalog', 'Mahal kita', 'Mahal kita', 'I love you', 'Say it back to Shah', 'love', true),
  ('tagalog', 'Ingat', 'Ingat', 'Take care', 'When Shah leaves', 'greetings', true),
  ('tagalog', 'Salamat', 'Salamat', 'Thank you', 'Express gratitude', 'basics', true),
  ('tagalog', 'Kumusta ka?', 'Kumusta ka?', 'How are you?', 'Daily greeting', 'greetings', true),
  ('tagalog', 'Miss na kita', 'Miss na kita', 'I miss you', 'When apart', 'love', true),
  ('tagalog', 'Gutom na ako', 'Gutom na ako', 'I''m hungry', 'Food time', 'daily', true),
  ('tagalog', 'Inaantok na ako', 'Inaantok na ako', 'I''m sleepy', 'Bedtime', 'daily', true),
  ('tagalog', 'Ang ganda mo', 'Ang ganda mo', 'You''re beautiful', 'Compliment Shah back', 'compliments', true),
  ('tagalog', 'Tara', 'Tara', 'Let''s go', 'When leaving', 'daily', true),
  ('tagalog', 'Oo', 'Oo', 'Yes', 'Agreement', 'basics', true);

-- Islamic phrases
INSERT INTO lessons (language, word_native, word_romanized, meaning, usage_context, category, is_couples_vocab) VALUES
  ('urdu', 'السلام علیکم', 'Assalamu Alaikum', 'Peace be upon you', 'Greeting Muslims', 'islamic', true),
  ('urdu', 'وعلیکم السلام', 'Wa Alaikum Assalam', 'And peace be upon you too', 'Response to Assalamu Alaikum', 'islamic', true),
  ('urdu', 'انشاءاللہ', 'Inshallah', 'God willing', 'When talking about future plans', 'islamic', true),
  ('urdu', 'ماشاءاللہ', 'Mashallah', 'God has willed it', 'Expressing appreciation/admiration', 'islamic', true),
  ('urdu', 'الحمدللہ', 'Alhamdulillah', 'All praise to God', 'Expressing gratitude', 'islamic', true),
  ('urdu', 'جزاک اللہ', 'JazakAllah', 'May God reward you', 'Thank you (Islamic)', 'islamic', true);


-- ============================================
-- 7. LESSON RESPONSES (Practice recordings)
-- ============================================
CREATE TABLE lesson_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  user_role VARCHAR(20) NOT NULL,
  response_type VARCHAR(20) NOT NULL CHECK (response_type IN ('recording', 'comment', 'feedback')),
  audio_url TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lesson_responses ON lesson_responses(lesson_id, created_at DESC);


-- ============================================
-- 8. LESSON PROGRESS
-- ============================================
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_role VARCHAR(20) NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_role, lesson_id)
);

CREATE TABLE learning_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_role VARCHAR(20) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_words_learned INTEGER DEFAULT 0,
  UNIQUE(user_role)
);

INSERT INTO learning_streaks (user_role, current_streak, longest_streak, total_words_learned) VALUES
  ('dane', 0, 0, 0);


-- ============================================
-- 9. DAILY DEEN
-- ============================================
CREATE TABLE daily_deen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('verse', 'hadith', 'insight', 'dua')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  arabic_text TEXT,
  source TEXT,
  reflection TEXT,
  category VARCHAR(50),
  shown_on DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO daily_deen (content_type, title, content, source, category, reflection) VALUES
  ('verse', 'On Hardship', 'Verily, with hardship comes ease.', 'Quran 94:5', 'patience', 'This is repeated twice in the Quran. Not "after" hardship — "with" it. Even in the struggle, ease exists.'),
  ('verse', 'On Capability', 'God does not burden a soul beyond that it can bear.', 'Quran 2:286', 'strength', 'Whatever you face, you already have the strength to handle it.'),
  ('hadith', 'On Kindness', 'Kindness is a mark of faith, and whoever is not kind has no faith.', 'Muslim', 'character', 'Faith shows through how you treat people, not just how you pray.'),
  ('hadith', 'On Smiling', 'Your smile for your brother is charity.', 'Tirmidhi', 'kindness', 'The smallest acts count. A smile costs nothing.'),
  ('insight', 'On Intention', 'In Islam, actions are judged by intentions. The same act can be worship or routine depending on why you do it.', NULL, 'mindfulness', 'Even eating can be worship if done with gratitude and intention.'),
  ('dua', 'For Anxiety', 'Hasbunallahu wa ni''mal wakeel — God is sufficient for us, and He is the best disposer of affairs.', 'Quran 3:173', 'peace', 'This is what believers say when things feel overwhelming.');


-- ============================================
-- 10. LOVE MESSAGES (Mood-based)
-- ============================================
CREATE TABLE love_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood VARCHAR(50) NOT NULL CHECK (mood IN ('miss_you', 'need_encouragement', 'stressed', 'happy', 'anxious', 'loved')),
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'audio', 'video')),
  content TEXT NOT NULL,
  storage_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO love_messages (mood, message_type, content) VALUES
  ('miss_you', 'text', 'Every moment apart is just a countdown to being in your arms again.'),
  ('miss_you', 'text', 'Distance means nothing when someone means everything.'),
  ('miss_you', 'text', 'I carry you with me everywhere. You''re never far from my heart.'),
  ('need_encouragement', 'text', 'I''ve watched you overcome things you thought were impossible. This is just another chapter in your story.'),
  ('need_encouragement', 'text', 'You are stronger than you know. And I''m here cheering you on, always.'),
  ('need_encouragement', 'text', 'Take it one step at a time. I believe in you more than you believe in yourself.'),
  ('stressed', 'text', 'Breathe. This moment will pass. I''m right here with you.'),
  ('stressed', 'text', 'You don''t have to carry everything alone. Lean on me.'),
  ('stressed', 'text', 'Close your eyes. Inhale. Exhale. You''ve got this. We''ve got this.'),
  ('anxious', 'text', 'Your worries are valid, but they don''t define your future. I''m here.'),
  ('anxious', 'text', 'One moment at a time. One breath at a time. I''m not going anywhere.'),
  ('happy', 'text', 'Your happiness is my happiness. Seeing you smile makes everything worth it.'),
  ('happy', 'text', 'I love seeing you like this. You deserve all the joy in the world.'),
  ('loved', 'text', 'You are my favorite person. Today, tomorrow, always.'),
  ('loved', 'text', 'I chose you. And I would choose you in every lifetime.');


-- ============================================
-- 11. LOVE LETTERS
-- ============================================
CREATE TABLE love_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user VARCHAR(20) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 12. MOMENTS (Photo sharing)
-- ============================================
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_role VARCHAR(20) NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  moment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moments_date ON moments(moment_date DESC);


-- ============================================
-- 13. DATE IDEAS
-- ============================================
CREATE TABLE date_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  vibe VARCHAR(30) NOT NULL CHECK (vibe IN ('romantic', 'casual', 'adventure', 'cozy', 'fancy')),
  price_level INTEGER NOT NULL CHECK (price_level BETWEEN 1 AND 4),
  date_type VARCHAR(30) NOT NULL CHECK (date_type IN ('dinner', 'lunch', 'activity', 'day_trip', 'at_home', 'cafe')),
  location VARCHAR(255),
  link TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'want_to_do' CHECK (status IN ('want_to_do', 'planned', 'done')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  added_by VARCHAR(20) DEFAULT 'shah',
  completed_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO date_ideas (name, description, vibe, price_level, date_type, notes, added_by) VALUES
  ('Sunset picnic', 'Find a spot with a view, bring a blanket and good food', 'romantic', 1, 'activity', 'Need to scout locations', 'shah'),
  ('Cook Pakistani food together', 'Learn to make biryani or nihari from scratch', 'cozy', 2, 'at_home', 'Get ingredients from halal market', 'shah'),
  ('Bookstore date', 'Pick a book for each other without revealing until checkout', 'casual', 2, 'activity', NULL, 'shah');


-- ============================================
-- 14. CALENDAR EVENTS
-- ============================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('date', 'trip', 'anniversary', 'reminder', 'workout', 'other')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  location VARCHAR(255),
  color VARCHAR(20) DEFAULT 'forest',
  added_by VARCHAR(20) DEFAULT 'shah',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_dates ON calendar_events(start_date);


-- ============================================
-- 15. GOALS
-- ============================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner VARCHAR(20) NOT NULL CHECK (owner IN ('shah', 'dane', 'shared')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0
);


-- ============================================
-- 16. ACTIVITY FEED
-- ============================================
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  for_user VARCHAR(20) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_feed ON activity_feed(for_user, is_read, created_at DESC);


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Verify PIN
CREATE OR REPLACE FUNCTION verify_pin(user_role VARCHAR, pin VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE role = user_role AND pin_hash = pin
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Get today's lesson
CREATE OR REPLACE FUNCTION get_daily_lesson(lang VARCHAR)
RETURNS TABLE (
  id UUID,
  word_native TEXT,
  word_romanized TEXT,
  meaning TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT,
  category VARCHAR,
  usage_context TEXT,
  is_couples_vocab BOOLEAN
) AS $$
DECLARE
  lesson_record RECORD;
  today DATE := CURRENT_DATE;
BEGIN
  -- Check for today's lesson
  SELECT * INTO lesson_record FROM lessons l
  WHERE l.language = lang AND l.shown_on = today AND l.is_active = true
  LIMIT 1;
  
  -- If none, pick one
  IF lesson_record IS NULL THEN
    SELECT * INTO lesson_record FROM lessons l
    WHERE l.language = lang AND l.is_active = true 
      AND (l.shown_on IS NULL OR l.shown_on < today - 7)
    ORDER BY l.is_couples_vocab DESC, RANDOM()
    LIMIT 1;
    
    IF lesson_record IS NOT NULL THEN
      UPDATE lessons SET shown_on = today WHERE lessons.id = lesson_record.id;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    lesson_record.id,
    lesson_record.word_native,
    lesson_record.word_romanized,
    lesson_record.meaning,
    lesson_record.example_sentence,
    lesson_record.example_translation,
    lesson_record.audio_url,
    lesson_record.category,
    lesson_record.usage_context,
    lesson_record.is_couples_vocab;
END;
$$ LANGUAGE plpgsql;


-- Get daily question
CREATE OR REPLACE FUNCTION get_daily_question()
RETURNS TABLE (
  id UUID,
  question TEXT,
  category VARCHAR,
  shah_answer TEXT,
  dane_answer TEXT
) AS $$
DECLARE
  q_record RECORD;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT * INTO q_record FROM daily_questions q
  WHERE q.shown_on = today AND q.is_active = true
  LIMIT 1;
  
  IF q_record IS NULL THEN
    SELECT * INTO q_record FROM daily_questions q
    WHERE q.is_active = true AND (q.shown_on IS NULL OR q.shown_on < today - 7)
    ORDER BY RANDOM()
    LIMIT 1;
    
    IF q_record IS NOT NULL THEN
      UPDATE daily_questions SET shown_on = today WHERE daily_questions.id = q_record.id;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    q_record.id,
    q_record.question,
    q_record.category,
    (SELECT answer FROM question_answers WHERE question_id = q_record.id AND user_role = 'shah'),
    (SELECT answer FROM question_answers WHERE question_id = q_record.id AND user_role = 'dane');
END;
$$ LANGUAGE plpgsql;


-- Get daily deen
CREATE OR REPLACE FUNCTION get_daily_deen()
RETURNS TABLE (
  id UUID,
  content_type VARCHAR,
  title VARCHAR,
  content TEXT,
  arabic_text TEXT,
  source TEXT,
  reflection TEXT,
  category VARCHAR
) AS $$
DECLARE
  deen_record RECORD;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT * INTO deen_record FROM daily_deen d
  WHERE d.shown_on = today AND d.is_active = true
  LIMIT 1;
  
  IF deen_record IS NULL THEN
    SELECT * INTO deen_record FROM daily_deen d
    WHERE d.is_active = true AND (d.shown_on IS NULL OR d.shown_on < today - 7)
    ORDER BY RANDOM()
    LIMIT 1;
    
    IF deen_record IS NOT NULL THEN
      UPDATE daily_deen SET shown_on = today WHERE daily_deen.id = deen_record.id;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    deen_record.id,
    deen_record.content_type,
    deen_record.title,
    deen_record.content,
    deen_record.arabic_text,
    deen_record.source,
    deen_record.reflection,
    deen_record.category;
END;
$$ LANGUAGE plpgsql;


-- Get random love message by mood
CREATE OR REPLACE FUNCTION get_love_message(msg_mood VARCHAR)
RETURNS TABLE (
  id UUID,
  message_type VARCHAR,
  content TEXT,
  storage_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.message_type, m.content, m.storage_url
  FROM love_messages m
  WHERE m.mood = msg_mood AND m.is_active = true
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- Update learning streak
CREATE OR REPLACE FUNCTION update_learning_streak(p_user_role VARCHAR)
RETURNS void AS $$
DECLARE
  last_date DATE;
  curr_streak INTEGER;
  long_streak INTEGER;
BEGIN
  SELECT last_completed_date, current_streak, longest_streak 
  INTO last_date, curr_streak, long_streak
  FROM learning_streaks WHERE user_role = p_user_role;
  
  IF last_date = CURRENT_DATE - 1 THEN
    curr_streak := curr_streak + 1;
  ELSIF last_date < CURRENT_DATE - 1 THEN
    curr_streak := 1;
  END IF;
  
  IF curr_streak > long_streak THEN
    long_streak := curr_streak;
  END IF;
  
  UPDATE learning_streaks 
  SET current_streak = curr_streak,
      longest_streak = long_streak,
      last_completed_date = CURRENT_DATE,
      total_words_learned = total_words_learned + 1
  WHERE user_role = p_user_role;
END;
$$ LANGUAGE plpgsql;


-- Set current status
CREATE OR REPLACE FUNCTION set_status(new_status TEXT, new_type VARCHAR DEFAULT 'general', new_emoji VARCHAR DEFAULT NULL, new_location VARCHAR DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  UPDATE status_updates SET is_current = false, ended_at = NOW() WHERE is_current = true;
  
  INSERT INTO status_updates (status, status_type, emoji, location, is_current)
  VALUES (new_status, new_type, new_emoji, new_location, true)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_deen ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Allow all for authenticated (simple private app)
CREATE POLICY "Full access" ON users FOR ALL USING (true);
CREATE POLICY "Full access" ON status_updates FOR ALL USING (true);
CREATE POLICY "Full access" ON countdowns FOR ALL USING (true);
CREATE POLICY "Full access" ON dua_requests FOR ALL USING (true);
CREATE POLICY "Full access" ON daily_questions FOR ALL USING (true);
CREATE POLICY "Full access" ON question_answers FOR ALL USING (true);
CREATE POLICY "Full access" ON lessons FOR ALL USING (true);
CREATE POLICY "Full access" ON lesson_responses FOR ALL USING (true);
CREATE POLICY "Full access" ON lesson_progress FOR ALL USING (true);
CREATE POLICY "Full access" ON learning_streaks FOR ALL USING (true);
CREATE POLICY "Full access" ON daily_deen FOR ALL USING (true);
CREATE POLICY "Full access" ON love_messages FOR ALL USING (true);
CREATE POLICY "Full access" ON love_letters FOR ALL USING (true);
CREATE POLICY "Full access" ON moments FOR ALL USING (true);
CREATE POLICY "Full access" ON date_ideas FOR ALL USING (true);
CREATE POLICY "Full access" ON calendar_events FOR ALL USING (true);
CREATE POLICY "Full access" ON goals FOR ALL USING (true);
CREATE POLICY "Full access" ON goal_milestones FOR ALL USING (true);
CREATE POLICY "Full access" ON activity_feed FOR ALL USING (true);
