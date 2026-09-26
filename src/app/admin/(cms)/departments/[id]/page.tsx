import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { DepartmentForm } from "../DepartmentForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit department" };

type EditDepartmentPageProps = { params: Promise<{ id: string }> };

export default async function EditDepartmentPage({
  params,
}: EditDepartmentPageProps) {
  const { id } = await params;
  const store = await getCmsStore();
  const [department, teachers] = await Promise.all([
    store.getDepartmentById(id),
    store.listTeachers(),
  ]);
  if (!department) notFound();

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
          Edit department
        </h1>
        <p className="mt-1 text-sm text-muted">
          {department.name}
          <Link
            href={`/departments/${department.slug}`}
            className="ml-2 inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover"
          >
            View on site
            <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
        </p>
      </header>
      <DepartmentForm department={department} teachers={teachers} />
    </div>
  );
}
