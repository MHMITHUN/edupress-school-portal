# Deployment Guide

EduPress deploys to Vercel with **zero configuration** and upgrades in
place — MongoDB and WordPress are optional add-ons, never prerequisites.

## 1. Zero-env Vercel deployment (the demo)

1. Push the repository to GitHub (the repo is a standalone git project).
2. In Vercel: **Add New → Project → Import** the repository.
   Framework preset **Next.js** is detected; defaults are fine.
3. Deploy. No environment variables needed.

What you get: the full public portal **and** the full admin CMS running on
the seeded in-memory demo store. The admin UI honestly shows the
**"MongoDB demo"** badge, and a public banner labels demo content. Data
resets on every cold start.

**Before sharing the CMS login publicly**, set `SESSION_SECRET` (Project →
Settings → Environment Variables):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Without it a demo fallback secret signs the cookies — fine for a personal
demo, not for anything real.

## 2. Environment matrix

| Configuration      | Env vars                                                                         | Content source                                       | Admin badge                                |
| ------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| Demo (default)     | none                                                                             | In-memory seeded store                               | MongoDB demo                               |
| Real MongoDB       | `MONGODB_URI` (+ `MONGODB_DB_NAME`, `SESSION_SECRET`)                            | MongoDB collections                                  | MongoDB                                    |
| Headless WordPress | `CMS_MODE=wordpress`, `WORDPRESS_BASE_URL` (+ auth pair, optional `MONGODB_URI`) | WP REST for notices/events; local store for the rest | WordPress headless                         |
| Broken WP config   | `CMS_MODE=wordpress`, no URL                                                     | —                                                    | Refuses to boot: `CMS configuration error` |

## 3. Optional: real MongoDB (Atlas or self-hosted)

1. Create a cluster (e.g. MongoDB Atlas free tier) and copy the connection
   string.
2. In Vercel set:
   - `MONGODB_URI` — the connection string
   - `MONGODB_DB_NAME` — e.g. `edupress_portal` (default)
   - `SESSION_SECRET` — generated as above
3. Seed once from any machine with network access to the cluster:

   ```bash
   MONGODB_URI="<connection string>" npm run seed
   ```

   The seed is idempotent: it ensures all indexes and upserts every row by
   its natural key (`$setOnInsert`), so re-running never overwrites edits.

4. Redeploy. The badge switches to **MongoDB**; content now persists.

## 4. Optional: headless WordPress mode

1. Install the bundled `edupress-notice-board` plugin on a WordPress site
   and create an Application Password — full walkthrough in
   [wordpress-integration.md](wordpress-integration.md).
2. In Vercel set `CMS_MODE=wordpress`, `WORDPRESS_BASE_URL`,
   `WORDPRESS_USERNAME`, `WORDPRESS_APP_PASSWORD` (and optionally
   `MONGODB_URI` for the local half of the split).
3. Redeploy. Notices and events now come from WordPress; the badge shows
   **WordPress headless**.

Failure modes are honest by design: `CMS_MODE=wordpress` without a URL
fails at boot with `CMS configuration error`; an unreachable WordPress
raises the public error boundary — never fabricated content.

## 5. Other platforms

Any Node host works (`npm run build && npm start`, Node 22+):

```bash
npm ci
npm run build
PORT=3002 npm start      # PORT is respected by `next start`
```

Set the same environment variables as above; nothing is Vercel-specific
(there is no middleware, no edge config, no ISR coupling — content pages
are `force-dynamic` and read the store per request).

## 6. CI

`.github/workflows/ci.yml` runs on every push/PR: **lint → typecheck →
unit tests → production build** (Node 22, `npm ci`). E2E (Playwright) is
run locally with `npm run test:e2e` — it boots the dev server on port 3002
itself.

## 7. Pre-deployment checklist

- [ ] `SESSION_SECRET` set (anything beyond a personal demo).
- [ ] Demo accounts rotated or removed if you keep the demo store public.
- [ ] `npm run lint && npm run typecheck && npm run test:run && npm run build`
      green locally.
- [ ] Seed run once against the production database (if using MongoDB).
- [ ] Admin badge shows the mode you intended (it cannot lie).
