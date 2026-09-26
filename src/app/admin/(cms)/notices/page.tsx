import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, CloudUpload, Pencil, Plus } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import {
  Badge,
  EmptyState,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TH,
  TD,
} from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import {
  deleteNoticeAction,
  setNoticeStatusAction,
} from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import { NOTICE_CATEGORY_LABELS } from "@/lib/content/notices";

/**
 * Notices manager (spec 17.8): table with status + priority + featured,
 * inline publish/unpublish, delete with confirm dialog, and links into the
 * full create/edit form.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Notices" };

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const store = await getCmsStore();
  const notices = await store.listNotices();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Notice board
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Notices</h1>
          <p className="mt-1 text-sm text-muted">
            {notices.length} notice{notices.length === 1 ? "" : "s"} — drafts,
            published and expired alike.
          </p>
        </div>
        <Link
          href="/admin/notices/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          New notice
        </Link>
      </header>

      <SavedAlert saved={saved} error={error} />

      {notices.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>Priority</TH>
              <TH>Status</TH>
              <TH>Published</TH>
              <TH className="text-right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {notices.map((notice) => {
              const published = notice.status === "published";
              return (
                <TableRow key={notice.id}>
                  <TD>
                    <Link
                      href={`/admin/notices/${notice.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {notice.title}
                    </Link>
                    {notice.featured && (
                      <span className="ml-2 inline-flex rounded-md border border-accent/20 bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent">
                        Featured
                      </span>
                    )}
                    {notice.expiryAt && (
                      <span className="mt-1 block text-xs text-muted">
                        Expires {formatDate(notice.expiryAt)}
                      </span>
                    )}
                  </TD>
                  <TD className="text-muted">
                    {NOTICE_CATEGORY_LABELS[notice.category]}
                  </TD>
                  <TD>
                    <Badge
                      tone={
                        notice.priority === "urgent"
                          ? "danger"
                          : notice.priority === "high"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      <span className="capitalize">{notice.priority}</span>
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone={published ? "success" : "neutral"}>
                      {published ? "Published" : "Draft"}
                    </Badge>
                  </TD>
                  <TD className="text-muted">{formatDate(notice.publishedAt)}</TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/notices/${notice.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <form action={setNoticeStatusAction}>
                        <input type="hidden" name="id" value={notice.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={published ? "draft" : "published"}
                        />
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          {published ? (
                            <>
                              <CloudOff className="size-3.5" aria-hidden="true" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CloudUpload className="size-3.5" aria-hidden="true" />
                              Publish
                            </>
                          )}
                        </button>
                      </form>
                      <ConfirmSubmit
                        action={deleteNoticeAction}
                        id={notice.id}
                        title="Delete this notice?"
                        description={`"${notice.title}" will be removed permanently from every listing. This cannot be undone.`}
                      />
                    </div>
                  </TD>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No notices yet"
          description="Create the first notice for the public notice board."
          action={
            <Link
              href="/admin/notices/new"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Create a notice
            </Link>
          }
        />
      )}
    </div>
  );
}
