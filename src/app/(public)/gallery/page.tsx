import type { Metadata } from "next";
import Link from "next/link";
import { getCmsStore } from "@/lib/cms";
import { Alert, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { GalleryCategory } from "@/lib/db/types";
import { GalleryGrid } from "./GalleryGrid";

/**
 * Gallery (spec 17.2): category filter chips (GET param) + CSS-art tiles
 * from each item's palette pair + accessible lightbox with caption and
 * taken date. The demo ships no external images, and says so honestly.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Campus, laboratories, sports, cultural events and library of Padma Model College.",
};

const CATEGORY_META: Array<{ value: GalleryCategory; label: string }> = [
  { value: "campus", label: "Campus" },
  { value: "science-lab", label: "Science Labs" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "library", label: "Library" },
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const requested = firstParam(sp.category)?.trim();
  const category = CATEGORY_META.some((row) => row.value === requested)
    ? (requested as GalleryCategory)
    : undefined;

  const store = await getCmsStore();
  const [items, allItems] = await Promise.all([
    store.listGalleryItems(category),
    store.listGalleryItems(),
  ]);

  const counts = new Map<string, number>();
  for (const item of allItems) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Campus life
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Gallery</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The campus, laboratories, sports days, cultural evenings and the
          reading library — moments from college life at Padma Model College.
        </p>
      </header>

      <Alert tone="info" className="mb-6" title="Illustrations, not photographs">
        <p>
          Each plate below is a <strong>generated CSS illustration</strong>{" "}
          built from a colour palette stored with the item — this demo portal
          deliberately ships no photograph files.
        </p>
      </Alert>

      <nav aria-label="Filter by category" className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/gallery"
          aria-current={category ? undefined : "true"}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            category
              ? "border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg"
              : "border-accent bg-accent text-accent-fg",
          )}
        >
          All ({allItems.length})
        </Link>
        {CATEGORY_META.map((row) => {
          const active = category === row.value;
          const count = counts.get(row.value) ?? 0;
          return (
            <Link
              key={row.value}
              href={`/gallery?category=${row.value}`}
              aria-current={active ? "true" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {row.label} ({count})
            </Link>
          );
        })}
      </nav>

      {items.length > 0 ? (
        <GalleryGrid items={items} />
      ) : (
        <EmptyState
          title="Nothing in this category yet"
          description="Gallery items will appear here once the office publishes them."
        />
      )}
    </div>
  );
}
