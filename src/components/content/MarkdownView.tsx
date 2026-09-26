import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Renders a CMS markdown body through the safe renderer in
 * src/lib/markdown.ts (input is escaped before any tag is emitted).
 * Typography comes from the .rich-text rules in globals.css.
 */
export function MarkdownView({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
