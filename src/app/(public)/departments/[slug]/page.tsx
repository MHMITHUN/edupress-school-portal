import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Mail, UserRound } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge } from "@/components/ui";
import { MarkdownView } from "@/components/content/MarkdownView";
import type { Download } from "@/lib/db/types";
import { formatDate } from "@/lib/utils";

/**
 * Department profile (spec 17.5): summary, full description, facilities,
 * head of department, faculty list and the downloads that concern this
 * department (matched by keyword — Download rows carry no dept field).
 */

export const dynamic = "force-dynamic";

type DepartmentPageProps = { params: Promise<{ slug: string }> };

/** Download title keywords per department slug (fictional-but-plausible match). */
const DOWNLOAD_KEYWORDS: Record<string, string[]> = {
  "computer-science-and-ict": ["ict", "computer"],
  physics: ["physics"],
  chemistry: ["chemistry"],
  mathematics: ["math"],
  biology: ["biology", "botany", "zoology"],
  "business-studies": ["business", "accounting", "commerce", "finance", "hsc 2027"],
};

export async function generateMetadata({
  params,
}: DepartmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const department = await (await getCmsStore()).getDepartmentBySlug(slug);
  if (!department) return { title: "Department not found" };
  return {
    title: `${department.name} Department`,
    description: department.summary,
  };
}

function relatedDownloads(all: Download[], slug: string): Download[] {
  const keywords = DOWNLOAD_KEYWORDS[slug] ?? [];
  return all
    .filter((download) => {
      if (download.category !== "syllabus" && download.category !== "routine") {
        return false;
      }
      const title = download.title.toLowerCase();
      return keywords.some((keyword) => title.includes(keyword));
    })
    .slice(0, 4);
}

export default async function DepartmentDetailPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const store = await getCmsStore();
  const department = await store.getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  const [teachers, allTeachers, downloads] = await Promise.all([
    store.listTeachers({ departmentSlug: department.slug }),
    store.listTeachers(),
    store.listDownloads(),
  ]);
  const head = department.headTeacherId
    ? allTeachers.find((teacher) => teacher.id === department.headTeacherId)
    : undefined;
  const subjects = [...new Set(teachers.flatMap((teacher) => teacher.subjects))];
  const downloadsForDept = relatedDownloads(downloads, department.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/departments"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All departments
      </Link>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">Est. {department.establishedYear}</Badge>
          <Badge tone="neutral">SSC &amp; HSC programmes</Badge>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-fg">
          Department of {department.name}
        </h1>
        <p className="mt-2 max-w-3xl font-serif text-lg italic leading-relaxed text-muted">
          {department.summary}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarkdownView markdown={department.descriptionMd} />
        </div>
        <aside aria-label="Department at a glance">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-fg">
              At a glance
            </h2>
            <dl className="mt-4 flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    Established
                  </dt>
                  <dd className="font-medium text-fg">{department.establishedYear}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UserRound className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    Head of department
                  </dt>
                  <dd className="font-medium text-fg">
                    {head ? `${head.name} — ${head.designation}` : "To be announced"}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  Faculty members
                </dt>
                <dd className="font-medium text-fg">{teachers.length}</dd>
              </div>
              {subjects.length > 0 && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    Subjects taught
                  </dt>
                  <dd className="mt-1.5">
                    <ul className="flex flex-wrap gap-1.5">
                      {subjects.map((subject) => (
                        <li
                          key={subject}
                          className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
                        >
                          {subject}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>

      {/* Faculty */}
      <section aria-labelledby="faculty-heading" className="mt-12">
        <h2 id="faculty-heading" className="font-serif text-2xl font-semibold text-fg">
          Faculty members
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <article
              key={teacher.id}
              className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-sm font-bold text-accent"
                >
                  {teacher.name
                    .split(" ")
                    .filter((part) => /^[A-Za-z]/.test(part))
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-fg">
                    {teacher.name}
                  </h3>
                  <p className="text-xs text-muted">{teacher.designation}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                {teacher.qualification}
              </p>
              <ul className="flex flex-wrap gap-1.5" aria-label="Subjects">
                {teacher.subjects.map((subject) => (
                  <li
                    key={subject}
                    className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
                  >
                    {subject}
                  </li>
                ))}
              </ul>
              {head?.id === teacher.id && (
                <Badge tone="accent" className="self-start">
                  Head of department
                </Badge>
              )}
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
        {teachers.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Faculty profiles for this department will be published soon.
          </p>
        )}
      </section>

      {/* Related downloads */}
      {downloadsForDept.length > 0 && (
        <section aria-labelledby="dept-downloads" className="mt-12">
          <h2 id="dept-downloads" className="font-serif text-2xl font-semibold text-fg">
            Related downloads
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {downloadsForDept.map((download) => (
              <li
                key={download.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm font-semibold leading-snug text-fg">
                    {download.title}
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge tone="neutral">{download.format.toUpperCase()}</Badge>
                    <span>{download.sizeLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {formatDate(download.updatedAt)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/downloads"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Browse all downloads
          </Link>
        </section>
      )}
    </div>
  );
}
