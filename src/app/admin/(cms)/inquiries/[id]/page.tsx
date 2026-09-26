import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCheck, MailCheck } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { markInquiryReadAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inquiry" };

type InquiryPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminInquiryPage({
  params,
  searchParams,
}: InquiryPageProps) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const store = await getCmsStore();
  const inquiries = await store.listInquiries();
  const inquiry = inquiries.find((row) => row.id === id);
  if (!inquiry) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Inquiry inbox
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl font-bold text-fg">
            {inquiry.subject}
          </h1>
          <Badge tone={inquiry.status === "new" ? "accent" : "neutral"}>
            {inquiry.status === "new" ? "New" : "Read"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted">
          From {inquiry.name} ·{" "}
          <a
            href={`mailto:${inquiry.email}`}
            className="font-medium text-accent hover:text-accent-hover"
          >
            {inquiry.email}
          </a>
          {inquiry.phone ? ` · ${inquiry.phone}` : ""} ·{" "}
          {formatDateTime(inquiry.createdAt)}
        </p>
      </header>

      <SavedAlert saved={saved} />

      <Card>
        <CardContent>
          <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-fg">
            {inquiry.message}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        {inquiry.status === "new" ? (
          <form action={markInquiryReadAction}>
            <input type="hidden" name="id" value={inquiry.id} />
            <Button type="submit">
              <CheckCheck className="size-4" aria-hidden="true" />
              Mark as read
            </Button>
          </form>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MailCheck className="size-4" aria-hidden="true" />
            Marked read — reply by email from your mail client.
          </p>
       )}
        <a
          href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
            `Re: ${inquiry.subject}`,
          )}`}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Reply by email
        </a>
      </div>
    </div>
  );
}
