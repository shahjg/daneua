-- ============================================
-- Run this to clean up preset data and update names
-- ============================================

-- Update user names
UPDATE users SET name = 'Shahjahan' WHERE role = 'shah';
UPDATE users SET name = 'Dane' WHERE role = 'dane';

-- Remove preset date ideas
DELETE FROM date_ideas;

-- Remove preset countdowns (add your own after)
DELETE FROM countdowns;

-- Clear any preset status
DELETE FROM status_updates;
INSERT INTO status_updates (status, status_type, emoji, is_current) VALUES
  ('Working on something special', 'focus', '💻', true);

-- Clear preset moments
DELETE FROM moments;

-- Clear preset letters
DELETE FROM love_letters;

-- Clear preset dua requests
DELETE FROM dua_requests;

-- Clear preset calendar events  
DELETE FROM calendar_events;

-- Clear preset goals
DELETE FROM goal_milestones;
DELETE FROM goals;

-- Clear preset activity
DELETE FROM activity_feed;

-- ============================================
-- Now add your own countdowns
-- ============================================
INSERT INTO countdowns (title, target_date, emoji, is_active) VALUES
  ('Summer Goals', '2026-06-01', '☀️', true);
-- Add more as needed:
-- INSERT INTO countdowns (title, target_date, emoji, is_active) VALUES
--   ('Pakistan Trip', '2026-03-15', '🇵🇰', true);


-- ============================================
-- Update PINs (IMPORTANT - change these!)
-- ============================================
-- UPDATE users SET pin_hash = 'your-4-digits' WHERE role = 'shah';
-- UPDATE users SET pin_hash = 'her-4-digits' WHERE role = 'dane';
