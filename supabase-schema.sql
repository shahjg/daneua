-- ============================================
-- D(ane)ua V2 - Complete Database Schema
-- Luxurious. Romantic. Personal.
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES
-- Basic info for both of you
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('shah', 'dane')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO profiles (name, role) VALUES
  ('Shah', 'shah'),
  ('Dane', 'dane');


-- ============================================
-- 2. STATUS UPDATES
-- Where you are / what you're doing
-- ============================================
CREATE TABLE status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_role VARCHAR(20) NOT NULL DEFAULT 'shah',
  status TEXT NOT NULL,
  location VARCHAR(100),
  is_current BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_status_current ON status_updates(is_current) WHERE is_current = true;

INSERT INTO status_updates (status, location, is_current) VALUES
  ('Working on something special', 'Home', true);


-- ============================================
-- 3. LOVE MESSAGES
-- Messages for different emotional needs
-- ============================================
CREATE TABLE love_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'miss_you', 
    'encouragement', 
    'make_me_laugh', 
    'stressed', 
    'hear_your_voice',
    'general'
  )),
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'audio', 'video')),
  title VARCHAR(255),
  content TEXT NOT NULL,
  storage_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample messages
INSERT INTO love_messages (category, message_type, title, content) VALUES
  ('miss_you', 'text', NULL, 'Every moment apart is just a countdown to holding you again. You are constantly on my mind.'),
  ('miss_you', 'text', NULL, 'Distance means nothing when someone means everything. And you mean everything to me.'),
  ('encouragement', 'text', NULL, 'I have watched you overcome so much. This is just another chapter in your story of strength.'),
  ('encouragement', 'text', NULL, 'You are more capable than you give yourself credit for. I see your potential even when you cannot.'),
  ('make_me_laugh', 'text', NULL, 'Remember when you thought you could cook? The fire alarm remembers too.'),
  ('stressed', 'text', NULL, 'Take a breath. Whatever this is, it is temporary. Your peace is permanent. I am here.'),
  ('stressed', 'text', NULL, 'You do not have to have it all figured out. Just take the next small step. I will be here.'),
  ('hear_your_voice', 'text', NULL, 'I wish I could be there right now. Until then, know that my voice is always just a call away.'),
  ('general', 'text', NULL, 'I chose you. And I would choose you again. Every single time.');


-- ============================================
-- 4. LOVE LETTERS
-- Archive of longer messages she can revisit
-- ============================================
CREATE TABLE love_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  occasion VARCHAR(100),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 5. LANGUAGE LEARNING
-- Urdu, Tagalog words and phrases
-- ============================================
CREATE TABLE language_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language VARCHAR(20) NOT NULL CHECK (language IN ('urdu', 'tagalog')),
  word_native TEXT NOT NULL,
  word_romanized TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT,
  category VARCHAR(50),
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  shown_on DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_language_active ON language_lessons(language, is_active, shown_on);

-- Urdu essentials
INSERT INTO language_lessons (language, word_native, word_romanized, meaning, example_sentence, example_translation, category) VALUES
  ('urdu', 'جان', 'Jaan', 'Life, soul — used as "my love"', 'تم میری جان ہو', 'Tum meri jaan ho — You are my life', 'love'),
  ('urdu', 'شکریہ', 'Shukriya', 'Thank you', 'بہت شکریہ', 'Bohat shukriya — Thank you very much', 'basics'),
  ('urdu', 'میں تم سے پیار کرتا ہوں', 'Main tumse pyaar karta hoon', 'I love you', NULL, NULL, 'love'),
  ('urdu', 'کیا حال ہے؟', 'Kya haal hai?', 'How are you?', NULL, NULL, 'basics'),
  ('urdu', 'خوبصورت', 'Khoobsurat', 'Beautiful', 'تم بہت خوبصورت ہو', 'Tum bohat khoobsurat ho — You are very beautiful', 'compliments'),
  ('urdu', 'انشاءاللہ', 'Inshallah', 'God willing', 'انشاءاللہ ہم جلد ملیں گے', 'Inshallah hum jald milenge — God willing we will meet soon', 'islamic'),
  ('urdu', 'السلام علیکم', 'Assalamu Alaikum', 'Peace be upon you — Islamic greeting', NULL, NULL, 'islamic'),
  ('urdu', 'ماشاءاللہ', 'Mashallah', 'God has willed it — expresses appreciation', NULL, NULL, 'islamic'),
  ('urdu', 'بھوک لگی ہے', 'Bhook lagi hai', 'I am hungry', NULL, NULL, 'daily'),
  ('urdu', 'مجھے نیند آ رہی ہے', 'Mujhe neend aa rahi hai', 'I am sleepy', NULL, NULL, 'daily');

