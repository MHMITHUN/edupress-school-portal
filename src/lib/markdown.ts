/**
 * Minimal, dependency-free Markdown -> HTML renderer for CMS content bodies
 * (notice bodies, department descriptions, the principal's message).
 *
 * Security model: the input is HTML-escaped FIRST; the small markdown
 * transforms then run over escaped text, so no markup can ever reach the
 * output except the tags this module itself emits. Link URLs pass an
 * allowlist (http/https/mailto/tel, or site-relative paths and anchors).
 *
 * Supported: #/##/###/#### headings, paragraphs with hard line breaks,
 * -/* unordered lists, "1." ordered lists, **bold**, *italic*, `code`,
 * [text](url) links and --- horizontal rules.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only allow schemes and shapes the portal itself would link to. */
function safeHref(url: string): string | null {
  if (url.startsWith("/") || url.startsWith("#")) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^mailto:/i.test(url)) return url;
  if (/^tel:/i.test(url)) return url;
  return null;
}

function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Inline spans (bold, italic, code, links) over one already-escaped line. */
function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, url: string) => {
    const href = safeHref(url);
    if (href === null) return label;
    const attrs = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${href}"${attrs}>${label}</a>`;
  });
  return out;
}

/** Render a markdown string to a self-contained HTML fragment. */
export function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];

  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${paragraph.map(inline).join("<br />")}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listType !== null) {
      html.push(`<${listType}>${listItems.map((item) => `<li>${inline(item)}</li>`).join("")}</${listType}>`);
      listType = null;
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Blank line closes the current paragraph / list.
    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Horizontal rule: --- or *** alone on a line.
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushParagraph();
      flushList();
      html.push("<hr />");
      continue;
    }

    // Headings: # to ####.
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length + 1, 4); // # -> h2 ... #### -> h4
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    // Unordered list item: - item / * item.
    const ulItem = line.match(/^\s*[-*]\s+(.*)$/);
    if (ulItem) {
      flushParagraph();
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(ulItem[1]);
      continue;
    }

    // Ordered list item: 1. item
    const olItem = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (olItem) {
      flushParagraph();
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(olItem[1]);
      continue;
    }

    // Anything else accumulates into the current paragraph.
    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}
