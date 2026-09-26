"use client";

import Link from "next/link";
import { CloudOff } from "lucide-react";

/**
 * Public error boundary. In WordPress mode a failing connector (server
 * down, timeout, missing env) lands here — the message from the server is
 * surfaced honestly instead of fake content ("WordPress unreachable at …").
 */

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-danger/10">
        <CloudOff className="size-7 text-danger" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-fg">
          Content could not be loaded
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          The portal could not reach its content source, so this page is
          showing an error instead of made-up content. Details:
        </p>
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-left font-mono text-xs text-danger"
        >
          {error.message || "Unknown error"}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
