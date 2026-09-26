import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { EmptyState, Table, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteGalleryItemAction } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import type { GalleryCategory } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gallery" };

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  campus: "Campus",
  "science-lab": "Science Labs",
  sports: "Sports",
  cultural: "Cultural",
  library: "Library",
};

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const items = await (await getCmsStore()).listGalleryItems();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Campus life
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Gallery</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} CSS-art tile{items.length === 1 ? "" : "s"} — each
            generated from a two-colour palette.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          New item
        </Link>
      </header>

      <SavedAlert saved={saved} error={error} />

      {items.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TH>Tile</TH>
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>Taken</TH>
              <TH className="text-right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TD>
                  <span
                    aria-hidden="true"
                    className="block h-10 w-16 rounded-md border border-border"
                    style={{
                      background: `linear-gradient(135deg, ${item.palette[0]} 0%, ${item.palette[1]} 100%)`,
                    }}
                  />
                  <span className="sr-only">
                    Palette {item.palette[0]} to {item.palette[1]}
                  </span>
                </TD>
                <TD>
                  <Link
                    href={`/admin/gallery/${item.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {item.title}
                  </Link>
                </TD>
                <TD className="text-muted">{CATEGORY_LABELS[item.category]}</TD>
                <TD className="text-muted">{formatDate(item.takenAt)}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin/gallery/${item.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <ConfirmSubmit
                      action={deleteGalleryItemAction}
                      id={item.id}
                      title="Delete this gallery item?"
                      description={`"${item.title}" will be removed from the public gallery permanently.`}
                    />
                  </div>
                </TD>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No gallery items yet"
          description="Add the first generated tile to the public gallery."
          action={
            <Link
              href="/admin/gallery/new"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Create an item
            </Link>
          }
        />
      )}
    </div>
  );
}
