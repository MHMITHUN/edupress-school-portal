"use client";

import { useActionState } from "react";
import { saveEventAction, type AdminFormState } from "@/app/admin/actions";
import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { isoToDatetimeLocal } from "@/lib/validation/content";
import type { Event } from "@/lib/db/types";

const initialState: AdminFormState = {};

/**
 * Event create/edit form (spec 17.8): slug, title, description, start/end
 * (UTC datetime pickers), location, category and status.
 */
export function EventForm({ event }: { event?: Event }) {
  const [state, formAction, pending] = useActionState(
    saveEventAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {event && <input type="hidden" name="id" value={event.id} />}
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Title"
            name="event-title"
            className="sm:col-span-2"
            error={errors.title}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="title"
                required
                defaultValue={event?.title ?? ""}
                placeholder="e.g. Annual Science Fair 2026"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Slug"
            name="event-slug"
            hint="URL segment, e.g. science-fair-2026"
            error={errors.slug}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="slug"
                required
                defaultValue={event?.slug ?? ""}
                placeholder="science-fair-2026"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Category" name="event-category" error={errors.category}>
            {(aria) => (
              <Select
                id={aria.id}
                name="category"
                defaultValue={event?.category ?? "academic"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="holiday">Holiday</option>
                <option value="meeting">Meeting</option>
              </Select>
            )}
          </Field>

          <Field
            label="Starts at"
            name="event-startsAt"
            hint="Treated as UTC."
            error={errors.startsAt}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="startsAt"
                type="datetime-local"
                required
                defaultValue={isoToDatetimeLocal(event?.startsAt)}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Ends at"
            name="event-endsAt"
            hint="Must be after the start."
            error={errors.endsAt}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="endsAt"
                type="datetime-local"
                required
                defaultValue={isoToDatetimeLocal(event?.endsAt)}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Location" name="event-location" error={errors.location}>
            {(aria) => (
              <Input
                id={aria.id}
                name="location"
                required
                defaultValue={event?.location ?? ""}
                placeholder="e.g. College Auditorium"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Status" name="event-status" error={errors.status}>
            {(aria) => (
              <Select
                id={aria.id}
                name="status"
                defaultValue={event?.status ?? "draft"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published</option>
              </Select>
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Field
            label="Description"
            name="event-description"
            hint="Plain paragraphs — shown on the events list and detail page."
            error={errors.description}
          >
            {(aria) => (
              <Textarea
                id={aria.id}
                name="description"
                required
                rows={6}
                defaultValue={event?.description ?? ""}
                placeholder="What happens at this event, who takes part, timings…"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" loading={pending}>
          {pending ? "Saving…" : event ? "Save changes" : "Create event"}
        </Button>
      </div>
    </form>
  );
}
