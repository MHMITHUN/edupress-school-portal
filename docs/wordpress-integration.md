# WordPress Integration Guide

How to run the EduPress portal against a real WordPress site in headless
mode, and how the connector maps fields between the two systems.

- Code: `src/lib/cms/wordpress/` (adapter) and `wordpress-plugin/edupress-notice-board/` (plugin)
- Spec: section 17.9 (connector) and 17.10 (plugin) of the project guide

## The model in one paragraph

`CMS_MODE=wordpress` switches the content layer from MongoDB to the
WordPress REST API **for notices and events**. Everything else (teachers,
departments, result sessions, gallery, downloads, site settings, the
inquiry inbox) keeps using the local store — MongoDB when `MONGODB_URI` is
set, the seeded in-memory demo store otherwise. This split is deliberate:
WordPress serves the two collections a content team actually edits in WP,
while structured records stay where the CMS UI owns them. The whole portal
still talks to one `CmsStore` interface, so no page knows which backend it
is reading.

```text
                    ┌─────────────────────────────────────────────┐
                    │            Next.js portal (this app)        │
                    └───────────────┬─────────────────────────────┘
                                    │ CmsStore interface
                    ┌───────────────┴───────────────┐
                    │       WordPressCmsStore       │
                    │  notices  → WordPress REST    │
                    │  events   → WordPress REST    │
                    │  everything else → local      │
                    │                  (Mongo/Demo) │
                    └───────────────┬───────────────┘
                                    │ WP REST API (+ Application Password for writes)
                    ┌───────────────▼───────────────┐
                    │  WordPress site               │
                    │  + edupress-notice-board      │
                    │    plugin (bundled)           │
                    └───────────────────────────────┘
```

## Step 1 — Install the plugin in WordPress

1. Copy `wordpress-plugin/edupress-notice-board/` into your WordPress
   `wp-content/plugins/` directory (zip the folder and upload it through
   **Plugins → Add New → Upload Plugin** works too).
2. Activate **EduPress Notice Board** in **Plugins**.
3. Verify the custom post type appears: **Notices** in the admin menu.
   The plugin registers:
   - CPT `edupress_notice` (with `edupress_notice` slug permalinks)
   - taxonomy `edupress_notice_category` with terms
     `general`, `exam`, `admission`, `event`, `holiday`, `result`
   - meta boxes: **Priority** (normal/high/urgent), **Featured**,
     **Expiry** (`Y-m-d H:i`), **Attachment URL + label**
   - normalized REST route `GET/POST /wp-json/edupress/v1/notices`
   - shortcode `[edupress_notice_board]` for classic WP themes

## Step 2 — Create an Application Password

Writes (create/update/publish/delete from the CMS) authenticate with
WordPress **Application Passwords**:

1. In WordPress: **Users → Profile → Application Passwords**.
2. Name it e.g. `edupress-connector` and click **Add New Application
   Password**.
3. Copy the generated `xxxx xxxx xxxx xxxx` value (shown once).

Reads are public and need no credentials. With credentials the connector
additionally reads draft notices (`context=edit`) so the admin manager
shows drafts; without them it sees published posts only — an honest,
labeled limitation.

## Step 3 — Configure the portal

```bash
CMS_MODE=wordpress
WORDPRESS_BASE_URL=https://wp.example.com
WORDPRESS_USERNAME=editor_user            # only needed for writes/drafts
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
# optional: MONGODB_URI=mongodb://localhost:27017   # local half of the split
```

`WORDPRESS_API_URL` overrides the default `<base>/wp-json` endpoint (use it
only if your WP REST namespace lives elsewhere).

Sanity checks before starting the app:

- `CMS_MODE=wordpress` **without** `WORDPRESS_BASE_URL`/`WORDPRESS_API_URL`
  is refused at startup with a clear `CMS configuration error` — fix the
  env or unset `CMS_MODE`.
- `curl https://wp.example.com/wp-json/edupress/v1/notices` should return
  a JSON array (plugin route). If it 404s but
  `curl https://wp.example.com/wp-json/wp/v2/edupress_notice?per_page=1`
  works, the connector still works via the core CPT fallback.

The admin UI shows a **WordPress headless** badge so editors always know
where content lives.

## Step 4 — Events (optional second CPT)

Events read from the core CPT endpoint `/wp/v2/edupress_event`. The plugin
deliberately registers only notices; to serve events from WordPress too,
register `edupress_event` on the WP side with these meta keys as the
contract:

