import { randomUUID } from "node:crypto";
import type {
  Notice,
  Event,
  Teacher,
  Department,
  ResultSession,
  GalleryItem,
  GalleryCategory,
  Download,
  DownloadCategory,
  SiteSettings,
  Inquiry,
  InquiryStatus,
  ContentStatus,
} from "@/lib/db/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/db/seeds/settings";
import {
  seedNotices,
  seedEvents,
  seedDepartments,
  seedTeachers,
  seedResultSessions,
  seedGalleryItems,
  seedDownloads,
} from "@/lib/db/seeds/content";
import { isExpired } from "@/lib/utils";
import type {
  CmsStore,
  CreateNoticeInput,
  UpdateNoticeInput,
  ListNoticesOptions,
  CreateEventInput,
  UpdateEventInput,
  ListEventsOptions,
  CreateTeacherInput,
  UpdateTeacherInput,
  ListTeachersOptions,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateResultSessionInput,
  UpdateResultSessionInput,
  ListResultSessionsOptions,
  StudentResultMatch,
  CreateGalleryItemInput,
  UpdateGalleryItemInput,
  CreateDownloadInput,
  UpdateDownloadInput,
  UpdateSiteSettingsInput,
  CreateInquiryInput,
  CmsStats,
} from "../content-store";

/**
 * In-memory CMS content store — the MongoDB-mode fallback used when
 * MONGODB_URI is absent (spec 17.9: the public app must work standalone,
 * e.g. on Vercel with no database). Seeded lazily from
 * src/lib/db/seeds/ (content arrays + default site settings); data resets
 * on server restart and every UI honestly labels the demo mode.
 *
 * All mutations are real — they write to the in-memory Maps, and reads
 * see them.
 */

const nowIso = () => new Date().toISOString();

/** Drop keys whose value is undefined so patches never wipe fields accidentally. */
function definedPatch<T extends object>(patch: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(patch) as Array<[keyof T & string, unknown]>) {
    if (value !== undefined) out[key] = value as T[keyof T & string];
  }
  return out;
}

export class DemoCmsStore implements CmsStore {
  private noticesById = new Map<string, Notice>();
  private noticesBySlug = new Map<string, Notice>();
  private eventsById = new Map<string, Event>();
  private eventsBySlug = new Map<string, Event>();
  private teachersById = new Map<string, Teacher>();
  private teachersBySlug = new Map<string, Teacher>();
  private departmentsById = new Map<string, Department>();
  private departmentsBySlug = new Map<string, Department>();
  private resultSessionsById = new Map<string, ResultSession>();
  private galleryItemsById = new Map<string, GalleryItem>();
  private downloadsById = new Map<string, Download>();
  private inquiries: Inquiry[] = [];
  private settingsValue: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
  private seeded = false;

  static async create(): Promise<DemoCmsStore> {
    const store = new DemoCmsStore();
    await store.ensureSeeded();
    return store;
  }

