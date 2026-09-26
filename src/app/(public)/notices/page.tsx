import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Button, EmptyState, Input } from "@/components/ui";
import { NoticeItem } from "@/components/content/NoticeItem";
import {
  NOTICE_CATEGORIES,
  filterNoticesByDateRange,
  orderPublicNotices,
  paginate,
  parseNoticeFilters,
  type NoticeFilters,
} from "@/lib/content/notices";
import { cn } from "@/lib/utils";

/**
 * Public notice board (spec 17.4): title search, category chips, date-range
 * filter, featured notice pinned first and 10-per-page pagination. Draft and
 * expired notices never reach this page — listNotices({ status: "published" })
 * enforces the publish and expiry rules in the store layer.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notice Board",
  description:
    "Exam routines, admission circulars, holiday notices, scholarships and result announcements of Padma Model College.",
};

const PER_PAGE = 10;

/** Build a /notices href preserving chosen filters (page resets unless given). */
function noticesHref(
  filters: NoticeFilters,
  overrides: Partial<NoticeFilters> = {},
): string {
  const merged = { ...filters, ...overrides };
  const page = overrides.page ?? 1;
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.category) params.set("category", merged.category);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/notices?${qs}` : "/notices";
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = parseNoticeFilters(await searchParams);
  const store = await getCmsStore();

  const published = await store.listNotices({
    status: "published",
    q: filters.q,
    category: filters.category,
  });
  const filtered = filterNoticesByDateRange(published, filters.from, filters.to);
  const ordered = orderPublicNotices(filtered);
  const { rows, page, totalPages } = paginate(ordered, filters.page, PER_PAGE);

  const hasFilters = Boolean(filters.q || filters.category || filters.from || filters.to);
  const firstIndex = ordered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const lastIndex = Math.min(page * PER_PAGE, ordered.length);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Official announcements
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Notice board</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Every published notice of the college office — examination routines,
          admission circulars, holidays, scholarships and results. Featured
          notices stay pinned at the top while they are current.
        </p>
      </header>

      {/* Category chips */}
      <nav aria-label="Filter by category" className="mb-4 flex flex-wrap gap-2">
        <Link
          href={noticesHref(filters, { category: undefined })}
          aria-current={filters.category ? undefined : "true"}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            filters.category
              ? "border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg"
              : "border-accent bg-accent text-accent-fg",
          )}
        >
          All
        </Link>
        {NOTICE_CATEGORIES.map((category) => {
          const active = filters.category === category.value;
          return (
            <Link
              key={category.value}
              href={noticesHref(filters, { category: category.value })}
              aria-current={active ? "true" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>

      {/* Search + date-range form (native GET keeps it work without JS) */}
      <form
        method="get"
        action="/notices"
        className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-end"
      >
        {filters.category && (
          <input type="hidden" name="category" value={filters.category} />
        )}
        <div className="flex-1">
          <label
            htmlFor="notice-q"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Search by title
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id="notice-q"
              name="q"
              type="search"
              defaultValue={filters.q ?? ""}
              placeholder="e.g. routine, admission, scholarship"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="notice-from"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Published from
          </label>
          <Input
            id="notice-from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
          />
        </div>
        <div>
          <label
            htmlFor="notice-to"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Published to
          </label>
          <Input id="notice-to" name="to" type="date" defaultValue={filters.to ?? ""} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Apply filters
          </Button>
          {hasFilters && (
            <Link
              href="/notices"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Clear</span>
            </Link>
          )}
        </div>
      </form>

      <p className="mb-3 text-sm text-muted" aria-live="polite">
        {ordered.length > 0
          ? `Showing ${firstIndex}–${lastIndex} of ${ordered.length} notice${
              ordered.length === 1 ? "" : "s"
            }`
          : "No notices match the current filters."}
      </p>

      {rows.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface px-5">
          {rows.map((notice) => (
            <NoticeItem key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notices found"
          description={
            hasFilters
              ? "Nothing matches your search or filters. Try clearing them or using a different keyword."
              : "The college office has not published any notices yet."
          }
          action={
            hasFilters ? (
              <Link
                href="/notices"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
              >
                <X className="size-3.5" aria-hidden="true" />
                Clear all filters
              </Link>
            ) : undefined
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Notice pages"
          className="mt-6 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link
                href={noticesHref(filters, { page: page - 1 })}
                rel="prev"
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-muted opacity-50"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Previous
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={noticesHref(filters, { page: page + 1 })}
                rel="next"
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Next
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-muted opacity-50"
              >
                Next
                <ChevronRight className="size-4" aria-hidden="true" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted">
            Page <span className="font-medium text-fg">{page}</span> of {totalPages}
          </p>
        </nav>
      )}
    </div>
  );
}
