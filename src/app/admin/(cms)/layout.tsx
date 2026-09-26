import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { logoutAction } from "@/app/actions/auth";
import { getCmsStore } from "@/lib/cms";
import { CmsModeBadge } from "@/components/layout/CmsModeBadge";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Admin CMS shell (spec 17.8): role-guarded sidebar layout with section
 * navigation, the honest CMS-mode badge and the signed-in user. Login
 * lives OUTSIDE this group (/admin/login) so it stays chrome-free.
 *
 * Roles: ADMIN and CONTENT_EDITOR manage all content; Settings is
 * ADMIN-only (hidden in nav, enforced again in page + action).
 */

export const dynamic = "force-dynamic";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  CONTENT_EDITOR: "Content editor",
} as const;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireRole(["ADMIN", "CONTENT_EDITOR"], "/admin");
  const stats = await (await getCmsStore()).getStats();

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      {/* Sidebar */}
      <aside className="border-b border-border bg-surface lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 p-4 lg:block">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent font-serif text-sm font-bold text-accent-fg"
            >
              PM
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-base font-bold text-fg">
                EduPress CMS
              </span>
              <span className="text-[11px] text-muted">
                Padma Model College
              </span>
            </span>
          </Link>
          <div className="lg:mt-3">
            <CmsModeBadge />
          </div>
        </div>

        <div className="px-3 pb-3 lg:mt-2">
          <AdminNav role={user.role} newInquiries={stats.newInquiries} />
        </div>

        <div className="hidden border-t border-border p-4 lg:block">
          <p className="flex items-center gap-2 text-xs font-medium text-muted">
            <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
            {user.name}
          </p>
          <p className="mt-0.5 pl-6 text-xs text-muted">{ROLE_LABEL[user.role]}</p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              View site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
