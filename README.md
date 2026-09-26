# EduPress — Headless School Portal and CMS

A complete public portal and admin CMS for **Padma Model College** — a
fictional Dhaka college (est. 1998, motto _"Knowledge, Discipline,
Character"_) — with an optional **headless WordPress** content layer and a
companion custom WordPress plugin. Next.js 16 App Router, React 19,
TypeScript (strict), Tailwind CSS v4, zod, MongoDB — and it runs with
**zero configuration**: no database, no WordPress server required.

> Every person, place, notice and mark in this project is fictional demo
> content written for teaching purposes. Nothing here represents a real
> institution.

## Live Demo

**Placeholder** — the deployment URL will be added here when the project is
published to Vercel (see [docs/deployment.md](docs/deployment.md)). The app
is Vercel-ready with no environment variables: it boots on the seeded
in-memory demo store and honestly labels "MongoDB demo" mode in the admin
UI.

## Screenshots

Captured with `scripts/screenshots.mjs` (Playwright, desktop 1280x800 and
mobile 390x844) into [`docs/screenshots/`](docs/screenshots/):

| File                   | Page                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `01-home.png`          | Home — hero, notices, events, statistics (1280x800)        |
| `02-main-feature.png`  | Notice board — search, category chips, filters active      |
| `03-results.png`       | Result verification — GPA card and subject marks           |
| `04-mobile.png`        | Home at phone width (390x844)                              |
| `05-admin.png`         | Admin CMS dashboard with the honest CMS mode badge         |

## Problem

A school or college needs a public website (notices, admission
information, teacher directory, results) and a private back office where
non-technical staff manage that content. Real institutions often already
run WordPress, while modern teams want a fast, accessible front end.
Building both worlds usually means either a slow dated portal or a custom
CMS nobody asked for.

This project shows the engineering answer: one Next.js application whose
entire content layer sits behind a single interface with interchangeable
backends — MongoDB (or a zero-setup demo store) by default, WordPress REST
in headless mode — plus a custom WordPress plugin that makes the WordPress
side speak the portal's language.

## Educational Objective

This is a teaching lab project. Working through it demonstrates:

- **Content architecture** — modelling notices, events, teachers,
  departments, result sessions, gallery items and downloads as typed,
  validated documents (zod at every boundary).
- **The adapter pattern in production** — one `CmsStore` interface, three
  implementations (MongoDB, in-memory demo, WordPress REST), chosen by
  environment.
- **Headless WordPress** — consuming and writing the WP REST API with a
  custom post type, custom REST route and Application Passwords.
- **Custom plugin development** — a real PHP plugin (CPT, taxonomy,
  metaboxes, REST endpoint, shortcode, nonces, capabilities, i18n, clean
  uninstall) living beside, but never inside, the Next.js runtime.
- **Authentication and authorization** — scrypt password hashing, signed
  stateless sessions, server-side role guards (no client-trusted UI).
- **Accessible, institutional UI engineering** — App Router server
  components, streaming-free honest error/empty/loading states, WCAG AA
  focus and contrast.

## Features

### Public portal (14 pages)

- **Home** — hero with live site settings, current announcement banner,
  academic quick links, latest notices, upcoming events, departments,
  principal's section, statistics and important resources.
- **Notice board** — title search, category filter chips, published-date
  range filter, featured notice pinned first, 10-per-page pagination,
  attachments (metadata), **printable view** per notice, and an expiry rule
  (published notices past `expiryAt` disappear automatically; drafts never
  appear).
- **Academic departments** — directory + per-department profiles with
  faculty and related downloads.
- **Teacher directory** — filters by department, designation and subject;
  per-teacher profiles.
- **Result verification** — student ID + exam + year lookup that searches
  **published sessions only**, returns only the queried student's card
  (never a class list), with GPA/grade and subject-wise marks.
- **Admission** — requirements, step-by-step process, important dates, fee
  structure, FAQ accordion, downloadable forms list and an inquiry form.
- **Events** — upcoming/past split with detail pages (status + date aware).
- **Gallery** — category filter, generated CSS-art tiles (no external
  images), accessible lightbox.
- **Downloads** — grouped document catalogue with an honest "demo portal
  does not host real files" policy.
- **About, Principal's message, Class routine** (static demo dataset,
  honestly labeled), **Contact** — info cards + zod-validated inquiry form
  feeding the CMS inbox.
- Custom **404** and **error** pages; every page works without JavaScript
  for its core read flows (native GET forms, server rendering).

### Admin CMS (`/admin`)

