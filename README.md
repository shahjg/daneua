# D(ane)ua V3 - Fixed Update

## What's Fixed

### General
- ✅ All pages centered properly
- ✅ Modals no longer cut off - can scroll and see all buttons
- ✅ Settings button on Home page to logout/switch users
- ✅ Name changed to "Shahjahan" everywhere
- ✅ Time-based greeting (Good morning/afternoon/evening/night)
- ✅ Removed quick actions (they weren't working)

### Home
- ✅ Centered greeting and content
- ✅ Settings gear icon to logout/switch users
- ✅ Send Dua shows confirmation for 5 seconds
- ✅ Countdowns centered and working

### Learn
- ✅ All content centered
- ✅ "Deen" renamed to "Islam"
- ✅ Recording button to practice pronunciation
- ✅ Can send recordings to each other
- ✅ Comments section for each word

### Us
- ✅ Centered and more romantic design
- ✅ Softer gradients on mood cards
- ✅ Voice notes tab to send voice messages
- ✅ Write a letter button works
- ✅ Photo upload works (click add photo)
- ✅ "Moments" renamed to "Pic of the Day"

### Plans
- ✅ Add Date Idea modal scrollable, button visible
- ✅ Add Event modal scrollable, button visible
- ✅ Shows who added each date/event
- ✅ "Done" changed to "Complete"

### Goals
- ✅ Header centered
- ✅ Add Goal modal scrollable, button visible
- ✅ Progress circles working

## How to Update

### Option 1: Replace Everything (Recommended)
1. Open GitHub Desktop
2. Delete all files in your local repo folder
3. Copy all files from this zip into the folder
4. Commit and push

### Option 2: Replace Specific Files
Replace these files in your repo:
- `src/App.jsx`
- `src/pages/HomePage.jsx`
- `src/pages/LearnPage.jsx`
- `src/pages/UsPage.jsx`
- `src/pages/PlansPage.jsx`
- `src/pages/GoalsPage.jsx`
- `src/pages/LoginPage.jsx`
- `src/components/Navigation.jsx`
- `src/context/AuthContext.jsx`

## After Deploying

Run this SQL in Supabase to clean up preset data and update names:

```sql
-- Update user names
UPDATE users SET name = 'Shahjahan' WHERE role = 'shah';
UPDATE users SET name = 'Dane' WHERE role = 'dane';

-- Remove preset date ideas
DELETE FROM date_ideas;

-- Remove preset countdowns (add your own after)
DELETE FROM countdowns;

-- Add your countdown
INSERT INTO countdowns (title, target_date, emoji, is_active) VALUES
  ('Summer Goals', '2026-06-01', '☀️', true);

-- Update your PINs
UPDATE users SET pin_hash = 'your-4-digits' WHERE role = 'shah';
UPDATE users SET pin_hash = 'her-4-digits' WHERE role = 'dane';
```

Or just run the `cleanup-and-setup.sql` file included.

## To Add Your Own Love Messages

In Supabase, go to the `love_messages` table and update/add rows:

```sql
-- Example: Add your own miss_you message
INSERT INTO love_messages (mood, message_type, content) VALUES
  ('miss_you', 'text', 'Your custom message here');
```

Moods available: `miss_you`, `need_encouragement`, `stressed`, `anxious`, `happy`, `loved`
