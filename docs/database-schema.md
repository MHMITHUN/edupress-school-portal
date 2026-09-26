# Database Schema

The data model behind EduPress — collections, fields, indexes and
relationships. Two backends share this exact model:

- **MongoDB** (`MongoCmsStore` / `MongoStore`) when `MONGODB_URI` is set —
  database name from `MONGODB_DB_NAME` (default `edupress_portal`).
- **In-memory demo store** (`DemoCmsStore` / `DemoStore`) otherwise —
  same shapes, lazily seeded from `src/lib/db/seeds/`, resets on restart.

Every document is parsed at the boundary by the zod schemas in
`src/lib/db/types.ts` — an invalid row is rejected, never silently
rendered. The WordPress adapter (spec 17.9) maps remote posts into these
same shapes for notices and events.

## Collections

### `users` — CMS staff accounts

| Field          | Type                        | Notes                                                       |
| -------------- | --------------------------- | ----------------------------------------------------------- |
| `id`           | string                      | e.g. `usr-admin-01`                                         |
| `name`         | string                      | display name                                                |
| `email`        | string                      | unique, login identifier                                    |
| `passwordHash` | string                      | `scrypt$<salt-hex>$<hash-hex>` (`src/lib/auth/password.ts`) |
| `role`         | `ADMIN` \| `CONTENT_EDITOR` | no public/student accounts exist                            |
| `createdAt`    | string (ISO)                |                                                             |

Index: `{ email: 1 }` unique.

### `notices` — the notice board (spec 17.4)

| Field                     | Type                                                                   | Notes                                  |
| ------------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| `id`                      | string                                                                 |                                        |
| `slug`                    | string                                                                 | unique, URL key                        |
| `title`                   | string                                                                 |                                        |
| `bodyMd`                  | string                                                                 | markdown body                          |
| `category`                | `exam` \| `admission` \| `event` \| `general` \| `holiday` \| `result` |                                        |
| `priority`                | `normal` \| `high` \| `urgent`                                         |                                        |
| `status`                  | `draft` \| `published`                                                 | drafts never render publicly           |
| `featured`                | boolean                                                                | pinned to the top of the public board  |
| `publishedAt`             | string (ISO)                                                           | sort key (newest first)                |
| `expiryAt`                | string (ISO, optional)                                                 | published notices past this are hidden |
| `attachment`              | `{ fileName, label }?`                                                 | metadata only — no file storage        |
| `createdAt` / `updatedAt` | string (ISO)                                                           |                                        |

Indexes: `{ slug: 1 }` unique, `{ status: 1, publishedAt: -1 }`.

### `events`

| Field                 | Type                                                           | Notes                        |
| --------------------- | -------------------------------------------------------------- | ---------------------------- |
| `id`                  | string                                                         |                              |
| `slug`                | string                                                         | unique                       |
| `title`               | string                                                         |                              |
| `description`         | string                                                         |                              |
| `startsAt` / `endsAt` | string (ISO)                                                   | upcoming = `startsAt >= now` |
| `location`            | string                                                         | venue                        |
| `category`            | `academic` \| `cultural` \| `sports` \| `holiday` \| `meeting` |                              |
| `status`              | `draft` \| `published`                                         |                              |
| `coverImage`          | string?                                                        | CSS-art key, not a URL       |

Indexes: `{ slug: 1 }` unique, `{ startsAt: 1 }`.

### `teachers` — the directory (spec 17.6)

| Field            | Type                                                                                             | Notes                    |
| ---------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| `id`             | string                                                                                           |                          |
| `slug`           | string                                                                                           | unique                   |
| `name`           | string                                                                                           | directory sorted by name |
| `designation`    | `Professor` \| `Associate Professor` \| `Assistant Professor` \| `Senior Lecturer` \| `Lecturer` |                          |
| `departmentSlug` | string                                                                                           | → `departments.slug`     |
| `qualification`  | string                                                                                           |                          |
| `subjects`       | string[]                                                                                         | at least one             |
| `email`          | string                                                                                           |                          |
| `bioMd`          | string                                                                                           | markdown profile         |
| `joinYear`       | number                                                                                           |                          |

Indexes: `{ slug: 1 }` unique, `{ departmentSlug: 1 }`.

### `departments`

| Field             | Type    | Notes                                             |
| ----------------- | ------- | ------------------------------------------------- |
| `id`              | string  |                                                   |
| `slug`            | string  | unique                                            |
| `name`            | string  |                                                   |
| `summary`         | string  | card blurb                                        |
| `descriptionMd`   | string  | profile page body                                 |
| `establishedYear` | number  |                                                   |
| `headTeacherId`   | string? | → `teachers.id`; deleting that teacher is refused |

