"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  CalendarDays,
  ClipboardCheck,
  Download,
  Images,
  Inbox,
  LayoutDashboard,
  Network,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/db/types";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown only for these roles. */
  roles?: Array<Role>;
}

const LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/notices", label: "Notices", icon: BellRing },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/departments", label: "Departments", icon: Network },
  { href: "/admin/results", label: "Results", icon: ClipboardCheck },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

/**
 * Admin sidebar navigation with active-link highlighting (usePathname).
 * Settings appears for ADMIN only (spec 17.8).
 */
export function AdminNav({ role, newInquiries }: { role: Role; newInquiries: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="CMS sections" className="flex flex-row gap-1 lg:flex-col">
      {LINKS.filter((link) => !link.roles || link.roles.includes(role)).map(
        (link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <link.icon className="size-4 shrink-0" aria-hidden="true" />
              {link.label}
              {link.href === "/admin/inquiries" && newInquiries > 0 && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    active ? "bg-accent-fg/20 text-accent-fg" : "bg-accent/10 text-accent",
                  )}
                >
                  {newInquiries}
                </span>
              )}
            </Link>
          );
        },
      )}
    </nav>
  );
}
