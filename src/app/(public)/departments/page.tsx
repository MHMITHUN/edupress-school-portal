import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical, UserRound } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge } from "@/components/ui";
import type { Teacher } from "@/lib/db/types";

/**
 * Department directory (spec 17.5): one card per department with the head
 * of department (when linked), teacher count and a short profile teaser.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Academic Departments",
  description:
    "The six academic departments of Padma Model College across the Science and Business Studies programmes — laboratories, facilities and faculty.",
};

export default async function DepartmentsPage() {
  const store = await getCmsStore();
  const [departments, teachers] = await Promise.all([
    store.listDepartments(),
    store.listTeachers(),
  ]);

  const teachersById = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const teachersByDept = new Map<string, Teacher[]>();
  for (const teacher of teachers) {
    const list = teachersByDept.get(teacher.departmentSlug) ?? [];
    list.push(teacher);
    teachersByDept.set(teacher.departmentSlug, list);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Faculties and facilities
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Academic departments
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Padma Model College runs SSC and HSC programmes through six
          departments. Each profile lists its laboratories and facilities,
          head of department and faculty members.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => {
          const head = department.headTeacherId
            ? teachersById.get(department.headTeacherId)
            : undefined;
          const deptTeachers = teachersByDept.get(department.slug) ?? [];
          const subjects = [...new Set(deptTeachers.flatMap((t) => t.subjects))].slice(0, 6);
          return (
            <article
              key={department.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-serif text-lg font-semibold leading-snug text-fg">
                  <Link
                    href={`/departments/${department.slug}`}
                    className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {department.name}
                  </Link>
                </h2>
                <Badge tone="neutral">Est. {department.establishedYear}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                {department.summary}
              </p>
              {subjects.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Subjects taught">
                  {subjects.map((subject) => (
                    <li
                      key={subject}
                      className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
                    >
                      {subject}
                    </li>
                  ))}
                </ul>
              )}
              <dl className="mt-auto flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
                  <dt className="sr-only">Head of department</dt>
                  <dd>
                    {head ? (
                      <>
                        Head: <span className="font-medium text-fg">{head.name}</span>
                      </>
                    ) : (
                      "Head of department to be announced"
                    )}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />
                  <dt className="sr-only">Faculty members</dt>
                  <dd>
                    {deptTeachers.length} faculty member{deptTeachers.length === 1 ? "" : "s"}
                  </dd>
                </div>
              </dl>
              <Link
                href={`/departments/${department.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Department profile
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