Index: `{ slug: 1 }` unique.

### `resultSessions` — exam result publication (spec 17.7)

| Field         | Type                                                                                 | Notes                                       |
| ------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| `id`          | string                                                                               |                                             |
| `exam`        | `SSC Mock Test` \| `HSC Pre-Test` \| `Half-Yearly` \| `Annual` \| `Test Examination` |                                             |
| `year`        | number                                                                               |                                             |
| `classLevel`  | `SSC` \| `HSC`                                                                       |                                             |
| `className`   | string                                                                               | e.g. `Class 10 (Science)`                   |
| `publishedAt` | string (ISO)                                                                         |                                             |
| `status`      | `draft` \| `published`                                                               | public verification searches published only |
| `results`     | `ResultEntry[]`                                                                      | embedded student rows (below)               |

`ResultEntry`: `studentId`, `studentName`, `gpa` (0–5, two decimals),
`grade`, `subjectMarks: Array<{ subject, marks (0–100), grade }>`.
A session saves as one unit — updating it **replaces the whole array**
(store contract); the admin editor submits all rows as JSON which the
server re-validates with zod.

Index: `{ exam: 1, year: 1, classLevel: 1 }`.

### `galleryItems`

| Field      | Type                                                             | Notes                                                    |
| ---------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `id`       | string                                                           |                                                          |
| `title`    | string                                                           |                                                          |
| `category` | `campus` \| `science-lab` \| `sports` \| `cultural` \| `library` |                                                          |
| `caption`  | string                                                           | lightbox text                                            |
| `takenAt`  | string (ISO)                                                     | sort key (newest first)                                  |
| `palette`  | `[string, string]`                                               | two hex colors driving the CSS-art tile (no image files) |

Index: `{ takenAt: -1 }`.

### `downloads`

| Field       | Type                                                                    | Notes                                    |
| ----------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| `id`        | string                                                                  |                                          |
| `title`     | string                                                                  |                                          |
| `category`  | `admission-form` \| `syllabus` \| `routine` \| `prospectus` \| `notice` |                                          |
| `fileName`  | string                                                                  | metadata only — no real files are served |
| `format`    | `pdf` \| `docx` \| `xlsx`                                               |                                          |
| `sizeLabel` | string                                                                  | human-readable, e.g. `240 KB`            |
| `updatedAt` | string (ISO)                                                            | sort key (newest first)                  |

Index: `{ category: 1 }`.

### `siteSettings` — singleton document

Always exactly one document with `id: "site"`:

| Field          | Type                         |
| -------------- | ---------------------------- |
| `collegeName`  | string                       |
| `tagline`      | string                       |
| `announcement` | `{ text, active }`           |
| `contact`      | `{ address, phone, email }`  |
| `principal`    | `{ name, title, messageMd }` |

Index: `{ id: 1 }` unique. `updateSettings` merges patches shallowly
(nested objects replace their whole subtree).

### `inquiries` — public contact form inbox

| Field                     | Type            | Notes                        |
| ------------------------- | --------------- | ---------------------------- |
| `id`                      | string          |                              |
| `name`, `email`, `phone?` | strings         | submitter (phone optional)   |
| `subject`, `message`      | strings         |                              |
| `status`                  | `new` \| `read` | toggled from the admin inbox |
| `createdAt`               | string (ISO)    | sort key (newest first)      |

Index: `{ status: 1, createdAt: -1 }`.

## Relationships

```text
departments.headTeacherId ────────────► teachers.id     (1-1, delete-refused while set)
teachers.departmentSlug   ────────────► departments.slug (many-to-one)
resultSessions[].subjectMarks          embedded (no separate collection)
inquiries                              standalone (public submissions)
siteSettings                           singleton "site"
```

There are no foreign-key constraints (MongoDB); the stores enforce the two
soft rules above (`deleteTeacher` refuses while a department references the
teacher; every document is zod-validated on read).

## Index management and seeding

`MongoCmsStore.ensureIndexes()` and `MongoStore.ensureIndexes()` create all
indexes above at startup; `npm run seed` (with `MONGODB_URI` set) creates
the same indexes and then upserts every seed row idempotently — users by
email, settings by id, slugged content by slug — using `$setOnInsert` so
re-running never overwrites CMS edits. Without `MONGODB_URI` the seed
script prints the demo-mode message (the in-memory store seeds itself).

Volume of the shipped seed set (`src/lib/db/seeds/content.ts`): 14 notices
(two drafts, one expiring window, one already expired), 9 events, 6
departments, 15 teachers, 4 result sessions (one deliberately draft), 12
gallery items, 9 downloads, 2 users, 1 settings document.
