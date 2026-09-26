import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { PrintButton } from "@/components/content/PrintButton";
import { MarkdownView } from "@/components/content/MarkdownView";
import { isPubliclyVisible } from "@/lib/content/notices";
import { formatDate } from "@/lib/utils";

/**
 * Printable notice view (spec 17.4): college letterhead, the notice body
 * and a signature block, styled for A4 with a real print stylesheet. The
 * on-screen controls (back / print) are hidden by the print styles.
 */

export const dynamic = "force-dynamic";

/** Print rules for this page only: the site chrome never reaches the paper. */
const PRINT_CSS = `
@media print {
  body > :not(main) { display: none !important; }
  main > div { padding: 0 !important; }
  body { background: #fff !important; }
}
@page { margin: 16mm; }
`;

type PrintPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PrintPageProps): Promise<Metadata> {
  const { slug } = await params;
  const notice = await (await getCmsStore()).getNoticeBySlug(slug);
  return { title: notice ? `${notice.title} — print` : "Notice not found" };
}

export default async function NoticePrintPage({ params }: PrintPageProps) {
  const { slug } = await params;
  const store = await getCmsStore();
  const notice = await store.getNoticeBySlug(slug);
  const settings = await store.getSettings();

  if (!notice || !isPubliclyVisible(notice)) {
    notFound();
  }

  return (
    <div className="py-8 print:py-0">
      {/* Page-local print stylesheet: hides the site chrome on paper only. */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 print:hidden">
        <Link
          href={`/notices/${notice.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to notice
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto mt-6 max-w-3xl border border-border bg-surface px-8 py-10 shadow-sm sm:px-12 print:mt-0 print:max-w-none print:border-0 print:p-0 print:shadow-none">
        {/* Letterhead */}
        <header className="border-b-2 border-accent pb-4 text-center">
          <h1 className="font-serif text-2xl font-bold uppercase tracking-wide text-fg">
            {settings.collegeName}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {settings.contact.address}
          </p>
          <p className="text-xs text-muted">
            Phone: {settings.contact.phone} · Email: {settings.contact.email}
          </p>
        </header>

        <p className="mt-6 text-center font-serif text-lg font-bold uppercase tracking-[0.2em] text-fg">
          Notice
        </p>
        <p className="mt-3 text-right text-sm text-fg">
          Date: {formatDate(notice.publishedAt)}
        </p>

        <h2 className="mt-2 font-serif text-xl font-bold leading-snug text-fg">
          {notice.title}
        </h2>
        {notice.expiryAt && (
          <p className="mt-1 text-sm text-muted">
            (This notice is valid until {formatDate(notice.expiryAt)}.)
          </p>
        )}

        <MarkdownView markdown={notice.bodyMd} className="mt-5" />

        {notice.attachment && (
          <p className="mt-6 border border-border bg-surface-2 px-4 py-2 text-sm text-fg print:border-0 print:bg-transparent">
            <strong className="font-semibold">Attachment:</strong>{" "}
            {notice.attachment.label} ({notice.attachment.fileName}) — available
            from the college office and the portal downloads desk.
          </p>
        )}

        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <p className="font-serif text-base font-semibold text-fg">
              {settings.principal.name}
            </p>
            <p className="text-sm text-muted">{settings.principal.title}</p>
            <p className="text-sm text-muted">{settings.collegeName}</p>
          </div>
        </div>

        <footer className="mt-10 border-t border-border pt-3 text-center text-[11px] text-muted print:hidden">
          Printed from the {settings.collegeName} portal — demo document with
          fictional content.
        </footer>
      </article>
    </div>
  );
}
