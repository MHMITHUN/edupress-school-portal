import { z } from "zod";

/**
 * Auth request schema (CMS login), shared by the server action in
 * src/app/actions/auth.ts and unit-tested alongside the session tests.
 * Kept in this module - a "use server" file may only export async functions,
 * so the schema must live outside it to be importable by tests.
 */

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;
