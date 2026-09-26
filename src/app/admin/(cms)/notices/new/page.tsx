import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NoticeForm } from "../NoticeForm";

export const metadata: Metadata = { title: "New notice" };

export default function NewNoticePage() {
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
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">
          New notice
        </h1>
        <p className="mt-1 text-sm text-muted">
          Notices start as drafts by convention — publish when the office
          signs off.
        </p>
      </header>
      <NoticeForm />
    </div>
  );
}
