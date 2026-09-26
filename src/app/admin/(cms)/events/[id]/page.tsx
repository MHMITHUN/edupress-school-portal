import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge } from "@/components/ui";
import { EventForm } from "../EventForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit event" };

type EditEventPageProps = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await (await getCmsStore()).getEventById(id);
  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All events
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-bold text-fg">Edit event</h1>
          <Badge tone={event.status === "published" ? "success" : "neutral"}>
            {event.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted">
          {event.title}
          {event.status === "published" && (
            <Link
              href={`/events/${event.slug}`}
              className="ml-2 inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover"
            >
              View on site
              <ExternalLink className="size-3" aria-hidden="true" />
            </Link>
          )}
        </p>
      </header>
      <EventForm event={event} />
    </div>
  );
}
