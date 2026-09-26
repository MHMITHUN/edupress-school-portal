import { z } from "zod";

/**
 * Zod schemas for every admin CMS form (spec 17.8). The server actions in
 * src/app/admin/actions.ts parse FormData into plain objects, validate with
 * these, and map issues back to per-field errors. Lives outside the
 * "use server" file so unit tests can import it directly.
 */

// ---- shared pieces -----------------------------------------------------------

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugField = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(120, "Slug is too long.")
  .regex(
    SLUG,
    "Use lowercase letters, digits and single hyphens (e.g. my-item).",
  );

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const htmlDate = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD date picker format.");

const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/**
 * datetime-local strings ("2026-10-31T16:00") are treated as UTC and become
 * full ISO strings. Empty or malformed values pass through as undefined, so
 * a required field reports "required" and an optional field is simply
 * dropped — a malformed expiry is never stored. (V8's Date parser accepts
 * junk like "garbage:00Z", hence the explicit format check.)
 */
export function datetimeLocalToIso(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !DATETIME_LOCAL.test(trimmed)) return undefined;
  const iso = new Date(`${trimmed}:00Z`); // datetime-local has no seconds
  return Number.isNaN(iso.getTime()) ? undefined : iso.toISOString();
}

export function isoToDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

// ---- notices -------------------------------------------------------------------

export const noticeFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title is too long."),
  slug: slugField,
  category: z.enum([
    "exam",
    "admission",
    "event",
    "general",
    "holiday",
    "result",
  ]),
  priority: z.enum(["normal", "high", "urgent"]),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  publishedAt: z.string().transform((value, ctx) => {
    const iso = datetimeLocalToIso(value);
    if (!iso) {
      ctx.addIssue({ code: "custom", message: "Published date is required." });
      return z.NEVER;
    }
    return iso;
  }),
  expiryAt: z
    .string()
    .optional()
    .transform((value) => datetimeLocalToIso(value === "" ? undefined : value)),
  attachmentFileName: z.string().trim().max(200).optional(),
  attachmentLabel: z.string().trim().max(200).optional(),
  bodyMd: z
    .string()
    .trim()
    .min(10, "The notice body needs at least 10 characters."),
});
export type NoticeFormValues = z.infer<typeof noticeFormSchema>;

// ---- events ----------------------------------------------------------------------

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(200, "Title is too long."),
    slug: slugField,
    category: z.enum(["academic", "cultural", "sports", "holiday", "meeting"]),
    status: z.enum(["draft", "published"]),
    location: z
      .string()
      .trim()
      .min(2, "Location is required.")
      .max(160, "Location is too long."),
    startsAt: z.string().transform((value, ctx) => {
      const iso = datetimeLocalToIso(value);
      if (!iso) {
        ctx.addIssue({ code: "custom", message: "Start date is required." });
        return z.NEVER;
      }
      return iso;
    }),
    endsAt: z.string().transform((value, ctx) => {
      const iso = datetimeLocalToIso(value);
      if (!iso) {
        ctx.addIssue({ code: "custom", message: "End date is required." });
        return z.NEVER;
      }
      return iso;
    }),
    description: z
      .string()
      .trim()
      .min(10, "The description needs at least 10 characters."),
  })
  .refine(
    (data) =>
      new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(),
    {
      message: "The end must be after the start.",
      path: ["endsAt"],
    },
  );
export type EventFormValues = z.infer<typeof eventFormSchema>;

// ---- teachers -----------------------------------------------------------------------

export const teacherFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters.")
    .max(120, "Name is too long."),
  slug: slugField,
  designation: z.enum([
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Senior Lecturer",
    "Lecturer",
  ]),
  departmentSlug: z.string().trim().min(1, "Choose a department."),
  qualification: z
    .string()
    .trim()
    .min(3, "Qualification is required.")
    .max(200, "Qualification is too long."),
  subjects: z
    .string()
    .trim()
    .min(1, "List at least one subject.")
    .transform((value) =>
      value
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
    )
    .refine((subjects) => subjects.length > 0, "List at least one subject."),
  email: z.string().trim().email("Enter a valid email address."),
  bioMd: z.string().trim().min(10, "The bio needs at least 10 characters."),
  joinYear: z.coerce
    .number({ message: "Join year must be a number." })
    .int("Join year must be a whole year.")
    .min(1980, "Join year looks too early.")
    .max(2027, "Join year cannot be in the future beyond 2027."),
});
export type TeacherFormValues = z.infer<typeof teacherFormSchema>;

// ---- departments --------------------------------------------------------------------

export const departmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters.")
    .max(140, "Name is too long."),
  slug: slugField,
  summary: z
    .string()
    .trim()
    .min(10, "The summary needs at least 10 characters.")
    .max(300, "Summary is too long."),
  descriptionMd: z
    .string()
    .trim()
    .min(20, "The description needs at least 20 characters."),
  establishedYear: z.coerce
    .number({ message: "Established year must be a number." })
    .int("Established year must be a whole year.")
    .min(1950, "Established year looks too early.")
    .max(2027, "Established year cannot be beyond 2027."),
  headTeacherId: z.string().trim().optional(),
});
export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

