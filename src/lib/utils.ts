/**
 * Small shared utilities used across the app.
 * Keep this file dependency-free so it is safe in both server and client code.
 */

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO date string as a human-readable date, e.g. "12 Jan 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Format an ISO date string with time, e.g. "12 Jan 2026, 4:30 PM". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

/**
 * Format an ISO date string as a relative time like "3 days ago".
 * Pass `now` explicitly in tests for deterministic output.
 */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 365 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["week", 7 * 24 * 60 * 60],
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(-Math.round(seconds / secondsInUnit), unit);
    }
  }
  return rtf.format(-seconds, "second");
}

/** Convert a title into a URL-safe slug. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * True when an optional expiry timestamp exists and is in the past.
 * Used to hide expired notices from public listings (spec 17.4).
 */
export function isExpired(
  expiryAt: string | undefined,
  now: Date = new Date(),
): boolean {
  if (!expiryAt) return false;
  const time = new Date(expiryAt).getTime();
  if (Number.isNaN(time)) return false;
  return time <= now.getTime();
}

/**
 * True when an ISO timestamp is strictly before the reference moment
 * (defaults to now). Lets page components compare dates without calling
 * the impure Date.now()/new Date() directly during render.
 */
export function isPastIso(iso: string, now: Date = new Date()): boolean {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  return time < now.getTime();
}
