import {
  NoticeSchema,
  EventSchema,
  type Notice,
  type Event,
  type NoticeCategory,
  type EventCategory,
  type ContentStatus,
} from "@/lib/db/types";
import type {
  CreateNoticeInput,
  UpdateNoticeInput,
  CreateEventInput,
  UpdateEventInput,
} from "../content-store";

/**
 * PURE mapping functions between WordPress REST payloads and the domain
 * zod types (spec 17.9). No fetch, no env, no side effects — everything
 * here is unit-testable with fixture JSON (tests/wordpress-mapping.test.ts)
 * and reused by WordPressCmsStore.
 *
 * Two WP payload shapes are handled for notices:
 *  1. The plugin route /wp-json/edupress/v1/notices (wordpress-plugin/
 *     edupress-notice-board) returns ALREADY-NORMALIZED snake_case JSON.
 *  2. The core CPT fallback /wp-json/wp/v2/edupress_notice returns
 *     standard WP post objects; notice fields live in meta + taxonomy.
 * Events always use the core CPT /wp-json/wp/v2/edupress_event with meta.
 *
 * Every mapper validates the result against the domain zod schema and
 * returns null when a payload does not fit — a bad WP row is dropped, not
 * faked.
 */

export const WP_ID_PREFIX = "wp-";

