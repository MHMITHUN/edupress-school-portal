import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { GalleryForm } from "../GalleryForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit gallery item" };

type EditGalleryPageProps = { params: Promise<{ id: string }> };

export default async function EditGalleryItemPage({
  params,
}: EditGalleryPageProps) {
  const { id } = await params;
  const item = await (await getCmsStore()).getGalleryItemById(id);
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All gallery items
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">
          Edit gallery item
        </h1>
        <p className="mt-1 text-sm text-muted">{item.title}</p>
      </header>
      <GalleryForm item={item} />
    </div>
  );
}
