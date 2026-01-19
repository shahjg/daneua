# D(ane)ua V3 - Major Update

## What's Fixed
- ✅ **Photo camera** - Opens camera directly (no gallery), fixed mirror/flip issue
- ✅ **Learn page** - No more double-loading when switching languages
- ✅ **Delete goals/plans** - Hover on cards to see delete button
- ✅ **Add buttons** - Clearly visible in modals

## What's New

### 📚 Learn Page - Completely Rebuilt
**Urdu Library** (70+ words)
- Love & Endearment
- Greetings & Farewells
- Compliments
- Food & Dining
- Family Terms
- Daily Essentials
- Bad Words 🤬

**Tagalog Library** (60+ words)
- Same categories as Urdu

**Grammar Lessons**
- Urdu SOV structure explained
- Tagalog VSO structure explained
- Examples with breakdowns

**Islamic Module** (4 Levels)
1. Social Phrases (Salam, Inshallah, Mashallah)
2. Dhikr (SubhanAllah, Alhamdulillah, Allahu Akbar)
3. Daily Duas (Bismillah, JazakAllah Khair)
4. Spiritual Concepts (Sabr, Tawakkul, Shukr, Adab)

**Urdu Alphabet**
- All 35 letters
- Name, sound for each letter
- Tap to explore

**Voice Practice**
- Record yourself saying words
- Playback to compare

### 💭 Ideas Page - Google Docs Style
**Folders**
- Business
- Life Planning
- Creative
- Other

**Documents**
- Create documents in folders
- Real-time collaborative editing
- See when partner is typing
- Auto-save

**Quick Notes**
- Post-it style sticky notes
- Quick thoughts & reminders

**Sketch**
- Drawing canvas
- Multiple colors
- Sketch out ideas visually

---

## CRITICAL: First-Time Setup

### Step 1: Create Storage Buckets
1. Supabase → **Storage**
2. **New bucket** → Name: `audio` → Toggle **Public** ON → Create
3. **New bucket** → Name: `photos` → Toggle **Public** ON → Create

### Step 2: Run SQL
1. Supabase → **SQL Editor** → New Query
2. Paste contents of `setup.sql`
3. Run

---

## Deploy
1. Delete everything in local repo
2. Extract zip → copy `daneua-v3-fix3` contents
3. Commit → Push
4. Vercel auto-deploys

## Default PINs
- **Shahjahan:** 1111
- **Dane:** 2222

---

## Coming Soon
- Push notifications
- Voice comparison (native vs your pronunciation)
- Alphabet tracing with drawing
- Lesson progress tracking
