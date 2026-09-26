# Content Guidelines — Running the CMS Day-to-Day

A practical guide for the college content editor (role
`CONTENT_EDITOR`) or administrator (`ADMIN`). Sign in at `/admin/login`.

> If the badge in the admin sidebar says **MongoDB demo**, everything you
> save lives in the server's memory and disappears on the next restart.
> That is expected for the demo — point the app at MongoDB
> (`MONGODB_URI`) for durable content, or run WordPress mode for the
> notice board (see [deployment.md](deployment.md) and
> [wordpress-integration.md](wordpress-integration.md)).

## The golden rules

1. **Draft until it is ready; publish when it is official.** Drafts are
   invisible everywhere on the public site — search, category pages,
   detail URLs all exclude them. Nothing "goes live by accident".
2. **Slugs are permanent addresses.** Lowercase words separated by
   hyphens (`hsc-test-routine-2026`). Renaming a slug later breaks the
   public link people may already have.
3. **Set an expiry when a notice has a deadline.** A published notice
   past its expiry disappears from every public listing automatically —
   no manual clean-up needed.
4. **Write for the reader:** what, when, where, who to contact. One
   notice per announcement; keep the title scannable
   ("SSC Mock Test 2026: Examination Routine", not "Routine").

## Dashboard

The landing page after sign-in. Eight count cards (notices, events,
teachers, departments, result sessions, gallery items, downloads,
inquiries) are **live numbers from the active store** — the "Notices"
hint shows how many are published _and unexpired_. Below: the latest
notices and the inquiry inbox with unread count. "New notice" is the
shortcut for the most common task.

## Notices (the daily workflow)

1. **Notices → New notice** (or open an existing row to edit).
2. Fill the fields:
   - **Title** — plain sentence case, ≤ 200 characters.
   - **Slug** — hyphenated, unique; the form enforces the format.
   - **Category** — `General`, `Examination`, `Admission`, `Event`,
     `Holiday` or `Result`. This drives the public filter chips; pick the
     _subject_ of the notice, not its urgency.
   - **Priority** — `Normal` default; `High`/`Urgent` are for genuine
     time-critical notices (examination cancellations, deadline changes).
     Priority does not reorder the board — **Featured** does.
   - **Status** — `Draft (hidden)` or `Published`.
   - **Published at** — the date shown on the board; datetime-local
     values are treated as **UTC**.
   - **Expires at** — optional; use it for anything with a deadline
     (application windows, holiday notices). Leave blank for permanent
     records.
   - **Featured** — pins the notice above everything else while it is
     current. Keep **at most one** featured notice; two pins defeat the
     purpose.
   - **Body (Markdown)** — headings (`##`), lists (`-`), `**bold**` and
     links are supported. Raw HTML is escaped; only `https:` and
     `mailto:` links render. Dates and times in the body should name the
     timezone (e.g. "10:00 AM, college time").
   - **Attachment file name + label** — fill **both together**; they are
     metadata shown to the public (e.g. `ssc-mock-routine-2026.pdf` /
     "SSC Mock Test Routine 2026 (PDF)"). The demo portal does not host
     real files — link the college office for the actual document.
3. **Create notice**. The manager list shows every status with inline
   **Publish / Unpublish**, **Edit** and **Delete** (delete asks for
   confirmation and is permanent).

Quick actions on the manager: publish a draft the moment it is approved;
unpublish instead of deleting when something might return.

## Events

Same discipline as notices plus: **Start** and **End** (end must be after
start), **Location** and a category (`Academic`, `Cultural`, `Sports`,
`Holiday`, `Meeting`). Published future events appear under "Upcoming
events" (soonest first); past ones move to "Past events" automatically.
Draft events never appear publicly.

## Teachers and departments

- **Teachers**: name, designation, department, qualification, comma-
  separated subjects, email, a markdown bio and join year. The public
  directory filters by department, designation and subject — accurate
  subjects matter more than long bios.
- **Departments**: summary (one or two sentences for cards) vs
  description (full profile page, markdown). The department head is
  picked from teachers; **a teacher who heads a department cannot be
  deleted** — assign a new head first.

## Result sessions (the sensitive one)

1. **Results → New session**: exam, year, class level and group,
   published date, status.
2. Add student rows: student ID, name, GPA (0–5), overall grade and at
   least one subject with marks (0–100) and grade. Rows can be added and
   removed before saving; the whole table is submitted as one JSON
   payload and re-validated on the server.
3. Keep the session **Draft** while entering data. Publishing makes every
   row in it publicly verifiable by student ID — and nothing else (the
   public page never lists students).
4. Saving an existing session **replaces its full student list** — if two
   editors paste different lists, the last save wins. Coordinate.

GPA and grades follow the national scale (A+ 80+, A 70+, A- 60+, B 50+,
C 40+, D below); keep the stated GPA consistent with the marks.

## Gallery

Each item is a **generated CSS-art tile** built from two hex colors —
choose a palette that hints at the scene (maroon for auditorium events,
green for sports). Category (`Campus`, `Science lab`, `Sports`,
`Cultural`, `Library`) drives the public filter. Captions should name the
occasion and the date context ("The sixty-seat reading hall, central
library").

## Downloads

A catalogue, not a file store: title, category, file name, format
(pdf/docx/xlsx), size label and updated date. Keep names aligned with
the notice that references the document. The public page states honestly
that the demo portal does not host real files.

## Inquiries (the inbox)

Messages from the public contact form arrive with status **New**. Open
one to read it and **Mark as read**. The dashboard's unread count keeps
the inbox honest. Reply by email from your own client — the portal does
not send mail.

## Settings (ADMIN only)

Editors do not see this section (the server refuses it, not just the
menu). Changes are live immediately: college name and tagline (hero),
announcement banner (leave the text empty to hide it), contact block
(footer + contact page) and the principal's message page.

## WordPress mode, for editors

When the badge says **WordPress headless**, notices (and events) you
create are written **to the WordPress site** — they appear in the WP
admin too, and everything there (including edits made in WordPress)
flows back to the portal. The remaining sections still save locally.
Unreachable WordPress shows an honest error; retry, nothing is lost
silently.

## Review checklist before publishing anything

- [ ] Title says what the notice is, in plain words
- [ ] Category and priority are honest (not everything is urgent)
- [ ] Body answers what/when/where/who, with a contact point
- [ ] Expiry set if the notice has a deadline
- [ ] Only one featured notice at a time
- [ ] Attachment name and label both filled (or both empty)
- [ ] Slug is final (it is the public URL)
