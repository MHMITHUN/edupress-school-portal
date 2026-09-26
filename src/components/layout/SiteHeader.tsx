import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { getSessionUser } from "@/lib/auth/guards";
import { logoutAction } from "@/app/actions/auth";
import { MobileNav } from "./MobileNav";
import { SiteNavMore } from "./SiteNavMore";

/**
 * Institutional site header (server component — reads the session, so
 * pages using the app shell render dynamically at request time).
 *
 * Top utility bar: phone / email / portal links (Downloads, Routine, CMS).
 * Main bar: college wordmark with monogram, primary nav + "More" disclosure
 * (About, Events, Gallery), CMS auth area, and the mobile hamburger.
 */

const COLLEGE_PHONE = "+880 2-55667788";
const COLLEGE_EMAIL = "info@padmamodelcollege.edu.bd";

export async function SiteHeader() {
  const user = await getSessionUser();

  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/notices", label: "Notices" },
    { href: "/departments", label: "Departments" },
    { href: "/teachers", label: "Teachers" },
    { href: "/admission", label: "Admission" },
    { href: "/results", label: "Results" },
  ];
  const moreLinks = [
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
  ];
  const utilityLinks = [
    { href: "/downloads", label: "Downloads" },
    { href: "/routine", label: "Routine" },
  ];
  const mobileLinks = [...primaryLinks.slice(1), ...moreLinks, ...utilityLinks];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      {/* Utility bar */}
      <div className="bg-accent text-accent-fg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs sm:px-6">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${COLLEGE_PHONE.replace(/[^+\d]/g, "")}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {COLLEGE_PHONE}
            </a>
            <a
              href={`mailto:${COLLEGE_EMAIL}`}
              className="hidden items-center gap-1.5 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {COLLEGE_EMAIL}
            </a>
          </div>
          <nav aria-label="Utility" className="hidden items-center gap-4 sm:flex">
            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {link.label}
              </Link>
            ))}
            <span aria-hidden="true" className="opacity-50">
              |
            </span>
            <Link
              href={user ? "/admin" : "/admin/login"}
              className="font-medium transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {user ? "CMS Dashboard" : "CMS Login"}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav
            links={mobileLinks}
            user={user ? { name: user.name, role: user.role } : null}
          />
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent font-serif text-lg font-bold tracking-tight text-accent-fg"
            >
              PM
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-lg font-bold text-fg sm:text-xl">
                Padma Model College
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted sm:block">
                Knowledge · Discipline · Character — Estd. 1998
              </span>
            </span>
          </Link>
        </div>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {link.label}
            </Link>
          ))}
          <SiteNavMore links={moreLinks} />
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/admin"
                className="hidden rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:inline-flex"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              CMS Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
