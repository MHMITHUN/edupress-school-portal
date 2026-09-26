import type {
  Notice,
  NoticeCategory,
  NoticePriority,
  ContentStatus,
  Event,
  EventCategory,
  Teacher,
  Designation,
  Department,
  ResultSession,
  ExamName,
  ClassLevel,
  ResultEntry,
  SubjectMark,
  GalleryItem,
  GalleryCategory,
  Download,
  DownloadCategory,
  DownloadFormat,
  SiteSettings,
  Inquiry,
  InquiryStatus,
} from "@/lib/db/types";

/**
 * THE content-store interface (spec 17.9): one contract, three
 * implementations behind getCmsStore() (src/lib/cms/index.ts):
 *
 *   1. MongoCmsStore   (src/lib/cms/mongodb/store.ts)    — MONGODB_URI set
 *   2. DemoCmsStore    (src/lib/cms/mongodb/demo-store.ts) — in-memory fallback
 *   3. WordPressCmsStore (src/lib/cms/wordpress/store.ts) — CMS_MODE=wordpress
 *
 * EXTENDING THIS INTERFACE: add the method signature here first, then
 * implement it in EVERY store above so the backends stay interchangeable.
 * Methods are domain-level (listNotices({ status }) etc.), never raw
 * collection access.
 */

// ---- input shapes (ids and timestamps are store-made where noted) ------------

export interface CreateNoticeInput {
  slug: string;
  title: string;
  bodyMd: string;
  category: NoticeCategory;
  /** Default "normal". */
  priority?: NoticePriority;
  /** Default "draft". */
  status?: ContentStatus;
  /** Default false. */
  featured?: boolean;
  /** Default: now. */
  publishedAt?: string;
  expiryAt?: string;
  attachment?: Notice["attachment"];
}
export type UpdateNoticeInput = Partial<Omit<CreateNoticeInput, "slug">>;

export interface CreateEventInput {
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  category: EventCategory;
  /** Default "draft". */
  status?: ContentStatus;
  coverImage?: string;
}
export type UpdateEventInput = Partial<Omit<CreateEventInput, "slug">>;

export interface CreateTeacherInput {
  slug: string;
  name: string;
  designation: Designation;
  departmentSlug: string;
  qualification: string;
  subjects: string[];
  email: string;
  bioMd: string;
  joinYear: number;
}
export type UpdateTeacherInput = Partial<Omit<CreateTeacherInput, "slug">>;

export interface CreateDepartmentInput {
  slug: string;
  name: string;
  summary: string;
  descriptionMd: string;
  establishedYear: number;
  headTeacherId?: string;
}
export type UpdateDepartmentInput = Partial<Omit<CreateDepartmentInput, "slug">>;

export interface CreateResultSessionInput {
  exam: ExamName;
  year: number;
  classLevel: ClassLevel;
  className: string;
  /** Default: now. */
  publishedAt?: string;
  /** Default "draft". */
  status?: ContentStatus;
  results: Array<ResultEntryInput>;
}
export type UpdateResultSessionInput = Partial<Omit<CreateResultSessionInput, never>>;

/** Result rows are provided as a whole array; updates replace it entirely. */
export interface ResultEntryInput {
  studentId: string;
  studentName: string;
  gpa: number;
  grade: string;
  subjectMarks: SubjectMark[];
}

export interface CreateGalleryItemInput {
  title: string;
  category: GalleryCategory;
  caption: string;
  takenAt: string;
  palette: [string, string];
}
export type UpdateGalleryItemInput = Partial<Omit<CreateGalleryItemInput, never>>;

export interface CreateDownloadInput {
  title: string;
  category: DownloadCategory;
  fileName: string;
  format: DownloadFormat;
  sizeLabel: string;
  /** Default: now. */
  updatedAt?: string;
}
export type UpdateDownloadInput = Partial<Omit<CreateDownloadInput, never>>;

export type UpdateSiteSettingsInput = Partial<Omit<SiteSettings, "id">>;

export interface CreateInquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// ---- list options ---------------------------------------------------------------

export interface ListNoticesOptions {
  /** "published" also hides notices whose expiryAt has passed. */
  status?: ContentStatus;
  category?: NoticeCategory;
  featured?: boolean;
  /** Case-insensitive search over titles. */
  q?: string;
  limit?: number;
}

export interface ListEventsOptions {
  status?: ContentStatus;
  category?: EventCategory;
  /** true: only events with startsAt >= now, sorted ascending (soonest first). */
  upcoming?: boolean;
  limit?: number;
}

export interface ListTeachersOptions {
  departmentSlug?: string;
  designation?: Designation;
  /** Match teachers who teach this subject. */
  subject?: string;
  /** Case-insensitive search over names. */
  q?: string;
}

export interface ListResultSessionsOptions {
  status?: ContentStatus;
  exam?: ExamName;
  year?: number;
}

// ---- read models -----------------------------------------------------------------

/** A student's verified result inside a published session (public flow, spec 17.7). */
export interface StudentResultMatch {
  session: ResultSession;
  entry: ResultEntry;
}

