import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { EmptyState, Table, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteDepartmentAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Departments" };

export default async function AdminDepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const store = await getCmsStore();
  const [departments, teachers] = await Promise.all([
    store.listDepartments(),
    store.listTeachers(),
  ]);
  const teacherNames = new Map(teachers.map((t) => [t.id, t.name]));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Academics
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Departments</h1>
          <p className="mt-1 text-sm text-muted">
            {departments.length} department{departments.length === 1 ? "" : "s"}{" "}
            with public profile pages.
          </p>
        </div>
        <Link
          href="/admin/departments/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          New department
        </Link>
      </header>

      <SavedAlert saved={saved} error={error} />

      {departments.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH>Est.</TH>
              <TH>Head</TH>
              <TH className="text-right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TD>
                  <Link
                    href={`/admin/departments/${department.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {department.name}
                  </Link>
                </TD>
                <TD className="font-mono text-xs text-muted">{department.slug}</TD>
                <TD className="text-muted">{department.establishedYear}</TD>
                <TD className="text-muted">
                  {department.headTeacherId
                    ? (teacherNames.get(department.headTeacherId) ?? "—")
                    : "—"}
                </TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin/departments/${department.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <ConfirmSubmit
                      action={deleteDepartmentAction}
                      id={department.id}
                      title="Delete this department?"
                      description={`"${department.name}" and its profile page will be removed permanently. Teachers keep their records but lose the department link.`}
                    />
                  </div>
                </TD>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No departments yet"
          description="Create the first academic department."
          action={
            <Link
              href="/admin/departments/new"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Create a department
            </Link>
          }
        />
      )}
    </div>
  );
}
