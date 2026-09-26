import type { SiteSettings } from "../types";

/**
 * Default site settings for the fictional demo institution.
 * Used to seed the settings singleton (id "site") in both stores and by
 * scripts/seed.ts. The principal is a FICTIONAL person, as is the college.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "site",
  collegeName: "Padma Model College",
  tagline: "Knowledge, Discipline, Character",
  announcement: {
    text: "Admission Circular 2026-27 published — applications close 31 October 2026. See the notice board for details.",
    active: true,
  },
  contact: {
    address: "12 Padma Avenue, Dhanmondi, Dhaka 1205, Bangladesh",
    phone: "+880 2-55667788",
    email: "info@padmamodelcollege.edu.bd",
  },
  principal: {
    name: "Prof. Dr. Anisur Rahman",
    title: "Principal",
    messageMd: `Dear students, guardians and well-wishers,

Welcome to the portal of Padma Model College. Since 1998 this campus has stood for three commitments expressed in our motto: knowledge earned through disciplined study, discipline practised daily in and out of the classroom, and character built through service, honesty and respect for others.

Our teachers know their students by name. Laboratories, a growing library and a calm campus in the heart of Dhanmondi support the SSC and HSC programmes we offer. Results matter to us, and so do the habits that produce them: regular attendance, honest work and the courage to ask questions.

This portal carries our notice board, examination results verification, department profiles and admission information. Guardians are always welcome to meet teachers during office hours; education is a partnership, and we value yours.

With best wishes,

Prof. Dr. Anisur Rahman
Principal, Padma Model College (fictional demo institution)`,
  },
};
