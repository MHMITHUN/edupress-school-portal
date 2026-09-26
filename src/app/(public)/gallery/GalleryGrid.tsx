"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import type { GalleryItem } from "@/lib/db/types";
import { Dialog } from "@/components/ui";
import { formatDate } from "@/lib/utils";

/**
 * Gallery grid + lightbox (spec 17.2). Each tile is generated CSS art from
 * the item's palette pair (the demo ships no real photographs); the
 * lightbox shows the generated plate at full width with caption + taken
 * date. Native <dialog> keeps focus handling accessible.
 */

function GalleryArt({
  palette,
  large = false,
  label,
}: {
  palette: readonly [string, string];
  large?: boolean;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Generated illustration: ${label}`}
      className="relative w-full overflow-hidden rounded-lg"
      style={{
        aspectRatio: large ? "4 / 3" : "4 / 3",
        background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 100%)`,
      }}
    >
      {/* Sun/arch motif drawn from the palette — quiet institutional art. */}
      <span
        aria-hidden="true"
        className="absolute rounded-full opacity-25"
        style={{
          width: large ? "58%" : "55%",
          aspectRatio: "1",
          left: "8%",
          top: "10%",
          background: palette[0],
        }}
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 opacity-20"
        style={{
          height: "34%",
          background: `repeating-linear-gradient(90deg, ${palette[0]} 0 14%, transparent 14% 28%)`,
        }}
      />
      <span
        aria-hidden="true"
        className="absolute right-[10%] top-[16%] rounded-full opacity-90"
        style={{
          width: large ? "13%" : "15%",
          aspectRatio: "1",
          background: palette[1],
          boxShadow: `0 0 0 6px ${palette[0]}33`,
        }}
      />
    </div>
  );
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex !== null ? items[openIndex] : null;

  const move = (delta: number) => {
    if (openIndex === null) return;
    setOpenIndex((openIndex + delta + items.length) % items.length);
  };

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-haspopup="dialog"
              className="group flex w-full flex-col gap-3 rounded-xl border border-border bg-surface p-3 text-left shadow-sm transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <GalleryArt palette={item.palette} label={item.title} />
              <div className="flex flex-col gap-1 px-1 pb-1">
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Camera className="size-3.5 text-accent" aria-hidden="true" />
                  {formatDate(item.takenAt)}
                </p>
                <h3 className="text-sm font-semibold leading-snug text-fg group-hover:text-accent">
                  {item.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                  {item.caption}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={openItem !== null}
        onClose={() => setOpenIndex(null)}
        title={openItem?.title ?? ""}
        className="max-w-2xl"
      >
        {openItem && (
          <figure className="flex flex-col gap-3">
            <GalleryArt palette={openItem.palette} large label={openItem.title} />
            <figcaption className="flex flex-col gap-1">
              <p className="text-sm leading-relaxed text-fg">{openItem.caption}</p>
              <p className="text-xs text-muted">
                Taken {formatDate(openItem.takenAt)} · generated illustration
                (demo gallery — no real photographs)
              </p>
            </figcaption>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => move(-1)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                &larr; Previous
              </button>
              <p className="text-xs text-muted" aria-live="polite">
                {(openIndex ?? 0) + 1} of {items.length}
              </p>
              <button
                type="button"
                onClick={() => move(1)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Next &rarr;
              </button>
            </div>
          </figure>
        )}
      </Dialog>
    </>
  );
}
