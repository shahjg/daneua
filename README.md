# D(ane)ua V3 - Fixes

## What's Fixed
- ✅ Modals no longer cut off on any screen size
- ✅ Countdowns can be added and deleted from the app
- ✅ Name changed to "Shahjahan" everywhere
- ✅ Better error messages for file uploads
- ✅ Time-based greeting (Good morning/afternoon/evening)
- ✅ Settings button to logout/switch users

## Recording Not Working?

You need to create storage buckets in Supabase:

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New bucket**
3. Create a bucket named exactly: `audio`
4. Set it to **Public**
5. Create another bucket named exactly: `photos`
6. Set it to **Public**

Without these buckets, recording uploads will fail.

## Default PINs
- Shahjahan: `1111`
- Dane: `2222`

## To Change PINs

Run this in Supabase SQL Editor:
```sql
UPDATE users SET pin_hash = 'your-4-digits' WHERE role = 'shah';
UPDATE users SET pin_hash = 'her-4-digits' WHERE role = 'dane';
```

## To Update Your Name in Database

```sql
UPDATE users SET name = 'Shahjahan' WHERE role = 'shah';
```

## To Deploy

1. Open GitHub Desktop
2. Delete all files in local repo
3. Copy all files from this folder into repo
4. Commit and push
5. Wait for Vercel to rebuild
