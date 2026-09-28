"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getCmsStore } from "@/lib/cms";
import { rateLimit } from "@/lib/rate-limit";
import { inquirySchema } from "@/lib/validation/inquiry";

/**
 * Public admission/contact inquiry action (spec 17.5, 17.7). Validates with
 * the shared zod schema, stores through the content layer (spec 17.9 —
 * inquiries always stay in the local store, even in WordPress mode) and
 * returns a plain-text-safe state for useActionState. Rate limited per
 * client IP (5 per hour, in-memory) so unauthenticated visitors cannot
 * submit unlimited inquiries; the schema still caps every field.
 */

/** Inquiry budget: 5 submissions per hour per client IP. */
const INQUIRY_MAX = 5;
const INQUIRY_WINDOW_MS = 60 * 60 * 1000;

/** Client IP for the rate-limit key: first hop of x-forwarded-for. */
async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

function retryMessage(retryAfterSec: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `Too many attempts - try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export interface InquiryFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "phone" | "subject" | "message", string>
  >;
}

const FIELDS = ["name", "email", "phone", "subject", "message"] as const;

function fieldErrorsFromIssues(
  issues: readonly z.ZodIssue[],
): InquiryFormState["fieldErrors"] {
  const out: InquiryFormState["fieldErrors"] = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (
      (FIELDS as readonly string[]).includes(String(key)) &&
      !out[key as (typeof FIELDS)[number]]
    ) {
      out[key as (typeof FIELDS)[number]] = issue.message;
    }
  }
  return out;
}

export async function submitInquiryAction(
  _prev: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  // Checked before validation so every submission counts, not just valid
  // ones. Keyed by client IP; "local" when no proxy header is present.
  const limit = rateLimit(
    `inquiry:${await clientIp()}`,
    INQUIRY_MAX,
    INQUIRY_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: retryMessage(limit.retryAfterSec) };
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }

  try {
    await (await getCmsStore()).createInquiry(parsed.data);
  } catch {
    return {
      error:
        "The inquiry could not be saved right now. Please try again in a moment, or call the office instead.",
    };
  }

  return { ok: true };
}
