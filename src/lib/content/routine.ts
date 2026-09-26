import type { ClassLevel } from "@/lib/db/types";

/**
 * Class routine dataset for /routine (spec 17.2).
 *
 * HONEST SOURCE LABEL: this is a STATIC demo dataset maintained in code —
 * it is not read from the CMS. The authoritative routine published by the
 * college office each term is the "Class Routine" sheet on /downloads, and
 * exam routines arrive as notices. The page labels this clearly.
 *
 * Teacher names reference the seeded teacher directory
 * (src/lib/db/seeds/teachers.ts) so the demo stays internally consistent.
 */

export const ROUTINE_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
] as const;
export type RoutineDay = (typeof ROUTINE_DAYS)[number];

export interface RoutinePeriod {
  /** 1-based period number. */
  period: number;
  start: string;
  end: string;
}

/** Seven teaching periods; the tiffin break (10:45–11:15) sits after period 3 and is rendered between rows, not as a period. */
export const ROUTINE_PERIODS: RoutinePeriod[] = [
  { period: 1, start: "08:30", end: "09:15" },
  { period: 2, start: "09:15", end: "10:00" },
  { period: 3, start: "10:00", end: "10:45" },
  { period: 4, start: "11:15", end: "12:00" },
  { period: 5, start: "12:00", end: "12:45" },
  { period: 6, start: "12:45", end: "13:30" },
  { period: 7, start: "13:30", end: "14:15" },
];

export interface RoutineEntry {
  day: RoutineDay;
  period: number;
  subject: string;
  /** Teacher short name (matches the teacher directory) or null for self-study/hall periods. */
  teacher: string | null;
}

export interface ClassRoutine {
  /** URL-safe id, e.g. "class-9-science-a". */
  id: string;
  classLevel: ClassLevel;
  /** e.g. "Class 9". */
  className: string;
  /** e.g. "Science (A)". */
  section: string;
  room: string;
  classTeacher: string;
  entries: RoutineEntry[];
}

const e = (
  day: RoutineDay,
  period: number,
  subject: string,
  teacher: string | null,
): RoutineEntry => ({ day, period, subject, teacher });

