import { randomUUID } from "node:crypto";
import type { Document } from "mongodb";
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
import {
  NoticeSchema,
  EventSchema,
  TeacherSchema,
  DepartmentSchema,
  ResultSessionSchema,
  GalleryItemSchema,
  DownloadSchema,
  SiteSettingsSchema,
  InquirySchema,
} from "@/lib/db/types";
import {
  getMongoCollection,
  parseDoc,
  escapeRegex,
} from "@/lib/db/mongo";
import { DEFAULT_SITE_SETTINGS } from "@/lib/db/seeds/settings";
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
 * CMS content store backed by MongoDB (mongodb driver), used when
 * CMS_MODE=mongodb (default) and MONGODB_URI is set. Every document is
 * zod-parsed at the boundary so pages get typed, trusted objects. Content
 * is managed in the admin CMS or seeded with npm run seed.
 *
 * The interface contract lives in src/lib/cms/content-store.ts; keep this
 * class in sync with DemoCmsStore (src/lib/cms/mongodb/demo-store.ts) and
 * WordPressCmsStore (src/lib/cms/wordpress/store.ts).
 */

interface NoticeDoc extends Notice, Document {
  _id?: unknown;
}
interface EventDoc extends Event, Document {
  _id?: unknown;
}
interface TeacherDoc extends Teacher, Document {
  _id?: unknown;
}
interface DepartmentDoc extends Department, Document {
  _id?: unknown;
}
interface ResultSessionDoc extends ResultSession, Document {
  _id?: unknown;
}
interface GalleryItemDoc extends GalleryItem, Document {
  _id?: unknown;
}
interface DownloadDoc extends Download, Document {
  _id?: unknown;
}
interface SiteSettingsDoc extends SiteSettings, Document {
  _id?: unknown;
}
interface InquiryDoc extends Inquiry, Document {
  _id?: unknown;
}

const nowIso = () => new Date().toISOString();

/** Drop keys whose value is undefined ($set must not wipe fields accidentally). */
function definedPatch<T extends object>(patch: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(patch) as Array<[keyof T & string, unknown]>) {
    if (value !== undefined) out[key] = value as T[keyof T & string];
  }
  return out;
}

/** Was a Mongo write rejected by a unique index (e.g. duplicate slug)? */
function isDuplicateKey(error: unknown): boolean {
  return error instanceof Error && /duplicate key/.test(error.message);
}

export class MongoCmsStore implements CmsStore {
  static async create(): Promise<MongoCmsStore> {
    const store = new MongoCmsStore();
    await store.ensureIndexes();
    return store;
  }

  /** Create indexes once per process. */
  private indexesEnsured = false;
  private async ensureIndexes(): Promise<void> {
    if (this.indexesEnsured) return;
    await getMongoCollection<NoticeDoc>("notices").createIndex(
      { slug: 1 },
      { unique: true },
    );
    await getMongoCollection<NoticeDoc>("notices").createIndex({
      status: 1,
      publishedAt: -1,
    });
    await getMongoCollection<EventDoc>("events").createIndex(
      { slug: 1 },
      { unique: true },
    );
    await getMongoCollection<EventDoc>("events").createIndex({ startsAt: 1 });
    await getMongoCollection<TeacherDoc>("teachers").createIndex(
      { slug: 1 },
      { unique: true },
    );
    await getMongoCollection<TeacherDoc>("teachers").createIndex({
      departmentSlug: 1,
    });
    await getMongoCollection<DepartmentDoc>("departments").createIndex(
      { slug: 1 },
      { unique: true },
    );
    await getMongoCollection<ResultSessionDoc>("resultSessions").createIndex({
      exam: 1,
      year: 1,
      classLevel: 1,
    });
    await getMongoCollection<GalleryItemDoc>("galleryItems").createIndex({
      takenAt: -1,
    });
    await getMongoCollection<DownloadDoc>("downloads").createIndex({
      category: 1,
    });
    await getMongoCollection<InquiryDoc>("inquiries").createIndex({
      status: 1,
      createdAt: -1,
    });
    this.indexesEnsured = true;
  }

  // ---- notices ---------------------------------------------------------

