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

## GitHub Pages deployment

Live URL (after setup): **https://dptspartan.github.io/us-exe-web/**

### Branch model

| Branch / target | Role |
|-----------------|------|
| `main` | Source code — feature PRs merge here. **Pushing to `main` does not deploy.** |
| GitHub Pages (Actions) | Live site — updated only when you tag `main` or run the workflow manually |

There is no `gh-pages` branch to maintain; GitHub Actions builds `dist` and publishes it directly.

### Release workflow

1. Work on a feature branch → open PR → **merge into `main`**
2. On GitHub: **Releases → Create a new release** (or **Tags → Create tag**)
   - Target: **`main`**
   - Tag: `v1.0.0` (must start with `v`)
3. Push/create the tag → Actions builds that commit and deploys to Pages

Tags on feature branches are **rejected** — the workflow checks that the tagged commit is on `main`.

CLI equivalent (after merge):

```bash
git checkout main && git pull
git tag v1.0.0
git push origin v1.0.0
```

### One-time GitHub setup

1. **Settings → Secrets and variables → Actions** — add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. **Settings → Pages → Build and deployment**
   - Source: **GitHub Actions**

### Other deploy triggers

| Trigger | What gets deployed |
|---------|-------------------|
| Tag `v*` on `main` | The tagged commit |
| Manual (Actions → Run workflow) | Latest `main` |

The app uses `HashRouter`, so routes work on GitHub Pages without extra SPA redirect config.

## Related repos

| Repo | Folder |
|------|--------|
| Mobile (Expo) | `../us-exe-mobile` |
| Backend (Supabase SQL + Edge Functions) | `../us-exe-backend` |

Database migrations and push webhooks live in **us-exe-backend**, not here.
