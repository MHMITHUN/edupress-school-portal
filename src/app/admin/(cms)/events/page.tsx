import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, CloudUpload, Pencil, Plus } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, EmptyState, Table, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteEventAction, setEventStatusAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Events" };

const CATEGORY_LABELS: Record<string, string> = {
  academic: "Academic",
  cultural: "Cultural",
  sports: "Sports",
  holiday: "Holiday",
  meeting: "Meeting",
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const store = await getCmsStore();
  const events = await store.listEvents();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            College calendar
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Events</h1>
          <p className="mt-1 text-sm text-muted">
            {events.length} event{events.length === 1 ? "" : "s"} — newest first.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          New event
        </Link>
      </header>

      <SavedAlert saved={saved} error={error} />

      {events.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>Starts</TH>
              <TH>Location</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => {
              const published = event.status === "published";
              return (
                <TableRow key={event.id}>
                  <TD>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {event.title}
                    </Link>
                  </TD>
                  <TD className="text-muted">{CATEGORY_LABELS[event.category]}</TD>
                  <TD className="text-muted">{formatDateTime(event.startsAt)}</TD>
                  <TD className="text-muted">{event.location}</TD>
                  <TD>
                    <Badge tone={published ? "success" : "neutral"}>
                      {published ? "Published" : "Draft"}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <form action={setEventStatusAction}>
                        <input type="hidden" name="id" value={event.id} />
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
                        action={deleteEventAction}
                        id={event.id}
                        title="Delete this event?"
                        description={`"${event.title}" will be removed from the calendar permanently. This cannot be undone.`}
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
          title="No events yet"
          description="Create the first calendar event."
          action={
            <Link
              href="/admin/events/new"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Create an event
            </Link>
          }
        />
      )}
    </div>
  );
}
