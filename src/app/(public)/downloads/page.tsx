import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, FileText, FileType2, Info } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Alert, Badge, Card, CardContent, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Download, DownloadCategory } from "@/lib/db/types";

/**
 * Downloads (spec 17.2): category groups with file cards (format badge,
 * size, updated date). No real files are served by the demo — each card
 * links to the office-counter/contact path and the page says so honestly.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Downloads",
  description:
    "Admission forms, syllabuses, class routines, the college prospectus and official notices of Padma Model College.",
};

const CATEGORY_ORDER: DownloadCategory[] = [
  "admission-form",
  "syllabus",
  "routine",
  "prospectus",
  "notice",
];

const CATEGORY_META: Record<DownloadCategory, { label: string; description: string }> = {
  "admission-form": {
    label: "Admission forms",
    description: "Application, medical certificate and guardian declaration forms.",
  },
  syllabus: {
    label: "Syllabuses",
    description: "Board-prescribed syllabuses and the ICT practical lab manual.",
  },
  routine: {
    label: "Class routines",
    description: "The authoritative term routine sheets published by the office.",
  },
  prospectus: {
    label: "Prospectus",
    description: "The college prospectus with programmes, fees and campus life.",
  },
  notice: {
    label: "Official notice copies",
    description: "Printable copies of the most-requested notices.",
  },
};

const FORMAT_ICON = {
  pdf: FileText,
  docx: FileType2,
  xlsx: FileSpreadsheet,
} as const;

function DownloadCard({ download }: { download: Download }) {
  const Icon = FORMAT_ICON[download.format] ?? FileText;
  return (
    <Card>
      <CardContent className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="text-sm font-semibold leading-snug text-fg">
            {download.title}
          </h3>
          <p className="break-all font-mono text-xs text-muted">
            {download.fileName}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Badge tone="neutral">{download.format.toUpperCase()}</Badge>
            <span>{download.sizeLabel}</span>
            <span aria-hidden="true">·</span>
            <span>Updated {formatDate(download.updatedAt)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DownloadsPage() {
  const store = await getCmsStore();
  const downloads = await store.listDownloads();

  const byCategory = new Map<DownloadCategory, Download[]>(
    CATEGORY_ORDER.map((category) => [
      category,
      downloads.filter((row) => row.category === category),
    ]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Documents counter
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Downloads</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Forms, syllabuses, routines and official documents published by the
          college office, grouped by category.
        </p>
      </header>

      <Alert tone="info" className="mb-8" title="How this demo distributes files">
        <p>
          This demonstration portal does not host real files. Every document
          below is available from the college office counter (Sun–Thu, 8:30
          AM–4:00 PM) — or send us a request through the{" "}
          <Link
            href="/contact"
            className="font-medium text-accent underline underline-offset-2"
          >
            contact page
          </Link>{" "}
          and the office will email the copy you need.
        </p>
      </Alert>

      {downloads.length === 0 ? (
        <EmptyState
          title="No downloads published yet"
          description="Documents will appear here once the college office publishes them."
        />
      ) : (
        <div className="flex flex-col gap-10">
          {CATEGORY_ORDER.map((category) => {
            const rows = byCategory.get(category) ?? [];
            if (rows.length === 0) return null;
            const meta = CATEGORY_META[category];
            return (
              <section key={category} aria-labelledby={`downloads-${category}`}>
                <div className="mb-4">
                  <h2
                    id={`downloads-${category}`}
                    className="font-serif text-2xl font-semibold text-fg"
                  >
                    {meta.label}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">{meta.description}</p>
                </div>
                <ul className="grid gap-4 md:grid-cols-2">
                  {rows.map((download) => (
                    <li key={download.id}>
                      <DownloadCard download={download} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-10 flex items-start gap-2 text-xs text-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        File sizes are indicative. For board-published documents (syllabuses,
        routines), the office always distributes the latest board revision.
      </p>
    </div>
  );
}
