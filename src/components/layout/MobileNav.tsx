"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export interface MobileNavUser {
  name: string;
  role: "ADMIN" | "CONTENT_EDITOR";
}

interface MobileNavProps {
  links: Array<{ href: string; label: string }>;
  user: MobileNavUser | null;
}

/**
 * Hamburger disclosure for small screens. Accessible: the button is
 * aria-expanded + aria-controls, the panel is a labelled region, and Esc
 * closes it. Hidden entirely on lg+ screens.
 */
export function MobileNav({ links, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-b border-border bg-surface shadow-sm"
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-h-[70vh] max-w-6xl flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-6"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <p className="px-3 pb-1 pt-3 text-xs text-muted">
              Signed in as {user.name} (
              {user.role === "ADMIN" ? "administrator" : "content editor"})
            </p>
          )}
        </nav>
      </div>
    </div>
  );
}