- **Dashboard** — per-collection count cards (all true counts from the
  active store), latest notices, inquiry inbox summary and an honest
  **CMS mode badge** (MongoDB demo / MongoDB / WordPress headless).
- **Managers** for notices (every field: category, priority, featured pin,
  publish/unpublish, expiry, attachment metadata, delete-with-confirm),
  events, teachers, departments, result sessions (repeatable student-row
  editor, whole-array replace semantics), gallery, downloads and the
  inquiry inbox (mark read).
- **Site settings** (admin-only): college name, tagline, announcement
  banner, contact block and the principal's message — live on the public
  site immediately.
- All mutations are **server actions** validated with zod and per-field
  error messages; roles are re-checked server-side on every action.

### Headless WordPress layer

- `CMS_MODE=wordpress` serves **notices and events** from any WordPress
  site via the WP REST API (plugin route first, core CPT fallback);
  everything else stays in the local store — a documented, deliberate
  split (see [docs/wordpress-integration.md](docs/wordpress-integration.md)).
- Writes to WordPress use **Application Passwords** (Basic auth).
- Missing WordPress env vars are an honest startup error; WordPress being
  unreachable is an honest error page — the app never fabricates content.
- **Custom plugin** `wordpress-plugin/edupress-notice-board/` (PHP):
  `edupress_notice` CPT + `edupress_notice_category` taxonomy + meta boxes
  (priority, featured, expiry, attachment) + normalized REST route
  `GET/POST /wp-json/edupress/v1/notices` + `[edupress_notice_board]`
  shortcode — with nonces, capability checks, sanitization, escaping and a
  clean uninstall.

## Technology Stack

| Layer            | Technology                                     | Version          |
| ---------------- | ---------------------------------------------- | ---------------- |
| Framework        | Next.js (App Router)                           | 16.3.6           |
| UI               | React                                          | 19.3.0           |
| Language         | TypeScript (strict)                            | 5.9.3            |
| Styling          | Tailwind CSS (v4 `@theme`, no config JS)       | ^4.3.3           |
| Validation       | zod                                            | ^4.6.5           |
| Database         | MongoDB Node.js driver                         | ^7.6.0           |
| Icons            | lucide-react                                   | ^1.48.0          |
| Fonts            | Source Serif 4 + Inter (next/font/google)      | —                |
| Unit tests       | Vitest + happy-dom + Testing Library           | ^5.0.2           |
| E2E tests        | Playwright                                     | 1.63.0           |
| Lint / format    | ESLint (eslint-config-next) / Prettier         | ^9.39.0 / ^3.9.9 |
| WordPress plugin | PHP 7.4+ (standalone, never in the Next build) | —                |

No ORM — the MongoDB driver is used directly behind the store interfaces.
No `middleware.ts` — every protected surface guards itself server-side.

## Architecture

```text
                       ┌──────────────────────────────────────────┐
                       │        Next.js 16 App Router app         │
                       │  (public portal + /admin CMS, RSC)       │
                       └───────────────────┬──────────────────────┘
                                           │  one interface:
                                           │  CmsStore (src/lib/cms/content-store.ts)
                                           │  Users store (src/lib/db/index.ts)
                    ┌──────────────────────┼───────────────────────────────┐
                    ▼                      ▼                               ▼
        ┌────────────────────┐  ┌────────────────────┐        ┌────────────────────────┐
        │ CMS_MODE=mongodb   │  │ CMS_MODE=mongodb   │        │ CMS_MODE=wordpress     │
        │ (default)          │  │ + MONGODB_URI      │        │ + WORDPRESS_BASE_URL   │
        │ DemoCmsStore       │  │ MongoCmsStore      │        │ WordPressCmsStore      │
        │ (in-memory, lazily │  │ (real collections  │        │ ┌────────────────────┐ │
        │  seeded, resets on │  │  + indexes)        │        │ │ WP REST adapter    │ │
        │  restart)          │  │                    │        │ │ notices + events   │ │
        └────────────────────┘  └────────────────────┘        │ └─────────┬──────────┘ │
                                                               │           │ composes   │
                                                               │           ▼            │
                                                               │  local Mongo/Demo store │
                                                               │  (everything else)      │
                                                               └───────────┬────────────┘
                                                                           │ WP REST API
                                                                           ▼
                                                               ┌────────────────────────┐
                                                               │ WordPress site +       │
                                                               │ edupress-notice-board  │
                                                               │ plugin (PHP, separate  │
                                                               │ deliverable)           │
                                                               └────────────────────────┘
```

