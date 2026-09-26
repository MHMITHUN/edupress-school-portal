import { Database, Globe } from "lucide-react";
import { cmsModeLabel } from "@/lib/cms";

/**
 * Admin-only CMS mode badge (spec 17.9: honest labeling). Shows which
 * backend currently serves content: MongoDB demo | MongoDB | WordPress
 * headless. Drop it into the admin shell next to the page title.
 */
export function CmsModeBadge() {
  const label = cmsModeLabel();

  if (label === "WordPress headless") {
    return (
      <span
        title="Content is served from a headless WordPress REST API (CMS_MODE=wordpress)."
        className="inline-flex items-center gap-1.5 rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
      >
        <Globe className="size-3.5" aria-hidden="true" />
        CMS: WordPress headless
      </span>
    );
  }

  const demo = label === "MongoDB demo";
  return (
    <span
      title={
        demo
          ? "In-memory demo store: seeded sample content, resets on restart. Set MONGODB_URI for persistence."
          : "Content is stored in MongoDB."
      }
      className={
        demo
          ? "inline-flex items-center gap-1.5 rounded-md border border-warning/25 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"
          : "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
      }
    >
      <Database className="size-3.5" aria-hidden="true" />
      CMS: {label}
    </span>
  );
}
