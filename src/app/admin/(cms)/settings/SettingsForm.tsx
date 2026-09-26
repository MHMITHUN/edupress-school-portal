"use client";

import { useActionState } from "react";
import { saveSettingsAction, type AdminFormState } from "@/app/admin/actions";
import { Button, Card, CardContent, Field, Input, Textarea } from "@/components/ui";
import type { SiteSettings } from "@/lib/db/types";

const initialState: AdminFormState = {};

/**
 * Site settings form (spec 17.8, ADMIN-only): college identity, the site
 * banner announcement, contact block and the principal's message — every
 * field feeds a live public surface.
 */
export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    saveSettingsAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
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
            label="College name"
            name="settings-collegeName"
            error={errors.collegeName}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="collegeName"
                required
                defaultValue={settings.collegeName}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
          <Field label="Tagline" name="settings-tagline" error={errors.tagline}>
            {(aria) => (
              <Input
                id={aria.id}
                name="tagline"
                required
                defaultValue={settings.tagline}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <Field
            label="Announcement text"
            name="settings-announcementText"
            hint="Shown in the maroon banner at the top of the public site."
            error={errors.announcementText}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="announcementText"
                defaultValue={settings.announcement.text}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
          <div className="flex items-center gap-2.5 pt-6">
            <input
              type="checkbox"
              id="settings-announcementActive"
              name="announcementActive"
              defaultChecked={settings.announcement.active}
              className="size-4 rounded border-border accent-[#7c2d3e]"
            />
            <label
              htmlFor="settings-announcementActive"
              className="text-sm font-medium text-fg"
            >
              Show announcement
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Address"
            name="settings-contactAddress"
            className="sm:col-span-2"
            error={errors.contactAddress}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="contactAddress"
                required
                defaultValue={settings.contact.address}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
          <Field
            label="Phone"
            name="settings-contactPhone"
            error={errors.contactPhone}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="contactPhone"
                required
                defaultValue={settings.contact.phone}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
          <Field
            label="Email"
            name="settings-contactEmail"
            error={errors.contactEmail}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="contactEmail"
                type="email"
                required
                defaultValue={settings.contact.email}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Principal's name"
              name="settings-principalName"
              error={errors.principalName}
            >
              {(aria) => (
                <Input
                  id={aria.id}
                  name="principalName"
                  required
                  defaultValue={settings.principal.name}
                  invalid={aria.invalid}
                  aria-describedby={aria["aria-describedby"]}
                  aria-invalid={aria["aria-invalid"]}
                />
              )}
            </Field>
            <Field
              label="Principal's title"
              name="settings-principalTitle"
              error={errors.principalTitle}
            >
              {(aria) => (
                <Input
                  id={aria.id}
                  name="principalTitle"
                  required
                  defaultValue={settings.principal.title}
                  invalid={aria.invalid}
                  aria-describedby={aria["aria-describedby"]}
                  aria-invalid={aria["aria-invalid"]}
                />
              )}
            </Field>
          </div>
          <Field
            label="Principal's message (Markdown)"
            name="settings-principalMessageMd"
            hint="Full text on /principal; the home page shows the opening lines."
            error={errors.principalMessageMd}
          >
            {(aria) => (
              <Textarea
                id={aria.id}
                name="principalMessageMd"
                required
                rows={12}
                defaultValue={settings.principal.messageMd}
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
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
