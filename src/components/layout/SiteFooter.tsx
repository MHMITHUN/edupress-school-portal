import Link from "next/link";

/** Institutional footer: about, quick links, resources, contact + honest demo note. */
export function SiteFooter() {
  const quickLinks = [
    { href: "/about", label: "About the College" },
    { href: "/departments", label: "Academic Departments" },
    { href: "/teachers", label: "Teacher Directory" },
    { href: "/admission", label: "Admission" },
  ];
  const resources = [
    { href: "/notices", label: "Notice Board" },
    { href: "/results", label: "Result Verification" },
    { href: "/routine", label: "Class Routine" },
    { href: "/downloads", label: "Downloads" },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <p className="font-serif text-base font-bold text-fg">
            Padma Model College
          </p>
          <p className="text-sm text-muted">
            Knowledge, Discipline, Character. A higher-secondary college in
            Dhanmondi, Dhaka serving SSC and HSC programmes since 1998.
          </p>
          <p className="text-xs text-muted">
            Demo site with fictional data: Padma Model College is a fictional
            institution created for this educational project (EduPress school
            portal and CMS lab).
          </p>
        </div>

        <nav aria-label="Quick links" className="flex flex-col gap-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Quick Links
          </p>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Resources" className="flex flex-col gap-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Resources
          </p>
          {resources.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Contact
          </p>
          <p className="text-muted">12 Padma Avenue, Dhanmondi, Dhaka 1205</p>
          <p className="text-muted">+880 2-55667788</p>
          <p className="text-muted">info@padmamodelcollege.edu.bd</p>
          <p className="text-muted">Office hours: Sun–Thu, 8:30 AM – 4:00 PM</p>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted sm:px-6">
          © 2026 Padma Model College (fictional demo entity). Powered by the
          EduPress school portal — a Next.js + MongoDB project with an optional
          headless WordPress content layer.
        </p>
      </div>
    </footer>
  );
}
