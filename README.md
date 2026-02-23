# Dane's Chai

## Replacing D(ane)ua — Step by Step

### 1. Delete old files in your GitHub repo
Delete everything EXCEPT `.git` folder (hidden). Or just replace all files.

### 2. Copy these files into the repo
```
your-repo/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── supabase.js
├── .env.example
├── index.html
├── package.json
├── setup.sql
├── vite.config.js
└── README.md
```

### 3. Update your .env (already exists from D(ane)ua)
Same keys, same values — nothing changes:
```
VITE_SUPABASE_URL=https://your-existing-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-existing-anon-key
```

### 4. Run the new schema in Supabase
Go to SQL Editor → New Query → paste `setup.sql` → Run.
This adds the new tables alongside your old ones. Nothing gets deleted.

### 5. Push to GitHub
```bash
git add .
git commit -m "Dane's Chai v13"
git push
```

### 6. Vercel auto-deploys
Same URL, same everything. Vercel picks up the push and redeploys.

### 7. Send Dane the link
She opens in Safari → Share → Add to Home Screen → done.

---

## Files You Can Delete (old D(ane)ua stuff)
- `postcss.config.js` — not needed (no Tailwind)
- `tailwind.config.js` — not needed
- `src/HomePage.jsx` — replaced by App.jsx
- `src/components/*` — all replaced
- `src/lib/*` — replaced by supabase.js
- `src/index.css` — not needed (inline styles)

## What Stays
- Your `.env` file with Supabase keys
- Your `.git` folder
- Vercel connection
