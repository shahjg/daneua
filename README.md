# D(ane)ua V3-FIX11

## What's Fixed in This Version
- ✅ **Learn Page** - Restored original design with Urdu, Tagalog, Islam tabs
- ✅ **Voice Recording** - Fixed recording in Learn page AND Us page (Voice Notes)
- ✅ **Photo Orientation** - Fixed inverted photos with canvas redraw
- ✅ **Ideas Save** - Real-time sync with auto-save (500ms debounce)
- ✅ **Word of the Day** - Consistent per-language daily word
- ✅ **Dual Recording** - Both can record vocab, visible to each other

## Features

### Learn Page (Tabs: Urdu, Tagalog, Islam)
- Word of the Day with voice practice
- Word Library with categories (Love, Greetings, Food, Family, etc.)
- Grammar lessons
- Alphabet browser
- Numbers
- Islamic lessons (4 levels)

### Ideas Page
- Folders for organization  
- Documents with real-time sync
- Quick Notes section
- Sketch canvas feature
- Auto-save while typing

### Us Page
- How I Feel mood selector
- Voice Notes (working!)
- Love Letters
- Pic of the Day (fixed orientation!)

### Plans Page
- Date Ideas with vibes
- Live Calendar with holidays
- Multi-day event support

## CRITICAL: Run This SQL

Go to Supabase → **SQL Editor** → New Query

```sql
-- Add quick_notes table
CREATE TABLE IF NOT EXISTS quick_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  added_by TEXT NOT NULL CHECK (added_by IN ('shah', 'dane')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all quick notes" ON quick_notes FOR ALL USING (true);

-- Add sketches column to idea_documents
ALTER TABLE idea_documents ADD COLUMN IF NOT EXISTS sketches JSONB DEFAULT '[]';
ALTER TABLE idea_documents ADD COLUMN IF NOT EXISTS last_edited_by TEXT;

-- Enable realtime for idea_documents
ALTER PUBLICATION supabase_realtime ADD TABLE idea_documents;

-- Word recordings table
CREATE TABLE IF NOT EXISTS word_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word_key TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('shah', 'dane')),
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(word_key, user_role)
);
ALTER TABLE word_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all word recordings" ON word_recordings FOR ALL USING (true);
```

## Storage Buckets Required

1. Go to Supabase → **Storage**
2. Create bucket `audio` - set to PUBLIC
3. Create bucket `photos` - set to PUBLIC

## Default PINs
- **Shahjahan:** `1111`
- **Dane:** `2222`