/** Dashboard counters (spec 17.8). */
export interface CmsStats {
  notices: number;
  publishedNotices: number;
  events: number;
  teachers: number;
  departments: number;
  resultSessions: number;
  galleryItems: number;
  downloads: number;
  inquiries: number;
  newInquiries: number;
}

// ---- the interface ------------------------------------------------------------------

export interface CmsStore {
  // ---- notices ---------------------------------------------------------
  /** Newest publishedAt first. `status: "published"` also filters expired rows. */
  listNotices(options?: ListNoticesOptions): Promise<Notice[]>;
  /** Any status — public pages must check status/expiry themselves. */
  getNoticeBySlug(slug: string): Promise<Notice | null>;
  getNoticeById(id: string): Promise<Notice | null>;
  createNotice(input: CreateNoticeInput): Promise<Notice>;
  updateNotice(id: string, patch: UpdateNoticeInput): Promise<Notice | null>;
  setNoticeStatus(id: string, status: ContentStatus): Promise<Notice | null>;
  /** Admin manager delete (permanent, confirmed client-side). */
  deleteNotice(id: string): Promise<boolean>;

  // ---- events ------------------------------------------------------------
  listEvents(options?: ListEventsOptions): Promise<Event[]>;
  getEventBySlug(slug: string): Promise<Event | null>;
  getEventById(id: string): Promise<Event | null>;
  createEvent(input: CreateEventInput): Promise<Event>;
  updateEvent(id: string, patch: UpdateEventInput): Promise<Event | null>;
  setEventStatus(id: string, status: ContentStatus): Promise<Event | null>;
  /** Admin manager delete (permanent, confirmed client-side). */
  deleteEvent(id: string): Promise<boolean>;

  // ---- teachers ------------------------------------------------------------
  /** Name ascending. */
  listTeachers(options?: ListTeachersOptions): Promise<Teacher[]>;
  getTeacherBySlug(slug: string): Promise<Teacher | null>;
  getTeacherById(id: string): Promise<Teacher | null>;
  createTeacher(input: CreateTeacherInput): Promise<Teacher>;
  updateTeacher(id: string, patch: UpdateTeacherInput): Promise<Teacher | null>;
  /** Admin manager delete. Fails (false) while a department references the teacher as head. */
  deleteTeacher(id: string): Promise<boolean>;

  // ---- departments ------------------------------------------------------------
  /** Name ascending. */
  listDepartments(): Promise<Department[]>;
  getDepartmentBySlug(slug: string): Promise<Department | null>;
  getDepartmentById(id: string): Promise<Department | null>;
  createDepartment(input: CreateDepartmentInput): Promise<Department>;
  updateDepartment(id: string, patch: UpdateDepartmentInput): Promise<Department | null>;
  /** Admin manager delete (clears headTeacherId references implicitly by removing the row). */
  deleteDepartment(id: string): Promise<boolean>;

  // ---- result sessions ------------------------------------------------------------
  /** publishedAt descending. */
  listResultSessions(options?: ListResultSessionsOptions): Promise<ResultSession[]>;
  getResultSessionById(id: string): Promise<ResultSession | null>;
  createResultSession(input: CreateResultSessionInput): Promise<ResultSession>;
  updateResultSession(
    id: string,
    patch: UpdateResultSessionInput,
  ): Promise<ResultSession | null>;
  setResultSessionStatus(
    id: string,
    status: ContentStatus,
  ): Promise<ResultSession | null>;
  /** Admin manager delete (removes the session and all of its rows). */
  deleteResultSession(id: string): Promise<boolean>;
  /** Public verification flow: match a student id across PUBLISHED sessions only. */
  findStudentResults(studentId: string): Promise<StudentResultMatch[]>;

  // ---- gallery ------------------------------------------------------------
  /** takenAt descending. */
  listGalleryItems(category?: GalleryCategory): Promise<GalleryItem[]>;
  getGalleryItemById(id: string): Promise<GalleryItem | null>;
  createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem>;
  updateGalleryItem(
    id: string,
    patch: UpdateGalleryItemInput,
  ): Promise<GalleryItem | null>;
  deleteGalleryItem(id: string): Promise<boolean>;

  // ---- downloads ------------------------------------------------------------
  /** updatedAt descending. */
  listDownloads(category?: DownloadCategory): Promise<Download[]>;
  getDownloadById(id: string): Promise<Download | null>;
  createDownload(input: CreateDownloadInput): Promise<Download>;
  updateDownload(id: string, patch: UpdateDownloadInput): Promise<Download | null>;
  deleteDownload(id: string): Promise<boolean>;

  // ---- site settings ------------------------------------------------------------
  /** Always resolves — falls back to the seeded defaults when unset. */
  getSettings(): Promise<SiteSettings>;
  updateSettings(patch: UpdateSiteSettingsInput): Promise<SiteSettings>;

  // ---- admission inquiries ------------------------------------------------------------
  createInquiry(input: CreateInquiryInput): Promise<Inquiry>;
  /** createdAt descending; filter by status for the admin inbox. */
  listInquiries(status?: InquiryStatus): Promise<Inquiry[]>;
  markInquiryRead(id: string): Promise<Inquiry | null>;

  // ---- dashboard ------------------------------------------------------------
  getStats(): Promise<CmsStats>;
}