**The "works without WordPress" principle (spec 17.9):** the default path
never touches WordPress. `getCmsStore()` resolves the backend from the
environment; with nothing configured the seeded in-memory demo store serves
the whole portal — which is exactly how the Vercel demo runs. WordPress is
an _add-on_, activated by env vars, never a dependency.

```text
src/lib/cms/content-store.ts        the CmsStore interface (single contract)
src/lib/cms/index.ts                getCmsStore() resolver + pure env matrix
src/lib/cms/mongodb/store.ts        MongoCmsStore    (MONGODB_URI set)
src/lib/cms/mongodb/demo-store.ts   DemoCmsStore     (in-memory fallback)
src/lib/cms/wordpress/store.ts      WordPressCmsStore (CMS_MODE=wordpress)
src/lib/cms/wordpress/rest.ts       WP REST client (8s timeout, basic-auth writes)
src/lib/cms/wordpress/mapping.ts    pure WP JSON <-> domain mappers (unit-tested)
src/lib/db/                         users + auth store (same dual-mode pattern)
src/lib/auth/                       scrypt hashing + HMAC session + guards
src/lib/validation/                 zod schemas (auth, inquiry, every CMS form)
```

The WordPress plugin relationship and field mapping are documented in
[docs/wordpress-integration.md](docs/wordpress-integration.md), the
collections in [docs/database-schema.md](docs/database-schema.md).

## Database Model

MongoDB database `edupress_portal` (or the in-memory demo equivalents).
All documents are validated by zod schemas in `src/lib/db/types.ts`.

| Collection       | Key fields                                                                                                                                                     | Indexes                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `users`          | id, name, email, passwordHash (scrypt), role (`ADMIN` \| `CONTENT_EDITOR`), createdAt                                                                          | `{ email: 1 }` unique                                  |
| `notices`        | id, slug, title, bodyMd, category (6), priority, status (draft/published), featured, publishedAt, expiryAt?, attachment{fileName,label}?, createdAt, updatedAt | `{ slug: 1 }` unique, `{ status: 1, publishedAt: -1 }` |
| `events`         | id, slug, title, description, startsAt, endsAt, location, category (5), status, coverImage?                                                                    | `{ slug: 1 }` unique, `{ startsAt: 1 }`                |
| `teachers`       | id, slug, name, designation (5), departmentSlug, qualification, subjects[], email, bioMd, joinYear                                                             | `{ slug: 1 }` unique, `{ departmentSlug: 1 }`          |
| `departments`    | id, slug, name, summary, descriptionMd, establishedYear, headTeacherId?                                                                                        | `{ slug: 1 }` unique                                   |
| `resultSessions` | id, exam (5), year, classLevel (SSC/HSC), className, publishedAt, status, results[] (studentId, studentName, gpa, grade, subjectMarks[])                       | `{ exam: 1, year: 1, classLevel: 1 }`                  |
| `galleryItems`   | id, title, category (5), caption, takenAt, palette[2] (CSS-art colors)                                                                                         | `{ takenAt: -1 }`                                      |
| `downloads`      | id, title, category (5), fileName, format (pdf/docx/xlsx), sizeLabel, updatedAt                                                                                | `{ category: 1 }`                                      |
| `siteSettings`   | singleton `id: "site"` — collegeName, tagline, announcement{text,active}, contact{address,phone,email}, principal{name,title,messageMd}                        | `{ id: 1 }` unique                                     |
| `inquiries`      | id, name, email, phone?, subject, message, status (new/read), createdAt                                                                                        | `{ status: 1, createdAt: -1 }`                         |

Relationships: `teachers.departmentSlug -> departments.slug`,
`departments.headTeacherId -> teachers.id` (deleting a head teacher is
refused), `resultSessions.results[]` embeds student rows (a session
publishes/unpublishes as one unit). See
[docs/database-schema.md](docs/database-schema.md).

## Authentication & Authorization

- **No public login.** Only CMS staff sign in, at `/admin/login`.
- Passwords: **scrypt** (`scrypt$salt$hash`), unique salt per user
  (`src/lib/auth/password.ts`).
- Sessions: stateless **HMAC-SHA256-signed token** in an httpOnly cookie
  (`src/lib/auth/session.ts`), 7-day expiry, zod-verified payload
  (`uid`, `role`, `exp`); tampered/expired tokens are rejected.
- Guards (`src/lib/auth/guards.ts`, no middleware): `getSessionUser`,
  `requireUser` (redirect to login), `requireRole` (403 page),
  `apiGuard` (401/403 JSON) — and the session's role is cross-checked
  against the store on every request.
