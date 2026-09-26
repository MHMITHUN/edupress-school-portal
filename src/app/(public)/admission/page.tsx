import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
  Medal,
  Phone,
} from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Alert, Badge, Card, CardContent } from "@/components/ui";
import { FaqAccordion } from "./FaqAccordion";

/**
 * Admission module (spec 17.5): requirements, step-by-step process,
 * important dates, fee overview, FAQ accordion and downloadable forms
 * (linked to /downloads). An optional inquiry CTA points at /contact —
 * deliberately NOT an online payment or application system.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admission",
  description:
    "Admission to the SSC and HSC programmes of Padma Model College — requirements, process, important dates, fee structure, FAQ and forms for the 2026-27 session.",
};

const REQUIREMENTS = [
  {
    level: "SSC programme (Class 9)",
    items: [
      "Junior School Certificate (JSC) or equivalent completion — minimum GPA 3.50",
      "Attested copy of the JSC mark sheet and testimonial",
      "Two passport-size photographs of the applicant",
      "Guardian's national ID card photocopy and contact number",
      "Filled admission form (available below and at the office counter)",
    ],
  },
  {
    level: "HSC programme (Class 11)",
    items: [
      "SSC or equivalent examination passed in 2024, 2025 or 2026",
      "Science group — minimum GPA 4.00 with Mathematics and higher Mathematics",
      "Business Studies group — minimum GPA 3.50 with accounting or business entrepreneurship",
      "Attested SSC mark sheet, certificate and testimonial",
      "Three passport-size photographs and guardian's national ID photocopy",
    ],
  },
];

const PROCESS_STEPS = [
  {
    title: "Collect and submit the form",
    text: "Get the admission form from the college office (Sun–Thu, 8:30 AM–4:00 PM) or from the Downloads page, and submit the completed form with attested documents and the application fee.",
  },
  {
    title: "Admission test",
    text: "Sit the written admission test — Mathematics, English and a general paper for Science applicants; Accounting/English and a general paper for Business Studies.",
  },
  {
    title: "Result and viva",
    text: "Merit and waiting lists are posted on the notice board. Shortlisted applicants attend a short viva with a guardian present.",
  },
  {
    title: "Admission and payment",
    text: "Selected students complete admission at the office counter with the prescribed session fees (cash or pay-order at the bank counter — the college does not collect online payments).",
  },
  {
    title: "Orientation and classes",
    text: "Attend the orientation session; classes for the 2026-27 session begin 1 January 2027.",
  },
];

const DATES = [
  { event: "Application opens", date: "1 September 2026" },
  { event: "Application deadline", date: "31 October 2026" },
  { event: "Admission test", date: "14 November 2026, 10:00 AM" },
  { event: "Merit list published", date: "24 November 2026" },
  { event: "Viva voce", date: "28–30 November 2026" },
  { event: "Admission and fee payment window", date: "1–14 December 2026" },
  { event: "Orientation", date: "28 December 2026" },
  { event: "Classes begin", date: "1 January 2027" },
];

const FEES = [
  {
    programme: "SSC — Science (monthly + session)",
    admission: "8,500",
    session: "4,000",
    monthly: "1,850",
  },
  {
    programme: "SSC — Business Studies (monthly + session)",
    admission: "7,500",
    session: "3,500",
    monthly: "1,650",
  },
  {
    programme: "HSC — Science (monthly + session)",
    admission: "11,000",
    session: "6,000",
    monthly: "2,400",
  },
  {
    programme: "HSC — Business Studies (monthly + session)",
    admission: "9,500",
    session: "5,000",
    monthly: "2,100",
  },
];

const FAQ = [
  {
    question: "When does the application window open for the 2026-27 session?",
    answer:
      "Applications open on 1 September 2026 and close on 31 October 2026. The admission circular with full details is published on the notice board and linked at the top of this page.",
  },
  {
    question: "Is there an online application or online fee payment?",
    answer:
      "No. Forms are collected and submitted at the college office counter, and fees are paid by cash or pay-order at the designated bank counter. This portal is informational — it does not collect payments.",
  },
  {
    question: "What does the admission test cover?",
    answer:
      "Science applicants sit Mathematics, English and a general paper; Business Studies applicants sit Accounting or Business Entrepreneurship, English and a general paper. The syllabus is the previous class's board curriculum.",
  },
  {
    question: "Can I transfer from another college mid-session?",
    answer:
      "Mid-session transfers depend on seat availability and require a testimonial from the current college plus board permission. Contact the admission desk with your details before applying.",
  },
  {
    question: "Are scholarships or fee waivers available?",
    answer:
      "Yes. Full and partial tuition waivers are awarded on merit (board results) and need, and the college participates in the government's stipend programme. Ask for the scholarship form at the admission desk.",
  },
  {
    question: "Do you admit students from English-medium backgrounds?",
    answer:
      "Yes, with an equivalence certificate from the education board for O-level or equivalent results. The same minimum GPA requirements apply after equivalence.",
  },
];

export default async function AdmissionPage() {
  const store = await getCmsStore();
  const forms = await store.listDownloads("admission-form");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Session 2026-27
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Admission information
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Everything needed to apply to the SSC and HSC programmes of Padma
          Model College: requirements, the step-by-step process, key dates,
          the fee structure and the forms themselves. This page is
          informational — applications are completed at the college office.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="accent">Applications close 31 October 2026</Badge>
          <Badge tone="neutral">Admission test: 14 November 2026</Badge>
        </div>
      </header>

      {/* Requirements */}
      <section aria-labelledby="requirements-heading" className="mb-12 grid gap-5 lg:grid-cols-2">
        <h2 id="requirements-heading" className="sr-only">
          Admission requirements
        </h2>
        {REQUIREMENTS.map((block) => (
          <Card key={block.level}>
            <CardContent className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-fg">
                <BadgeCheck className="size-5 text-accent" aria-hidden="true" />
                {block.level}
              </h3>
              <ul className="flex flex-col gap-2">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Process timeline */}
      <section aria-labelledby="process-heading" className="mb-12">
        <h2 id="process-heading" className="mb-5 font-serif text-2xl font-semibold text-fg">
          How to apply — step by step
        </h2>
        <ol className="flex flex-col gap-0 border-l-2 border-border pl-6">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title} className="relative pb-6 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-[35px] top-0 flex size-7 items-center justify-center rounded-full bg-accent font-sans text-xs font-bold text-accent-fg"
              >
                {index + 1}
              </span>
              <h3 className="font-serif text-base font-semibold text-fg">
                {step.title}
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Dates + fees side by side on wide screens */}
      <div className="mb-12 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="dates-heading">
          <h2 id="dates-heading" className="mb-4 font-serif text-2xl font-semibold text-fg">
            Important dates
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Admission calendar for the 2026-27 session
              </caption>
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Event
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DATES.map((row) => (
                  <tr key={row.event} className="hover:bg-surface-2/50">
                    <th scope="row" className="px-4 py-3 font-medium text-fg">
                      {row.event}
                    </th>
                    <td className="px-4 py-3 text-muted">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="fees-heading">
          <h2 id="fees-heading" className="mb-4 font-serif text-2xl font-semibold text-fg">
            Fee structure
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Session 2026-27 fee overview (BDT)
              </caption>
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Programme
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Admission (BDT)
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Session (BDT)
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Monthly (BDT)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {FEES.map((row) => (
                  <tr key={row.programme} className="hover:bg-surface-2/50">
                    <th scope="row" className="px-4 py-3 font-medium text-fg">
                      {row.programme}
                    </th>
                    <td className="px-4 py-3 text-muted">{row.admission}</td>
                    <td className="px-4 py-3 text-muted">{row.session}</td>
                    <td className="px-4 py-3 text-muted">{row.monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Fees shown are the published 2026-27 schedule in Bangladeshi Taka.
            Laboratory and examination fees are charged at actual board rates.
            Merit and need-based waivers are available — ask at the admission
            desk.
          </p>
        </section>
      </div>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="mb-12">
        <div className="mb-4">
          <h2 id="faq-heading" className="font-serif text-2xl font-semibold text-fg">
            Frequently asked questions
          </h2>
          <p className="mt-1 text-sm text-muted">
            Common questions from applicants and guardians.
          </p>
        </div>
        <FaqAccordion items={FAQ} />
      </section>

      {/* Downloadable forms */}
      <section aria-labelledby="forms-heading" className="mb-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="forms-heading" className="font-serif text-2xl font-semibold text-fg">
              Downloadable forms
            </h2>
            <p className="mt-1 text-sm text-muted">
              The forms the admission desk accepts — all also available at the
              office counter.
            </p>
          </div>
          <Link
            href="/downloads"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            All downloads
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        {forms.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <li key={form.id}>
                <Card className="h-full">
                  <CardContent className="flex flex-col gap-2">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <FileText className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-semibold leading-snug text-fg">
                      {form.title}
                    </h3>
                    <p className="flex items-center gap-2 text-xs text-muted">
                      <Badge tone="neutral">{form.format.toUpperCase()}</Badge>
                      <span>{form.sizeLabel}</span>
                    </p>
                    <Link
                      href="/downloads"
                      className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
                    >
                      Get it from Downloads
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Alert tone="info">
            <p>
              Form entries are managed in the Downloads section — none are
              published yet. Visit the office counter meanwhile.
            </p>
          </Alert>
        )}
      </section>

      {/* Inquiry CTA */}
      <section
        aria-labelledby="inquiry-heading"
        className="rounded-xl border border-accent/25 bg-accent/5 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="inquiry-heading"
              className="flex items-center gap-2 font-serif text-xl font-semibold text-fg"
            >
              <ClipboardList className="size-5 text-accent" aria-hidden="true" />
              Still have questions?
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              Send an admission inquiry to the office through the contact page,
              call {`+880 2-55667788`} during office hours, or visit the
              admission desk at 12 Padma Avenue, Dhanmondi.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Mail className="size-4" aria-hidden="true" />
              Send an inquiry
            </Link>
            <a
              href="tel:+880255667788"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Phone className="size-4" aria-hidden="true" />
              Call the office
            </a>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          <Medal className="size-3.5 text-accent" aria-hidden="true" />
          This portal does not process applications or payments online — the
          admission desk completes every admission in person.
        </p>
      </section>
    </div>
  );
}
