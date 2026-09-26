import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { DepartmentForm } from "../DepartmentForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New department" };

export default async function NewDepartmentPage() {
  const teachers = await (await getCmsStore()).listTeachers();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/departments"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All departments
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">
          New department
        </h1>
      </header>
      <DepartmentForm teachers={teachers} />
    </div>
  );
}
