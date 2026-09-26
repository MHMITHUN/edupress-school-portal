import { Info } from "lucide-react";
import { isDemoContent } from "@/lib/cms";

/**
 * Honest demo-mode label (spec 17.9): shown whenever content is served from
 * the in-memory demo store (CMS_MODE=mongodb and MONGODB_URI absent). In
 * WordPress mode content comes from the WP server, so the banner hides.
 */
export function DemoBanner() {
  if (!isDemoContent()) return null;

  return (
    <div
      role="status"
      className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center sm:px-6"
    >
      <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 text-xs text-warning">
        <Info className="size-3.5 shrink-0" aria-hidden="true" />
        Demo mode: fictional Padma Model College sample content; data resets
        on restart. Set MONGODB_URI for persistence.
      </p>
    </div>
  );
}
