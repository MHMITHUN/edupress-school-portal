import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, Table, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui";
import { ResultSessionForm } from "../ResultSessionForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit result session" };

type EditResultPageProps = { params: Promise<{ id: string }> };

export default async function EditResultSessionPage({
  params,
}: EditResultPageProps) {
  const { id } = await params;
  const session = await (await getCmsStore()).getResultSessionById(id);
  if (!session) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/results"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All result sessions
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-bold text-fg">
            {session.exam} {session.year}
          </h1>
          <Badge tone={session.status === "published" ? "success" : "neutral"}>
            {session.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted">
          {session.className} ({session.classLevel}) · {session.results.length}{" "}
          student rows
        </p>
      </header>

      {/* Read-only roster view of the stored rows */}
      <section aria-label="Current student rows">
        <h2 className="mb-3 font-serif text-xl font-semibold text-fg">
          Current rows
        </h2>
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Student ID</TH>
              <TH>Name</TH>
              <TH>GPA</TH>
              <TH>Grade</TH>
              <TH>Subjects</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {session.results.map((entry) => (
              <TableRow key={entry.studentId}>
                <TD className="font-mono text-xs">{entry.studentId}</TD>
                <TD className="font-medium">{entry.studentName}</TD>
                <TD className="text-muted">{entry.gpa.toFixed(2)}</TD>
                <TD className="text-muted">{entry.grade}</TD>
                <TD className="text-xs text-muted">
                  {entry.subjectMarks
                    .map((mark) => `${mark.subject} ${mark.marks} (${mark.grade})`)
                    .join(", ")}
                </TD>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <ResultSessionForm session={session} />
    </div>
  );
}
