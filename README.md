# D(ane)ua V3 - Fixed

## What's Fixed
- ✅ Pic of Day → Opens camera first, then gallery option
- ✅ Delete goals and date ideas (hover to see delete button)
- ✅ Word of the day stays same per language all day
- ✅ "Explore" section redesigned with vibe-based categories
- ✅ Voice notes work and are shared between both users
- ✅ Letters have clear submit button
- ✅ Add Date/Goal buttons clearly visible
- ✅ **NEW: Ideas tab** - Collaborative notes like Google Docs but cute!

## New Features

### Ideas Tab 💭
- Post-it style notes with colors
- Categories: General, Travel, Home, Date Ideas, Bucket List, Food, Gift Ideas
- Pin important ideas
- Mark ideas as complete
- Voice ideas (record & save)
- Add photos to ideas
- Live typing indicator (see when partner is adding)

## CRITICAL: Do This First

### Step 1: Create Storage Buckets

1. Go to Supabase → **Storage**
2. Click **New bucket**
3. Name: `audio` → Toggle **Public bucket** = ON → Create
4. Repeat for bucket named `photos`

### Step 2: Run the SQL

Go to Supabase → **SQL Editor** → New Query

Copy and paste the contents of `setup.sql` and run it.

This will:
- Create `voice_notes` table
- Create `shared_ideas` table (for Ideas feature)
- Set up storage policies
- Update your name to "Shahjahan"

## To Deploy

1. GitHub Desktop → delete everything in your local repo
2. Extract zip → copy `daneua-v3-fix3` contents into repo  
3. Commit → Push
4. Wait for Vercel

## Default PINs
- **Shahjahan:** `1111`
- **Dane:** `2222`

## Upcoming Features (Not in this release)
- Push notifications for Duas and updates
- Lesson levels and progress tracking
- More comprehensive language lessons (Gemini's suggestions)
- Video support in Ideas
