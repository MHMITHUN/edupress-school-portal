import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, CalendarDays, MapPin } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { Event, EventCategory } from "@/lib/db/types";

/**
 * Events (spec 17.2): upcoming (soonest first) and past (latest first)
 * sections. Draft events never appear — the store filters by status.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Academic, cultural and sports events of Padma Model College — upcoming and past.",
};

const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  academic: "Academic",
  cultural: "Cultural",
  sports: "Sports",
  holiday: "Holiday",
  meeting: "Meeting",
};

function EventCard({ event, upcoming }: { event: Event; upcoming: boolean }) {
  return (
    <li>
      <Link
        href={`/events/${event.slug}`}
        className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <CalendarDays className="size-3.5 text-accent" aria-hidden="true" />
            {formatDateTime(event.startsAt)}
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold leading-snug text-fg group-hover:text-accent">
            {event.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
            {event.description}
          </p>
        </div>
        <p className="mt-auto flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
          {event.location}
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {upcoming ? "Upcoming" : "Concluded"}
          </span>
        </p>
      </Link>
    </li>
  );
}

export default async function EventsPage() {
  const store = await getCmsStore();
  const [upcoming, past] = await Promise.all([
    store.listEvents({ status: "published", upcoming: true }),
    store.listEvents({ status: "published", upcoming: false }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          College calendar
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Events
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Fairs, olympiads, sports, cultural evenings and guardian sessions —
          published by the college office as they are scheduled.
        </p>
      </header>

      <section aria-labelledby="upcoming-events-heading" className="mb-12">
        <h2
          id="upcoming-events-heading"
          className="mb-4 font-serif text-2xl font-semibold text-fg"
        >
          Upcoming events
        </h2>
        {upcoming.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} upcoming={true} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No upcoming events"
            description="Nothing is scheduled right now — new events will appear here as soon as the office publishes them."
          />
        )}
      </section>

      <section aria-labelledby="past-events-heading">
        <h2
          id="past-events-heading"
          className="mb-4 font-serif text-2xl font-semibold text-fg"
        >
          Past events
        </h2>
        {past.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} upcoming={false} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No past events recorded"
            description="Published event reports will be listed here after they take place."
          />
        )}
      </section>
    </div>
  );
}
