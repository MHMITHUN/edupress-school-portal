import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Hourglass, Paperclip, Printer } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge } from "@/components/ui";
import { MarkdownView } from "@/components/content/MarkdownView";
import { NoticeItem } from "@/components/content/NoticeItem";
import {
  NOTICE_CATEGORY_LABELS,
  isPubliclyVisible,
  orderPublicNotices,
} from "@/lib/content/notices";
import { formatDate } from "@/lib/utils";

/**
 * Notice detail (spec 17.4). getBySlug getters return drafts too, so the
 * page itself enforces the publish + expiry rule with isPubliclyVisible()
 * before rendering — otherwise notFound().
 */

export const dynamic = "force-dynamic";

type NoticePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: NoticePageProps): Promise<Metadata> {
  const { slug } = await params;
  const notice = await (await getCmsStore()).getNoticeBySlug(slug);
  if (!notice || !isPubliclyVisible(notice)) {
    return { title: "Notice not found" };
  }
  return {
    title: notice.title,
    description: notice.bodyMd
      .replace(/[#*`>\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160),
  };
}

export default async function NoticeDetailPage({ params }: NoticePageProps) {
  const { slug } = await params;
  const store = await getCmsStore();
  const notice = await store.getNoticeBySlug(slug);

  if (!notice || !isPubliclyVisible(notice)) {
    notFound();
  }

  const related = orderPublicNotices(
    (
      await store.listNotices({
        status: "published",
        category: notice.category,
      })
    ).filter((row) => row.id !== notice.id),
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/notices"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All notices
      </Link>

      <article className="mt-5 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <header className="border-b border-border pb-5">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{NOTICE_CATEGORY_LABELS[notice.category]}</Badge>
            {notice.priority === "high" && <Badge tone="warning">High priority</Badge>}
            {notice.priority === "urgent" && <Badge tone="danger">Urgent</Badge>}
            {notice.featured && <Badge tone="accent">Featured</Badge>}
          </div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-fg sm:text-3xl">
            {notice.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              Published {formatDate(notice.publishedAt)}
            </p>
            {notice.expiryAt && (
              <p className="flex items-center gap-1.5">
                <Hourglass className="size-4" aria-hidden="true" />
                Valid until {formatDate(notice.expiryAt)}
              </p>
            )}
          </div>
          {notice.attachment && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg">
              <Paperclip className="size-3.5 text-accent" aria-hidden="true" />
              Attachment: {notice.attachment.label}
              <span className="text-muted">({notice.attachment.fileName})</span>
            </p>
          )}
        </header>

        <MarkdownView markdown={notice.bodyMd} className="mt-6" />

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="text-sm text-muted">
            Issued by the college office, {notice.category === "exam"
              ? "Examination Section"
              : notice.category === "admission"
                ? "Admission Desk"
                : "Notice Board"}
            .
          </p>
          <Link
            href={`/notices/${notice.slug}/print`}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Printer className="size-4" aria-hidden="true" />
            Printable view
          </Link>
        </footer>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-notices" className="mt-10">
          <h2 id="related-notices" className="mb-3 font-serif text-xl font-semibold text-fg">
            Related {NOTICE_CATEGORY_LABELS[notice.category].toLowerCase()} notices
          </h2>
          <div className="rounded-xl border border-border bg-surface px-5">
            {related.map((row) => (
              <NoticeItem key={row.id} notice={row} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
