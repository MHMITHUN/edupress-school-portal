import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "../EventForm";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
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
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">New event</h1>
        <p className="mt-1 text-sm text-muted">
          Upcoming published events appear on the home page and the events
          calendar.
        </p>
      </header>
      <EventForm />
    </div>
  );
}
