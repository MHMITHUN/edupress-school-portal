import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Mail, Search, Users, X } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, Button, EmptyState, Input, Select } from "@/components/ui";
import type { Designation } from "@/lib/db/types";

/**
 * Teacher directory (spec 17.5): searchable, filterable card grid. Filters
 * are plain GET params so links stay shareable and the page works without
 * client JavaScript.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teacher Directory",
  description:
    "Faculty directory of Padma Model College — heads of department, professors, lecturers and their subjects, searchable by department, subject and designation.",
};

const DESIGNATIONS: Designation[] = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Senior Lecturer",
  "Lecturer",
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() || undefined;
  const departmentSlug = firstParam(sp.dept)?.trim() || undefined;
  const subject = firstParam(sp.subject)?.trim() || undefined;
  const designationRaw = firstParam(sp.designation)?.trim() || undefined;
  const designation = DESIGNATIONS.includes(designationRaw as Designation)
    ? (designationRaw as Designation)
    : undefined;

  const store = await getCmsStore();
  const [allTeachers, departments, teachers] = await Promise.all([
    store.listTeachers(),
    store.listDepartments(),
    store.listTeachers({ q, departmentSlug, subject, designation }),
  ]);

  const subjects = [...new Set(allTeachers.flatMap((t) => t.subjects))].sort((a, b) =>
    a.localeCompare(b),
  );
  const departmentNames = new Map(departments.map((d) => [d.slug, d.name]));
  const hasFilters = Boolean(q || departmentSlug || subject || designation);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Our faculty
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Teacher directory
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The faculty of Padma Model College across six departments. Search by
          name or filter by department, subject and designation.
        </p>
      </header>

      {/* Filter form (native GET — works without JavaScript) */}
      <form
        method="get"
        action="/teachers"
        className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      >
        <div className="lg:col-span-2">
          <label htmlFor="teacher-q" className="mb-1 block text-xs font-medium text-muted">
            Search by name
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id="teacher-q"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder="e.g. Nusrat, Rahman"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <label htmlFor="teacher-dept" className="mb-1 block text-xs font-medium text-muted">
            Department
          </label>
          <Select id="teacher-dept" name="dept" defaultValue={departmentSlug ?? ""}>
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.slug} value={department.slug}>
                {department.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="teacher-subject" className="mb-1 block text-xs font-medium text-muted">
            Subject
          </label>
          <Select id="teacher-subject" name="subject" defaultValue={subject ?? ""}>
            <option value="">All subjects</option>
            {subjects.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label
            htmlFor="teacher-designation"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Designation
          </label>
          <Select
            id="teacher-designation"
            name="designation"
            defaultValue={designation ?? ""}
          >
            <option value="">All designations</option>
            {DESIGNATIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit">
            <Search className="size-4" aria-hidden="true" />
            Apply filters
          </Button>
          {hasFilters && (
            <Link
              href="/teachers"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="size-4" aria-hidden="true" />
              Clear
            </Link>
          )}
        </div>
      </form>

      <p className="mb-4 flex items-center gap-2 text-sm text-muted" aria-live="polite">
        <Users className="size-4" aria-hidden="true" />
        {teachers.length} teacher{teachers.length === 1 ? "" : "s"}
        {hasFilters ? " match the current filters" : " listed"}
      </p>

      {teachers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <article
              key={teacher.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-base font-bold text-accent"
                >
                  {initials(teacher.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-fg">
                    {teacher.name}
                  </h2>
                  <p className="text-xs text-muted">
                    {departmentNames.get(teacher.departmentSlug) ??
                      teacher.departmentSlug}
                  </p>
                </div>
              </div>
              <Badge tone="accent" className="self-start">
                {teacher.designation}
              </Badge>
              <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted">
                <GraduationCap className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {teacher.qualification}
              </p>
              <ul className="flex flex-wrap gap-1.5" aria-label="Subjects taught">
                {teacher.subjects.map((name) => (
                  <li
                    key={name}
                    className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
                  >
                    {name}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${teacher.email}`}
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                {teacher.email}
              </a>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No teachers found"
          description={
            hasFilters
              ? "No faculty member matches the current filters. Try a different combination."
              : "Faculty profiles will be published soon."
          }
          action={
            hasFilters ? (
              <Link
                href="/teachers"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
              >
                <X className="size-3.5" aria-hidden="true" />
                Clear all filters
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
