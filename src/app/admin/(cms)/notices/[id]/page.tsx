import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge } from "@/components/ui";
import { NoticeForm } from "../NoticeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit notice" };

type EditNoticePageProps = { params: Promise<{ id: string }> };

export default async function EditNoticePage({ params }: EditNoticePageProps) {
  const { id } = await params;
  const notice = await (await getCmsStore()).getNoticeById(id);
  if (!notice) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/notices"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All notices
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-bold text-fg">Edit notice</h1>
          <Badge tone={notice.status === "published" ? "success" : "neutral"}>
            {notice.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted">
          {notice.title}
          {notice.status === "published" && (
            <Link
              href={`/notices/${notice.slug}`}
              className="ml-2 inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover"
            >
              View on site
              <ExternalLink className="size-3" aria-hidden="true" />
            </Link>
          )}
        </p>
      </header>
      <NoticeForm notice={notice} />
    </div>
  );
}