export const CLASS_ROUTINES: ClassRoutine[] = [
  {
    id: "class-9-science-a",
    classLevel: "SSC",
    className: "Class 9",
    section: "Science (A)",
    room: "Room 201",
    classTeacher: "Sabrina Chowdhury",
    entries: [
      e("Sunday", 1, "Mathematics", "Md. Shafiqul Alam"),
      e("Sunday", 2, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Sunday", 3, "Bangla", "Rehana Sarkar"),
      e("Sunday", 4, "English", "Nusrat Jahan"),
      e("Sunday", 5, "ICT", "Sabrina Chowdhury"),
      e("Sunday", 6, "Religion & Moral Education", "Maulana Abdur Rashid"),
      e("Sunday", 7, "Self-study (hall)", null),
      e("Monday", 1, "Chemistry", "Farhana Yeasmin"),
      e("Monday", 2, "Mathematics", "Md. Shafiqul Alam"),
      e("Monday", 3, "Bangla", "Rehana Sarkar"),
      e("Monday", 4, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Monday", 5, "English", "Nusrat Jahan"),
      e("Monday", 6, "ICT", "Md. Rafiqul Islam"),
      e("Monday", 7, "Higher Mathematics", "Tanvir Ahmed"),
      e("Tuesday", 1, "Biology", "Shahana Begum"),
      e("Tuesday", 2, "Chemistry", "Farhana Yeasmin"),
      e("Tuesday", 3, "Mathematics", "Md. Shafiqul Alam"),
      e("Tuesday", 4, "English", "Nusrat Jahan"),
      e("Tuesday", 5, "Bangla", "Rehana Sarkar"),
      e("Tuesday", 6, "ICT", "Sabrina Chowdhury"),
      e("Tuesday", 7, "Physical Education", "Kamrul Hasan"),
      e("Wednesday", 1, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Wednesday", 2, "Biology", "Shahana Begum"),
      e("Wednesday", 3, "Higher Mathematics", "Tanvir Ahmed"),
      e("Wednesday", 4, "Bangla", "Rehana Sarkar"),
      e("Wednesday", 5, "Chemistry", "Farhana Yeasmin"),
      e("Wednesday", 6, "English", "Nusrat Jahan"),
      e("Wednesday", 7, "Self-study (hall)", null),
      e("Thursday", 1, "Mathematics", "Md. Shafiqul Alam"),
      e("Thursday", 2, "ICT", "Md. Rafiqul Islam"),
      e("Thursday", 3, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Thursday", 4, "Biology", "Shahana Begum"),
      e("Thursday", 5, "Higher Mathematics", "Tanvir Ahmed"),
      e("Thursday", 6, "Bangla", "Rehana Sarkar"),
      e("Thursday", 7, "Library period", null),
    ],
  },
  {
    id: "class-9-business-a",
    classLevel: "SSC",
    className: "Class 9",
    section: "Business Studies (A)",
    room: "Room 105",
    classTeacher: "Golam Kibria",
    entries: [
      e("Sunday", 1, "Accounting", "Golam Kibria"),
      e("Sunday", 2, "Bangla", "Rehana Sarkar"),
      e("Sunday", 3, "Mathematics", "Md. Shafiqul Alam"),
      e("Sunday", 4, "English", "Nusrat Jahan"),
      e("Sunday", 5, "ICT", "Sabrina Chowdhury"),
      e("Sunday", 6, "Business Entrepreneurship", "Rashed Karim"),
      e("Sunday", 7, "Self-study (hall)", null),
      e("Monday", 1, "Finance & Banking", "Rashed Karim"),
      e("Monday", 2, "Accounting", "Golam Kibria"),
      e("Monday", 3, "English", "Nusrat Jahan"),
      e("Monday", 4, "Bangla", "Rehana Sarkar"),
      e("Monday", 5, "Mathematics", "Md. Shafiqul Alam"),
      e("Monday", 6, "ICT", "Md. Rafiqul Islam"),
      e("Monday", 7, "Religion & Moral Education", "Maulana Abdur Rashid"),
      e("Tuesday", 1, "Business Entrepreneurship", "Rashed Karim"),
      e("Tuesday", 2, "Accounting", "Golam Kibria"),
      e("Tuesday", 3, "ICT", "Sabrina Chowdhury"),
      e("Tuesday", 4, "Mathematics", "Md. Shafiqul Alam"),
      e("Tuesday", 5, "English", "Nusrat Jahan"),
      e("Tuesday", 6, "Bangla", "Rehana Sarkar"),
      e("Tuesday", 7, "Physical Education", "Kamrul Hasan"),
      e("Wednesday", 1, "Accounting", "Golam Kibria"),
      e("Wednesday", 2, "Finance & Banking", "Rashed Karim"),
      e("Wednesday", 3, "Bangla", "Rehana Sarkar"),
      e("Wednesday", 4, "English", "Nusrat Jahan"),
      e("Wednesday", 5, "Business Entrepreneurship", "Rashed Karim"),
      e("Wednesday", 6, "Mathematics", "Md. Shafiqul Alam"),
      e("Wednesday", 7, "Self-study (hall)", null),
      e("Thursday", 1, "ICT", "Md. Rafiqul Islam"),
      e("Thursday", 2, "English", "Nusrat Jahan"),
      e("Thursday", 3, "Accounting", "Golam Kibria"),
      e("Thursday", 4, "Bangla", "Rehana Sarkar"),
      e("Thursday", 5, "Finance & Banking", "Rashed Karim"),
      e("Thursday", 6, "Mathematics", "Md. Shafiqul Alam"),
      e("Thursday", 7, "Library period", null),
    ],
  },
  {
    id: "class-10-science-a",
    classLevel: "SSC",
    className: "Class 10",
    section: "Science (A)",
    room: "Room 301",
    classTeacher: "Tanvir Ahmed",
    entries: [
      e("Sunday", 1, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Sunday", 2, "Chemistry", "Farhana Yeasmin"),
      e("Sunday", 3, "Higher Mathematics", "Tanvir Ahmed"),
      e("Sunday", 4, "Bangla", "Rehana Sarkar"),
      e("Sunday", 5, "English", "Nusrat Jahan"),
      e("Sunday", 6, "ICT", "Md. Rafiqul Islam"),
      e("Sunday", 7, "Biology", "Shahana Begum"),
      e("Monday", 1, "Mathematics", "Md. Shafiqul Alam"),
      e("Monday", 2, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Monday", 3, "English", "Nusrat Jahan"),
      e("Monday", 4, "Biology", "Shahana Begum"),
      e("Monday", 5, "Chemistry", "Farhana Yeasmin"),
      e("Monday", 6, "Higher Mathematics", "Tanvir Ahmed"),
      e("Monday", 7, "Model Test (SSC preparation)", null),
      e("Tuesday", 1, "Bangla", "Rehana Sarkar"),
      e("Tuesday", 2, "Higher Mathematics", "Tanvir Ahmed"),
      e("Tuesday", 3, "ICT", "Sabrina Chowdhury"),
      e("Tuesday", 4, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Tuesday", 5, "Mathematics", "Md. Shafiqul Alam"),
      e("Tuesday", 6, "Chemistry", "Farhana Yeasmin"),
      e("Tuesday", 7, "Physical Education", "Kamrul Hasan"),
      e("Wednesday", 1, "Biology", "Shahana Begum"),
      e("Wednesday", 2, "English", "Nusrat Jahan"),
      e("Wednesday", 3, "Physics", "Prof. Dr. Anisur Rahman"),
      e("Wednesday", 4, "Higher Mathematics", "Tanvir Ahmed"),
      e("Wednesday", 5, "Bangla", "Rehana Sarkar"),
      e("Wednesday", 6, "Mathematics", "Md. Shafiqul Alam"),
      e("Wednesday", 7, "Self-study (hall)", null),
      e("Thursday", 1, "Chemistry", "Farhana Yeasmin"),
      e("Thursday", 2, "ICT", "Md. Rafiqul Islam"),
      e("Thursday", 3, "Bangla", "Rehana Sarkar"),
      e("Thursday", 4, "English", "Nusrat Jahan"),
      e("Thursday", 5, "Biology", "Shahana Begum"),
      e("Thursday", 6, "Higher Mathematics", "Tanvir Ahmed"),
      e("Thursday", 7, "Library period", null),
    ],
  },
  {
    id: "class-11-science-a",
    classLevel: "HSC",
    className: "Class 11",
    section: "Science (A)",
    room: "Room 401",
    classTeacher: "Farhana Yeasmin",
    entries: [
      e("Sunday", 1, "Physics 1st Paper", "Prof. Dr. Anisur Rahman"),
      e("Sunday", 2, "Chemistry 1st Paper", "Farhana Yeasmin"),
      e("Sunday", 3, "Mathematics 1st Paper", "Md. Shafiqul Alam"),
      e("Sunday", 4, "ICT", "Md. Rafiqul Islam"),
      e("Sunday", 5, "English", "Nusrat Jahan"),
      e("Sunday", 6, "Bangla", "Rehana Sarkar"),
      e("Sunday", 7, "Higher Mathematics 2nd Paper", "Tanvir Ahmed"),
      e("Monday", 1, "Chemistry 2nd Paper", "Farhana Yeasmin"),
      e("Monday", 2, "Physics 2nd Paper", "Prof. Dr. Anisur Rahman"),
      e("Monday", 3, "Bangla", "Rehana Sarkar"),
      e("Monday", 4, "Mathematics 2nd Paper", "Md. Shafiqul Alam"),
      e("Monday", 5, "ICT (practical lab)", "Sabrina Chowdhury"),
      e("Monday", 6, "English", "Nusrat Jahan"),
      e("Monday", 7, "Biology 1st Paper", "Shahana Begum"),
      e("Tuesday", 1, "Mathematics 1st Paper", "Md. Shafiqul Alam"),
      e("Tuesday", 2, "Higher Mathematics 1st Paper", "Tanvir Ahmed"),
      e("Tuesday", 3, "Physics 1st Paper", "Prof. Dr. Anisur Rahman"),
      e("Tuesday", 4, "Chemistry 1st Paper", "Farhana Yeasmin"),
      e("Tuesday", 5, "Bangla", "Rehana Sarkar"),
      e("Tuesday", 6, "ICT", "Md. Rafiqul Islam"),
      e("Tuesday", 7, "Physical Education", "Kamrul Hasan"),
      e("Wednesday", 1, "Biology 2nd Paper", "Shahana Begum"),
      e("Wednesday", 2, "English", "Nusrat Jahan"),
      e("Wednesday", 3, "Physics 2nd Paper", "Prof. Dr. Anisur Rahman"),
      e("Wednesday", 4, "Higher Mathematics 2nd Paper", "Tanvir Ahmed"),
      e("Wednesday", 5, "Chemistry 2nd Paper", "Farhana Yeasmin"),
      e("Wednesday", 6, "Mathematics 2nd Paper", "Md. Shafiqul Alam"),
      e("Wednesday", 7, "Self-study (hall)", null),
      e("Thursday", 1, "Physics (practical lab)", "Prof. Dr. Anisur Rahman"),
      e("Thursday", 2, "Chemistry (practical lab)", "Farhana Yeasmin"),
      e("Thursday", 3, "ICT", "Md. Rafiqul Islam"),
      e("Thursday", 4, "Bangla", "Rehana Sarkar"),
      e("Thursday", 5, "English", "Nusrat Jahan"),
      e("Thursday", 6, "Biology 1st Paper", "Shahana Begum"),
      e("Thursday", 7, "Library period", null),
    ],
  },
  {
    id: "class-11-business-a",
    classLevel: "HSC",
    className: "Class 11",
    section: "Business Studies (A)",
    room: "Room 405",
    classTeacher: "Rashed Karim",
    entries: [
      e("Sunday", 1, "Accounting 1st Paper", "Golam Kibria"),
      e("Sunday", 2, "Business Organization", "Rashed Karim"),
      e("Sunday", 3, "Finance & Banking", "Nazmul Huda"),
      e("Sunday", 4, "ICT", "Sabrina Chowdhury"),
      e("Sunday", 5, "English", "Nusrat Jahan"),
      e("Sunday", 6, "Bangla", "Rehana Sarkar"),
      e("Sunday", 7, "Production Management", "Nazmul Huda"),
      e("Monday", 1, "Accounting 2nd Paper", "Golam Kibria"),
      e("Monday", 2, "Business Organization", "Rashed Karim"),
      e("Monday", 3, "Bangla", "Rehana Sarkar"),
      e("Monday", 4, "English", "Nusrat Jahan"),
      e("Monday", 5, "ICT (practical lab)", "Md. Rafiqul Islam"),
      e("Monday", 6, "Finance & Banking", "Nazmul Huda"),
      e("Monday", 7, "Self-study (hall)", null),
      e("Tuesday", 1, "Production Management", "Nazmul Huda"),
      e("Tuesday", 2, "Accounting 1st Paper", "Golam Kibria"),
      e("Tuesday", 3, "ICT", "Sabrina Chowdhury"),
      e("Tuesday", 4, "Business Organization", "Rashed Karim"),
      e("Tuesday", 5, "Bangla", "Rehana Sarkar"),
      e("Tuesday", 6, "English", "Nusrat Jahan"),
      e("Tuesday", 7, "Physical Education", "Kamrul Hasan"),
      e("Wednesday", 1, "Finance & Banking", "Nazmul Huda"),
      e("Wednesday", 2, "English", "Nusrat Jahan"),
      e("Wednesday", 3, "Accounting 2nd Paper", "Golam Kibria"),
      e("Wednesday", 4, "Business Organization", "Rashed Karim"),
      e("Wednesday", 5, "ICT", "Md. Rafiqul Islam"),
      e("Wednesday", 6, "Bangla", "Rehana Sarkar"),
      e("Wednesday", 7, "Self-study (hall)", null),
      e("Thursday", 1, "Accounting 1st Paper", "Golam Kibria"),
      e("Thursday", 2, "Business Organization", "Rashed Karim"),
      e("Thursday", 3, "English", "Nusrat Jahan"),
      e("Thursday", 4, "Bangla", "Rehana Sarkar"),
      e("Thursday", 5, "Production Management", "Nazmul Huda"),
      e("Thursday", 6, "ICT", "Sabrina Chowdhury"),
      e("Thursday", 7, "Library period", null),
    ],
  },
  {
    id: "class-12-science-a",
    classLevel: "HSC",
    className: "Class 12",
    section: "Science (A)",
    room: "Room 501",
    classTeacher: "Prof. Dr. Anisur Rahman",
    entries: [
      e("Sunday", 1, "Physics 1st Paper", "Prof. Dr. Anisur Rahman"),
      e("Sunday", 2, "Higher Mathematics 1st Paper", "Tanvir Ahmed"),
      e("Sunday", 3, "Chemistry 2nd Paper", "Farhana Yeasmin"),
      e("Sunday", 4, "English", "Nusrat Jahan"),
      e("Sunday", 5, "ICT", "Md. Rafiqul Islam"),
      e("Sunday", 6, "Bangla", "Rehana Sarkar"),
      e("Sunday", 7, "Biology 2nd Paper", "Shahana Begum"),
      e("Monday", 1, "Chemistry 1st Paper", "Farhana Yeasmin"),
      e("Monday", 2, "Physics 2nd Paper", "Prof. Dr. Anisur Rahman"),
      e("Monday", 3, "Mathematics 2nd Paper", "Md. Shafiqul Alam"),
      e("Monday", 4, "Bangla", "Rehana Sarkar"),
      e("Monday", 5, "ICT (practical lab)", "Sabrina Chowdhury"),
      e("Monday", 6, "English", "Nusrat Jahan"),
      e("Monday", 7, "Test Examination practice", null),
      e("Tuesday", 1, "Mathematics 1st Paper", "Md. Shafiqul Alam"),
      e("Tuesday", 2, "Biology 1st Paper", "Shahana Begum"),
      e("Tuesday", 3, "Higher Mathematics 2nd Paper", "Tanvir Ahmed"),
      e("Tuesday", 4, "Physics 1st Paper", "Prof. Dr. Anisur Rahman"),
      e("Tuesday", 5, "Chemistry 2nd Paper", "Farhana Yeasmin"),
      e("Tuesday", 6, "English", "Nusrat Jahan"),
      e("Tuesday", 7, "Physical Education", "Kamrul Hasan"),
      e("Wednesday", 1, "Physics 2nd Paper", "Prof. Dr. Anisur Rahman"),
      e("Wednesday", 2, "Chemistry 1st Paper", "Farhana Yeasmin"),
      e("Wednesday", 3, "English", "Nusrat Jahan"),
      e("Wednesday", 4, "Higher Mathematics 1st Paper", "Tanvir Ahmed"),
      e("Wednesday", 5, "ICT", "Md. Rafiqul Islam"),
      e("Wednesday", 6, "Bangla", "Rehana Sarkar"),
      e("Wednesday", 7, "Self-study (hall)", null),
      e("Thursday", 1, "Physics (practical lab)", "Prof. Dr. Anisur Rahman"),
      e("Thursday", 2, "Chemistry (practical lab)", "Farhana Yeasmin"),
      e("Thursday", 3, "Bangla", "Rehana Sarkar"),
      e("Thursday", 4, "Mathematics 2nd Paper", "Md. Shafiqul Alam"),
      e("Thursday", 5, "Biology 2nd Paper", "Shahana Begum"),
      e("Thursday", 6, "English", "Nusrat Jahan"),
      e("Thursday", 7, "Library period", null),
    ],
  },
  {
    id: "class-12-business-a",
    classLevel: "HSC",
    className: "Class 12",
    section: "Business Studies (A)",
    room: "Room 505",
    classTeacher: "Golam Kibria",
    entries: [
      e("Sunday", 1, "Accounting 2nd Paper", "Golam Kibria"),
      e("Sunday", 2, "Business Organization", "Rashed Karim"),
      e("Sunday", 3, "Production Management", "Nazmul Huda"),
      e("Sunday", 4, "ICT", "Sabrina Chowdhury"),
      e("Sunday", 5, "English", "Nusrat Jahan"),
      e("Sunday", 6, "Bangla", "Rehana Sarkar"),
      e("Sunday", 7, "Finance & Banking", "Nazmul Huda"),
      e("Monday", 1, "Accounting 1st Paper", "Golam Kibria"),
      e("Monday", 2, "Business Organization", "Rashed Karim"),
      e("Monday", 3, "Bangla", "Rehana Sarkar"),
      e("Monday", 4, "English", "Nusrat Jahan"),
      e("Monday", 5, "ICT (practical lab)", "Md. Rafiqul Islam"),
      e("Monday", 6, "Finance & Banking", "Nazmul Huda"),
      e("Monday", 7, "Test Examination practice", null),
      e("Tuesday", 1, "Production Management", "Nazmul Huda"),
      e("Tuesday", 2, "Accounting 2nd Paper", "Golam Kibria"),
      e("Tuesday", 3, "ICT", "Md. Rafiqul Islam"),
      e("Tuesday", 4, "Business Organization", "Rashed Karim"),
      e("Tuesday", 5, "Bangla", "Rehana Sarkar"),
      e("Tuesday", 6, "English", "Nusrat Jahan"),
      e("Tuesday", 7, "Physical Education", "Kamrul Hasan"),
      e("Wednesday", 1, "Finance & Banking", "Nazmul Huda"),
      e("Wednesday", 2, "English", "Nusrat Jahan"),
      e("Wednesday", 3, "Accounting 1st Paper", "Golam Kibria"),
      e("Wednesday", 4, "Business Organization", "Rashed Karim"),
      e("Wednesday", 5, "ICT", "Sabrina Chowdhury"),
      e("Wednesday", 6, "Bangla", "Rehana Sarkar"),
      e("Wednesday", 7, "Self-study (hall)", null),
      e("Thursday", 1, "Accounting 2nd Paper", "Golam Kibria"),
      e("Thursday", 2, "Business Organization", "Rashed Karim"),
      e("Thursday", 3, "English", "Nusrat Jahan"),
      e("Thursday", 4, "Bangla", "Rehana Sarkar"),
      e("Thursday", 5, "Production Management", "Nazmul Huda"),
      e("Thursday", 6, "Finance & Banking", "Nazmul Huda"),
      e("Thursday", 7, "Library period", null),
    ],
  },
];

/** Find a routine by id (undefined when unknown). */
export function getRoutine(id: string): ClassRoutine | undefined {
  return CLASS_ROUTINES.find((routine) => routine.id === id);
}

/** Default routine when no selection is present in the URL. */
export const DEFAULT_ROUTINE_ID = CLASS_ROUTINES[0].id;

/** Look up the entry for a day + period (undefined means a free slot). */
export function findEntry(
  routine: ClassRoutine,
  day: RoutineDay,
  period: number,
): RoutineEntry | undefined {
  return routine.entries.find(
    (entry) => entry.day === day && entry.period === period,
  );
}
