import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResultSessionForm } from "../ResultSessionForm";

export const metadata: Metadata = { title: "New result session" };

export default function NewResultSessionPage() {
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
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">
          New result session
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add the examination metadata and every student row; keep it draft
          until the examination committee signs off.
        </p>
      </header>
      <ResultSessionForm />
    </div>
  );
}
