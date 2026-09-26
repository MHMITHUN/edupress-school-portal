import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DemoBanner } from "@/components/layout/DemoBanner";

/**
 * Public site shell: honest demo banner, institutional header and footer.
 * (Admin pages under /admin use their own sidebar shell instead.)
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
