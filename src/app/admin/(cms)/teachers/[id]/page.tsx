import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { TeacherForm } from "../TeacherForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit teacher" };

type EditTeacherPageProps = { params: Promise<{ id: string }> };

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const { id } = await params;
  const store = await getCmsStore();
  const [teacher, departments] = await Promise.all([
    store.getTeacherById(id),
    store.listDepartments(),
  ]);
  if (!teacher) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/teachers"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All teachers
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">Edit teacher</h1>
        <p className="mt-1 text-sm text-muted">
          {teacher.name}
          <Link
            href={`/teachers?q=${encodeURIComponent(teacher.name)}`}
            className="ml-2 inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover"
          >
            View on site
            <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
        </p>
      </header>
      <TeacherForm teacher={teacher} departments={departments} />
    </div>
  );
}
