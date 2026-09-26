import type { Event } from "../types";

/**
 * Event seeds — nine college events. Past events use fixed Jan-Sep 2026
 * dates; the four upcoming events carry fixed Oct-Dec 2026 dates so the
 * home page's "upcoming events" section stays populated on the demo site
 * beyond late September 2026.
 */

export const seedEvents: Event[] = [
  {
    id: "evt-001",
    slug: "annual-science-fair-2026",
    title: "Annual Science Fair 2026",
    description:
      "Two days of student projects across working models, environmental studies, robotics and ICT, and biological sciences. Open to guardians from 10:00 AM on the second day; best three projects advance to the divisional fair.",
    startsAt: "2026-10-05T09:00:00.000Z",
    endsAt: "2026-10-06T16:00:00.000Z",
    location: "College Auditorium",
    category: "academic",
    status: "published",
  },
  {
    id: "evt-002",
    slug: "parents-day-2026",
    title: "Parents' Day 2026",
    description:
      "Class-wise Guardian sessions where teachers present progress cards after the SSC Mock Test, followed by a common session on the winter revision programme and campus discipline policy.",
    startsAt: "2026-10-28T10:00:00.000Z",
    endsAt: "2026-10-28T15:30:00.000Z",
    location: "College Auditorium and Classrooms",
    category: "meeting",
    status: "published",
  },
  {
    id: "evt-003",
    slug: "inter-college-mathematics-olympiad-2026",
    title: "Inter-College Mathematics Olympiad 2026",
    description:
      "Regional round hosted by Padma Model College. Individual written round in the morning, live team round after lunch; prizes awarded by the chief guest from the Dhaka Education Board.",
    startsAt: "2026-11-12T08:30:00.000Z",
    endsAt: "2026-11-12T17:00:00.000Z",
    location: "College Auditorium",
    category: "academic",
    status: "published",
  },
  {
    id: "evt-004",
    slug: "career-counselling-session-2026",
    title: "Career Counselling Session: University Admissions",
    description:
      "Alumni now studying at BUET, Dhaka University and medical colleges guide Class 12 students on admission tests, subject choice and application timelines. Includes an open question round.",
    startsAt: "2026-12-05T10:00:00.000Z",
    endsAt: "2026-12-05T13:00:00.000Z",
    location: "Seminar Room",
    category: "academic",
    status: "published",
  },
  {
    id: "evt-005",
    slug: "annual-sports-day-2026",
    title: "Annual Sports Day 2026",
    description:
      "Inter-house athletics: sprints, relay, long jump, shot put and the traditional tug-of-war final. The house championship trophy is awarded at the closing ceremony.",
    startsAt: "2026-02-05T08:00:00.000Z",
    endsAt: "2026-02-05T16:00:00.000Z",
    location: "College Ground",
    category: "sports",
    status: "published",
  },
  {
    id: "evt-006",
    slug: "annual-cultural-program-2026",
    title: "Annual Cultural Programme 2026",
    description:
      "Music, drama and recitation by college troupes, with the one-act play 'Padmar Ekti Golpo' staged by the drama club as the centrepiece.",
    startsAt: "2026-01-29T16:00:00.000Z",
    endsAt: "2026-01-29T20:30:00.000Z",
    location: "College Auditorium",
    category: "cultural",
    status: "published",
  },
  {
    id: "evt-007",
    slug: "campus-book-fair-2026",
    title: "Campus Book Fair 2026",
    description:
      "Three-day book fair with publishers from Nilkhet and Bangla Academy, a second-hand textbook exchange desk run by the reading club, and an evening poetry reading.",
    startsAt: "2026-02-12T09:00:00.000Z",
    endsAt: "2026-02-14T18:00:00.000Z",
    location: "College Lawn",
    category: "cultural",
    status: "published",
  },
  {
    id: "evt-008",
    slug: "inter-department-debate-2026",
    title: "Inter-Department Debate Competition 2026",
    description:
      "Bangla-language parliamentary debate on campus and social themes; Science faces Business Studies in the final motion on digital study habits.",
    startsAt: "2026-03-19T10:00:00.000Z",
    endsAt: "2026-03-19T16:00:00.000Z",
    location: "Seminar Room",
    category: "academic",
    status: "published",
  },
  {
    id: "evt-009",
    slug: "hsc-first-year-orientation-2026",
    title: "HSC 1st Year Orientation",
    description:
      "Welcome session for newly admitted Class 11 students and guardians: department introductions, laboratory safety briefing, library membership and campus tour.",
    startsAt: "2026-07-15T09:30:00.000Z",
    endsAt: "2026-07-15T13:00:00.000Z",
    location: "College Auditorium",
    category: "academic",
    status: "published",
  },
];
