# D(ane)ua V3-FIX11

## What's New in This Version
- ✅ **Word of the Day** - Featured on Learn page with dual recording
- ✅ **Dual Recording System** - Both Shahjahan & Dane can record vocab practice, visible to each other
- ✅ **Photo of the Day** - Working photo sharing feature in Us page
- ✅ **Live Calendar** - Calendar grid in Plans page with navigation
- ✅ **Ideas Persistence** - Documents auto-save every 3 seconds
- ✅ **Dua Selector** - 6 message categories: Prayer, Affirmation, Love, Sincerity, Gratitude, Peace
- ✅ **Expanded Vocabulary** - Arabic, Urdu, Tagalog with categories

## Features

### Learn Page
- Word of the Day (rotates daily)
- Dual voice recording (practice together)
- Arabic: Greetings, Love, Family, Daily, Islamic phrases
- Urdu: Greetings, Love, Family, Daily phrases
- Tagalog: Greetings, Love, Family, Daily phrases

### Plans Page
- Date Ideas with vibes (Romantic, Casual, Adventure, etc.)
- Live Calendar with holidays
- Add custom events
- Multi-day event support

### Us Page
- How I Feel mood selector with messages
- Voice Notes (record and share)
- Love Letters
- Pic of the Day (daily photos)

### Ideas Page
- Folder organization
- Rich text document editor
- Auto-save functionality
- Word processing features (bold, italic, colors, lists, etc.)

### HomePage
- Countdowns to special events
- Daily Question
- Love Notes
- Dua Selector (6 categories)

## CRITICAL: Setup Required

### Step 1: Create Storage Buckets

1. Go to Supabase → **Storage**
2. Click **New bucket**
3. Name: `audio` → Toggle **Public bucket** = ON → Create
4. Repeat for bucket named `photos`

### Step 2: Run the SQL

Go to Supabase → **SQL Editor** → New Query

Copy and paste the contents of `setup.sql` and run it.

This creates:
- `love_notes` table
- `voice_notes` table
- `word_recordings` table (NEW - for dual voice practice)
- `idea_folders` & `idea_documents` tables
- `moments` table (for Pic of Day)
- Storage policies for audio & photos buckets

## To Deploy

1. GitHub Desktop → delete everything in your local repo
2. Extract zip → copy contents into repo  
3. Commit → Push
4. Wait for Vercel

## Default PINs
- **Shahjahan:** `1111`
- **Dane:** `2222`
