import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryForm } from "../GalleryForm";

export const metadata: Metadata = { title: "New gallery item" };

export default function NewGalleryItemPage() {
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
          New gallery item
        </h1>
      </header>
      <GalleryForm />
    </div>
  );
}