-- Tagalog essentials  
INSERT INTO language_lessons (language, word_native, word_romanized, meaning, example_sentence, example_translation, category) VALUES
  ('tagalog', 'Mahal kita', 'Mahal kita', 'I love you', NULL, NULL, 'love'),
  ('tagalog', 'Salamat', 'Salamat', 'Thank you', 'Maraming salamat', 'Thank you very much', 'basics'),
  ('tagalog', 'Kumusta', 'Kumusta', 'How are you?', 'Kumusta ka?', 'How are you?', 'basics'),
  ('tagalog', 'Maganda', 'Maganda', 'Beautiful', 'Maganda ka', 'You are beautiful', 'compliments'),
  ('tagalog', 'Gutom na ako', 'Gutom na ako', 'I am hungry', NULL, NULL, 'daily'),
  ('tagalog', 'Ingat', 'Ingat', 'Take care', 'Ingat ka', 'Take care of yourself', 'basics'),
  ('tagalog', 'Oo', 'Oo', 'Yes', NULL, NULL, 'basics'),
  ('tagalog', 'Hindi', 'Hindi', 'No', NULL, NULL, 'basics'),
  ('tagalog', 'Miss na kita', 'Miss na kita', 'I miss you', NULL, NULL, 'love'),
  ('tagalog', 'Tulog na', 'Tulog na', 'Go to sleep', NULL, NULL, 'daily');


-- ============================================
-- 6. DAILY DEEN (Islamic Insights)
-- ============================================
CREATE TABLE daily_deen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('verse', 'hadith', 'insight', 'dua', 'fact')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  arabic_text TEXT,
  reflection TEXT,
  category VARCHAR(50),
  shown_on DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO daily_deen (content_type, title, content, source, category, reflection) VALUES
  ('verse', 'On Hardship', 'With hardship comes ease. Verily, with hardship comes ease.', 'Quran 94:5-6', 'patience', 'This verse repeats "with hardship comes ease" twice. Not after — with. Even in the struggle, relief is already there.'),
  ('verse', 'On Capacity', 'God does not burden a soul beyond that it can bear.', 'Quran 2:286', 'strength', 'Whatever you are facing, you have already been given the strength to handle it.'),
  ('hadith', 'On Kindness', 'Kindness is a mark of faith, and whoever is not kind has no faith.', 'Muslim', 'character', 'Faith is not just prayer. It is how you treat people.'),
  ('hadith', 'On Smiling', 'Your smile for your brother is charity.', 'Tirmidhi', 'kindness', 'The smallest acts count. A smile costs nothing but means everything.'),
  ('insight', 'On Intention', 'In Islam, actions are judged by intentions. The same act can be worship or routine depending on why you do it.', NULL, 'mindfulness', 'Even drinking water can be worship if you do it with gratitude.'),
  ('insight', 'On Patience', 'Sabr is not passive waiting. It is active perseverance while trusting the process.', NULL, 'patience', 'Patience does not mean doing nothing. It means doing what you can and leaving the rest to God.'),
  ('dua', 'For Anxiety', 'Hasbunallahu wa ni''mal wakeel — God is sufficient for us, and He is the best disposer of affairs.', 'Quran 3:173', 'anxiety', 'This is what the Prophet said in his most difficult moments. When everything feels like too much.'),
  ('fact', 'The Five Pillars', 'Islam is built on five pillars: faith declaration, prayer, charity, fasting, and pilgrimage. Simple foundations for a whole way of life.', NULL, 'basics', 'It is not complicated. These five things are the foundation everything else builds on.');


