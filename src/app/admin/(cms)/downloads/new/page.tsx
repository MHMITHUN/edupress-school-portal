import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DownloadForm } from "../DownloadForm";

export const metadata: Metadata = { title: "New download entry" };

export default function NewDownloadPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/downloads"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All downloads
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">
          New download entry
        </h1>
      </header>
      <DownloadForm />
    </div>
  );
}
