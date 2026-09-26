"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui";

/**
 * Delete button with an accessible confirm dialog (spec 17.8): the real
 * submit lives inside the dialog's <form>, wired to the passed server
 * action with the hidden id. Cancelling closes without submitting.
 */
export function ConfirmSubmit({
  action,
  id,
  label = "Delete",
  title,
  description,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-danger/30 px-2.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        {label}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Cancel
          </button>
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-lg bg-danger px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              {label === "Delete" ? "Delete permanently" : label}
            </button>
          </form>
        </div>
      </Dialog>
    </>
  );
}
