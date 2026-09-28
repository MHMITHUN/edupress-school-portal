"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { getStore } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/auth";

/**
 * CMS auth server actions. Both roles (ADMIN, CONTENT_EDITOR) land on
 * /admin after signing in — there is no public student login (spec 17).
 * Login is throttled per email address (10 attempts per 10 minutes,
 * in-memory) to slow down password guessing.
 */

/** Login throttle budget: 10 attempts per 10 minutes per email. */
const LOGIN_MAX = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export interface AuthFormState {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
}

/** First validation message per field, from a zod error's issues. */
function fieldErrorsFromIssues(
  issues: z.ZodIssue[],
): AuthFormState["fieldErrors"] {
  const out: AuthFormState["fieldErrors"] = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if ((key === "email" || key === "password") && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}

function safeNextPath(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  // Only same-site absolute paths, no protocol tricks.
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }

  const { email, password } = parsed.data;

  // Counted before the credential check so failed guesses use up the
  // budget too. Generic message: it does not reveal whether the account
  // exists, matching the "Incorrect email or password." posture above.
  const limit = rateLimit(
    `login:${email.toLowerCase()}`,
    LOGIN_MAX,
    LOGIN_WINDOW_MS,
  );
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSec / 60));
    return {
      error: `Too many attempts - try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const store = await getStore();
  const user = await store.getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Incorrect email or password." };
  }

  await setSessionCookie(createSessionToken({ uid: user.id, role: user.role }));

  const next = safeNextPath(formData.get("next"));
  redirect(next ?? "/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