- Roles: **ADMIN** (everything, incl. Settings) and **CONTENT_EDITOR**
  (all content managers; Settings pages and actions refuse editors
  server-side).

## Testing

- **Unit tests (Vitest)** — `npm run test:run`:
  - `tests/auth-password.test.ts` — scrypt roundtrip, wrong-password
    rejection, per-hash salts, malformed stored values.
  - `tests/auth-session.test.ts` — token roundtrip, tamper rejection,
    wrong secret, expiry boundaries, payload schema, malformed tokens.
  - `tests/validators.test.ts` — every CMS form schema (notice, event,
    teacher, settings rules, gallery, downloads, result sessions) and the
    datetime-local <-> UTC helpers.
  - `tests/store-cms.test.ts` — seed integrity (every row parses), the
    publish/expiry rule, public ordering, result verification privacy,
    inquiry validation.
  - `tests/store-media.test.ts` — gallery/download CRUD idempotency,
    settings merge rules, idempotent lazy seeding (demo store).
  - `tests/cms-store.test.ts`, `tests/cms-mode.test.ts` — the CmsStore
    contract, the full CMS-mode env matrix and startup errors.
  - `tests/wordpress-mapping.test.ts` — pure WP JSON <-> domain mappers.
  - `tests/markdown.test.ts`, `tests/utils.test.ts` — markdown safety
    (HTML escaping, link allow-list) and shared helpers.
- **E2E (Playwright)** — `npm run test:e2e` (dev server on port 3002):
  `tests/e2e/smoke.spec.ts` walks every public page, the publish/expiry
  rules on the live board, gallery lightbox, the contact inquiry flow,
  admin sign-in/roles — plus a final section that re-runs the six headline
  flows (home, notice search/filter, printable view, result verification,
  editor dashboard, create-notice CMS loop) and fails on **any console
  error**.
- CI (`.github/workflows/ci.yml`): lint → typecheck → unit tests → build.

## Local Development

```bash
npm install
npm run dev        # http://localhost:3002 (dev script pins the port)
```

No environment variables needed. Without `MONGODB_URI` the app runs on the
in-memory demo store (lazily seeded with the full fictional content set,
resets on server restart) and labels this honestly in the UI.

With MongoDB available:

```bash
MONGODB_URI=mongodb://localhost:27017 npm run seed   # idempotent: upserts by slug/email, ensures indexes, prints counts
MONGODB_URI=mongodb://localhost:27017 npm run dev
```

| Script                               | Purpose                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| `npm run dev`                        | Dev server on port 3002 (Turbopack)                       |
| `npm run build` / `npm start`        | Production build / serve                                  |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit`                                   |
| `npm run test` / `npm run test:run`  | Vitest (watch / single run)                               |
| `npm run test:e2e`                   | Playwright e2e against the dev server                     |
| `npm run seed`                       | Seed MongoDB (demo-mode message when `MONGODB_URI` unset) |
| `npm run format`                     | Prettier (incl. Tailwind class sorting)                   |

## Environment Variables

| Variable                 | Required      | Default                         | Purpose                                                                                                                    |
| ------------------------ | ------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`            | no            | unset                           | MongoDB connection string. Unset = in-memory demo store (lazily seeded, resets on restart).                                |
| `MONGODB_DB_NAME`        | no            | `edupress_portal`               | Database name when `MONGODB_URI` is set.                                                                                   |
| `SESSION_SECRET`         | in production | demo fallback                   | HMAC-SHA256 key for session cookies. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `CMS_MODE`               | no            | `mongodb`                       | `mongodb` (default) or `wordpress` (headless WP REST adapter).                                                             |
| `WORDPRESS_BASE_URL`     | with WP mode  | unset                           | WordPress site URL, e.g. `https://wp.example.com`. Required when `CMS_MODE=wordpress` (else a clear startup error).        |
| `WORDPRESS_API_URL`      | no            | `WORDPRESS_BASE_URL + /wp-json` | Full REST API URL override.                                                                                                |
| `WORDPRESS_USERNAME`     | for WP writes | unset                           | WordPress username (Application Passwords).                                                                                |
| `WORDPRESS_APP_PASSWORD` | for WP writes | unset                           | WordPress application password (Profile → Application Passwords).                                                          |

See [`.env.example`](.env.example) for the annotated template and
[docs/wordpress-integration.md](docs/wordpress-integration.md) for the
WordPress walkthrough.

## Deployment

