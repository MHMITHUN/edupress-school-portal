"use client";

import { useActionState } from "react";
import { saveDownloadAction, type AdminFormState } from "@/app/admin/actions";
import { Button, Card, CardContent, Field, Input, Select } from "@/components/ui";
import type { Download } from "@/lib/db/types";

const initialState: AdminFormState = {};

function toDateInput(iso: string | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/**
 * Download entry create/edit form (spec 17.8). Entries describe documents
 * (the demo serves no real files — the public page links the office path).
 */
export function DownloadForm({ download }: { download?: Download }) {
  const [state, formAction, pending] = useActionState(
    saveDownloadAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {download && <input type="hidden" name="id" value={download.id} />}
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
            name="download-title"
            className="sm:col-span-2"
            error={errors.title}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="title"
                required
                defaultValue={download?.title ?? ""}
                placeholder="e.g. Admission Form 2026-27"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Category" name="download-category" error={errors.category}>
            {(aria) => (
              <Select
                id={aria.id}
                name="category"
                defaultValue={download?.category ?? "admission-form"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="admission-form">Admission forms</option>
                <option value="syllabus">Syllabuses</option>
                <option value="routine">Class routines</option>
                <option value="prospectus">Prospectus</option>
                <option value="notice">Official notice copies</option>
              </Select>
            )}
          </Field>

          <Field label="Format" name="download-format" error={errors.format}>
            {(aria) => (
              <Select
                id={aria.id}
                name="format"
                defaultValue={download?.format ?? "pdf"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="xlsx">XLSX</option>
              </Select>
            )}
          </Field>

          <Field
            label="File name"
            name="download-fileName"
            hint="Must match the format extension."
            error={errors.fileName}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="fileName"
                required
                defaultValue={download?.fileName ?? ""}
                placeholder="admission-form-2026.pdf"
                className="font-mono"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Size label"
            name="download-sizeLabel"
            hint="Human-readable, e.g. 240 KB"
            error={errors.sizeLabel}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="sizeLabel"
                required
                defaultValue={download?.sizeLabel ?? ""}
                placeholder="240 KB"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Updated on" name="download-updatedAt" error={errors.updatedAt}>
            {(aria) => (
              <Input
                id={aria.id}
                name="updatedAt"
                type="date"
                required
                defaultValue={toDateInput(download?.updatedAt)}
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
          {pending ? "Saving…" : download ? "Save changes" : "Create entry"}
        </Button>
      </div>
    </form>
  );
}