-- ============================================
-- 7. DATE IDEAS
-- Restaurant and activity bank
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
  image_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'want_to_do' CHECK (status IN ('want_to_do', 'planned', 'done')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  added_by VARCHAR(20) DEFAULT 'shah',
  completed_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_date_ideas_status ON date_ideas(status, vibe);

-- Sample date ideas
INSERT INTO date_ideas (name, description, vibe, price_level, date_type, notes, added_by) VALUES
  ('Picnic at sunset', 'Pack a basket, find a spot with a view, watch the sun go down together', 'romantic', 1, 'activity', 'Need to find a good spot', 'shah'),
  ('Cook a new cuisine together', 'Pick a country, find a recipe, make a mess in the kitchen', 'cozy', 2, 'at_home', 'Maybe try Pakistani food?', 'shah'),
  ('Bookstore date', 'Pick a book for each other without revealing it until you leave', 'casual', 2, 'activity', NULL, 'shah');


-- ============================================
-- 8. SHARED CALENDAR
-- Events, trips, important dates
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
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule VARCHAR(50),
  added_by VARCHAR(20) DEFAULT 'shah',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_dates ON calendar_events(start_date);


-- ============================================
-- 9. GOALS
-- Personal and shared goals
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
-- 10. DAILY QUESTIONS
-- Conversation starters
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
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample questions
INSERT INTO daily_questions (question, category) VALUES
  ('What is one thing that made you smile today?', 'reflection'),
  ('If we could travel anywhere tomorrow, where would you want to go?', 'dreams'),
  ('What is something you are proud of but rarely talk about?', 'deep'),
  ('What is a small thing I do that you appreciate?', 'love'),
  ('What is on your mind right now?', 'connection'),
  ('If you could master any skill instantly, what would it be?', 'fun'),
  ('What is a fear you have overcome?', 'growth'),
  ('What song reminds you of us?', 'love'),
  ('What is something you want to do together this month?', 'plans'),
  ('What made you fall in love with me?', 'love'),
  ('What is one thing you wish you had more time for?', 'reflection'),
  ('Describe your perfect lazy Sunday.', 'lifestyle'),
  ('What is a dream you have never told anyone?', 'deep'),
  ('What is one thing you want me to know today?', 'connection');


-- ============================================
-- 11. MOMENTS (Photo of the Day)
-- ============================================
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_role VARCHAR(20) NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  moment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moments_date ON moments(moment_date, user_role);


-- ============================================
-- 12. NOTIFICATIONS / ACTIVITY FEED
-- ============================================
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  link_to VARCHAR(100),
  is_read BOOLEAN DEFAULT false,
  for_user VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_unread ON activity_feed(for_user, is_read, created_at DESC);


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get random love message by category
CREATE OR REPLACE FUNCTION get_love_message(msg_category VARCHAR)
RETURNS TABLE (
  id UUID,
  message_type VARCHAR,
  title VARCHAR,
  content TEXT,
  storage_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.message_type, m.title, m.content, m.storage_url
  FROM love_messages m
  WHERE m.category = msg_category AND m.is_active = true
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- Get daily word for language
CREATE OR REPLACE FUNCTION get_daily_word(lang VARCHAR)
RETURNS TABLE (
  id UUID,
  word_native TEXT,
  word_romanized TEXT,
  meaning TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT,
  category VARCHAR
) AS $$
DECLARE
  word_record RECORD;
  today DATE := CURRENT_DATE;
BEGIN
  -- Check if word already assigned today
  SELECT * INTO word_record FROM language_lessons l
  WHERE l.language = lang AND l.shown_on = today AND l.is_active = true
  LIMIT 1;
  
  -- If not, assign one
  IF word_record IS NULL THEN
    SELECT * INTO word_record FROM language_lessons l
    WHERE l.language = lang AND l.is_active = true 
      AND (l.shown_on IS NULL OR l.shown_on < today - 14)
    ORDER BY RANDOM()
    LIMIT 1;
    
    IF word_record IS NOT NULL THEN
      UPDATE language_lessons SET shown_on = today WHERE language_lessons.id = word_record.id;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    word_record.id,
    word_record.word_native,
    word_record.word_romanized,
    word_record.meaning,
    word_record.example_sentence,
    word_record.example_translation,
    word_record.audio_url,
    word_record.category;
END;
$$ LANGUAGE plpgsql;


-- Get daily deen
CREATE OR REPLACE FUNCTION get_daily_deen()
RETURNS TABLE (
  id UUID,
  content_type VARCHAR,
  title VARCHAR,
  content TEXT,
  source TEXT,
  arabic_text TEXT,
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
    deen_record.source,
    deen_record.arabic_text,
    deen_record.reflection,
    deen_record.category;
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


-- Set current status
CREATE OR REPLACE FUNCTION set_status(new_status TEXT, new_location VARCHAR DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  UPDATE status_updates SET is_current = false, ended_at = NOW() WHERE is_current = true;
  
  INSERT INTO status_updates (status, location, is_current)
  VALUES (new_status, new_location, true)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_deen ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (private app for two)
CREATE POLICY "Full access for authenticated" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON status_updates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON love_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON love_letters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON language_lessons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON daily_deen FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON date_ideas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON goals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON goal_milestones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON daily_questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON question_answers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON moments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Full access for authenticated" ON activity_feed FOR ALL USING (auth.role() = 'authenticated');
