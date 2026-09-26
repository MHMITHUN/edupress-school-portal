"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  submitInquiryAction,
  type InquiryFormState,
} from "@/app/actions/inquiry";
import { Button, Card, CardContent, Field, Input, Textarea } from "@/components/ui";

const initialState: InquiryFormState = {};

/**
 * Public inquiry form (spec 17.5): useActionState + the shared zod-validated
 * server action. Success swaps the form for a confirmation; field errors
 * come back per-field with aria wiring handled by Field.
 */
export function InquiryForm() {
  const [state, formAction, pending] = useActionState(
    submitInquiryAction,
    initialState,
  );

  if (state.ok) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" aria-hidden="true" />
          </span>
          <h3 className="font-serif text-xl font-semibold text-fg">
            Inquiry received
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Thank you — the college office has your inquiry and will reply to
            your email during office hours (Sun–Thu, 8:30 AM–4:00 PM). For
            anything urgent, call +880 2-55667788.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          {state.error && (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
            >
              {state.error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" name="inquiry-name" error={state.fieldErrors?.name}>
              {(aria) => (
                <Input
                  id={aria.id}
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="e.g. Ayesha Siddika"
                  invalid={aria.invalid}
                  aria-describedby={aria["aria-describedby"]}
                  aria-invalid={aria["aria-invalid"]}
                />
              )}
            </Field>
            <Field label="Email" name="inquiry-email" error={state.fieldErrors?.email}>
              {(aria) => (
                <Input
                  id={aria.id}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  invalid={aria.invalid}
                  aria-describedby={aria["aria-describedby"]}
                  aria-invalid={aria["aria-invalid"]}
                />
              )}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Phone (optional)"
              name="inquiry-phone"
              hint="Bangladeshi format, e.g. +880 1712-345678"
              error={state.fieldErrors?.phone}
            >
              {(aria) => (
                <Input
                  id={aria.id}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+880 17xx-xxxxxx"
                  invalid={aria.invalid}
                  aria-describedby={aria["aria-describedby"]}
                  aria-invalid={aria["aria-invalid"]}
                />
              )}
            </Field>
            <Field label="Subject" name="inquiry-subject" error={state.fieldErrors?.subject}>
              {(aria) => (
                <Input
                  id={aria.id}
                  name="subject"
                  required
                  placeholder="e.g. Admission question for Class 11"
                  invalid={aria.invalid}
                  aria-describedby={aria["aria-describedby"]}
                  aria-invalid={aria["aria-invalid"]}
                />
              )}
            </Field>
          </div>

          <Field
            label="Message"
            name="inquiry-message"
            hint="Tell us what you need — 10 to 2000 characters."
            error={state.fieldErrors?.message}
          >
            {(aria) => (
              <Textarea
                id={aria.id}
                name="message"
                required
                rows={5}
                placeholder="e.g. I would like to know the required documents for HSC Science admission…"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Button type="submit" loading={pending} className="self-start">
            {pending ? "Sending…" : "Send inquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
