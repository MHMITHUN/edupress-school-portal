import type { Notice, NoticeCategory } from "@/lib/db/types";
import { isExpired } from "@/lib/utils";

/**
 * Pure helpers for the PUBLIC notice board (spec 17.4). Everything here is
 * side-effect free so it can be unit-tested without a store (see
 * tests/store-cms.test.ts) and shared by the home page and the notice list.
 */

/** Category chips for the public filter bar, in display order. */
export const NOTICE_CATEGORIES: Array<{ value: NoticeCategory; label: string }> = [
  { value: "exam", label: "Exam" },
  { value: "admission", label: "Admission" },
  { value: "result", label: "Result" },
  { value: "event", label: "Event" },
  { value: "holiday", label: "Holiday" },
  { value: "general", label: "General" },
];

export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> =
  Object.fromEntries(NOTICE_CATEGORIES.map((c) => [c.value, c.label])) as Record<
    NoticeCategory,
    string
  >;

/**
 * The publish rule in one place: a notice is publicly visible only when it
 * is published AND not past its expiry. Pages use this before rendering a
 * slug lookup (getNoticeBySlug returns drafts too).
 */
export function isPubliclyVisible(notice: Notice, now: Date = new Date()): boolean {
  return notice.status === "published" && !isExpired(notice.expiryAt, now);
}

/**
 * Public ordering (spec 17.4): featured notices are pinned to the top,
 * newest publishedAt first inside each group.
 */
export function orderPublicNotices(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

/** Validate a raw value as a notice category, else undefined. */
export function parseNoticeCategory(value: string | undefined): NoticeCategory | undefined {
  return NOTICE_CATEGORIES.some((c) => c.value === value)
    ? (value as NoticeCategory)
    : undefined;
}

/** yyyy-mm-dd or undefined. */
function parseDate(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export interface NoticeFilters {
  q?: string;
  category?: NoticeCategory;
  /** Inclusive lower bound on the published date (yyyy-mm-dd). */
  from?: string;
  /** Inclusive upper bound on the published date (yyyy-mm-dd). */
  to?: string;
  page: number;
}

/** First value of a Next 16 searchParams entry (string | string[] | undefined). */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse + validate the notice board's search params (bad values ignored). */
export function parseNoticeFilters(params: Record<string, string | string[] | undefined>): NoticeFilters {
  const page = Number.parseInt(firstParam(params.page) ?? "1", 10);
  return {
    q: firstParam(params.q)?.trim() || undefined,
    category: parseNoticeCategory(firstParam(params.category)),
    from: parseDate(firstParam(params.from)),
    to: parseDate(firstParam(params.to)),
    page: Number.isFinite(page) && page >= 1 ? page : 1,
  };
}

/** Inclusive date-range filter on the published date (UTC date prefix). */
export function filterNoticesByDateRange(
  notices: Notice[],
  from: string | undefined,
  to: string | undefined,
): Notice[] {
  if (!from && !to) return notices;
  return notices.filter((notice) => {
    const day = notice.publishedAt.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  });
}

export interface Paged<T> {
  rows: T[];
  page: number;
  totalPages: number;
}

/** Slice a row list into a page (1-based). */
export function paginate<T>(rows: T[], page: number, perPage: number): Paged<T> {
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    rows: rows.slice((safePage - 1) * perPage, safePage * perPage),
    page: safePage,
    totalPages,
  };
}
