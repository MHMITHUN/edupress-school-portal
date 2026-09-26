import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, CloudUpload, Pencil, Plus } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, EmptyState, Table, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import {
  deleteResultSessionAction,
  setResultSessionStatusAction,
} from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Results" };

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const store = await getCmsStore();
  const sessions = await store.listResultSessions();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Examination results
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
            Result sessions
          </h1>
          <p className="mt-1 text-sm text-muted">
            Only published sessions appear in the public verification flow
            (spec 17.7).
          </p>
        </div>
        <Link
          href="/admin/results/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          New session
        </Link>
      </header>

      <SavedAlert saved={saved} error={error} />

      {sessions.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Examination</TH>
              <TH>Class group</TH>
              <TH>Students</TH>
              <TH>Published on</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => {
              const published = session.status === "published";
              return (
                <TableRow key={session.id}>
                  <TD>
                    <Link
                      href={`/admin/results/${session.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {session.exam} {session.year}
                    </Link>
                  </TD>
                  <TD className="text-muted">
                    {session.className} ({session.classLevel})
                  </TD>
                  <TD className="text-muted">{session.results.length}</TD>
                  <TD className="text-muted">
                    {formatDate(session.publishedAt)}
                  </TD>
                  <TD>
                    <Badge tone={published ? "success" : "neutral"}>
                      {published ? "Published" : "Draft"}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/results/${session.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <form action={setResultSessionStatusAction}>
                        <input type="hidden" name="id" value={session.id} />
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
                        action={deleteResultSessionAction}
                        id={session.id}
                        title="Delete this result session?"
                        description={`${session.exam} ${session.year} (${session.results.length} student rows) will be removed permanently. This cannot be undone.`}
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
          title="No result sessions yet"
          description="Create the first examination session with its student rows."
          action={
            <Link
              href="/admin/results/new"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Create a session
            </Link>
          }
        />
      )}
    </div>
  );
}
