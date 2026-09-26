import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, EmptyState, Table, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteTeacherAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Teachers" };

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const store = await getCmsStore();
  const [teachers, departments] = await Promise.all([
    store.listTeachers(),
    store.listDepartments(),
  ]);
  const departmentNames = new Map(departments.map((d) => [d.slug, d.name]));
  const departmentHeadIds = new Set(
    departments
      .map((d) => d.headTeacherId)
      .filter((id): id is string => Boolean(id)),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Faculty
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Teachers</h1>
          <p className="mt-1 text-sm text-muted">
            {teachers.length} teacher{teachers.length === 1 ? "" : "s"} in the
            public directory.
          </p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          New teacher
        </Link>
      </header>

      <SavedAlert saved={saved} error={error} />

      {teachers.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Name</TH>
              <TH>Designation</TH>
              <TH>Department</TH>
              <TH>Subjects</TH>
              <TH>Email</TH>
              <TH className="text-right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TD>
                  <Link
                    href={`/admin/teachers/${teacher.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {teacher.name}
                  </Link>
                </TD>
                <TD className="text-muted">{teacher.designation}</TD>
                <TD className="text-muted">
                  {departmentNames.get(teacher.departmentSlug) ?? teacher.departmentSlug}
                </TD>
                <TD className="text-muted">{teacher.subjects.join(", ")}</TD>
                <TD className="text-muted">{teacher.email}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    {departmentHeadIds.has(teacher.id) && (
                      <Badge tone="accent">Head of dept.</Badge>
                    )}
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    {departmentHeadIds.has(teacher.id) ? (
                      <span
                        title="Assign a new department head before deleting this teacher."
                        className="inline-flex h-8 cursor-not-allowed items-center rounded-lg border border-border px-2.5 text-xs font-medium text-muted opacity-60"
                      >
                        Delete
                      </span>
                    ) : (
                      <ConfirmSubmit
                        action={deleteTeacherAction}
                        id={teacher.id}
                        title="Delete this teacher?"
                        description={`${teacher.name} will be removed from the directory permanently. This cannot be undone.`}
                      />
                    )}
                  </div>
                </TD>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No teachers yet"
          description="Add the first faculty member to the directory."
          action={
            <Link
              href="/admin/teachers/new"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Add a teacher
            </Link>
          }
        />
      )}
    </div>
  );
}
