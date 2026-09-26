import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getCmsStore } from "@/lib/cms";
import { Card, CardContent } from "@/components/ui";
import { InquiryForm } from "./InquiryForm";

/**
 * Contact page (spec 17.2): college information cards (from site settings,
 * so CMS edits reflect here) + the inquiry form wired to the inquiries
 * store with zod validation and success/error states.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Padma Model College — address, phone, email, office hours and the online inquiry form.",
};

export default async function ContactPage() {
  const store = await getCmsStore();
  const settings = await store.getSettings();

  const infoCards = [
    {
      icon: MapPin,
      title: "Campus address",
      lines: [settings.contact.address],
    },
    {
      icon: Phone,
      title: "Phone",
      lines: [settings.contact.phone, "Office hours: Sun–Thu, 8:30 AM – 4:00 PM"],
    },
    {
      icon: Mail,
      title: "Email",
      lines: [settings.contact.email],
    },
    {
      icon: Clock,
      title: "Office hours",
      lines: ["Sunday – Thursday", "8:30 AM – 4:00 PM", "Closed on government holidays"],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Reach the office
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Contact us
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Questions about admission, notices, results or anything else on this
          portal — the college office replies during working hours. Guardians
          are always welcome to meet teachers in person.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        <section aria-labelledby="contact-info-heading" className="lg:col-span-2">
          <h2 id="contact-info-heading" className="mb-4 font-serif text-xl font-semibold text-fg">
            College information
          </h2>
          <ul className="flex flex-col gap-4">
            {infoCards.map((card) => (
              <li key={card.title}>
                <Card className="h-full">
                  <CardContent className="flex items-start gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <card.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-fg">{card.title}</h3>
                      {card.lines.map((line, index) => (
                        <p key={index} className="text-sm leading-relaxed text-muted">
                          {line}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Inquiries sent through the form reach the office inbox managed in
            the CMS — not a public forum. Your details are used only to reply.
          </p>
        </section>

        <section aria-labelledby="inquiry-form-heading" className="lg:col-span-3">
          <h2 id="inquiry-form-heading" className="mb-4 font-serif text-xl font-semibold text-fg">
            Send an inquiry
          </h2>
          <InquiryForm />
        </section>
      </div>
    </div>
  );
}
