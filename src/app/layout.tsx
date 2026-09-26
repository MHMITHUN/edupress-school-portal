import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

/**
 * Root layout: fonts + document shell ONLY. Site chrome lives in the
 * (public) route group layout (header/footer), while /admin gets its own
 * sidebar shell — both compose under this minimal root.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Padma Model College | EduPress School Portal",
    template: "%s | Padma Model College",
  },
  description:
    "Official portal of Padma Model College, Dhaka (est. 1998): notice board, academic departments, teacher directory, admission, result verification, events and gallery — powered by the EduPress school portal and CMS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
