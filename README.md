# D(ane)ua 💚

A private Progressive Web App for two. Built with love.

## Features

- **Mood Dashboard** - 4 mood buttons that surface personalized messages
- **Growth Module** - Daily Urdu & Tagalog words with audio, Daily Deen insights
- **Live Utility** - Real-time status ticker, shared to-dos, calendar
- **Media Vault** - Pre-recorded audio/video messages

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS (Mobile-first)
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **Deployment**: PWA (installable on iOS/Android)

---

## Quick Start

### 1. Clone & Install

```bash
cd daneua
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema in `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment (Vercel)

### Option A: Git Deploy
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Option B: CLI Deploy
```bash
npm install -g vercel
vercel --prod
```

Add env vars in Vercel dashboard.

---

## PWA Installation

### iOS (Safari)
1. Open the deployed URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name it "D(ane)ua" and tap Add

### Android (Chrome)
1. Open the deployed URL in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home Screen" or "Install App"

---

## Adding Content

### Mood Messages

In Supabase, go to **Table Editor > mood_messages**:

```sql
INSERT INTO mood_messages (mood, message_type, content, title) VALUES
  ('sad', 'text', 'Your custom message here...', 'Title');
```

For audio/video messages:
1. Upload to Supabase Storage
2. Get the public URL
3. Insert with `message_type: 'audio'` or `'video'` and `storage_url`

### Urdu/Tagalog Words

```sql
INSERT INTO language_words (language, word_native, word_romanized, meaning_english, category) VALUES
  ('urdu', 'محبت', 'Mohabbat', 'Love', 'love');
```

To add audio pronunciations:
1. Record voice notes
2. Upload to Supabase Storage > `audio/` bucket
3. Update the `audio_url` field

### Daily Deen

```sql
INSERT INTO daily_deen (content_type, title, content, source, reflection, category) VALUES
  ('verse', 'Title Here', 'Content here...', 'Quran X:XX', 'Your note...', 'patience');
```

### Status Updates

```sql
SELECT set_current_status('At the Gym 💪', '💪', 'Home');
```

Or update directly in Table Editor.

---

## Project Structure

```
daneua/
├── public/
│   ├── manifest.json      # PWA config
│   ├── sw.js              # Service worker
│   └── offline.html       # Offline fallback
├── src/
│   ├── components/
│   │   ├── MoodDashboard.jsx
│   │   ├── GrowthModule.jsx
│   │   ├── LiveUtility.jsx
│   │   ├── MediaVault.jsx
│   │   └── Navigation.jsx
│   ├── lib/
│   │   └── supabase.js    # Database client
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase-schema.sql    # Database schema
└── tailwind.config.js     # Color palette
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Evergreen | `#05472A` | Primary, headers |
| Ivory | `#FFFFF0` | Background |
| Blush | `#F8D7DA` | Soft accents |
| Heart | `#8B1E3F` | Emotional accents |

---

## Creating Icons

For the PWA icons, create these sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Place in `public/icons/`

Simple icon idea: Evergreen background with a white heart or "D" letter.

---

## Future Enhancements

- [ ] Push notifications for new messages
- [ ] Offline mood submissions with background sync
- [ ] Photo gallery
- [ ] Voice notes you can record for her
- [ ] Anniversary countdown
- [ ] Shared music playlist integration

---

Made with 💚 for Dane
