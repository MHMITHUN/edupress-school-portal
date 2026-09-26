import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  FlaskConical,
  GraduationCap,
  Landmark,
  LibraryBig,
  Target,
  Users,
} from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, Card, CardContent } from "@/components/ui";

/**
 * About the college (spec 17.2): history, mission/vision, campus facts and
 * leadership. History prose is fixed institutional copy; leadership and the
 * facts strip read the live content layer (departments + teacher directory
 * + settings) so they stay true in every CMS mode.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About the College",
  description:
    "Padma Model College (est. 1998), Dhanmondi, Dhaka — history, mission and vision, campus facts and leadership.",
};

const MILESTONES = [
  {
    year: "1998",
    text: "Padma Model College opens on Padma Avenue, Dhanmondi with two SSC batches and eleven teachers.",
  },
  {
    year: "2004",
    text: "The HSC programme begins in Science; the first chemistry and physics laboratories are commissioned.",
  },
  {
    year: "2011",
    text: "Business Studies group introduced at both levels; the central library moves to its present sixty-seat reading hall.",
  },
  {
    year: "2017",
    text: "ICT becomes a taught subject for every class; Computer Lab 1 opens with forty-two workstations.",
  },
  {
    year: "2021",
    text: "Remote-learning programme during the pandemic; the college intranet notice board launches.",
  },
  {
    year: "2026",
    text: "This portal unites the notice board, result verification, departments and admissions in one place.",
  },
];

export default async function AboutPage() {
  const store = await getCmsStore();
  const [settings, departments, teachers, stats] = await Promise.all([
    store.getSettings(),
    store.listDepartments(),
    store.listTeachers(),
    store.getStats(),
  ]);

  const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]));
  const leadership = departments
    .map((department) => ({
      department,
      head:
        department.headTeacherId !== undefined
          ? (teacherById.get(department.headTeacherId) ?? null)
          : null,
    }))
    .filter((row) => row.head !== null);

  const principalExcerpt = settings.principal.messageMd
    .split(/\n\s*\n/)
    .slice(0, 2)
    .join(" ")
    .replace(/\*\*/g, "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          <Landmark className="size-4" aria-hidden="true" />
          Estd. 1998 · Dhanmondi, Dhaka
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          About {settings.collegeName}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          {settings.tagline} — for more than two and a half decades the college
          has served SSC and HSC programmes in Science and Business Studies,
          combining disciplined classroom teaching with laboratories, a
          reading library and an active campus culture.
        </p>
      </header>

      {/* Mission / vision */}
      <section
        aria-labelledby="mission-vision-heading"
        className="mb-12 grid gap-5 md:grid-cols-2"
      >
        <h2 id="mission-vision-heading" className="sr-only">
          Mission and vision
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Target className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-serif text-xl font-semibold text-fg">Our mission</h3>
            <p className="text-sm leading-relaxed text-muted">
              To give every student a disciplined, laboratory-grounded
              education in the SSC and HSC programmes — taught by teachers who
              know their students by name, measured honestly by board results,
              and grounded in the daily practice of our motto: knowledge,
              discipline, character.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-serif text-xl font-semibold text-fg">Our vision</h3>
            <p className="text-sm leading-relaxed text-muted">
              A college in the heart of Dhaka whose graduates enter university
              and professional life with strong fundamentals, honest work
              habits and a sense of service — and whose campus remains a
              calm, serious place to study.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* History timeline */}
      <section aria-labelledby="history-heading" className="mb-12">
        <h2 id="history-heading" className="mb-5 font-serif text-2xl font-semibold text-fg">
          Our history
        </h2>
        <ol className="relative flex flex-col gap-0 border-l-2 border-border pl-6">
          {MILESTONES.map((milestone) => (
            <li key={milestone.year} className="relative pb-6 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-accent bg-surface"
              />
              <p className="font-serif text-base font-bold text-accent">
                {milestone.year}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {milestone.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Campus facts */}
      <section
        aria-labelledby="facts-heading"
        className="mb-12 border-y border-border bg-surface"
      >
        <div className="py-8">
          <h2 id="facts-heading" className="sr-only">
            Campus facts
          </h2>
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <Users className="size-3.5" aria-hidden="true" />
                Teachers
              </dt>
              <dd className="font-serif text-3xl font-bold text-fg">
                {stats.teachers}
              </dd>
              <dd className="text-xs text-muted">Listed in the directory</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <BookOpenCheck className="size-3.5" aria-hidden="true" />
                Departments
              </dt>
              <dd className="font-serif text-3xl font-bold text-fg">
                {stats.departments}
              </dd>
              <dd className="text-xs text-muted">Science and Business Studies</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <FlaskConical className="size-3.5" aria-hidden="true" />
                Laboratories
              </dt>
              <dd className="font-serif text-3xl font-bold text-fg">4</dd>
              <dd className="text-xs text-muted">Physics, chemistry, biology, ICT</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <LibraryBig className="size-3.5" aria-hidden="true" />
                Library seats
              </dt>
              <dd className="font-serif text-3xl font-bold text-fg">60+</dd>
              <dd className="text-xs text-muted">Reading hall, extended exam hours</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Leadership */}
      <section aria-labelledby="leadership-heading" className="mb-12">
        <div className="mb-5">
          <h2 id="leadership-heading" className="font-serif text-2xl font-semibold text-fg">
            Leadership
          </h2>
          <p className="mt-1 text-sm text-muted">
            The principal and the heads of the academic departments.
          </p>
        </div>

        <Card className="mb-5">
          <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <span
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-xl font-bold text-accent"
            >
              {settings.principal.name
                .replace(/^(Prof\.|Dr\.|Md\.|Mr\.|Ms\.)\s*/gi, "")
                .split(" ")
                .filter((part) => /^[A-Za-z]/.test(part))
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="font-serif text-lg font-semibold text-fg">
                {settings.principal.name}
              </p>
              <p className="text-sm text-muted">
                {settings.principal.title}, {settings.collegeName}
              </p>
              <p className="max-w-2xl text-sm italic leading-relaxed text-muted">
                &ldquo;{principalExcerpt}&rdquo;
              </p>
              <Link
                href="/principal"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Read the full message
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leadership.map(({ department, head }) => (
            <li key={department.id}>
              <Card className="h-full">
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-fg">{head!.name}</h3>
                    <Badge tone="neutral">Head</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {head!.designation} · {department.name}
                  </p>
                  <Link
                    href={`/departments/${department.slug}`}
                    className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
                  >
                    Department profile
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-muted">
        Padma Model College is a fictional institution created for this
        educational project; all people and events shown are fictional demo
        data.
      </p>
    </div>
  );
}
