# D(ane)ua V3 - Fixed

## What's Fixed
- ✅ Voice notes now work on iOS (better codec support)
- ✅ Voice notes are shared (both can see/hear each other's)
- ✅ Photos upload on iOS
- ✅ Add Date/Goal buttons are clearly visible
- ✅ Letters have clear submit button
- ✅ Daily question stays same all day
- ✅ Both can see each other's answers

## CRITICAL: Do This First

### Step 1: Create Storage Buckets

1. Go to Supabase → **Storage**
2. Click **New bucket**
3. Name: `audio`
4. Toggle **Public bucket** = ON
5. Click **Create**
6. Repeat for bucket named `photos`

### Step 2: Run the SQL

Go to Supabase → **SQL Editor** → New Query

Copy and paste the contents of `setup.sql` and run it.

This will:
- Create the `voice_notes` table
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

## Troubleshooting

### Voice notes still not sending on iOS?
- Make sure `audio` bucket exists and is **Public**
- Run the SQL to create policies
- Check browser console for errors

### Photos not uploading?
- Make sure `photos` bucket exists and is **Public**
- Run the SQL to create policies

### "voice_notes table doesn't exist" error?
- Run the setup.sql in SQL Editor
