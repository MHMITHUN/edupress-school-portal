"use client";

import { useActionState } from "react";
import { saveResultSessionAction, type AdminFormState } from "@/app/admin/actions";
import { Button, Card, CardContent, Field, Input, Select } from "@/components/ui";
import {
  ResultEntriesEditor,
  type EditorEntry,
} from "./ResultEntriesEditor";
import type { ResultSession } from "@/lib/db/types";

const initialState: AdminFormState = {};

/** ISO date -> YYYY-MM-DD for <input type="date"> defaults. */
function toDateInput(iso: string | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
}

/**
 * Result session create/edit form (spec 17.7 + 17.8): exam metadata on
 * top, the repeatable student-row editor below. Draft sessions stay
 * invisible to the public verification flow until published.
 */
export function ResultSessionForm({ session }: { session?: ResultSession }) {
  const [state, formAction, pending] = useActionState(
    saveResultSessionAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  const initialEntries: EditorEntry[] | undefined = session?.results.map(
    (entry) => ({
      studentId: entry.studentId,
      studentName: entry.studentName,
      gpa: String(entry.gpa),
      grade: entry.grade,
      subjectMarks: entry.subjectMarks.map((mark) => ({
        subject: mark.subject,
        marks: String(mark.marks),
        grade: mark.grade,
      })),
    }),
  );

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {session && <input type="hidden" name="id" value={session.id} />}
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Examination" name="result-exam" error={errors.exam}>
            {(aria) => (
              <Select
                id={aria.id}
                name="exam"
                defaultValue={session?.exam ?? "SSC Mock Test"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="SSC Mock Test">SSC Mock Test</option>
                <option value="HSC Pre-Test">HSC Pre-Test</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Annual">Annual</option>
                <option value="Test Examination">Test Examination</option>
              </Select>
            )}
          </Field>

          <Field label="Year" name="result-year" error={errors.year}>
            {(aria) => (
              <Input
                id={aria.id}
                name="year"
                type="number"
                required
                defaultValue={session?.year ?? 2026}
                min={2020}
                max={2027}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Level" name="result-classLevel" error={errors.classLevel}>
            {(aria) => (
              <Select
                id={aria.id}
                name="classLevel"
                defaultValue={session?.classLevel ?? "SSC"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="SSC">SSC</option>
                <option value="HSC">HSC</option>
              </Select>
            )}
          </Field>

          <Field
            label="Class group"
            name="result-className"
            hint='e.g. "Science 1st Year"'
            error={errors.className}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="className"
                required
                defaultValue={session?.className ?? ""}
                placeholder="Science 1st Year"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Published on"
            name="result-publishedAt"
            error={errors.publishedAt}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="publishedAt"
                type="date"
                required
                defaultValue={toDateInput(session?.publishedAt)}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Status" name="result-status" error={errors.status}>
            {(aria) => (
              <Select
                id={aria.id}
                name="status"
                defaultValue={session?.status ?? "draft"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="draft">Draft (not searchable)</option>
                <option value="published">Published (verifiable)</option>
              </Select>
            )}
          </Field>
        </CardContent>
      </Card>

      <section aria-label="Student results">
        <h2 className="mb-3 font-serif text-xl font-semibold text-fg">
          Student results
        </h2>
        {errors.entries && (
          <p role="alert" className="mb-3 text-sm font-medium text-danger">
            {errors.entries}
          </p>
        )}
        <ResultEntriesEditor initial={initialEntries} />
      </section>

      <div className="flex items-center gap-2">
        <Button type="submit" loading={pending}>
          {pending ? "Saving…" : session ? "Save session" : "Create session"}
        </Button>
      </div>
    </form>
  );
}
