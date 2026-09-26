import { z } from "zod";

/**
 * Admission inquiry schema (spec 17.7), shared by the public admission
 * form's server action and unit tests. Lives OUTSIDE any "use server" file
 * so tests can import it directly (same convention as ./auth.ts).
 */

const BD_PHONE = /^\+?[0-9][0-9\s-]{7,14}$/;

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please give your full name.")
    .max(80, "Name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  /** Optional; when present must look like a phone number. Empty is fine. */
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || BD_PHONE.test(value), {
      message: "Enter a valid phone number (8-15 digits).",
    })
    .optional(),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters.")
    .max(120, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(2000, "Message is too long (2000 characters at most)."),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
