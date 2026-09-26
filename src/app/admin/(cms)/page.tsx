import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, Inbox } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TH,
  TD,
} from "@/components/ui";
import { formatRelative } from "@/lib/utils";
import { NOTICE_CATEGORY_LABELS } from "@/lib/content/notices";

/**
 * CMS dashboard (spec 17.8): per-collection count cards, latest notices
 * table and the recent inquiry inbox. Everything reads the live store, so
 * the numbers are true for whichever CMS mode is active.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const store = await getCmsStore();
  const [stats, notices, inquiries] = await Promise.all([
    store.getStats(),
    store.listNotices({ limit: 6 }),
    store.listInquiries(),
  ]);

  const cards = [
    { label: "Notices", value: stats.notices, hint: `${stats.publishedNotices} published & unexpired`, href: "/admin/notices" },
    { label: "Events", value: stats.events, hint: "All statuses", href: "/admin/events" },
    { label: "Teachers", value: stats.teachers, hint: "Faculty directory", href: "/admin/teachers" },
    { label: "Departments", value: stats.departments, hint: "Academic departments", href: "/admin/departments" },
    { label: "Result sessions", value: stats.resultSessions, hint: "Draft + published", href: "/admin/results" },
    { label: "Gallery items", value: stats.galleryItems, hint: "CSS-art tiles", href: "/admin/gallery" },
    { label: "Downloads", value: stats.downloads, hint: "Documents counter", href: "/admin/downloads" },
    {
      label: "Inquiries",
      value: stats.inquiries,
      hint: `${stats.newInquiries} unread`,
      href: "/admin/inquiries",
    },
  ];

  const recentInquiries = inquiries.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Content management
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            The state of every content collection at a glance.
          </p>
        </div>
        <Link
          href="/admin/notices/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <BellRing className="size-4" aria-hidden="true" />
          New notice
        </Link>
      </header>

      {/* Count cards */}
      <section aria-labelledby="counts-heading">
        <h2 id="counts-heading" className="sr-only">
          Collection counts
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <li key={card.label}>
              <Link
                href={card.href}
                className="group flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {card.label}
                </p>
                <p className="font-serif text-3xl font-bold text-fg group-hover:text-accent">
                  {card.value}
                </p>
                <p className="text-xs text-muted">{card.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Latest notices */}
      <section aria-labelledby="latest-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="latest-heading" className="font-serif text-xl font-semibold text-fg">
            Latest notices
          </h2>
          <Link
            href="/admin/notices"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Manage notices
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        {notices.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TH>Title</TH>
                <TH>Category</TH>
                <TH>Priority</TH>
                <TH>Status</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TD>
                    <Link
                      href={`/admin/notices/${notice.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {notice.title}
                    </Link>
                  </TD>
                  <TD className="text-muted">
                    {NOTICE_CATEGORY_LABELS[notice.category]}
                  </TD>
                  <TD className="text-muted capitalize">{notice.priority}</TD>
                  <TD>
                    <Badge tone={notice.status === "published" ? "success" : "neutral"}>
                      {notice.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TD>
                </TableRow>
              ))}
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
      </section>

      {/* Recent inquiries */}
      <section aria-labelledby="inquiries-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="inquiries-heading" className="font-serif text-xl font-semibold text-fg">
            Recent inquiries
          </h2>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Open inbox
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        {recentInquiries.length > 0 ? (
          <Card>
            <CardHeader className="border-b-0 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Inbox className="size-4 text-accent" aria-hidden="true" />
                {stats.newInquiries > 0
                  ? `${stats.newInquiries} unread of ${stats.inquiries}`
                  : "All caught up"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="divide-y divide-border">
                {recentInquiries.map((inquiry) => (
                  <li key={inquiry.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="flex flex-col gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-fg">
                          {inquiry.subject}
                        </span>
                        <span className="text-xs text-muted">
                          {inquiry.name} · {inquiry.email}
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
            title="No inquiries yet"
            description="Messages from the public contact form will land here."
          />
        )}
      </section>
    </div>
  );
}