  async listNotices(options: ListNoticesOptions = {}): Promise<Notice[]> {
    const filter: Record<string, unknown> = {};
    if (options.status) {
      filter.status = options.status;
      // Public listings never show expired notices (spec 17.4).
      if (options.status === "published") {
        filter.$or = [
          { expiryAt: { $exists: false } },
          { expiryAt: { $gt: nowIso() } },
        ];
      }
    }
    if (options.category) filter.category = options.category;
    if (options.featured !== undefined) filter.featured = options.featured;
    const q = options.q?.trim();
    if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };

    let cursor = getMongoCollection<NoticeDoc>("notices")
      .find(filter)
      .sort({ publishedAt: -1 });
    if (options.limit) cursor = cursor.limit(options.limit);

    const docs = await cursor.toArray();
    return docs
      .map((doc) => parseDoc(NoticeSchema, doc))
      .filter((n): n is Notice => n !== null);
  }

  async getNoticeBySlug(slug: string): Promise<Notice | null> {
    const doc = await getMongoCollection<NoticeDoc>("notices").findOne({ slug });
    return parseDoc(NoticeSchema, doc);
  }

  async getNoticeById(id: string): Promise<Notice | null> {
    const doc = await getMongoCollection<NoticeDoc>("notices").findOne({ id });
    return parseDoc(NoticeSchema, doc);
  }

  async createNotice(input: CreateNoticeInput): Promise<Notice> {
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
    try {
      await getMongoCollection<NoticeDoc>("notices").insertOne({ ...notice });
    } catch (error) {
      if (isDuplicateKey(error)) {
        throw new Error(`A notice with slug ${input.slug} already exists.`);
      }
      throw error;
    }
    return notice;
  }

  async updateNotice(
    id: string,
    patch: UpdateNoticeInput,
  ): Promise<Notice | null> {
    const doc = await getMongoCollection<NoticeDoc>("notices").findOneAndUpdate(
      { id },
      { $set: { ...definedPatch(patch), updatedAt: nowIso() } },
      { returnDocument: "after" },
    );
    return parseDoc(NoticeSchema, doc);
  }

  async setNoticeStatus(
    id: string,
    status: ContentStatus,
  ): Promise<Notice | null> {
    return this.updateNotice(id, { status });
  }

  async deleteNotice(id: string): Promise<boolean> {
    const result = await getMongoCollection<NoticeDoc>("notices").deleteOne({
      id,
    });
    return result.deletedCount > 0;
  }

  // ---- events ------------------------------------------------------------

  async listEvents(options: ListEventsOptions = {}): Promise<Event[]> {
    const filter: Record<string, unknown> = {};
    if (options.status) filter.status = options.status;
    if (options.category) filter.category = options.category;
    if (options.upcoming) filter.startsAt = { $gte: nowIso() };

    let cursor = getMongoCollection<EventDoc>("events")
      .find(filter)
      .sort({ startsAt: options.upcoming ? 1 : -1 });
    if (options.limit) cursor = cursor.limit(options.limit);

    const docs = await cursor.toArray();
    return docs
      .map((doc) => parseDoc(EventSchema, doc))
      .filter((e): e is Event => e !== null);
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    const doc = await getMongoCollection<EventDoc>("events").findOne({ slug });
    return parseDoc(EventSchema, doc);
  }

  async getEventById(id: string): Promise<Event | null> {
    const doc = await getMongoCollection<EventDoc>("events").findOne({ id });
    return parseDoc(EventSchema, doc);
  }

  async createEvent(input: CreateEventInput): Promise<Event> {
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
    try {
      await getMongoCollection<EventDoc>("events").insertOne({ ...event });
    } catch (error) {
      if (isDuplicateKey(error)) {
        throw new Error(`An event with slug ${input.slug} already exists.`);
      }
      throw error;
    }
    return event;
  }

  async updateEvent(id: string, patch: UpdateEventInput): Promise<Event | null> {
    const doc = await getMongoCollection<EventDoc>("events").findOneAndUpdate(
      { id },
      { $set: definedPatch(patch) },
      { returnDocument: "after" },
    );
    return parseDoc(EventSchema, doc);
  }

  async setEventStatus(id: string, status: ContentStatus): Promise<Event | null> {
    return this.updateEvent(id, { status });
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await getMongoCollection<EventDoc>("events").deleteOne({
      id,
    });
    return result.deletedCount > 0;
  }

  // ---- teachers ------------------------------------------------------------

  async listTeachers(options: ListTeachersOptions = {}): Promise<Teacher[]> {
    const filter: Record<string, unknown> = {};
    if (options.departmentSlug) filter.departmentSlug = options.departmentSlug;
    if (options.designation) filter.designation = options.designation;
    if (options.subject) {
      filter.subjects = { $regex: `^${escapeRegex(options.subject)}$`, $options: "i" };
    }
    const q = options.q?.trim();
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

    const docs = await getMongoCollection<TeacherDoc>("teachers")
      .find(filter)
      .sort({ name: 1 })
      .toArray();
    return docs
      .map((doc) => parseDoc(TeacherSchema, doc))
      .filter((t): t is Teacher => t !== null);
  }

  async getTeacherBySlug(slug: string): Promise<Teacher | null> {
    const doc = await getMongoCollection<TeacherDoc>("teachers").findOne({ slug });
    return parseDoc(TeacherSchema, doc);
  }

  async getTeacherById(id: string): Promise<Teacher | null> {
    const doc = await getMongoCollection<TeacherDoc>("teachers").findOne({ id });
    return parseDoc(TeacherSchema, doc);
  }

  async createTeacher(input: CreateTeacherInput): Promise<Teacher> {
    const teacher: Teacher = { id: `tch-${randomUUID()}`, ...input };
    try {
      await getMongoCollection<TeacherDoc>("teachers").insertOne({ ...teacher });
    } catch (error) {
      if (isDuplicateKey(error)) {
        throw new Error(`A teacher with slug ${input.slug} already exists.`);
      }
      throw error;
    }
    return teacher;
  }

  async updateTeacher(
    id: string,
    patch: UpdateTeacherInput,
  ): Promise<Teacher | null> {
    const doc = await getMongoCollection<TeacherDoc>("teachers").findOneAndUpdate(
      { id },
      { $set: definedPatch(patch) },
      { returnDocument: "after" },
    );
    return parseDoc(TeacherSchema, doc);
  }

  async deleteTeacher(id: string): Promise<boolean> {
    // Refuse while a department lists this teacher as its head.
    const referencing = await getMongoCollection<DepartmentDoc>(
      "departments",
    ).findOne({ headTeacherId: id });
    if (referencing) return false;
    const result = await getMongoCollection<TeacherDoc>("teachers").deleteOne({
      id,
    });
    return result.deletedCount > 0;
  }

  // ---- departments ------------------------------------------------------------

  async listDepartments(): Promise<Department[]> {
    const docs = await getMongoCollection<DepartmentDoc>("departments")
      .find({})
      .sort({ name: 1 })
      .toArray();
    return docs
      .map((doc) => parseDoc(DepartmentSchema, doc))
      .filter((d): d is Department => d !== null);
  }

  async getDepartmentBySlug(slug: string): Promise<Department | null> {
    const doc = await getMongoCollection<DepartmentDoc>("departments").findOne({
      slug,
    });
    return parseDoc(DepartmentSchema, doc);
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    const doc = await getMongoCollection<DepartmentDoc>("departments").findOne({
      id,
    });
    return parseDoc(DepartmentSchema, doc);
  }

  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    const department: Department = {
      id: `dep-${randomUUID()}`,
      ...input,
      ...(input.headTeacherId !== undefined
        ? { headTeacherId: input.headTeacherId }
        : {}),
    };
    try {
      await getMongoCollection<DepartmentDoc>("departments").insertOne({
        ...department,
      });
    } catch (error) {
      if (isDuplicateKey(error)) {
        throw new Error(`A department with slug ${input.slug} already exists.`);
      }
      throw error;
    }
    return department;
  }

  async updateDepartment(
    id: string,
    patch: UpdateDepartmentInput,
  ): Promise<Department | null> {
    const doc = await getMongoCollection<DepartmentDoc>(
      "departments",
    ).findOneAndUpdate(
      { id },
      { $set: definedPatch(patch) },
      { returnDocument: "after" },
    );
    return parseDoc(DepartmentSchema, doc);
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await getMongoCollection<DepartmentDoc>(
      "departments",
    ).deleteOne({ id });
    return result.deletedCount > 0;
  }

  // ---- result sessions ------------------------------------------------------------

  async listResultSessions(
    options: ListResultSessionsOptions = {},
  ): Promise<ResultSession[]> {
    const filter: Record<string, unknown> = {};
    if (options.status) filter.status = options.status;
    if (options.exam) filter.exam = options.exam;
    if (options.year) filter.year = options.year;

    const docs = await getMongoCollection<ResultSessionDoc>("resultSessions")
      .find(filter)
      .sort({ publishedAt: -1 })
      .toArray();
    return docs
      .map((doc) => parseDoc(ResultSessionSchema, doc))
      .filter((r): r is ResultSession => r !== null);
  }

  async getResultSessionById(id: string): Promise<ResultSession | null> {
    const doc = await getMongoCollection<ResultSessionDoc>(
      "resultSessions",
    ).findOne({ id });
    return parseDoc(ResultSessionSchema, doc);
  }

  async createResultSession(
    input: CreateResultSessionInput,
  ): Promise<ResultSession> {
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
    await getMongoCollection<ResultSessionDoc>("resultSessions").insertOne({
      ...session,
    });
    return session;
  }

  async updateResultSession(
    id: string,
    patch: UpdateResultSessionInput,
  ): Promise<ResultSession | null> {
    const doc = await getMongoCollection<ResultSessionDoc>(
      "resultSessions",
    ).findOneAndUpdate(
      { id },
      { $set: definedPatch(patch) },
      { returnDocument: "after" },
    );
    return parseDoc(ResultSessionSchema, doc);
  }

  async setResultSessionStatus(
    id: string,
    status: ContentStatus,
  ): Promise<ResultSession | null> {
    return this.updateResultSession(id, { status });
  }

  async deleteResultSession(id: string): Promise<boolean> {
    const result = await getMongoCollection<ResultSessionDoc>(
      "resultSessions",
    ).deleteOne({ id });
    return result.deletedCount > 0;
  }

  async findStudentResults(studentId: string): Promise<StudentResultMatch[]> {
    const needle = studentId.trim();
    if (!needle) return [];
    // Case-insensitive exact match on student id, published sessions only.
    const sessions = await getMongoCollection<ResultSessionDoc>(
      "resultSessions",
    )
      .find({
        status: "published",
        "results.studentId": { $regex: `^${escapeRegex(needle)}$`, $options: "i" },
      })
      .sort({ publishedAt: -1 })
      .toArray();

    const matches: StudentResultMatch[] = [];
    for (const doc of sessions) {
      const session = parseDoc(ResultSessionSchema, doc);
      if (!session) continue;
      for (const entry of session.results) {
        if (entry.studentId.toLowerCase() === needle.toLowerCase()) {
          matches.push({ session, entry });
        }
      }
    }
    return matches;
  }

  // ---- gallery ------------------------------------------------------------

  async listGalleryItems(category?: GalleryCategory): Promise<GalleryItem[]> {
    const docs = await getMongoCollection<GalleryItemDoc>("galleryItems")
      .find(category ? { category } : {})
      .sort({ takenAt: -1 })
      .toArray();
    return docs
      .map((doc) => parseDoc(GalleryItemSchema, doc))
      .filter((g): g is GalleryItem => g !== null);
  }

  async getGalleryItemById(id: string): Promise<GalleryItem | null> {
    const doc = await getMongoCollection<GalleryItemDoc>("galleryItems").findOne({
      id,
    });
    return parseDoc(GalleryItemSchema, doc);
  }

  async createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
    const item: GalleryItem = { id: `gal-${randomUUID()}`, ...input };
    await getMongoCollection<GalleryItemDoc>("galleryItems").insertOne({ ...item });
    return item;
  }

  async updateGalleryItem(
    id: string,
    patch: UpdateGalleryItemInput,
  ): Promise<GalleryItem | null> {
    const doc = await getMongoCollection<GalleryItemDoc>(
      "galleryItems",
    ).findOneAndUpdate(
      { id },
      { $set: definedPatch(patch) },
      { returnDocument: "after" },
    );
    return parseDoc(GalleryItemSchema, doc);
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const result = await getMongoCollection<GalleryItemDoc>(
      "galleryItems",
    ).deleteOne({ id });
    return result.deletedCount > 0;
  }

  // ---- downloads ------------------------------------------------------------

  async listDownloads(category?: DownloadCategory): Promise<Download[]> {
    const docs = await getMongoCollection<DownloadDoc>("downloads")
      .find(category ? { category } : {})
      .sort({ updatedAt: -1 })
      .toArray();
    return docs
      .map((doc) => parseDoc(DownloadSchema, doc))
      .filter((d): d is Download => d !== null);
  }

  async getDownloadById(id: string): Promise<Download | null> {
    const doc = await getMongoCollection<DownloadDoc>("downloads").findOne({ id });
    return parseDoc(DownloadSchema, doc);
  }

  async createDownload(input: CreateDownloadInput): Promise<Download> {
    const download: Download = {
      id: `dwn-${randomUUID()}`,
      ...input,
      updatedAt: input.updatedAt ?? nowIso(),
    };
    await getMongoCollection<DownloadDoc>("downloads").insertOne({ ...download });
    return download;
  }

  async updateDownload(
    id: string,
    patch: UpdateDownloadInput,
  ): Promise<Download | null> {
    const doc = await getMongoCollection<DownloadDoc>("downloads").findOneAndUpdate(
      { id },
      { $set: { ...definedPatch(patch), updatedAt: patch.updatedAt ?? nowIso() } },
      { returnDocument: "after" },
    );
    return parseDoc(DownloadSchema, doc);
  }

  async deleteDownload(id: string): Promise<boolean> {
    const result = await getMongoCollection<DownloadDoc>("downloads").deleteOne({
      id,
    });
    return result.deletedCount > 0;
  }

  // ---- site settings ------------------------------------------------------------

  async getSettings(): Promise<SiteSettings> {
    const doc = await getMongoCollection<SiteSettingsDoc>("siteSettings").findOne({
      id: "site",
    });
    return parseDoc(SiteSettingsSchema, doc) ?? { ...DEFAULT_SITE_SETTINGS };
  }

  async updateSettings(patch: UpdateSiteSettingsInput): Promise<SiteSettings> {
    // Merge over the effective settings (defaults when unset) so the
    // upserted document always satisfies SiteSettingsSchema.
    const merged: SiteSettings = {
      ...(await this.getSettings()),
      ...definedPatch(patch),
      id: "site",
    };
    const doc = await getMongoCollection<SiteSettingsDoc>(
      "siteSettings",
    ).findOneAndUpdate(
      { id: "site" },
      { $set: { ...merged } },
      { upsert: true, returnDocument: "after" },
    );
    return parseDoc(SiteSettingsSchema, doc) ?? merged;
  }

  // ---- admission inquiries ------------------------------------------------------------

  async createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
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
    await getMongoCollection<InquiryDoc>("inquiries").insertOne({ ...inquiry });
    return inquiry;
  }

  async listInquiries(status?: InquiryStatus): Promise<Inquiry[]> {
    const docs = await getMongoCollection<InquiryDoc>("inquiries")
      .find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .toArray();
    return docs
      .map((doc) => parseDoc(InquirySchema, doc))
      .filter((i): i is Inquiry => i !== null);
  }

  async markInquiryRead(id: string): Promise<Inquiry | null> {
    const doc = await getMongoCollection<InquiryDoc>("inquiries").findOneAndUpdate(
      { id },
      { $set: { status: "read" } },
      { returnDocument: "after" },
    );
    return parseDoc(InquirySchema, doc);
  }

  // ---- dashboard ------------------------------------------------------------

  async getStats(): Promise<CmsStats> {
    const publishedNoticeFilter = {
      status: "published" as const,
      $or: [{ expiryAt: { $exists: false } }, { expiryAt: { $gt: nowIso() } }],
    };
    const [
      notices,
      publishedNotices,
      events,
      teachers,
      departments,
      resultSessions,
      galleryItems,
      downloads,
      inquiries,
      newInquiries,
    ] = await Promise.all([
      getMongoCollection<NoticeDoc>("notices").countDocuments({}),
      getMongoCollection<NoticeDoc>("notices").countDocuments(
        publishedNoticeFilter,
      ),
      getMongoCollection<EventDoc>("events").countDocuments({}),
      getMongoCollection<TeacherDoc>("teachers").countDocuments({}),
      getMongoCollection<DepartmentDoc>("departments").countDocuments({}),
      getMongoCollection<ResultSessionDoc>("resultSessions").countDocuments({}),
      getMongoCollection<GalleryItemDoc>("galleryItems").countDocuments({}),
      getMongoCollection<DownloadDoc>("downloads").countDocuments({}),
      getMongoCollection<InquiryDoc>("inquiries").countDocuments({}),
      getMongoCollection<InquiryDoc>("inquiries").countDocuments({
        status: "new",
      }),
    ]);
    return {
      notices,
      publishedNotices,
      events,
      teachers,
      departments,
      resultSessions,
      galleryItems,
      downloads,
      inquiries,
      newInquiries,
    };
  }
}
