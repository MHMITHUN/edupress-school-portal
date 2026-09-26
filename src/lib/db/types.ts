import { z } from "zod";

/**
 * Zod schemas + inferred TypeScript types for every collection (spec 17).
 * The MongoDB stores parse documents at the boundary with these schemas;
 * the in-memory demo stores produce values that already satisfy them.
 */

// ---- users -----------------------------------------------------------------

/**
 * CMS roles. ADMIN manages everything including users and settings;
 * CONTENT_EDITOR manages content (notices, events, teachers, ...).
 * There is no public student login on the portal.
 */
export const RoleSchema = z.enum(["ADMIN", "CONTENT_EDITOR"]);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  /** scrypt$<salt-hex>$<hash-hex> — see src/lib/auth/password.ts */
  passwordHash: z.string().min(1),
  role: RoleSchema,
  createdAt: z.string(), // ISO date, e.g. "2026-01-05T09:00:00.000Z"
});
export type User = z.infer<typeof UserSchema>;
/** User shape safe to send to the client. */
export type PublicUser = Omit<User, "passwordHash">;

// ---- shared enums ------------------------------------------------------------

export const ContentStatusSchema = z.enum(["draft", "published"]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

// ---- notices -----------------------------------------------------------------

export const NoticeCategorySchema = z.enum([
  "exam",
  "admission",
  "event",
  "general",
  "holiday",
  "result",
]);
export type NoticeCategory = z.infer<typeof NoticeCategorySchema>;

export const NoticePrioritySchema = z.enum(["normal", "high", "urgent"]);
export type NoticePriority = z.infer<typeof NoticePrioritySchema>;

export const NoticeSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  /** Markdown body rendered by the portal. */
  bodyMd: z.string(),
  category: NoticeCategorySchema,
  priority: NoticePrioritySchema,
  status: ContentStatusSchema,
  featured: z.boolean(),
  publishedAt: z.string(),
  /** Notices with a past expiryAt are hidden from public listings. */
  expiryAt: z.string().optional(),
  attachment: z
    .object({
      fileName: z.string().min(1),
      label: z.string().min(1),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Notice = z.infer<typeof NoticeSchema>;

// ---- events ------------------------------------------------------------------

export const EventCategorySchema = z.enum([
  "academic",
  "cultural",
  "sports",
  "holiday",
  "meeting",
]);
export type EventCategory = z.infer<typeof EventCategorySchema>;

export const EventSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  location: z.string(),
  category: EventCategorySchema,
  status: ContentStatusSchema,
  /**
   * Optional CSS-art key for the generated gradient cover card
   * (this portal ships no external images).
   */
  coverImage: z.string().optional(),
});
export type Event = z.infer<typeof EventSchema>;

// ---- departments ---------------------------------------------------------------

export const DepartmentSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: z.string(),
  descriptionMd: z.string(),
  establishedYear: z.number().int().positive(),
  /** Optional reference to the Teacher who leads the department. */
  headTeacherId: z.string().optional(),
});
export type Department = z.infer<typeof DepartmentSchema>;

// ---- teachers -------------------------------------------------------------------

export const DesignationSchema = z.enum([
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Senior Lecturer",
]);
export type Designation = z.infer<typeof DesignationSchema>;

export const TeacherSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  designation: DesignationSchema,
  departmentSlug: z.string().min(1),
  qualification: z.string().min(1),
  subjects: z.array(z.string().min(1)).min(1),
  email: z.string().email(),
  bioMd: z.string(),
  joinYear: z.number().int().positive(),
});
export type Teacher = z.infer<typeof TeacherSchema>;

// ---- results ----------------------------------------------------------------------

export const ExamNameSchema = z.enum([
  "SSC Mock Test",
  "HSC Pre-Test",
  "Half-Yearly",
  "Annual",
  "Test Examination",
]);
export type ExamName = z.infer<typeof ExamNameSchema>;

export const ClassLevelSchema = z.enum(["SSC", "HSC"]);
export type ClassLevel = z.infer<typeof ClassLevelSchema>;

export const SubjectMarkSchema = z.object({
  subject: z.string().min(1),
  marks: z.number().int().min(0).max(100),
  grade: z.string().min(1),
});
export type SubjectMark = z.infer<typeof SubjectMarkSchema>;

export const ResultEntrySchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  gpa: z.number().min(0).max(5),
  grade: z.string().min(1),
  subjectMarks: z.array(SubjectMarkSchema).min(1),
});
export type ResultEntry = z.infer<typeof ResultEntrySchema>;

export const ResultSessionSchema = z.object({
  id: z.string().min(1),
  exam: ExamNameSchema,
  year: z.number().int().positive(),
  /** Programme level: SSC (classes 9-10) or HSC (classes 11-12). */
  classLevel: ClassLevelSchema,
  /** Human-readable class group, e.g. "Science 1st Year". */
  className: z.string().min(1),
  publishedAt: z.string(),
  status: ContentStatusSchema,
  results: z.array(ResultEntrySchema),
});
export type ResultSession = z.infer<typeof ResultSessionSchema>;

// ---- gallery --------------------------------------------------------------------

export const GalleryCategorySchema = z.enum([
  "campus",
  "science-lab",
  "sports",
  "cultural",
  "library",
]);
export type GalleryCategory = z.infer<typeof GalleryCategorySchema>;

export const GalleryItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: GalleryCategorySchema,
  caption: z.string(),
  takenAt: z.string(),
  /** Exactly two hex colors driving the generated CSS-art tile. */
  palette: z.tuple([z.string(), z.string()]),
});
export type GalleryItem = z.infer<typeof GalleryItemSchema>;

// ---- downloads -------------------------------------------------------------------

export const DownloadCategorySchema = z.enum([
  "admission-form",
  "syllabus",
  "routine",
  "prospectus",
  "notice",
]);
export type DownloadCategory = z.infer<typeof DownloadCategorySchema>;

export const DownloadFormatSchema = z.enum(["pdf", "docx", "xlsx"]);
export type DownloadFormat = z.infer<typeof DownloadFormatSchema>;

export const DownloadSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: DownloadCategorySchema,
  fileName: z.string().min(1),
  format: DownloadFormatSchema,
  /** Human-readable size, e.g. "240 KB" (no real files are served). */
  sizeLabel: z.string().min(1),
  updatedAt: z.string(),
});
export type Download = z.infer<typeof DownloadSchema>;

// ---- site settings ----------------------------------------------------------------

export const SiteSettingsSchema = z.object({
  /** Singleton document id. */
  id: z.literal("site"),
  collegeName: z.string().min(1),
  tagline: z.string().min(1),
  announcement: z.object({
    text: z.string(),
    active: z.boolean(),
  }),
  contact: z.object({
    address: z.string(),
    phone: z.string(),
    email: z.string().email(),
  }),
  principal: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    messageMd: z.string(),
  }),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

// ---- admission inquiries -------------------------------------------------------------

export const InquiryStatusSchema = z.enum(["new", "read"]);
export type InquiryStatus = z.infer<typeof InquiryStatusSchema>;

export const InquirySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  status: InquiryStatusSchema,
  createdAt: z.string(),
});
export type Inquiry = z.infer<typeof InquirySchema>;
