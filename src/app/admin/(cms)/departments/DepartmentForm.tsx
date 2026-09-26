"use client";

import { useActionState } from "react";
import { saveDepartmentAction, type AdminFormState } from "@/app/admin/actions";
import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import type { Department, Teacher } from "@/lib/db/types";

const initialState: AdminFormState = {};

/**
 * Department create/edit form (spec 17.8): name, slug, summary, markdown
 * description, established year and optional head (from the teacher list).
 */
export function DepartmentForm({
  department,
  teachers,
}: {
  department?: Department;
  teachers: Teacher[];
}) {
  const [state, formAction, pending] = useActionState(
    saveDepartmentAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {department && <input type="hidden" name="id" value={department.id} />}
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
          <Field label="Name" name="department-name" error={errors.name}>
            {(aria) => (
              <Input
                id={aria.id}
                name="name"
                required
                defaultValue={department?.name ?? ""}
                placeholder="e.g. Department of Physics"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Slug"
            name="department-slug"
            hint="e.g. physics"
            error={errors.slug}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="slug"
                required
                defaultValue={department?.slug ?? ""}
                placeholder="physics"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Established year"
            name="department-establishedYear"
            error={errors.establishedYear}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="establishedYear"
                type="number"
                required
                defaultValue={department?.establishedYear ?? 1998}
                min={1950}
                max={2027}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Head of department (optional)"
            name="department-headTeacherId"
            hint="Pick from the teacher directory."
            error={errors.headTeacherId}
          >
            {(aria) => (
              <Select
                id={aria.id}
                name="headTeacherId"
                defaultValue={department?.headTeacherId ?? ""}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="">— none —</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.designation})
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Field
            label="Summary"
            name="department-summary"
            hint="One or two sentences shown on department cards."
            error={errors.summary}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="summary"
                required
                defaultValue={department?.summary ?? ""}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Description (Markdown)"
            name="department-descriptionMd"
            hint="Full profile on the department page."
            error={errors.descriptionMd}
          >
            {(aria) => (
              <Textarea
                id={aria.id}
                name="descriptionMd"
                required
                rows={10}
                defaultValue={department?.descriptionMd ?? ""}
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
          {pending ? "Saving…" : department ? "Save changes" : "Create department"}
        </Button>
      </div>
    </form>
  );
}
