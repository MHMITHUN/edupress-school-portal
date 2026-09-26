import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge } from "@/components/ui";
import { formatDateTime, isPastIso } from "@/lib/utils";
import type { EventCategory } from "@/lib/db/types";

/**
 * Event detail: date/location/description card. getBySlug returns drafts
 * too, so the page itself enforces published-only before rendering.
 */

export const dynamic = "force-dynamic";

const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  academic: "Academic",
  cultural: "Cultural",
  sports: "Sports",
  holiday: "Holiday",
  meeting: "Meeting",
};

type EventPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await (await getCmsStore()).getEventBySlug(slug);
  if (!event || event.status !== "published") {
    return { title: "Event not found" };
  }
  return {
    title: event.title,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const store = await getCmsStore();
  const event = await store.getEventBySlug(slug);

  if (!event || event.status !== "published") {
    notFound();
  }

  const others = (await store.listEvents({ status: "published", upcoming: true }))
    .filter((row) => row.id !== event.id)
    .slice(0, 3);

  const isPast = isPastIso(event.endsAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All events
      </Link>

      <article className="mt-5 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
          <Badge tone={isPast ? "neutral" : "accent"}>
            {isPast ? "Concluded" : "Upcoming"}
          </Badge>
        </div>
        <h1 className="font-serif text-2xl font-bold leading-tight text-fg sm:text-3xl">
          {event.title}
        </h1>

        <dl className="mt-5 grid gap-4 rounded-lg border border-border bg-surface-2/60 p-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Starts
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-fg">
              <CalendarDays className="size-4 text-accent" aria-hidden="true" />
              {formatDateTime(event.startsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Ends
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-fg">
              <CalendarDays className="size-4 text-accent" aria-hidden="true" />
              {formatDateTime(event.endsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Venue
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-fg">
              <MapPin className="size-4 text-accent" aria-hidden="true" />
              {event.location}
            </dd>
          </div>
        </dl>

        <div className="prose-p-0 mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-fg">
          {event.description.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {others.length > 0 && (
        <section aria-labelledby="other-events" className="mt-10">
          <h2 id="other-events" className="mb-3 font-serif text-xl font-semibold text-fg">
            Other upcoming events
          </h2>
          <ul className="flex flex-col gap-3">
            {others.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/events/${row.slug}`}
                  className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <p className="text-xs font-medium text-muted">
                    {formatDateTime(row.startsAt)} · {row.location}
                  </p>
                  <p className="font-serif text-base font-semibold text-fg">
                    {row.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