// ---- result sessions ------------------------------------------------------------------

const subjectMarkSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(80, "Subject name is too long."),
  marks: z.coerce
    .number({ message: "Marks must be a number." })
    .int("Marks must be a whole number.")
    .min(0, "Marks cannot be negative.")
    .max(100, "Marks are out of 100."),
  grade: z
    .string()
    .trim()
    .min(1, "Grade is required.")
    .max(5, "Grade like A+, A, B…"),
});

const resultEntrySchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(4, "Student ID needs at least 4 characters.")
    .max(30, "Student ID is too long."),
  studentName: z
    .string()
    .trim()
    .min(3, "Student name is required.")
    .max(120, "Name is too long."),
  gpa: z.coerce
    .number({ message: "GPA must be a number." })
    .min(0, "GPA cannot be negative.")
    .max(5, "GPA is out of 5."),
  grade: z
    .string()
    .trim()
    .min(1, "Grade is required.")
    .max(5, "Grade like A+, A, B…"),
  subjectMarks: z.array(subjectMarkSchema).min(1, "Add at least one subject."),
});

export const resultSessionFormSchema = z.object({
  exam: z.enum([
    "SSC Mock Test",
    "HSC Pre-Test",
    "Half-Yearly",
    "Annual",
    "Test Examination",
  ]),
  year: z.coerce
    .number({ message: "Year must be a number." })
    .int("Year must be a whole year.")
    .min(2020, "Year looks too early.")
    .max(2027, "Year cannot be beyond 2027."),
  classLevel: z.enum(["SSC", "HSC"]),
  className: z
    .string()
    .trim()
    .min(3, "Class group is required.")
    .max(80, "Class group is too long."),
  status: z.enum(["draft", "published"]),
  publishedAt: htmlDate("Published date"),
  entries: z.array(resultEntrySchema).min(1, "Add at least one student row."),
});
export type ResultSessionFormValues = z.infer<typeof resultSessionFormSchema>;

// ---- gallery ---------------------------------------------------------------------------

export const galleryFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(140, "Title is too long."),
  category: z.enum(["campus", "science-lab", "sports", "cultural", "library"]),
  caption: z
    .string()
    .trim()
    .min(10, "The caption needs at least 10 characters.")
    .max(300, "Caption is too long."),
  takenAt: htmlDate("Taken date"),
  colorA: z
    .string()
    .trim()
    .regex(HEX_COLOR, "Use a 6-digit hex colour like #7c2d3e."),
  colorB: z
    .string()
    .trim()
    .regex(HEX_COLOR, "Use a 6-digit hex colour like #e5e0d8."),
});
export type GalleryFormValues = z.infer<typeof galleryFormSchema>;

// ---- downloads --------------------------------------------------------------------------

export const downloadFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title is too long."),
  category: z.enum([
    "admission-form",
    "syllabus",
    "routine",
    "prospectus",
    "notice",
  ]),
  fileName: z
    .string()
    .trim()
    .min(3, "File name is required.")
    .max(200, "File name is too long.")
    .regex(
      /^[\w\- .]+\.(pdf|docx|xlsx)$/i,
      "File name must end in .pdf, .docx or .xlsx.",
    ),
  format: z.enum(["pdf", "docx", "xlsx"]),
  sizeLabel: z
    .string()
    .trim()
    .min(1, "Size label is required (e.g. 240 KB).")
    .max(20, "Size label is too long."),
  updatedAt: htmlDate("Updated date"),
});
export type DownloadFormValues = z.infer<typeof downloadFormSchema>;

// ---- site settings ---------------------------------------------------------------------

export const settingsFormSchema = z.object({
  collegeName: z
    .string()
    .trim()
    .min(3, "College name is required.")
    .max(140, "Name is too long."),
  tagline: z
    .string()
    .trim()
    .min(3, "Tagline is required.")
    .max(160, "Tagline is too long."),
  announcementText: z
    .string()
    .trim()
    .max(300, "Announcement is too long (300 characters)."),
  announcementActive: z.boolean(),
  contactAddress: z
    .string()
    .trim()
    .min(3, "Address is required.")
    .max(200, "Address is too long."),
  contactPhone: z
    .string()
    .trim()
    .min(6, "Phone is required.")
    .max(40, "Phone is too long."),
  contactEmail: z.string().trim().email("Enter a valid email address."),
  principalName: z
    .string()
    .trim()
    .min(3, "Principal name is required.")
    .max(140, "Name is too long."),
  principalTitle: z
    .string()
    .trim()
    .min(2, "Title is required.")
    .max(80, "Title is too long."),
  principalMessageMd: z
    .string()
    .trim()
    .min(20, "The principal's message needs at least 20 characters."),
});
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
