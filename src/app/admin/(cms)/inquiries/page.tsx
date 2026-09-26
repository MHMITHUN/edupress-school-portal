import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import {
  Badge,
  Card,
  CardContent,
  EmptyState,
  Select,
} from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { formatRelative } from "@/lib/utils";
import type { InquiryStatus } from "@/lib/db/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inquiries" };

/**
 * Inquiry inbox (spec 17.8): status filter (new/read via GET param), list
 * with sender + relative time; the row links to the full message view.
 */

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; status?: string }>;
}) {
  const { saved, error, status } = await searchParams;
  const filter: InquiryStatus | undefined =
    status === "new" || status === "read" ? status : undefined;

  const store = await getCmsStore();
  const [inquiries, all] = await Promise.all([
    store.listInquiries(filter),
    store.listInquiries(),
  ]);
  const unread = all.filter((row) => row.status === "new").length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Contact form
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Inquiry inbox
        </h1>
        <p className="mt-1 text-sm text-muted">
          {all.length} message{all.length === 1 ? "" : "s"} ·{" "}
          {unread > 0 ? `${unread} unread` : "all read"}.
        </p>
      </header>

      <SavedAlert saved={saved} error={error} />

      <form
        method="get"
        action="/admin/inquiries"
        className="flex items-end gap-3"
      >
        <div className="w-44">
          <label
            htmlFor="inquiry-status"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Show
          </label>
          <Select id="inquiry-status" name="status" defaultValue={filter ?? ""}>
            <option value="">All messages</option>
            <option value="new">Unread only</option>
            <option value="read">Read only</option>
          </Select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Apply
        </button>
      </form>

      {inquiries.length > 0 ? (
        <Card>
          <CardContent className="pt-2">
            <ul className="divide-y divide-border">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id} className="py-4 first:pt-2 last:pb-0">
                  <Link
                    href={`/admin/inquiries/${inquiry.id}`}
                    className={cn(
                      "flex flex-col gap-1 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span
                        className={cn(
                          "truncate text-sm text-fg",
                          inquiry.status === "new" && "font-semibold",
                        )}
                      >
                        {inquiry.subject}
                      </span>
                      <span className="text-xs text-muted">
                        {inquiry.name} · {inquiry.email}
                        {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                      <Badge tone={inquiry.status === "new" ? "accent" : "neutral"}>
                        {inquiry.status === "new" ? "New" : "Read"}
                      </Badge>
                      {formatRelative(inquiry.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Inbox}
          title="Nothing here"
          description={
            filter === "new"
              ? "No unread inquiries — the inbox is clear."
              : "No inquiries yet. Messages from the public contact form will land here."
          }
        />
      )}
    </div>
  );
}