  /**
   * Idempotent: seed exactly once per process. Content rows come from
   * src/lib/db/seeds/content.ts (chunk B wiring point).
   */
  async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    this.settingsValue = { ...DEFAULT_SITE_SETTINGS };
    for (const notice of seedNotices) {
      this.noticesById.set(notice.id, notice);
      this.noticesBySlug.set(notice.slug, notice);
    }
    for (const event of seedEvents) {
      this.eventsById.set(event.id, event);
      this.eventsBySlug.set(event.slug, event);
    }
    for (const department of seedDepartments) {
      this.departmentsById.set(department.id, department);
      this.departmentsBySlug.set(department.slug, department);
    }
    for (const teacher of seedTeachers) {
      this.teachersById.set(teacher.id, teacher);
      this.teachersBySlug.set(teacher.slug, teacher);
    }
    for (const session of seedResultSessions) {
      this.resultSessionsById.set(session.id, session);
    }
    for (const item of seedGalleryItems) {
      this.galleryItemsById.set(item.id, item);
    }
    for (const download of seedDownloads) {
      this.downloadsById.set(download.id, download);
    }
    this.seeded = true;
  }

  // ---- notices ---------------------------------------------------------

  async listNotices(options: ListNoticesOptions = {}): Promise<Notice[]> {
    await this.ensureSeeded();
    const q = options.q?.trim().toLowerCase();
    const now = new Date();
    const filtered = [...this.noticesById.values()].filter((notice) => {
      if (options.status) {
        if (notice.status !== options.status) return false;
        // Public listings never show expired notices (spec 17.4).
        if (options.status === "published" && isExpired(notice.expiryAt, now)) {
          return false;
        }
      }
      if (options.category && notice.category !== options.category) return false;
      if (options.featured !== undefined && notice.featured !== options.featured) {
        return false;
      }
      if (q && !notice.title.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = filtered.sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    return options.limit ? sorted.slice(0, options.limit) : sorted;
  }

  async getNoticeBySlug(slug: string): Promise<Notice | null> {
    await this.ensureSeeded();
    return this.noticesBySlug.get(slug) ?? null;
  }

  async getNoticeById(id: string): Promise<Notice | null> {
    await this.ensureSeeded();
    return this.noticesById.get(id) ?? null;
  }

  async createNotice(input: CreateNoticeInput): Promise<Notice> {
    await this.ensureSeeded();
    if (this.noticesBySlug.has(input.slug)) {
      throw new Error(`A notice with slug ${input.slug} already exists.`);
    }
    const notice: Notice = {
      id: `not-${randomUUID()}`,
      slug: input.slug,
      title: input.title,
      bodyMd: input.bodyMd,
      category: input.category,
      priority: input.priority ?? "normal",
      status: input.status ?? "draft",
      featured: input.featured ?? false,
      publishedAt: input.publishedAt ?? nowIso(),
      ...(input.expiryAt !== undefined ? { expiryAt: input.expiryAt } : {}),
      ...(input.attachment !== undefined ? { attachment: input.attachment } : {}),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this.noticesById.set(notice.id, notice);
    this.noticesBySlug.set(notice.slug, notice);
    return notice;
  }

  async updateNotice(
    id: string,
    patch: UpdateNoticeInput,
  ): Promise<Notice | null> {
    await this.ensureSeeded();
    const current = this.noticesById.get(id);
    if (!current) return null;
    const updated: Notice = {
      ...current,
      ...definedPatch(patch),
      updatedAt: nowIso(),
    };
    this.noticesById.set(id, updated);
    this.noticesBySlug.set(updated.slug, updated);
    return updated;
  }

  async setNoticeStatus(
    id: string,
    status: ContentStatus,
  ): Promise<Notice | null> {
    return this.updateNotice(id, { status });
  }

  async deleteNotice(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const notice = this.noticesById.get(id);
    if (!notice) return false;
    this.noticesById.delete(id);
    this.noticesBySlug.delete(notice.slug);
    return true;
  }

  // ---- events ------------------------------------------------------------

  async listEvents(options: ListEventsOptions = {}): Promise<Event[]> {
    await this.ensureSeeded();
    const now = new Date();
    const filtered = [...this.eventsById.values()].filter((event) => {
      if (options.status && event.status !== options.status) return false;
      if (options.category && event.category !== options.category) return false;
      if (options.upcoming && new Date(event.startsAt).getTime() < now.getTime()) {
        return false;
      }
      return true;
    });
    const sorted = options.upcoming
      ? filtered.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      : filtered.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    return options.limit ? sorted.slice(0, options.limit) : sorted;
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    await this.ensureSeeded();
    return this.eventsBySlug.get(slug) ?? null;
  }

  async getEventById(id: string): Promise<Event | null> {
    await this.ensureSeeded();
    return this.eventsById.get(id) ?? null;
  }

  async createEvent(input: CreateEventInput): Promise<Event> {
    await this.ensureSeeded();
    if (this.eventsBySlug.has(input.slug)) {
      throw new Error(`An event with slug ${input.slug} already exists.`);
    }
    const event: Event = {
      id: `evt-${randomUUID()}`,
      slug: input.slug,
      title: input.title,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location,
      category: input.category,
      status: input.status ?? "draft",
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
    };
    this.eventsById.set(event.id, event);
    this.eventsBySlug.set(event.slug, event);
    return event;
  }

  async updateEvent(id: string, patch: UpdateEventInput): Promise<Event | null> {
    await this.ensureSeeded();
    const current = this.eventsById.get(id);
    if (!current) return null;
    const updated: Event = { ...current, ...definedPatch(patch) };
    this.eventsById.set(id, updated);
    this.eventsBySlug.set(updated.slug, updated);
    return updated;
  }

  async setEventStatus(id: string, status: ContentStatus): Promise<Event | null> {
    return this.updateEvent(id, { status });
  }

  async deleteEvent(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const event = this.eventsById.get(id);
    if (!event) return false;
    this.eventsById.delete(id);
    this.eventsBySlug.delete(event.slug);
    return true;
  }

  // ---- teachers ------------------------------------------------------------

  async listTeachers(options: ListTeachersOptions = {}): Promise<Teacher[]> {
    await this.ensureSeeded();
    const q = options.q?.trim().toLowerCase();
    const filtered = [...this.teachersById.values()].filter((teacher) => {
      if (options.departmentSlug && teacher.departmentSlug !== options.departmentSlug) {
        return false;
      }
      if (options.designation && teacher.designation !== options.designation) {
        return false;
      }
      if (
        options.subject &&
        !teacher.subjects.some(
          (subject) => subject.toLowerCase() === options.subject!.toLowerCase(),
        )
      ) {
        return false;
      }
      if (q && !teacher.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTeacherBySlug(slug: string): Promise<Teacher | null> {
    await this.ensureSeeded();
    return this.teachersBySlug.get(slug) ?? null;
  }

  async getTeacherById(id: string): Promise<Teacher | null> {
    await this.ensureSeeded();
    return this.teachersById.get(id) ?? null;
  }

  async createTeacher(input: CreateTeacherInput): Promise<Teacher> {
    await this.ensureSeeded();
    if (this.teachersBySlug.has(input.slug)) {
      throw new Error(`A teacher with slug ${input.slug} already exists.`);
    }
    const teacher: Teacher = {
      id: `tch-${randomUUID()}`,
      ...input,
    };
    this.teachersById.set(teacher.id, teacher);
    this.teachersBySlug.set(teacher.slug, teacher);
    return teacher;
  }

  async updateTeacher(
    id: string,
    patch: UpdateTeacherInput,
  ): Promise<Teacher | null> {
    await this.ensureSeeded();
    const current = this.teachersById.get(id);
    if (!current) return null;
    const updated: Teacher = { ...current, ...definedPatch(patch) };
    this.teachersById.set(id, updated);
    this.teachersBySlug.set(updated.slug, updated);
    return updated;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const teacher = this.teachersById.get(id);
    if (!teacher) return false;
    // Refuse while a department lists this teacher as its head.
    for (const department of this.departmentsById.values()) {
      if (department.headTeacherId === id) return false;
    }
    this.teachersById.delete(id);
    this.teachersBySlug.delete(teacher.slug);
    return true;
  }

  // ---- departments ------------------------------------------------------------

  async listDepartments(): Promise<Department[]> {
    await this.ensureSeeded();
    return [...this.departmentsById.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async getDepartmentBySlug(slug: string): Promise<Department | null> {
    await this.ensureSeeded();
    return this.departmentsBySlug.get(slug) ?? null;
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    await this.ensureSeeded();
    return this.departmentsById.get(id) ?? null;
  }

  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    await this.ensureSeeded();
    if (this.departmentsBySlug.has(input.slug)) {
      throw new Error(`A department with slug ${input.slug} already exists.`);
    }
    const department: Department = {
      id: `dep-${randomUUID()}`,
      ...input,
      ...(input.headTeacherId !== undefined
        ? { headTeacherId: input.headTeacherId }
        : {}),
    };
    this.departmentsById.set(department.id, department);
    this.departmentsBySlug.set(department.slug, department);
    return department;
  }

  async updateDepartment(
    id: string,
    patch: UpdateDepartmentInput,
  ): Promise<Department | null> {
    await this.ensureSeeded();
    const current = this.departmentsById.get(id);
    if (!current) return null;
    const updated: Department = { ...current, ...definedPatch(patch) };
    this.departmentsById.set(id, updated);
    this.departmentsBySlug.set(updated.slug, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const department = this.departmentsById.get(id);
    if (!department) return false;
    this.departmentsById.delete(id);
    this.departmentsBySlug.delete(department.slug);
    return true;
  }

  // ---- result sessions ------------------------------------------------------------

  async listResultSessions(
    options: ListResultSessionsOptions = {},
  ): Promise<ResultSession[]> {
    await this.ensureSeeded();
    const filtered = [...this.resultSessionsById.values()].filter((session) => {
      if (options.status && session.status !== options.status) return false;
      if (options.exam && session.exam !== options.exam) return false;
      if (options.year && session.year !== options.year) return false;
      return true;
    });
    return filtered.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async getResultSessionById(id: string): Promise<ResultSession | null> {
    await this.ensureSeeded();
    return this.resultSessionsById.get(id) ?? null;
  }

  async createResultSession(
    input: CreateResultSessionInput,
  ): Promise<ResultSession> {
    await this.ensureSeeded();
    const session: ResultSession = {
      id: `res-${randomUUID()}`,
      exam: input.exam,
      year: input.year,
      classLevel: input.classLevel,
      className: input.className,
      publishedAt: input.publishedAt ?? nowIso(),
      status: input.status ?? "draft",
      results: input.results,
    };
    this.resultSessionsById.set(session.id, session);
    return session;
  }

  async updateResultSession(
    id: string,
    patch: UpdateResultSessionInput,
  ): Promise<ResultSession | null> {
    await this.ensureSeeded();
    const current = this.resultSessionsById.get(id);
    if (!current) return null;
    const updated: ResultSession = { ...current, ...definedPatch(patch) };
    this.resultSessionsById.set(id, updated);
    return updated;
  }

  async setResultSessionStatus(
    id: string,
    status: ContentStatus,
  ): Promise<ResultSession | null> {
    return this.updateResultSession(id, { status });
  }

  async deleteResultSession(id: string): Promise<boolean> {
    await this.ensureSeeded();
    return this.resultSessionsById.delete(id);
  }

  async findStudentResults(studentId: string): Promise<StudentResultMatch[]> {
    await this.ensureSeeded();
    const needle = studentId.trim().toLowerCase();
    if (!needle) return [];
    const matches: StudentResultMatch[] = [];
    for (const session of this.resultSessionsById.values()) {
      if (session.status !== "published") continue;
      for (const entry of session.results) {
        if (entry.studentId.toLowerCase() === needle) {
          matches.push({ session, entry });
        }
      }
    }
    return matches.sort((a, b) =>
      b.session.publishedAt.localeCompare(a.session.publishedAt),
    );
  }

  // ---- gallery ------------------------------------------------------------

  async listGalleryItems(category?: GalleryCategory): Promise<GalleryItem[]> {
    await this.ensureSeeded();
    const filtered = [...this.galleryItemsById.values()].filter(
      (item) => !category || item.category === category,
    );
    return filtered.sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  }

  async getGalleryItemById(id: string): Promise<GalleryItem | null> {
    await this.ensureSeeded();
    return this.galleryItemsById.get(id) ?? null;
  }

  async createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
    await this.ensureSeeded();
    const item: GalleryItem = {
      id: `gal-${randomUUID()}`,
      ...input,
    };
    this.galleryItemsById.set(item.id, item);
    return item;
  }

  async updateGalleryItem(
    id: string,
    patch: UpdateGalleryItemInput,
  ): Promise<GalleryItem | null> {
    await this.ensureSeeded();
    const current = this.galleryItemsById.get(id);
    if (!current) return null;
    const updated: GalleryItem = { ...current, ...definedPatch(patch) };
    this.galleryItemsById.set(id, updated);
    return updated;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    await this.ensureSeeded();
    return this.galleryItemsById.delete(id);
  }

  // ---- downloads ------------------------------------------------------------

  async listDownloads(category?: DownloadCategory): Promise<Download[]> {
    await this.ensureSeeded();
    const filtered = [...this.downloadsById.values()].filter(
      (download) => !category || download.category === category,
    );
    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getDownloadById(id: string): Promise<Download | null> {
    await this.ensureSeeded();
    return this.downloadsById.get(id) ?? null;
  }

  async createDownload(input: CreateDownloadInput): Promise<Download> {
    await this.ensureSeeded();
    const download: Download = {
      id: `dwn-${randomUUID()}`,
      ...input,
      updatedAt: input.updatedAt ?? nowIso(),
    };
    this.downloadsById.set(download.id, download);
    return download;
  }

  async updateDownload(
    id: string,
    patch: UpdateDownloadInput,
  ): Promise<Download | null> {
    await this.ensureSeeded();
    const current = this.downloadsById.get(id);
    if (!current) return null;
    const updated: Download = {
      ...current,
      ...definedPatch(patch),
      updatedAt: patch.updatedAt ?? nowIso(),
    };
    this.downloadsById.set(id, updated);
    return updated;
  }

  async deleteDownload(id: string): Promise<boolean> {
    await this.ensureSeeded();
    return this.downloadsById.delete(id);
  }

  // ---- site settings ------------------------------------------------------------

  async getSettings(): Promise<SiteSettings> {
    await this.ensureSeeded();
    return { ...this.settingsValue };
  }

  async updateSettings(patch: UpdateSiteSettingsInput): Promise<SiteSettings> {
    await this.ensureSeeded();
    this.settingsValue = { ...this.settingsValue, ...definedPatch(patch), id: "site" };
    return { ...this.settingsValue };
  }

  // ---- admission inquiries ------------------------------------------------------------

  async createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
    await this.ensureSeeded();
    const inquiry: Inquiry = {
      id: `inq-${randomUUID()}`,
      name: input.name,
      email: input.email,
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      subject: input.subject,
      message: input.message,
      status: "new",
      createdAt: nowIso(),
    };
    this.inquiries.push(inquiry);
    return inquiry;
  }

  async listInquiries(status?: InquiryStatus): Promise<Inquiry[]> {
    await this.ensureSeeded();
    const filtered = this.inquiries.filter(
      (inquiry) => !status || inquiry.status === status,
    );
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markInquiryRead(id: string): Promise<Inquiry | null> {
    await this.ensureSeeded();
    const inquiry = this.inquiries.find((row) => row.id === id);
    if (!inquiry) return null;
    inquiry.status = "read";
    return { ...inquiry };
  }

  // ---- dashboard ------------------------------------------------------------

  async getStats(): Promise<CmsStats> {
    await this.ensureSeeded();
    const now = new Date();
    const notices = [...this.noticesById.values()];
    return {
      notices: notices.length,
      publishedNotices: notices.filter(
        (notice) =>
          notice.status === "published" && !isExpired(notice.expiryAt, now),
      ).length,
      events: this.eventsById.size,
      teachers: this.teachersById.size,
      departments: this.departmentsById.size,
      resultSessions: this.resultSessionsById.size,
      galleryItems: this.galleryItemsById.size,
      downloads: this.downloadsById.size,
      inquiries: this.inquiries.length,
      newInquiries: this.inquiries.filter((inquiry) => inquiry.status === "new")
        .length,
    };
  }
}
