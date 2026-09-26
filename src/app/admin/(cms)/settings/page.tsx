import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getCmsStore } from "@/lib/cms";
import { Alert } from "@/components/ui";
import { SavedAlert } from "@/components/admin/SavedAlert";
import { SettingsForm } from "./SettingsForm";

/**
 * Site settings (spec 17.8): ADMIN-ONLY. The role guard runs here (the
 * sidebar hides the link for editors) and again inside saveSettingsAction,
 * so a crafted form post from a content editor is still refused.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { saved } = await searchParams;
  const settings = await (await getCmsStore()).getSettings();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Site-wide
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Identity, announcement, contact block and the principal&rsquo;s
          message — every field feeds the public site directly.
        </p>
      </header>

      <Alert tone="info">
        <p className="flex items-center gap-2">
          <Lock className="size-4 text-accent" aria-hidden="true" />
          Administrators only. Content editors keep full access to every
          content section.
        </p>
      </Alert>

      <SavedAlert saved={saved} />

      <SettingsForm settings={settings} />
    </div>
  );
}
