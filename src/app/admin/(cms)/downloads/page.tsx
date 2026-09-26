import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, EmptyState, Table, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteDownloadAction } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import type { DownloadCategory } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Downloads" };

const CATEGORY_LABELS: Record<DownloadCategory, string> = {
  "admission-form": "Admission forms",
  syllabus: "Syllabuses",
  routine: "Class routines",
  prospectus: "Prospectus",
  notice: "Notices",
};

export default async function AdminDownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const downloads = await (await getCmsStore()).listDownloads();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Documents counter
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Downloads</h1>
          <p className="mt-1 text-sm text-muted">
            {downloads.length} entr{downloads.length === 1 ? "y" : "ies"} — the
            public page groups them by category.
          </p>
        </div>
        <Link
          href="/admin/downloads/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          New entry
        </Link>
      </header>

      <SavedAlert saved={saved} error={error} />

      {downloads.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>File</TH>
              <TH>Size</TH>
              <TH>Updated</TH>
              <TH className="text-right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {downloads.map((download) => (
              <TableRow key={download.id}>
                <TD>
                  <Link
                    href={`/admin/downloads/${download.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {download.title}
                  </Link>
                </TD>
                <TD className="text-muted">{CATEGORY_LABELS[download.category]}</TD>
                <TD className="font-mono text-xs text-muted">
                  {download.fileName}
                </TD>
                <TD>
                  <Badge tone="neutral">{download.format.toUpperCase()}</Badge>{" "}
                  <span className="text-muted">{download.sizeLabel}</span>
                </TD>
                <TD className="text-muted">{formatDate(download.updatedAt)}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin/downloads/${download.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <ConfirmSubmit
                      action={deleteDownloadAction}
                      id={download.id}
                      title="Delete this download entry?"
                      description={`"${download.title}" will be removed from the public downloads page permanently.`}
                    />
                  </div>
                </TD>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No download entries yet"
          description="Add the first document to the counter."
          action={
            <Link
              href="/admin/downloads/new"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Create an entry
            </Link>
          }
        />
      )}
    </div>
  );
}
