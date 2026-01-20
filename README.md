# D(ane)ua V3-FIX8

Private PWA for couples. PIN auth, real-time sync, editorial design.

## What's Fixed in V3-FIX8

### Home Page
- ✅ Removed status section
- ✅ Removed recent duas section  
- ✅ Notification prompt disappears after enabling
- ✅ Today's Question shows both answers once submitted
- ✅ Dua categories: Love, Prayer, Work Hard, Health, Peace, Gratitude
- ✅ Love note sender

### Learn Page - COMPLETELY REBUILT
- ✅ **Arabic**: 150+ words in 8 categories, full 28-letter alphabet with positions, numbers 0-1000, comprehensive grammar (pronouns, articles, gender, sentences, possessives)
- ✅ **Urdu**: Greetings, love, family, daily phrases
- ✅ **Tagalog**: Greetings, love, family, daily phrases
- ✅ **Islamic Studies**: 4 levels of REAL lessons (not just phrases)
  - Level 1: Six Pillars of Iman, Five Pillars of Islam
  - Level 2: How to perform Wudu, Structure of Salah
  - Level 3: Daily Duas from Sunnah, Character from Prophet's example
  - Level 4: Islamic Marriage & Family, Ethics in Daily Life
- ✅ Bigger, better back buttons throughout
- ✅ Voice recording practice for words

### Plans Page
- ✅ **Date Ideas FIRST** (before Calendar)
- ✅ Original clean design restored
- ✅ Simple checkboxes with edit/delete
- ✅ Calendar with TIME labels on event prompts
- ✅ Multi-day event support (date extender)
- ✅ 2025-2026 holidays integrated (US + Islamic)
- ✅ Countdowns with edit/delete

### Goals Page
- ✅ Original design restored
- ✅ Simple edit/delete added (not overcomplicated)
- ✅ Progress bar with +1, +10, -1 buttons

### Us Page
- ✅ Photo upload fixed with canvas processing
- ✅ Mood selector
- ✅ Voice notes with recording
- ✅ Love letters

### Ideas Page - COMPLETELY REBUILT
- ✅ **Removed quick notes** (useless)
- ✅ Create your own folders
- ✅ Documents with **SAVE BUTTON**
- ✅ Full Google Docs style editor:
  - Bold, Italic, Underline, Strikethrough
  - H1, H2, H3 headers
  - Font size selector
  - Text color picker (9 colors)
  - Highlight colors (6 colors)
  - Bullet and numbered lists
  - Text alignment (left, center, right)
  - Image insertion
  - Block quotes
  - Horizontal rules

## First Time Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your Project URL and anon key

### 2. Create Storage Buckets (CRITICAL!)
In Supabase Dashboard → Storage:
1. Click **New Bucket**
2. Create bucket named `audio` → Toggle **Public** ON
3. Create bucket named `photos` → Toggle **Public** ON

### 3. Run Database SQL
1. Go to **SQL Editor** in Supabase
2. Paste contents of `setup.sql`
3. Click **Run**

### 4. Configure Environment
Create `.env` file:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Deploy
```bash
npm install
npm run build
# Deploy dist/ to Vercel/Netlify
```

Or with Vercel CLI:
```bash
vercel --prod
```

## Default PINs
- **Shahjahan**: 1111
- **Dane**: 2222

## Tech Stack
- React 18 + Vite
- Supabase (Database + Storage + Realtime)
- Tailwind CSS
- PWA with service worker

## Features Summary

| Page | Features |
|------|----------|
| **Home** | Daily question, duas, love notes |
| **Learn** | Arabic (150+ words, grammar, alphabet), Urdu, Tagalog, Islamic Studies (4 levels) |
| **Us** | Moods, voice notes, letters, photo of the day |
| **Plans** | Date ideas, calendar with holidays, countdowns |
| **Goals** | Progress tracking with milestones |
| **Ideas** | Folders, rich text documents with full formatting |