/** Domain id ("wp-123") -> numeric WP post id. */
export function toWpPostId(id: string): number | null {
  const numeric = Number.parseInt(id.startsWith(WP_ID_PREFIX) ? id.slice(WP_ID_PREFIX.length) : id, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

/** WP post status -> domain content status (pending/private/future read as draft — documented approximation). */
export function wpStatusToContentStatus(status: string): ContentStatus {
  // Accept both WP's "publish" and the plugin endpoint's "published".
  return status === "publish" || status === "published" ? "published" : "draft";
}

/** Domain content status -> WP post status. */
export function contentStatusToWpStatus(status: ContentStatus): "publish" | "draft" {
  return status === "published" ? "publish" : "draft";
}

// ---- plugin-normalized notices ----------------------------------------------

/** Shape returned by the plugin's /edupress/v1/notices endpoint. */
export interface PluginNoticePayload {
  id: number;
  slug: string;
  title: string;
  body_md: string;
  category: string;
  priority: string;
  status: string;
  featured: boolean;
  published_at: string;
  expiry_at: string | null;
  attachment: { file_name: string; label: string } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Normalize an ISO-ish WP datetime to full ISO. WordPress stores GMT, so
 * naive datetimes (no offset — "2026-09-01T09:00:00", "2026-03-01 16:00")
 * are parsed as UTC; explicit offsets/Z are respected as given.
 */
function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim().replace(" ", "T");
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const date = new Date(hasOffset ? raw : `${raw}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Map one plugin-normalized payload to a Notice (null when it fails validation). */
export function mapPluginNotice(payload: unknown): Notice | null {
  if (typeof payload !== "object" || payload === null) return null;
  const row = payload as Partial<PluginNoticePayload>;
  const publishedAt = toIsoOrNull(row.published_at);
  const createdAt = toIsoOrNull(row.created_at) ?? publishedAt;
  const updatedAt = toIsoOrNull(row.updated_at) ?? createdAt;
  if (!publishedAt || !createdAt || !updatedAt) return null;

  const notice = {
    id: `${WP_ID_PREFIX}${row.id}`,
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    bodyMd: String(row.body_md ?? ""),
    category: (row.category ?? "general") as NoticeCategory,
    priority: (row.priority ?? "normal") as Notice["priority"],
    status: wpStatusToContentStatus(String(row.status ?? "draft")),
    featured: Boolean(row.featured),
    publishedAt,
    ...(row.expiry_at ? { expiryAt: toIsoOrNull(row.expiry_at) ?? undefined } : {}),
    ...(row.attachment && row.attachment.file_name && row.attachment.label
      ? {
          attachment: {
            fileName: String(row.attachment.file_name),
            label: String(row.attachment.label),
          },
        }
      : {}),
    createdAt,
    updatedAt,
  };
  // undefined expiry when the raw value was unparseable — drop the key entirely
  if (notice.expiryAt === undefined) delete notice.expiryAt;
  const parsed = NoticeSchema.safeParse(notice);
  return parsed.success ? parsed.data : null;
}

// ---- core CPT notices ----------------------------------------------------------

/** Fields of a WP core post object the connector reads. */
export interface CorePostPayload {
  id: number;
  slug: string;
  status: string;
  date_gmt: string;
  modified_gmt: string;
  title: { rendered?: string };
  content: { rendered?: string; raw?: string };
  excerpt?: { rendered?: string };
  meta?: Record<string, unknown>;
  edupress_notice_category?: number[];
}

/** Strip tags + decode the few entities WP leaves in rendered HTML. */
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#038;|&#38;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#8212;|&mdash;/g, "-")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Map a core CPT post to a Notice. `termsById` translates taxonomy term ids
 * into our category slugs. Body preference: content.raw (markdown, needs an
 * authenticated context=edit read), then tag-stripped content.rendered.
 */
export function mapCoreNotice(
  post: unknown,
  termsById: ReadonlyMap<number, string> = new Map(),
): Notice | null {
  if (typeof post !== "object" || post === null) return null;
  const row = post as Partial<CorePostPayload>;
  const meta = row.meta ?? {};
  const publishedAt = toIsoOrNull(row.date_gmt);
  const createdAt = publishedAt;
  const updatedAt = toIsoOrNull(row.modified_gmt) ?? createdAt;
  if (!publishedAt || !createdAt || !updatedAt) return null;

  const termId = Array.isArray(row.edupress_notice_category)
    ? row.edupress_notice_category[0]
    : undefined;
  const categoryFromTerm =
    termId !== undefined ? termsById.get(termId) : undefined;

  const body =
    row.content?.raw !== undefined && row.content.raw !== ""
      ? row.content.raw
      : htmlToText(row.content?.rendered ?? "");

  const expiryRaw = typeof meta.edupress_expiry === "string" ? meta.edupress_expiry : "";
  const attachmentUrl =
    typeof meta.edupress_attachment_url === "string" ? meta.edupress_attachment_url : "";
  const attachmentLabel =
    typeof meta.edupress_attachment_label === "string" ? meta.edupress_attachment_label : "";

  const notice = {
    id: `${WP_ID_PREFIX}${row.id}`,
    slug: String(row.slug ?? ""),
    title: htmlToText(row.title?.rendered ?? ""),
    bodyMd: body,
    category: (categoryFromTerm ?? "general") as NoticeCategory,
    priority:
      meta.edupress_priority === "high" || meta.edupress_priority === "urgent"
        ? meta.edupress_priority
        : ("normal" as Notice["priority"]),
    status: wpStatusToContentStatus(String(row.status ?? "draft")),
    featured: meta.edupress_featured === true,
    publishedAt,
    ...(expiryRaw ? { expiryAt: toIsoOrNull(expiryRaw) ?? undefined } : {}),
    ...(attachmentUrl && attachmentLabel
      ? { attachment: { fileName: attachmentUrl, label: attachmentLabel } }
      : {}),
    createdAt,
    updatedAt,
  };
  if (notice.expiryAt === undefined) delete notice.expiryAt;
  const parsed = NoticeSchema.safeParse(notice);
  return parsed.success ? parsed.data : null;
}

/** Domain notice values -> plugin POST /edupress/v1/notices body. */
export function noticeToPluginPayload(
  input: CreateNoticeInput | UpdateNoticeInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if ("slug" in input && input.slug !== undefined) body.slug = input.slug;
  if (input.bodyMd !== undefined) body.body_md = input.bodyMd;
  if (input.category !== undefined) body.category = input.category;
  if (input.priority !== undefined) body.priority = input.priority;
  if (input.status !== undefined) body.status = contentStatusToWpStatus(input.status);
  if (input.featured !== undefined) body.featured = input.featured;
  if (input.publishedAt !== undefined) body.published_at = input.publishedAt;
  if (input.expiryAt !== undefined) body.expiry_at = input.expiryAt ?? null;
  if (input.attachment !== undefined) {
    body.attachment =
      input.attachment === undefined
        ? null
        : {
            file_name: input.attachment.fileName,
            label: input.attachment.label,
          };
  }
  return body;
}

// ---- core CPT events -----------------------------------------------------------

export interface CoreEventPostPayload extends CorePostPayload {
  meta?: Record<string, unknown>;
}

/** Map a core edupress_event post to an Event (meta keys are the contract). */
export function mapCoreEvent(post: unknown): Event | null {
  if (typeof post !== "object" || post === null) return null;
  const row = post as Partial<CoreEventPostPayload>;
  const meta = row.meta ?? {};

  const startsAt =
    toIsoOrNull(meta.edupress_starts_at) ?? toIsoOrNull(row.date_gmt);
  const endsAt =
    toIsoOrNull(meta.edupress_ends_at) ?? toIsoOrNull(row.modified_gmt);
  if (!startsAt || !endsAt) return null;

  const event = {
    id: `${WP_ID_PREFIX}${row.id}`,
    slug: String(row.slug ?? ""),
    title: htmlToText(row.title?.rendered ?? ""),
    description:
      row.content?.raw !== undefined && row.content.raw !== ""
        ? row.content.raw
        : htmlToText(row.content?.rendered ?? ""),
    startsAt,
    endsAt,
    location:
      typeof meta.edupress_location === "string" ? meta.edupress_location : "Unspecified venue",
    category: (isEventCategory(meta.edupress_event_category)
      ? meta.edupress_event_category
      : "academic") as EventCategory,
    status: wpStatusToContentStatus(String(row.status ?? "draft")),
  };
  const parsed = EventSchema.safeParse(event);
  return parsed.success ? parsed.data : null;
}

function isEventCategory(value: unknown): value is EventCategory {
  return (
    value === "academic" ||
    value === "cultural" ||
    value === "sports" ||
    value === "holiday" ||
    value === "meeting"
  );
}

/** Domain event values -> core CPT POST/PUT body. */
export function eventToCorePayload(
  input: CreateEventInput | UpdateEventInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if ("slug" in input && input.slug !== undefined) body.slug = input.slug;
  if (input.description !== undefined) body.content = input.description;
  if (input.status !== undefined) body.status = contentStatusToWpStatus(input.status);
  const meta: Record<string, unknown> = {};
  if (input.startsAt !== undefined) meta.edupress_starts_at = input.startsAt;
  if (input.endsAt !== undefined) meta.edupress_ends_at = input.endsAt;
  if (input.location !== undefined) meta.edupress_location = input.location;
  if (input.category !== undefined) meta.edupress_event_category = input.category;
  if (Object.keys(meta).length > 0) body.meta = meta;
  return body;
}
