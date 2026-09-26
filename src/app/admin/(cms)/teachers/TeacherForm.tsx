"use client";

import { useActionState } from "react";
import { saveTeacherAction, type AdminFormState } from "@/app/admin/actions";
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
 * Teacher create/edit form (spec 17.6 + 17.8). The department select is
 * fed from the live departments list (passed by the server page).
 */
export function TeacherForm({
  teacher,
  departments,
}: {
  teacher?: Teacher;
  departments: Department[];
}) {
  const [state, formAction, pending] = useActionState(
    saveTeacherAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {teacher && <input type="hidden" name="id" value={teacher.id} />}
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
          <Field label="Full name" name="teacher-name" error={errors.name}>
            {(aria) => (
              <Input
                id={aria.id}
                name="name"
                required
                defaultValue={teacher?.name ?? ""}
                placeholder="e.g. Sabrina Chowdhury"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Slug"
            name="teacher-slug"
            hint="e.g. sabrina-chowdhury"
            error={errors.slug}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="slug"
                required
                defaultValue={teacher?.slug ?? ""}
                placeholder="sabrina-chowdhury"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Designation" name="teacher-designation" error={errors.designation}>
            {(aria) => (
              <Select
                id={aria.id}
                name="designation"
                defaultValue={teacher?.designation ?? "Lecturer"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
                <option value="Lecturer">Lecturer</option>
              </Select>
            )}
          </Field>

          <Field
            label="Department"
            name="teacher-departmentSlug"
            error={errors.departmentSlug}
          >
            {(aria) => (
              <Select
                id={aria.id}
                name="departmentSlug"
                defaultValue={teacher?.departmentSlug ?? departments[0]?.slug ?? ""}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                {departments.map((department) => (
                  <option key={department.slug} value={department.slug}>
                    {department.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Qualification"
            name="teacher-qualification"
            hint="e.g. MSc in Physics, Dhaka University"
            error={errors.qualification}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="qualification"
                required
                defaultValue={teacher?.qualification ?? ""}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Subjects"
            name="teacher-subjects"
            hint="Comma-separated, e.g. ICT, Programming"
            error={errors.subjects}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="subjects"
                required
                defaultValue={teacher?.subjects.join(", ") ?? ""}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Email" name="teacher-email" error={errors.email}>
            {(aria) => (
              <Input
                id={aria.id}
                name="email"
                type="email"
                required
                defaultValue={teacher?.email ?? ""}
                placeholder="name@padmamodelcollege.edu.bd"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Join year"
            name="teacher-joinYear"
            error={errors.joinYear}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="joinYear"
                type="number"
                required
                defaultValue={teacher?.joinYear ?? 2026}
                min={1980}
                max={2027}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Field
            label="Bio (Markdown)"
            name="teacher-bioMd"
            hint="Shown on the teacher directory card and profile."
            error={errors.bioMd}
          >
            {(aria) => (
              <Textarea
                id={aria.id}
                name="bioMd"
                required
                rows={6}
                defaultValue={teacher?.bioMd ?? ""}
                placeholder="Teaching focus, clubs mentored, a line about approach…"
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
          {pending ? "Saving…" : teacher ? "Save changes" : "Create teacher"}
        </Button>
      </div>
    </form>
  );
}