| Meta key                  | Content                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `edupress_starts_at`      | event start, ISO-ish datetime                                  |
| `edupress_ends_at`        | event end                                                      |
| `edupress_location`       | venue text                                                     |
| `edupress_event_category` | `academic` \| `cultural` \| `sports` \| `holiday` \| `meeting` |

The post title becomes the event title, `post_name` the slug,
`post_content` the description and `post_status` maps to
published/draft. Until the CPT exists, the events page honestly reads as
"No upcoming events" (a 404 on a list endpoint means "collection absent",
not a crash); an unreachable server still raises an error page.

## How the connector maps fields

### Notices — plugin route (preferred)

`GET /wp-json/edupress/v1/notices` returns normalized snake_case rows:

| WP/plugin field                             | Portal `Notice` field            |
| ------------------------------------------- | -------------------------------- |
| `id`                                        | `id` (prefixed `wp-` internally) |
| `slug`                                      | `slug`                           |
| `title` (rendered)                          | `title`                          |
| `body_md`                                   | `bodyMd` (markdown kept as-is)   |
| `status` (`publish`/`draft`)                | `status` (`published`/`draft`)   |
| `category` (taxonomy slug)                  | `category`                       |
| `priority`                                  | `priority`                       |
| `featured`                                  | `featured`                       |
| `published_at` (ISO 8601)                   | `publishedAt`                    |
| `expiry_at` (ISO 8601)                      | `expiryAt`                       |
| `attachment.file_name` / `attachment.label` | `attachment`                     |

`POST` accepts the same shape (plus `title`, `slug`). The connector pages
through up to 10 × 100 rows per read.

### Notices — core CPT fallback (plugin absent)

Reads `/wp/v2/edupress_notice` (+ the taxonomy endpoint to resolve category
terms) using the post meta keys `edupress_priority`, `edupress_featured`,
`edupress_expiry`, `edupress_attachment_url`,
`edupress_attachment_label`. When only `content.rendered` exists, tags are
stripped and HTML entities decoded into the body. Without the taxonomy
every notice falls back to category `general`, and creates cannot assign a
category — install the plugin for the full experience.

### Events — core CPT

See the meta table above; `mapCoreEvent` falls back to `post_date` when
meta is missing and drops posts with unparseable dates.

### Writes

| Portal action                       | WordPress call                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| Create notice                       | `POST /edupress/v1/notices` (plugin) or `POST /wp/v2/edupress_notice` with meta (fallback) |
| Update notice / publish / unpublish | `PUT /wp/v2/edupress_notice/{id}` with only the patched fields                             |
| Delete notice                       | `DELETE /wp/v2/edupress_notice/{id}?force=true`                                            |
| Create/update event                 | `POST/PUT /wp/v2/edupress_event` with the meta contract                                    |

All writes use HTTP Basic auth with the Application Password and an 8-second
timeout. Errors surface in the admin UI (e.g. duplicate slugs) or the
public error boundary — content is never fabricated on failure.

## Behaviour summary

| Situation                               | What the portal does                                                  |
| --------------------------------------- | --------------------------------------------------------------------- |
| Plugin route available                  | Notices read/write through it (best fidelity)                         |
| Plugin absent, CPT present              | Core fallback: reads fine, category falls back to `general` on create |
| Neither registered (404 on list)        | Reads as an empty board — honest empty state, no crash                |
| WordPress unreachable / timeout         | Honest error page (`src/app/(public)/error.tsx`), never fake content  |
| `CMS_MODE=wordpress`, no URL configured | Startup `CMS configuration error`                                     |
| Credentials present                     | Drafts visible in the admin manager; without: published only          |

## Troubleshooting

- **"CMS configuration error" at boot** — `CMS_MODE=wordpress` without
  `WORDPRESS_BASE_URL`/`WORDPRESS_API_URL`. Set one or unset `CMS_MODE`.
- **Notices empty though WP has posts** — check the posts are `publish`
  (not `private`/`pending`), and that you are not filtering by a category
  the WP posts lack.
- **401 on create/update** — Application Password wrong or revoked;
  regenerate it. Permalinks set to "Plain" can also break REST — set any
  pretty permalink structure.
- **Drafts not showing in the admin list** — reads without credentials see
  published posts only; set `WORDPRESS_USERNAME`/`WORDPRESS_APP_PASSWORD`.
- **Everything else still local** — expected: the split (notices/events in
  WP, the rest local) is by design; see the table at the top.
