"use server";

import { z } from "zod";
import { getCmsStore } from "@/lib/cms";
import { inquirySchema } from "@/lib/validation/inquiry";

/**
 * Public admission/contact inquiry action (spec 17.5, 17.7). Validates with
 * the shared zod schema, stores through the content layer (spec 17.9 —
 * inquiries always stay in the local store, even in WordPress mode) and
 * returns a plain-text-safe state for useActionState. No secrets, no
 * rate-limit bypass concerns: the schema caps every field.
 */

export interface InquiryFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "subject" | "message", string>>;
}

const FIELDS = ["name", "email", "phone", "subject", "message"] as const;

function fieldErrorsFromIssues(issues: readonly z.ZodIssue[]): InquiryFormState["fieldErrors"] {
  const out: InquiryFormState["fieldErrors"] = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if ((FIELDS as readonly string[]).includes(String(key)) && !out[key as (typeof FIELDS)[number]]) {
      out[key as (typeof FIELDS)[number]] = issue.message;
    }
  }
  return out;
}

export async function submitInquiryAction(
  _prev: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
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
