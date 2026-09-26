import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "CMS sign in",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : undefined;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          CMS sign in
        </h1>
        <p className="text-sm text-muted">
          Sign in to manage notices, departments, teachers, results, events
          and site content.
        </p>
      </div>
      <LoginForm next={safeNext} />
      <div className="rounded-lg border border-border bg-surface-2 p-4 text-xs text-muted">
        <p className="font-medium text-fg">
          Demo accounts (password Demo@12345)
        </p>
        <ul className="mt-2 space-y-1 font-mono">
          <li>admin@demo.local — administrator</li>
          <li>editor@demo.local — content editor</li>
        </ul>
      </div>
    </div>
  );
}
