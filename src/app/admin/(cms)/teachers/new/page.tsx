import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Alert } from "@/components/ui";
import { TeacherForm } from "../TeacherForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New teacher" };

export default async function NewTeacherPage() {
  const departments = await (await getCmsStore()).listDepartments();

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
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">New teacher</h1>
      </header>
      {departments.length === 0 ? (
        <Alert tone="warning" title="Create a department first">
          <p>
            Teachers belong to a department — add at least one department
            before creating faculty profiles.
          </p>
        </Alert>
      ) : (
        <TeacherForm departments={departments} />
      )}
    </div>
  );
}
