# D(ane)ua V3 - Fix 7

Private PWA for couples. PIN auth, real-time sync, editorial design.

## What's Fixed (V3-FIX7)

- **In-app notifications** - No more browser alerts or Vercel prompts. All errors/success shown as toast notifications
- **Photo orientation** - Canvas processing fixes iOS photo flip/mirror issues
- **Delete modals** - All delete actions use in-app confirmation modals
- **Edit functionality** - Goals, Plans, Calendar events all have edit with delete inside
- **Live Calendar** - Visual calendar grid with date picker
- **Today's Question** - Both answers visible once submitted
- **Dua categories** - Choose from Love, Prayer, Work Hard, Health, Peace, Gratitude
- **Ideas redesign** - Google Docs style with user-created folders, documents, sketches

## What's New

### Learn Page
- Urdu: 100+ words, grammar, alphabet (swipeable), numbers, voice recording
- Tagalog: Full library, alphabet, numbers, voice recording  
- Islam: Word of day, 4-level lessons, Arabic alphabet, Arabic numbers
- Voice Practice: Record yourself saying words, see partner's recordings

### Ideas Page  
- Create your own folders
- Document editor with real-time sync
- Sketch/drawing on documents
- Quick notes section

### Plans Page
- Visual calendar grid (tap any date to add event)
- Edit events with delete option
- Date ideas with checkboxes
- Countdowns with edit/delete

### Goals Page
- Full edit/delete modal
- Milestones with progress bar

## First Time Setup

### 1. Create Storage Buckets (CRITICAL)
In Supabase Dashboard:
1. Go to **Storage**
2. Click **New Bucket**
3. Create bucket named `audio` - Toggle **Public** ON
4. Create bucket named `photos` - Toggle **Public** ON

### 2. Run Database SQL
1. Go to **SQL Editor** in Supabase
2. Paste contents of `setup.sql`
3. Click **Run**

### 3. Deploy
```bash
# Extract zip to your local repo
# Then:
git add .
git commit -m "V3-FIX7"
git push
```
Vercel auto-deploys on push.

## Default PINs
- Shahjahan: 1111
- Dane: 2222

## Features

- **Home**: Status updates, daily question (both answers visible), dua categories, love notes
- **Plans**: Live calendar, date ideas, countdowns
- **Goals**: Milestones with progress tracking
- **Us**: Moods, voice notes, love letters, pic of the day
- **Learn**: Urdu/Tagalog/Islam with voice practice
- **Ideas**: Folders, documents, sketches, quick notes

## Tech Stack
- React + Vite
- Supabase (DB + Auth + Storage + Realtime)
- Tailwind CSS
- PWA with service worker
