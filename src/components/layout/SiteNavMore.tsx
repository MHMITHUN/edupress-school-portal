"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

/**
 * "More" disclosure for the desktop main nav: overflow links live here so
 * the primary row stays clean. Accessible: aria-expanded + aria-controls,
 * aria-haspopup, Esc closes, click-outside closes, focus returns to the
 * button. Hidden below lg (the mobile nav takes over there).
 */
export function SiteNavMore({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        More
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