**Vercel — zero environment variables:** import the repo, deploy. The
public portal and the full CMS run on the seeded demo store; the admin UI
shows the honest "MongoDB demo" badge. Set `SESSION_SECRET` before sharing
the CMS login publicly.

Optional steps:

1. **Real MongoDB (Atlas or self-hosted):** set `MONGODB_URI` (+
   `MONGODB_DB_NAME`), run `npm run seed` once against it, redeploy. Mode
   badge switches to "MongoDB".
2. **Headless WordPress:** install the bundled plugin on a WP site, create
   an Application Password, set `CMS_MODE=wordpress` +
   `WORDPRESS_BASE_URL` (+ `WORDPRESS_USERNAME`/`WORDPRESS_APP_PASSWORD`
   for writes). Notices/events come from WordPress; everything else stays
   in the local store. Full walkthrough:
   [docs/wordpress-integration.md](docs/wordpress-integration.md).

Details, env matrix and gotchas: [docs/deployment.md](docs/deployment.md).

## Demo Accounts

Sign in at `/admin/login` (password `Demo@12345` for both):

| Email               | Role           | Can do                                       |
| ------------------- | -------------- | -------------------------------------------- |
| `admin@demo.local`  | ADMIN          | Everything, including site Settings          |
| `editor@demo.local` | CONTENT_EDITOR | All content managers; Settings is admin-only |

These accounts are obviously fictional and exist only for the demo/seed
store (the Mongo seed creates the same two users).

## Known Limitations

- **WordPress mode is a split, not a full migration:** WP serves notices
  and events; teachers, departments, result sessions, gallery, downloads,
  settings and inquiries stay in the local Mongo/demo store (documented in
  `src/lib/cms/wordpress/store.ts` and
  [docs/wordpress-integration.md](docs/wordpress-integration.md)).
- **Demo store resets** on server restart — it is an in-memory seed, not a
  database. Content edits made while in demo mode are not durable.
- **No real file uploads:** notice/download attachments store metadata
  (file name + label) only; the gallery uses generated CSS-art tiles, so
  the repo ships no binary assets.
- **Result sessions replace their whole student array on save** (store
  contract) — no per-row patching.
- The class routine page serves a static, honestly-labeled demo dataset,
  not CMS content.
- The Mongo seed/upsert path is typechecked and mirrors the store logic
  but was not exercised against a live MongoDB server during development
  (no local server available); the demo path is verified end-to-end.

## Future Enhancements

- Server-side pagination for the admin managers and richer audit logging
  (who published what, when).
- Image uploads (blob storage + optimization pipeline) for the gallery and
  notice attachments.
- Public per-notice RSS/Atom feed and optional email subscriptions.
- Bengali localization of the public portal (the plugin is already
  i18n-ready on the WP side).
- Scheduled publishing (`publishedAt` in the future stays hidden until due)
  and per-department sub-sites.

## Teaching Use Cases

- **Adapter pattern / ports-and-adapters:** `CmsStore` with three
  interchangeable implementations picked by environment — assign students
  to add a fourth (e.g. a SQLite or CMS.io adapter).
- **Headless CMS architecture lab:** run the portal on the demo store, then
  flip `CMS_MODE=wordpress` against a local WP install and observe the
  same UI reading a different backend.
- **WordPress plugin development course:** the bundled plugin is a compact,
  review-ready example of CPT + taxonomy + metabox + custom REST route +
  shortcode with the full security checklist.
- **Validation-focused unit testing:** every zod schema and store rule has
  a paired test file students can extend (e.g. "add a notices date filter
  and its tests").
- **Auth/security walkthrough:** scrypt vs plaintext, signed stateless
  cookies vs sessions table, server-side guards vs client-side hiding.

## Interview Talking Points

- "The content layer is one interface with three backends — MongoDB, an
  in-memory demo store, and a WordPress REST adapter — so the product
  demos with zero infrastructure and upgrades in place."
- "I wrote the WordPress plugin myself: custom post type, normalized REST
  route, Application Password auth for writes, nonce and capability checks
  — and kept it out of the Next.js runtime entirely."
- "Stateless signed sessions with a zod-verified payload; the token role is
  cross-checked against the store so a stale token can't escalate."
- "The publish/expiry/featured rules live in the store layer, so the public
  UI, the tests and every backend enforce the same visibility contract."
- "Honest failure modes: wrong CMS env fails at startup, unreachable
  WordPress surfaces the error boundary — the app never shows fabricated
  content or silently falls back to the wrong backend."

## License

[MIT](LICENSE) © 2026 MD Mahamudul Hasan. Educational project; Padma Model
College and all content are fictional.
