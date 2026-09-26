import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Landmark,
  Megaphone,
  Users,
} from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge } from "@/components/ui";
import { NoticeItem } from "@/components/content/NoticeItem";
import { formatDate } from "@/lib/utils";

/**
 * Home page (spec 17.3). Every section reads the live content layer through
 * getCmsStore(), so the page renders identically from the MongoDB demo
 * store, MongoDB or the headless WordPress adapter.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Padma Model College — Knowledge, Discipline, Character",
  description:
    "Official portal of Padma Model College, Dhanmondi, Dhaka (est. 1998): notice board, departments, teacher directory, admission, result verification and events.",
  openGraph: {
    title: "Padma Model College",
    description:
      "Notice board, academic departments, teacher directory, admission and result verification — the official portal of Padma Model College, Dhaka (est. 1998).",
    type: "website",
    siteName: "Padma Model College",
  },
};

const QUICK_LINKS = [
  {
    href: "/notices",
    label: "Notice Board",
    description:
      "Exam routines, admission circulars, holiday notices and result announcements.",
    icon: BellRing,
  },
  {
    href: "/admission",
    label: "Admission",
    description:
      "Circular 2026-27, requirements, important dates, fees and forms.",
    icon: GraduationCap,
  },
  {
    href: "/results",
    label: "Result Verification",
    description:
      "Verify published SSC and HSC examination results by student ID.",
    icon: ClipboardCheck,
  },
  {
    href: "/downloads",
    label: "Downloads",
    description:
      "Admission forms, syllabuses, class routines and the college prospectus.",
    icon: Download,
  },
];

export default async function HomePage() {
  const store = await getCmsStore();
  const [settings, notices, events, departments, downloads, stats] = await Promise.all([
    store.getSettings(),
    store.listNotices({ status: "published", limit: 6 }),
    store.listEvents({ status: "published", upcoming: true, limit: 3 }),
    store.listDepartments(),
    store.listDownloads(),
    store.getStats(),
  ]);

  const headDownloads = downloads.slice(0, 4);
  const principalExcerpt = settings.principal.messageMd
    .split(/\n\s*\n/)
    .slice(0, 2)
    .join(" ")
    .replace(/\*\*/g, "");

  return (
    <>
      {/* Active announcement (from site settings) */}
      {settings.announcement.active && settings.announcement.text && (
        <div className="border-b border-accent-hover/40 bg-accent text-accent-fg">
          <p className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-2.5 text-sm sm:px-6">
            <Megaphone className="size-4 shrink-0" aria-hidden="true" />
            <span>{settings.announcement.text}</span>
            <Link
              href="/notices"
              className="ml-auto hidden shrink-0 items-center gap-1 font-medium underline underline-offset-2 transition-colors hover:decoration-2 sm:inline-flex"
            >
              Notice board
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </p>
        </div>
      )}

      {/* Institutional identity hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:py-20">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <Landmark className="size-4" aria-hidden="true" />
            Estd. 1998 · Dhanmondi, Dhaka
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-fg md:text-5xl">
            {settings.collegeName}
          </h1>
          <p className="max-w-2xl font-serif text-lg italic text-muted md:text-xl">
            {settings.tagline}.
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            A higher-secondary college serving SSC and HSC programmes in
            Science and Business Studies — with full laboratories, a reading
            library and a campus culture built on disciplined study. This
            portal carries our notices, departments, teacher directory,
            admission circulars and published results in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admission"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Admission information
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/notices"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <BellRing className="size-4" aria-hidden="true" />
              Latest notices
            </Link>
          </div>
        </div>
      </section>

      {/* Academic quick links */}
      <section aria-labelledby="quick-links-heading" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 id="quick-links-heading" className="sr-only">
          Academic quick links
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <link.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-serif text-lg font-semibold text-fg">
                {link.label}
              </span>
              <span className="text-sm leading-relaxed text-muted">
                {link.description}
              </span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent">
                Open
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest notices + upcoming events */}
      <section
        aria-labelledby="latest-notices-heading"
        className="border-y border-border bg-surface-2/60"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="mb-2 flex items-end justify-between gap-4">
              <h2
                id="latest-notices-heading"
                className="font-serif text-2xl font-semibold text-fg"
              >
                Latest notices
              </h2>
              <Link
                href="/notices"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                All notices
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            {notices.length > 0 ? (
              <div className="rounded-xl border border-border bg-surface px-5">
                {notices.map((notice) => (
                  <NoticeItem key={notice.id} notice={notice} showPinned={false} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
                No published notices yet — announcements will appear here as
                soon as the college office posts them.
              </p>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="mb-2 flex items-end justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold text-fg">
                Upcoming events
              </h2>
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                All events
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            {events.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-xl border border-border bg-surface p-5 shadow-sm"
                  >
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent">
                      <CalendarClock className="size-3.5" aria-hidden="true" />
                      {formatDate(event.startsAt)}
                      <span aria-hidden="true">·</span>
                      <span className="text-muted normal-case">
                        {event.location}
                      </span>
                    </p>
                    <h3 className="mt-2 font-serif text-base font-semibold text-fg">
                      {event.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                      {event.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
                No upcoming events on the calendar right now.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Departments grid */}
      <section aria-labelledby="departments-heading" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              id="departments-heading"
              className="font-serif text-2xl font-semibold text-fg"
            >
              Academic departments
            </h2>
            <p className="mt-1 text-sm text-muted">
              Six departments across the Science and Business Studies programmes.
            </p>
          </div>
          <Link
            href="/departments"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover sm:inline-flex"
          >
            All departments
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <Link
              key={department.id}
              href={`/departments/${department.slug}`}
              className="group flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold leading-snug text-fg">
                  {department.name}
                </h3>
                <Badge tone="neutral">Est. {department.establishedYear}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                {department.summary}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent">
                Department profile
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Principal's message */}
      <section
        aria-labelledby="principal-heading"
        className="border-y border-border bg-surface"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <span
              aria-hidden="true"
              className="flex size-24 items-center justify-center rounded-full bg-accent/10 font-serif text-3xl font-bold text-accent"
            >
              AR
            </span>
            <div className="text-center md:text-left">
              <h2
                id="principal-heading"
                className="font-serif text-lg font-semibold text-fg"
              >
                {settings.principal.name}
              </h2>
              <p className="text-sm text-muted">
                {settings.principal.title}, {settings.collegeName}
              </p>
            </div>
          </div>
          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              From the principal&rsquo;s desk
            </p>
            <blockquote className="mt-3 font-serif text-lg italic leading-relaxed text-fg">
              {principalExcerpt}
            </blockquote>
            <Link
              href="/about"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Read the full message
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics strip */}
      <section aria-label="College statistics" className="bg-accent text-accent-fg">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] opacity-80">
              Students on roll
            </dt>
            <dd className="font-serif text-3xl font-bold">1,240+</dd>
            <dd className="text-xs opacity-70">Illustrative figure (fictional demo)</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] opacity-80">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden="true" />
                Teachers
              </span>
            </dt>
            <dd className="font-serif text-3xl font-bold">{stats.teachers}</dd>
            <dd className="text-xs opacity-70">Listed in the teacher directory</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] opacity-80">
              <span className="inline-flex items-center gap-1.5">
                <BookOpenCheck className="size-3.5" aria-hidden="true" />
                Departments
              </span>
            </dt>
            <dd className="font-serif text-3xl font-bold">{stats.departments}</dd>
            <dd className="text-xs opacity-70">Science and Business Studies</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] opacity-80">
              <span className="inline-flex items-center gap-1.5">
                <Landmark className="size-3.5" aria-hidden="true" />
                Established
              </span>
            </dt>
            <dd className="font-serif text-3xl font-bold">1998</dd>
            <dd className="text-xs opacity-70">Serving Dhanmondi since</dd>
          </div>
        </dl>
      </section>

      {/* Important resources (downloads preview) */}
      <section
        aria-labelledby="resources-heading"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
      >
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              id="resources-heading"
              className="font-serif text-2xl font-semibold text-fg"
            >
              Important resources
            </h2>
            <p className="mt-1 text-sm text-muted">
              Forms, syllabuses and routines published by the college office.
            </p>
          </div>
          <Link
            href="/downloads"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover sm:inline-flex"
          >
            All downloads
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        {headDownloads.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {headDownloads.map((download) => (
              <li
                key={download.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm font-semibold leading-snug text-fg">
                    {download.title}
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge tone="neutral">{download.format.toUpperCase()}</Badge>
                    <span>{download.sizeLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {formatDate(download.updatedAt)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
            No downloadable resources published yet.
          </p>
        )}
      </section>
    </>
  );
}
