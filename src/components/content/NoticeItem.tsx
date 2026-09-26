import Link from "next/link";
import { CalendarDays, Paperclip, Pin, Star } from "lucide-react";
import type { Notice } from "@/lib/db/types";
import type { NoticePriority } from "@/lib/db/types";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { NOTICE_CATEGORY_LABELS } from "@/lib/content/notices";

/**
 * One row of the public notice board (home page preview + /notices list):
 * date, category badge, priority badge, featured pin, title link and an
 * attachment indicator. No body content — the link owns the detail view.
 */

const PRIORITY_TONE: Record<NoticePriority, "neutral" | "warning" | "danger"> = {
  normal: "neutral",
  high: "warning",
  urgent: "danger",
};

export function NoticeItem({
  notice,
  showPinned = true,
  className,
}: {
  notice: Notice;
  /** Draw the "Pinned" marker on featured notices (list view). */
  showPinned?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-4",
        className,
      )}
    >
      <p className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted sm:w-24 sm:flex-col sm:items-start sm:gap-0.5">
        <CalendarDays className="size-3.5 sm:hidden" aria-hidden="true" />
        <span>{formatDate(notice.publishedAt)}</span>
        <span className="hidden text-[11px] font-normal uppercase tracking-wide sm:block">
          {notice.featured && showPinned ? "Featured" : "Published"}
        </span>
      </p>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{NOTICE_CATEGORY_LABELS[notice.category]}</Badge>
          {notice.priority !== "normal" && (
            <Badge tone={PRIORITY_TONE[notice.priority]}>
              {notice.priority === "urgent" ? "Urgent" : "High priority"}
            </Badge>
          )}
          {notice.featured && showPinned && (
            <Badge tone="accent">
              <Pin className="mr-1 size-3" aria-hidden="true" />
              Pinned
            </Badge>
          )}
        </div>
        <h3 className="text-base font-semibold leading-snug text-fg">
          <Link
            href={`/notices/${notice.slug}`}
            className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {notice.title}
          </Link>
        </h3>
        {notice.attachment && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Paperclip className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Attachment: </span>
            {notice.attachment.label}
          </p>
        )}
      </div>
      {notice.featured && showPinned && (
        <Star
          className="hidden size-4 shrink-0 text-accent sm:block"
          aria-hidden="true"
        />
      )}
    </article>
  );
}
