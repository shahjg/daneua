-- ═══════════════════════════════════════════════════════
-- DANE'S CHAI — Supabase Schema
-- Run this in your Supabase SQL Editor (one time)
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════

-- Ask Anything — Q&A between Dane and Shah
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text,
  asked_by uuid references auth.users(id),
  answered boolean default false,
  answered_at timestamptz,
  created_at timestamptz default now()
);

-- Our Words — love archive
create table if not exists our_words (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  from_name text not null, -- 'Shah' or 'Dane'
  created_at timestamptz default now()
);

-- Looking Forward — milestones
create table if not exists milestones (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  when_text text default 'TBD',
  done boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  subscription jsonb not null,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Storytime — uploaded story audio/entries
create table if not exists stories (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  duration text,
  media_url text, -- URL from Supabase Storage
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- First Steps — uploaded video entries
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  duration text,
  media_url text, -- URL from Supabase Storage
  thumbnail_color text default '#0B6B48',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table questions enable row level security;
alter table our_words enable row level security;
alter table milestones enable row level security;
alter table push_subscriptions enable row level security;
alter table stories enable row level security;
alter table videos enable row level security;

-- Policies: both users can read/write everything (it's a couple's app)
-- For questions
create policy "Anyone can read questions" on questions for select using (true);
create policy "Authenticated can insert questions" on questions for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update questions" on questions for update using (auth.role() = 'authenticated');

-- For our_words
create policy "Anyone can read words" on our_words for select using (true);
create policy "Authenticated can insert words" on our_words for insert with check (auth.role() = 'authenticated');

-- For milestones
create policy "Anyone can read milestones" on milestones for select using (true);
create policy "Authenticated can manage milestones" on milestones for all using (auth.role() = 'authenticated');

-- For stories
create policy "Anyone can read stories" on stories for select using (true);
create policy "Authenticated can manage stories" on stories for all using (auth.role() = 'authenticated');

-- For videos
create policy "Anyone can read videos" on videos for select using (true);
create policy "Authenticated can manage videos" on videos for all using (auth.role() = 'authenticated');

-- For push subscriptions
create policy "Users manage own subscriptions" on push_subscriptions for all using (auth.uid() = user_id);

-- Enable realtime for shared tables
alter publication supabase_realtime add table questions;
alter publication supabase_realtime add table our_words;
alter publication supabase_realtime add table milestones;

-- Storage bucket for media (videos, audio, voice notes)
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage policy: authenticated users can upload
create policy "Authenticated can upload media" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "Anyone can view media" on storage.objects
  for select using (bucket_id = 'media');

-- ═══════════════════════════════════════════════════════
-- Seed data — initial milestones
-- ═══════════════════════════════════════════════════════
insert into milestones (title, when_text, done, sort_order) values
  ('Learn each other''s language', 'This year', false, 1),
  ('Cook biryani together', 'Ramadan', false, 2),
  ('Visit Pakistan', 'InshaAllah', false, 3),
  ('Visit Philippines', 'InshaAllah', false, 4),
  ('Eid al-Fitr together', 'March 2026', false, 5),
  ('Meet the extended family', 'Summer', false, 6),
  ('Move in together', 'InshaAllah', false, 7),
  ('Nikkah', 'InshaAllah', false, 8);

-- Seed data — initial Our Words entries
insert into our_words (text, from_name) values
  ('You''re my favourite part of every single day.', 'Shah'),
  ('I prayed for you before I even knew your name.', 'Shah'),
  ('Mahal kita, meri jaan.', 'Dane'),
  ('The way you say Bismillah before eating — I notice every time.', 'Dane');

-- Seed data — initial Ask Anything
insert into questions (question, answer, answered) values
  ('Can I celebrate Christmas AND Eid?', 'Of course. Christmas is your family''s tradition, Eid is mine. We do both. Love isn''t about choosing sides.', true),
  ('Why 5 prayers a day?', 'Think of it like checking in. Dawn, noon, afternoon, sunset, night. Five pauses to breathe and remember what matters. It''s my rhythm.', true),
  ('Will your family accept me?', 'They care that I''m happy and that you''re kind. Say Assalamu Alaikum, eat Ammi''s food. You''re already in.', true);
