import type { Metadata } from "next";
import { BadgeCheck, ClipboardCheck, Info, SearchCheck, ShieldCheck } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Select,
  Table,
  TableBody,
  TableRow,
  TH,
  TD,
} from "@/components/ui";
import type { ExamName } from "@/lib/db/types";
import { formatDate } from "@/lib/utils";

/**
 * Public result verification (spec 17.7). Privacy rules baked into the flow:
 *  - ONLY published sessions are searched (store.findStudentResults).
 *  - ONLY the queried student's row is rendered — never a class list.
 *  - exam/year selects narrow the lookup but never enumerate students.
 * Demo data disclaimer shown beside every result (honest labelling).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Result Verification",
  description:
    "Verify published SSC and HSC examination results of Padma Model College by student ID, examination and year.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const studentId = firstParam(sp.id)?.trim() ?? "";
  const examParam = firstParam(sp.exam)?.trim() || undefined;
  const yearParam = Number.parseInt(firstParam(sp.year) ?? "", 10);
  const year = Number.isFinite(yearParam) ? yearParam : undefined;

  const store = await getCmsStore();
  const sessions = await store.listResultSessions({ status: "published" });

  const exams = [...new Set(sessions.map((s) => s.exam))].sort((a, b) =>
    a.localeCompare(b),
  );
  const years = [...new Set(sessions.map((s) => s.year))].sort((a, b) => b - a);

  const submitted = studentId.length > 0;
  const tooShort = submitted && studentId.length < 4;

  let matches = submitted && !tooShort ? await store.findStudentResults(studentId) : [];
  if (examParam) matches = matches.filter((m) => m.session.exam === examParam);
  if (year) matches = matches.filter((m) => m.session.year === year);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Examination results
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Result verification
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Enter your student ID to verify a published examination result.
          Results appear only after the examination committee has published
          the session — and only the queried student&rsquo;s own result is
          ever shown.
        </p>
      </header>

      <Card className="mb-6">
        <CardContent>
          <form method="get" action="/results" className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="result-id"
                className="mb-1 block text-xs font-medium text-muted"
              >
                Student ID <span className="text-danger">*</span>
              </label>
              <Input
                id="result-id"
                name="id"
                required
                defaultValue={studentId}
                placeholder="e.g. PMC-2026-1101"
                invalid={tooShort}
                aria-describedby="result-id-hint"
              />
              <p id="result-id-hint" className="mt-1 text-xs text-muted">
                As printed on your admit card or college ID, e.g. PMC-2026-1101.
              </p>
            </div>
            <div>
              <label
                htmlFor="result-exam"
                className="mb-1 block text-xs font-medium text-muted"
              >
                Examination
              </label>
              <Select id="result-exam" name="exam" defaultValue={examParam ?? ""}>
                <option value="">All examinations</option>
                {exams.map((exam: ExamName) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label
                htmlFor="result-year"
                className="mb-1 block text-xs font-medium text-muted"
              >
                Year
              </label>
              <Select id="result-year" name="year" defaultValue={year ? String(year) : ""}>
                <option value="">All years</option>
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg">
                <SearchCheck className="size-4" aria-hidden="true" />
                Verify result
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Input validation error */}
      {tooShort && (
        <Alert tone="warning" title="Check the student ID" className="mb-6">
          A student ID has at least 4 characters (for example PMC-2026-1101).
          Please enter your complete ID and try again.
        </Alert>
      )}

      {/* Not-found state */}
      {submitted && !tooShort && matches.length === 0 && (
        <EmptyState
          className="mb-6"
          icon={ClipboardCheck}
          title="No published result matches"
          description="No published result matches this student ID — check the ID, examination and year, then try again. Results appear here only after the session has been officially published."
        />
      )}

      {/* Result cards — one per matched published session */}
      {matches.length > 0 && (
        <div className="flex flex-col gap-6">
          {matches.map(({ session, entry }) => (
            <Card key={`${session.id}-${entry.studentId}`}>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      <BadgeCheck className="size-4" aria-hidden="true" />
                      Verified result
                    </p>
                    <h2 className="mt-1 font-serif text-xl font-bold text-fg">
                      {session.exam} {session.year}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted">
                      {session.className} · {session.classLevel} · Published{" "}
                      {formatDate(session.publishedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <p className="text-xs uppercase tracking-wide text-muted">GPA</p>
                    <p className="font-serif text-3xl font-bold text-accent">
                      {entry.gpa.toFixed(2)}
                    </p>
                    <Badge tone="success">Grade {entry.grade}</Badge>
                  </div>
                </div>

                <div>
                  <dl className="mb-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">
                        Student
                      </dt>
                      <dd className="font-semibold text-fg">{entry.studentName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">
                        Student ID
                      </dt>
                      <dd className="font-mono text-fg">{entry.studentId}</dd>
                    </div>
                  </dl>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        <TableRow className="bg-surface-2 text-muted hover:bg-surface-2">
                          <TH scope="row">Subject</TH>
                          <TH scope="row" className="text-right">
                            Marks
                          </TH>
                          <TH scope="row" className="text-right">
                            Grade
                          </TH>
                        </TableRow>
                        {entry.subjectMarks.map((row) => (
                          <TableRow key={row.subject}>
                            <TD className="font-medium text-fg">{row.subject}</TD>
                            <TD className="text-right tabular-nums text-fg">
                              {row.marks}
                              <span className="text-muted"> / 100</span>
                            </TD>
                            <TD className="text-right">
                              <Badge
                                tone={
                                  row.grade === "A+"
                                    ? "success"
                                    : row.grade.startsWith("A")
                                      ? "accent"
                                      : "neutral"
                                }
                              >
                                {row.grade}
                              </Badge>
                            </TD>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-border bg-surface-2/60 font-semibold hover:bg-surface-2/60">
                          <TD>Total (GPA {entry.gpa.toFixed(2)})</TD>
                          <TD className="text-right tabular-nums text-fg">
                            {entry.subjectMarks.reduce((sum, r) => sum + r.marks, 0)}
                            <span className="text-muted">
                              {" "}
                              / {entry.subjectMarks.length * 100}
                            </span>
                          </TD>
                          <TD className="text-right">
                            <Badge tone="accent">Grade {entry.grade}</Badge>
                          </TD>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Alert tone="info">
                  <p className="flex items-start gap-1.5">
                    <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      Verification note: this result comes from the college
                      result archive for the queried ID only. Demo portal —
                      every student and mark on this page is fictional sample
                      data for the EduPress project.
                    </span>
                  </p>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Standing privacy + demo note */}
      <aside
        aria-label="About result verification"
        className="mt-10 rounded-xl border border-border bg-surface-2/60 p-5"
      >
        <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-fg">
          <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
          How verification works
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted">
          <li>
            Only examination sessions officially published by the college are
            searchable; pending or draft sessions return no match.
          </li>
          <li>
            The page never lists students — a result card appears only for the
            exact student ID entered, and mark sheets are not downloadable.
          </li>
          <li>
            For corrections, apply to the examination section with your admit
            card within seven days of publication (fictional demo process).
          </li>
        </ul>
      </aside>
    </div>
  );
}
