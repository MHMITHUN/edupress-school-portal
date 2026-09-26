"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Accessible FAQ accordion (spec 17.5): real buttons with aria-expanded +
 * aria-controls, one panel id per item, and the answer region itself stays
 * in the DOM only while open. Arrow icon rotates with state.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-surface">
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-faq-q-${index}`;
        const panelId = `${baseId}-faq-a-${index}`;
        return (
          <div key={buttonId}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-fg transition-colors hover:bg-surface-2/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                {item.question}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted transition-transform duration-200",
                    open && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="px-5 pb-5 text-sm leading-relaxed text-muted"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
