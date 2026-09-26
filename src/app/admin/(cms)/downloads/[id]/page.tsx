import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { DownloadForm } from "../DownloadForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit download entry" };

type EditDownloadPageProps = { params: Promise<{ id: string }> };

export default async function EditDownloadPage({ params }: EditDownloadPageProps) {
  const { id } = await params;
  const download = await (await getCmsStore()).getDownloadById(id);
  if (!download) notFound();

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
          Edit download entry
        </h1>
        <p className="mt-1 text-sm text-muted">{download.title}</p>
      </header>
      <DownloadForm download={download} />
    </div>
  );
}
