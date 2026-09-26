import type { Notice } from "../types";

/**
 * Notice seeds — fourteen notices covering every category, two drafts
 * (never public), one urgent featured admission notice with an expiry
 * window, one already-expired scholarship deadline (hidden from public
 * listings by the store's expiry rule), and three with attachments.
 *
 * All dates are fixed ISO strings (Jan-Sep 2026 unless an older exam
 * session demands otherwise). Fictional college, fictional signatories.
 */

export const seedNotices: Notice[] = [
  {
    id: "not-001",
    slug: "admission-circular-2026-27",
    title: "Admission Circular 2026-27: SSC and HSC Programmes",
    bodyMd: `Padma Model College invites applications for admission to the academic session 2026-27.

## Available programmes
- SSC programme (Class 9) — Science and Business Studies groups
- HSC programme (Class 11) — Science and Business Studies groups

## Key dates
- Application opens: 1 September 2026
- Application deadline: 31 October 2026
- Admission test: 14 November 2026, 10:00 AM, college auditorium
- Test result and viva: 28-30 November 2026
- Classes begin: 1 January 2027

## How to apply
The admission form is available from the college office (Sun-Thu, 8:30 AM - 4:00 PM) and from the Downloads section of this portal. Completed forms must reach the admission desk with attested copies of mark sheets, two passport-size photographs and the prescribed application fee.

Selection is based on previous results, the admission test and a short viva. Merit and waiting lists will be posted on this notice board; no individual letters will be issued.`,
    category: "admission",
    priority: "urgent",
    status: "published",
    featured: true,
    publishedAt: "2026-09-01T09:00:00.000Z",
    expiryAt: "2026-10-31T16:00:00.000Z",
    attachment: {
      fileName: "admission-circular-2026.pdf",
      label: "Admission Circular 2026-27 (PDF)",
    },
    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-09-01T08:45:00.000Z",
  },
  {
    id: "not-002",
    slug: "ssc-mock-test-2026-routine",
    title: "SSC Mock Test 2026: Examination Routine",
    bodyMd: `The routine for the SSC Mock Test 2026 for Class 10 (Science and Business Studies) is published below.

- Bangla 1st Paper — 2 September 2026, 10:00 AM
- Bangla 2nd Paper — 3 September 2026, 10:00 AM
- English 1st Paper — 4 September 2026, 10:00 AM
- English 2nd Paper — 6 September 2026, 10:00 AM
- Mathematics — 8 September 2026, 10:00 AM
- ICT — 9 September 2026, 10:00 AM
- Physics / Accounting — 10 September 2026, 10:00 AM
- Chemistry / Finance — 11 September 2026, 10:00 AM

Students must carry college ID cards and sit thirty minutes before the start of each examination. The full routine with room allocations is attached.`,
    category: "exam",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-08-30T09:00:00.000Z",
    attachment: {
      fileName: "ssc-mock-routine-2026.pdf",
      label: "SSC Mock Test Routine 2026 (PDF)",
    },
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-30T09:00:00.000Z",
  },
  {
    id: "not-003",
    slug: "ssc-mock-test-2026-results-published",
    title: "SSC Mock Test 2026 Results Published",
    bodyMd: `Results of the SSC Mock Test 2026 for Class 10 have been published. Students may verify their results on the Results page of this portal using their student ID.

Individual mark sheets can be collected from the respective class teachers from Sunday, 21 September 2026. Students who could not reach the pass mark in two or more subjects must attend the special coaching classes beginning 5 October 2026; class teachers will share the schedule.

Guardians are requested to review the mark sheets with their wards and contact the class teacher during office hours for any clarification.`,
    category: "result",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-09-15T11:00:00.000Z",
    attachment: {
      fileName: "ssc-mock-results-summary-2026.pdf",
      label: "Results summary sheet (PDF)",
    },
    createdAt: "2026-09-15T10:30:00.000Z",
    updatedAt: "2026-09-15T11:00:00.000Z",
  },
  {
    id: "not-004",
    slug: "hsc-pre-test-examination-schedule",
    title: "HSC Pre-Test Examination Schedule Announced",
    bodyMd: `The HSC Pre-Test Examination for Class 12 will begin on 20 November 2026 and continue until 4 December 2026, following the board pattern in subjects, marks and timing.

Students must clear all college dues and collect their admit cards from the examination department by 15 November 2026. No student will be allowed into the examination hall without the admit card and college ID.

The subject-wise routine with examination halls will be published as a separate notice in the first week of November.`,
    category: "exam",
    priority: "high",
    status: "published",
    featured: false,
    publishedAt: "2026-09-14T09:30:00.000Z",
    createdAt: "2026-09-14T09:00:00.000Z",
    updatedAt: "2026-09-14T09:30:00.000Z",
  },
  {
    id: "not-005",
    slug: "practical-exam-schedule-hsc-pre-test",
    title: "Practical Examination Schedule for HSC Pre-Test",
    bodyMd: `Practical examinations for the HSC Pre-Test 2026 will be held in the respective department laboratories between 8 and 17 November 2026.

- Physics — 8-9 November, Physics Lab 1 and 2
- Chemistry — 10-11 November, Chemistry Laboratory
- Biology — 12 November, Biology Laboratory
- Higher Mathematics — 13 November, Room 304
- ICT — 15-16 November, Computer Lab 1
- Accounting and Finance — 17 November, Room 210

Laboratory notebooks must be submitted to the department head on the day of the practical. Students should arrive in lab coat and follow the standing safety instructions.`,
    category: "exam",
    priority: "high",
    status: "published",
    featured: false,
    publishedAt: "2026-09-20T09:00:00.000Z",
    createdAt: "2026-09-19T14:00:00.000Z",
    updatedAt: "2026-09-20T09:00:00.000Z",
  },
  {
    id: "not-006",
    slug: "annual-examination-2025-results-class-10",
    title: "Annual Examination 2025 Results: Class 10",
    bodyMd: `Results of the Annual Examination 2025 for Class 10 have been approved by the examination committee and are now published.

Students may verify their results through the Results page of this portal. Mark sheets will be distributed at the annual prize-giving ceremony; guardians are invited to attend.

Students with unsatisfactory performance in more than two subjects are advised to join the winter revision programme. Please contact your class teacher for registration.`,
    category: "result",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-01-10T10:00:00.000Z",
    createdAt: "2026-01-09T16:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "not-007",
    slug: "annual-science-fair-2026-registration",
    title: "Annual Science Fair 2026: Registration Open",
    bodyMd: `Registration is open for the Annual Science Fair 2026, to be held on 5-6 October 2026 in the college auditorium.

Projects may be submitted by teams of up to three students from any class. Each team must register with a project title and a one-paragraph abstract through their department head by 28 September 2026.

Categories this year: working models, environmental studies, robotics and ICT, and biological sciences. The best three projects will represent the college at the divisional science fair in December.`,
    category: "event",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-09-05T09:00:00.000Z",
    attachment: {
      fileName: "science-fair-registration-form-2026.docx",
      label: "Science Fair registration form (DOCX)",
    },
    createdAt: "2026-09-04T15:00:00.000Z",
    updatedAt: "2026-09-05T09:00:00.000Z",
  },
  {
    id: "not-008",
    slug: "eid-ul-fitr-holiday-notice",
    title: "Eid-ul-Fitr Holiday Notice",
    bodyMd: `The college will remain closed from 18 March 2026 to 24 March 2026 on the occasion of the holy Eid-ul-Fitr, subject to the sighting of the moon.

Classes resume on Wednesday, 25 March 2026 at the usual time. The college office will remain open on 20 and 23 March from 10:00 AM to 1:00 PM for urgent admission-related work.

Guardians are requested to ensure students return on the reopening day; attendance will be recorded as usual.`,
    category: "holiday",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-03-14T10:00:00.000Z",
    createdAt: "2026-03-14T09:00:00.000Z",
    updatedAt: "2026-03-14T10:00:00.000Z",
  },
  {
    id: "not-009",
    slug: "independence-day-holiday-notice",
    title: "Independence Day Holiday Notice",
    bodyMd: `The college will remain closed on 26 March 2026 on the occasion of the Independence and National Day.

The national flag will be hoisted at the college premises at 8:00 AM, followed by a short programme of patriotic songs and a recitation. Students of classes 9 and 11 are invited to attend with their class teachers; attendance is voluntary.

Classes resume on Friday, 27 March 2026.`,
    category: "holiday",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-03-20T10:00:00.000Z",
    createdAt: "2026-03-20T09:30:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "not-010",
    slug: "office-hours-during-ramadan",
    title: "Revised Office Hours during Ramadan",
    bodyMd: `During the month of Ramadan, the college office and library will follow revised hours:

- College office: 9:30 AM to 3:00 PM (Sunday to Thursday)
- Library: 10:00 AM to 2:30 PM
- Classes: 9:00 AM to 2:00 PM

The schedule will remain in effect until the Eid holidays are announced. Guardians are requested to plan visits to the admission and accounts desks within these hours.`,
    category: "general",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-02-22T09:00:00.000Z",
    createdAt: "2026-02-21T15:00:00.000Z",
    updatedAt: "2026-02-22T09:00:00.000Z",
  },
  {
    id: "not-011",
    slug: "library-extended-hours-before-exams",
    title: "Library Extended Hours before Examinations",
    bodyMd: `The college library will remain open from 8:00 AM to 5:00 PM on all working days between 24 August and 20 September 2026 to support examination preparation.

Additional copies of board question banks and reference texts for Physics, Chemistry, Higher Mathematics and Accounting have been placed in the reserve section. These may be used inside the library only.

Silence must be maintained in the reading hall; group study is possible in the seminar room on advance booking with the librarian.`,
    category: "general",
    priority: "normal",
    status: "published",
    featured: false,
    publishedAt: "2026-07-20T09:00:00.000Z",
    createdAt: "2026-07-20T08:30:00.000Z",
    updatedAt: "2026-07-20T09:00:00.000Z",
  },
  {
    id: "not-012",
    slug: "scholarship-applications-2026-deadline",
    title: "Merit Scholarship Applications: Final Reminder",
    bodyMd: `Students who have not yet submitted applications for the college merit scholarship for the 2026 academic year are reminded that the deadline is 15 March 2026.

Applications submitted after the deadline will not be considered under any circumstances. The scholarship covers half of the monthly tuition fee for one academic year and is awarded on the basis of the previous annual examination results and family circumstances.

The completed form, with a guardian income statement, must reach the vice-principal's office by 2:00 PM on the deadline day.`,
    category: "admission",
    priority: "high",
    status: "published",
    featured: false,
    publishedAt: "2026-02-10T09:00:00.000Z",
    expiryAt: "2026-03-15T14:00:00.000Z",
    createdAt: "2026-02-10T08:30:00.000Z",
    updatedAt: "2026-02-10T09:00:00.000Z",
  },
  {
    id: "not-013",
    slug: "revised-class-routine-hsc-first-year",
    title: "Revised Class Routine for HSC 1st Year (Draft)",
    bodyMd: `DRAFT — not yet published. A revised routine for HSC 1st Year classes is being prepared following the addition of two extra ICT practical periods.

The draft below is under review by the routine committee and will be published once approved by the principal.

- ICT practical added: Tuesday, 4th period, Computer Lab 2
- Physics demonstration moved: Wednesday, 2nd period
- Business Studies accounting case class: Thursday, 6th period

Do not circulate; awaiting final approval.`,
    category: "exam",
    priority: "normal",
    status: "draft",
    featured: false,
    publishedAt: "2026-09-18T09:00:00.000Z",
    createdAt: "2026-09-18T08:00:00.000Z",
    updatedAt: "2026-09-18T09:00:00.000Z",
  },
  {
    id: "not-014",
    slug: "parent-teacher-meeting-september-draft",
    title: "Parent-Teacher Meeting, September 2026 (Draft)",
    bodyMd: `DRAFT — not yet published. A parent-teacher meeting for Classes 9-12 is planned for the last week of October 2026, following the publication of the SSC Mock Test results.

Proposed agenda: mock test analysis, attendance review, winter revision programme, and the annual science fair. Class teachers will prepare individual progress cards before the meeting.

This draft awaits confirmation of the auditorium booking before publication.`,
    category: "general",
    priority: "normal",
    status: "draft",
    featured: false,
    publishedAt: "2026-09-22T09:00:00.000Z",
    createdAt: "2026-09-22T08:00:00.000Z",
    updatedAt: "2026-09-22T09:00:00.000Z",
  },
];
