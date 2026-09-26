import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

/** The safe markdown renderer behind MarkdownView (notice/department bodies). */

describe("renderMarkdown", () => {
  it("renders paragraphs with hard line breaks", () => {
    const html = renderMarkdown("First line\nSecond line");
    expect(html).toBe("<p>First line<br />Second line</p>");
  });

  it("renders headings, bold, italic and code", () => {
    const html = renderMarkdown("## Exam **routine**\n\n*note* and `code`");
    expect(html).toContain("<h3>Exam <strong>routine</strong></h3>");
    expect(html).toContain("<em>note</em>");
    expect(html).toContain("<code>code</code>");
  });

  it("groups consecutive list items into one list", () => {
    const html = renderMarkdown("- one\n- two\n\n1. first\n2. second");
    expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html).toContain("<ol><li>first</li><li>second</li></ol>");
  });

  it("renders horizontal rules", () => {
    expect(renderMarkdown("above\n\n---\n\nbelow")).toContain("<hr />");
  });

  it("escapes all raw HTML in the input", () => {
    const html = renderMarkdown('<script>alert("x")</script> & <b>bold</b>');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });

  it("allows https, mailto and site-relative links only", () => {
    expect(renderMarkdown("[site](https://example.com)")).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a>',
    );
    expect(renderMarkdown("[local](/notices)")).toContain('<a href="/notices">local</a>');
    expect(renderMarkdown("[mail](mailto:info@example.com)")).toContain(
      '<a href="mailto:info@example.com">mail</a>',
    );
    expect(renderMarkdown("[evil](javascript:alert(1))")).not.toContain("javascript:");
  });

  it("keeps links working when the URL carries query ampersands", () => {
    const html = renderMarkdown("[search](/notices?q=routine&category=exam)");
    expect(html).toContain('href="/notices?q=routine&amp;category=exam"');
  });
});
