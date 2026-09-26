import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Card, CardContent } from "@/components/ui";
import { MarkdownView } from "@/components/content/MarkdownView";

/**
 * Principal's message (spec 17.2): the full text from site settings
 * (settings.principal.messageMd), rendered through the safe markdown
 * renderer. The home page carries only the excerpt.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Principal's Message",
  description:
    "Full message from the Principal of Padma Model College — the college's commitments to knowledge, discipline and character.",
};

export default async function PrincipalPage() {
  const store = await getCmsStore();
  const settings = await store.getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/about"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        About the college
      </Link>

      <header className="mt-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          From the principal&rsquo;s desk
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Principal&rsquo;s message
        </h1>
      </header>

      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <span
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-2xl font-bold text-accent"
          >
            {settings.principal.name
              .replace(/^(Prof\.|Dr\.|Md\.|Mr\.|Ms\.)\s*/gi, "")
              .split(" ")
              .filter((part) => /^[A-Za-z]/.test(part))
              .slice(0, 2)
              .map((part) => part[0])
              .join("")}
          </span>
          <div>
            <p className="font-serif text-lg font-semibold text-fg">
              {settings.principal.name}
            </p>
            <p className="text-sm text-muted">
              {settings.principal.title}, {settings.collegeName}
            </p>
            <p className="mt-1 text-xs text-muted">
              Fictional person — Padma Model College is a demo institution.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <MarkdownView markdown={settings.principal.messageMd} />
        </CardContent>
      </Card>
    </div>
  );
}
