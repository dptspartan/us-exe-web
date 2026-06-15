# Us.exe web

React + Vite dashboard for couples — sticky notes, photo wall, jam sessions, moods, letters, and more.

## Setup

1. Copy env vars (same Supabase project as mobile):

   ```bash
   # .env.local
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

## Related repos

| Repo | Folder |
|------|--------|
| Mobile (Expo) | `../us-exe-mobile` |
| Backend (Supabase SQL + Edge Functions) | `../us-exe-backend` |

Database migrations and push webhooks live in **us-exe-backend**, not here.
