"use client";

import { useActionState } from "react";
import { saveNoticeAction, type AdminFormState } from "@/app/admin/actions";
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
import type { Notice } from "@/lib/db/types";

const initialState: AdminFormState = {};

const CATEGORIES: Array<{ value: Notice["category"]; label: string }> = [
  { value: "general", label: "General" },
  { value: "exam", label: "Examination" },
  { value: "admission", label: "Admission" },
  { value: "event", label: "Event" },
  { value: "holiday", label: "Holiday" },
  { value: "result", label: "Result" },
];

/**
 * Notice create/edit form (spec 17.4 + 17.8): EVERY notice field including
 * expiry, attachment metadata and the featured toggle. Field errors come
 * back from the zod-validated server action.
 */
export function NoticeForm({ notice }: { notice?: Notice }) {
  const [state, formAction, pending] = useActionState(
    saveNoticeAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {notice && <input type="hidden" name="id" value={notice.id} />}
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
            name="notice-title"
            className="sm:col-span-2"
            error={errors.title}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="title"
                required
                defaultValue={notice?.title ?? ""}
                placeholder="e.g. HSC Test Examination Routine 2026"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Slug"
            name="notice-slug"
            hint="URL segment, e.g. hsc-test-routine-2026"
            error={errors.slug}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="slug"
                required
                defaultValue={notice?.slug ?? ""}
                placeholder="hsc-test-routine-2026"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Category" name="notice-category" error={errors.category}>
            {(aria) => (
              <Select
                id={aria.id}
                name="category"
                defaultValue={notice?.category ?? "general"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                {CATEGORIES.map((row) => (
                  <option key={row.value} value={row.value}>
                    {row.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Priority" name="notice-priority" error={errors.priority}>
            {(aria) => (
              <Select
                id={aria.id}
                name="priority"
                defaultValue={notice?.priority ?? "normal"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            )}
          </Field>

          <Field label="Status" name="notice-status" error={errors.status}>
            {(aria) => (
              <Select
                id={aria.id}
                name="status"
                defaultValue={notice?.status ?? "draft"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published</option>
              </Select>
            )}
          </Field>

          <Field
            label="Published at"
            name="notice-publishedAt"
            hint="Treated as UTC."
            error={errors.publishedAt}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="publishedAt"
                type="datetime-local"
                required
                defaultValue={isoToDatetimeLocal(notice?.publishedAt) || isoToDatetimeLocal(new Date().toISOString())}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Expires at (optional)"
            name="notice-expiryAt"
            hint="Hidden from public listings after this moment. Leave blank for none (an existing expiry cannot be cleared yet)."
            error={errors.expiryAt}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="expiryAt"
                type="datetime-local"
                defaultValue={isoToDatetimeLocal(notice?.expiryAt)}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <div className="flex items-center gap-2.5 sm:col-span-2">
            <input
              type="checkbox"
              id="notice-featured"
              name="featured"
              defaultChecked={notice?.featured ?? false}
              className="size-4 rounded border-border accent-[#7c2d3e]"
            />
            <label htmlFor="notice-featured" className="text-sm font-medium text-fg">
              Featured — pin to the top of the public notice board
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Field
            label="Body (Markdown)"
            name="notice-bodyMd"
            hint="Headings, lists, bold and links are supported."
            error={errors.bodyMd}
          >
            {(aria) => (
              <Textarea
                id={aria.id}
                name="bodyMd"
                required
                rows={12}
                defaultValue={notice?.bodyMd ?? ""}
                placeholder="Write the notice body…"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Attachment file name (optional)"
            name="notice-attachmentFileName"
            hint="e.g. routine-2026.pdf"
            error={errors.attachmentFileName}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="attachmentFileName"
                defaultValue={notice?.attachment?.fileName ?? ""}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
          <Field
            label="Attachment label (optional)"
            name="notice-attachmentLabel"
            hint="Shown to the public, e.g. Routine PDF (420 KB)"
            error={errors.attachmentLabel}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="attachmentLabel"
                defaultValue={notice?.attachment?.label ?? ""}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
          <p className="text-xs text-muted sm:col-span-2">
            Both attachment fields must be filled together; leaving them empty
            keeps the current attachment.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" loading={pending}>
          {pending ? "Saving…" : notice ? "Save changes" : "Create notice"}
        </Button>
      </div>
    </form>
  );
}
