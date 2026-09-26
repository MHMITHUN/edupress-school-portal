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
import { DemoCmsStore } from "../mongodb/demo-store";
import { MongoCmsStore } from "../mongodb/store";
import { isExpired } from "@/lib/utils";
import { WpClient, WordPressError, resolveWpConfig } from "./rest";
import {
  mapPluginNotice,
  mapCoreNotice,
  mapCoreEvent,
  noticeToPluginPayload,
  eventToCorePayload,
  contentStatusToWpStatus,
  toWpPostId,
  type PluginNoticePayload,
  type CorePostPayload,
} from "./mapping";

/**
 * HEADLESS WORDPRESS ADAPTER (spec 17.9).
 *
 * DESIGN DECISION — the store COMPOSES two backends behind one CmsStore:
 *
 *   +-----------------------------------+------------------------------+
 *   | WordPress (WP REST API v2)        | Local store (Mongo/Demo)     |
 *   | - notices  (edupress_notice CPT)  | - teachers                   |
 *   | - events   (edupress_event  CPT)  | - departments                |
 *   |                                   | - result sessions            |
 *   | Reads:  public REST, unauthenticated.  - gallery items            |
 *   |         plugin route /edupress/v1/notices| - downloads            |
 *   |         first, core CPT fallback. | - site settings              |
 *   | Writes: Application Passwords     | - admission inquiries        |
 *   |         (Basic auth).             | - dashboard counters (local) |
 *   +-----------------------------------+------------------------------+
 *
 * Rationale: WordPress serves the notice board and the events calendar —
 * the two collections a content team actually edits in WP (and what the
 * bundled edupress-notice-board plugin exposes). Structured records
 * (result sessions with student rows, the teacher directory, settings and
 * the inquiry inbox) stay in MongoDB/demo storage, where the CMS UI owns
 * them. This keeps the WP integration small and honest while the whole
 * portal still works through ONE interface.
 *
 * Failure policy: any WordPress error propagates (honest error pages via
 * the public error boundary) — this store never fabricates content.
 */

const PER_PAGE = 100;
const MAX_PAGES = 10;

export class WordPressCmsStore implements CmsStore {
  private readonly client: WpClient;
  private readonly localPromise: Promise<CmsStore>;

  /** null = plugin route unavailable, use core CPT fallback. */
  private pluginRouteAvailable: boolean | null = null;
  private termsByIdPromise: Promise<Map<number, string>> | null = null;

  constructor(client?: WpClient, local?: CmsStore) {
    this.client = client ?? new WpClient(resolveWpConfig(process.env));
    this.localPromise = local
      ? Promise.resolve(local)
      : WordPressCmsStore.createLocalStore();
  }

  static async create(): Promise<WordPressCmsStore> {
    // Fail fast on a missing WORDPRESS_BASE_URL (clear startup error, spec 17.9).
    resolveWpConfig(process.env);
    return new WordPressCmsStore();
  }

  private static async createLocalStore(): Promise<CmsStore> {
    return process.env.MONGODB_URI
      ? MongoCmsStore.create()
      : DemoCmsStore.create();
  }

  private local(): Promise<CmsStore> {
    return this.localPromise;
  }

  /** Fetch notice category terms (id -> slug) once, for core-CPT mapping. */
  private termsById(): Promise<Map<number, string>> {
    if (!this.termsByIdPromise) {
      this.termsByIdPromise = (async () => {
        const map = new Map<number, string>();
        try {
          const { data } = await this.client.get<Array<{ id: number; slug: string }>>(
            "/wp/v2/edupress_notice_category",
            { per_page: 100 },
          );
          for (const term of Array.isArray(data) ? data : []) {
            map.set(term.id, term.slug);
          }
        } catch {
          // Taxonomy absent (plugin not installed) — core fallback then maps
          // every notice to the "general" category.
        }
        return map;
      })();
    }
    return this.termsByIdPromise;
  }

  /** Page through a WP list endpoint until exhausted (or MAX_PAGES). */
  private async listAll<T>(path: string, query: Record<string, string | number | undefined>): Promise<T[]> {
    const rows: T[] = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const { data } = await this.client.get<T[]>(path, { ...query, per_page: PER_PAGE, page });
      if (!Array.isArray(data)) break;
      rows.push(...data);
      if (data.length < PER_PAGE) break;
    }
    return rows;
  }

  /** Have credentials? Core reads can then request context=edit (raw markdown bodies). */
  private get canAuth(): boolean {
    return Boolean(this.client.config.username && this.client.config.appPassword);
  }

  /**
   * All notices from WordPress, any visible status (the plugin route caps
   * unauthenticated callers at published posts — an honest limitation).
   */
  private async fetchAllWpNotices(): Promise<Notice[]> {
    const status = this.canAuth ? "any" : "publish";

    // 1) Plugin route first (normalized JSON).
    if (this.pluginRouteAvailable !== false) {
      try {
        const rows = await this.listAll<PluginNoticePayload>("/edupress/v1/notices", { status });
        const mapped = rows.map(mapPluginNotice).filter((n): n is Notice => n !== null);
        this.pluginRouteAvailable = true;
        return mapped;
      } catch (error) {
        if (error instanceof WordPressError && error.status === 404) {
          this.pluginRouteAvailable = false; // fall through to core CPT
        } else {
          throw error;
        }
      }
    }

    // 2) Core CPT fallback. A 404 here means neither the plugin route nor
    //    the CPT exists on this WordPress site — that reads as "no notices
    //    published yet" (empty list) rather than a hard error, so a partial
    //    WP setup keeps the portal usable. Unreachable servers/timeouts
    //    still throw (honest error, never fake data).
    const query: Record<string, string | undefined> = {
      status: status === "any" ? "publish,draft" : "publish",
      context: this.canAuth ? "edit" : undefined,
    };
    try {
      const posts = await this.listAll<CorePostPayload>("/wp/v2/edupress_notice", query);
      const terms = await this.termsById();
      return posts
        .map((post) => mapCoreNotice(post, terms))
        .filter((n): n is Notice => n !== null);
    } catch (error) {
      if (error instanceof WordPressError && error.status === 404) return [];
      throw error;
    }
  }

  private applyNoticeOptions(rows: Notice[], options: ListNoticesOptions = {}): Notice[] {
    const now = new Date();
    const q = options.q?.trim().toLowerCase();
    const filtered = rows.filter((notice) => {
      if (options.status) {
        if (notice.status !== options.status) return false;
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
    const sorted = filtered.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return options.limit ? sorted.slice(0, options.limit) : sorted;
  }

  // ---- notices ---------------------------------------------------------

  async listNotices(options: ListNoticesOptions = {}): Promise<Notice[]> {
    return this.applyNoticeOptions(await this.fetchAllWpNotices(), options);
  }

  async getNoticeBySlug(slug: string): Promise<Notice | null> {
    const all = await this.fetchAllWpNotices();
    return all.find((notice) => notice.slug === slug) ?? null;
  }

  async getNoticeById(id: string): Promise<Notice | null> {
    const all = await this.fetchAllWpNotices();
    return all.find((notice) => notice.id === id) ?? null;
  }

  async createNotice(input: CreateNoticeInput): Promise<Notice> {
    const payload = noticeToPluginPayload(input);
    if (this.pluginRouteAvailable !== false) {
      try {
        const { data } = await this.client.post<PluginNoticePayload>(
          "/edupress/v1/notices",
          payload,
        );
        this.pluginRouteAvailable = true;
        const mapped = mapPluginNotice(data);
        if (mapped) return mapped;
        throw new WordPressError(
          `WordPress at ${this.client.config.baseUrl} accepted the notice but returned a payload this connector cannot read.`,
        );
      } catch (error) {
        if (error instanceof WordPressError && error.status === 404) {
          this.pluginRouteAvailable = false;
        } else {
          throw error;
        }
      }
    }
    // Core CPT fallback (no taxonomy assignment — documented limitation).
    const { data } = await this.client.post<CorePostPayload>("/wp/v2/edupress_notice", {
      title: input.title,
      slug: input.slug,
      status: contentStatusToWpStatus(input.status ?? "draft"),
      content: input.bodyMd,
      meta: {
        edupress_priority: input.priority ?? "normal",
        edupress_featured: input.featured ?? false,
        ...(input.expiryAt ? { edupress_expiry: input.expiryAt } : {}),
        ...(input.attachment
          ? {
              edupress_attachment_url: input.attachment.fileName,
              edupress_attachment_label: input.attachment.label,
            }
          : {}),
      },
    });
    const mapped = mapCoreNotice(data, await this.termsById());
    if (!mapped) {
      throw new WordPressError(
        `WordPress at ${this.client.config.baseUrl} created the notice but returned an unreadable payload.`,
      );
    }
    return mapped;
  }

  async updateNotice(id: string, patch: UpdateNoticeInput): Promise<Notice | null> {
    const wpId = toWpPostId(id);
    if (wpId === null) return null;
    const body: Record<string, unknown> = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.status !== undefined) body.status = contentStatusToWpStatus(patch.status);
    if (patch.bodyMd !== undefined) body.content = patch.bodyMd;
    const meta: Record<string, unknown> = {};
    if (patch.priority !== undefined) meta.edupress_priority = patch.priority;
    if (patch.featured !== undefined) meta.edupress_featured = patch.featured;
    if (patch.expiryAt !== undefined) meta.edupress_expiry = patch.expiryAt;
    if (patch.attachment !== undefined) {
      meta.edupress_attachment_url = patch.attachment.fileName;
      meta.edupress_attachment_label = patch.attachment.label;
    }
    if (Object.keys(meta).length > 0) body.meta = meta;

    const { data } = await this.client.put<CorePostPayload>(
      `/wp/v2/edupress_notice/${wpId}`,
      body,
      { context: "edit" },
    );
    return mapCoreNotice(data, await this.termsById());
  }

  async setNoticeStatus(id: string, status: ContentStatus): Promise<Notice | null> {
    return this.updateNotice(id, { status });
  }

  async deleteNotice(id: string): Promise<boolean> {
    const wpId = toWpPostId(id);
    if (wpId === null) return false;
    await this.client.delete(`/wp/v2/edupress_notice/${wpId}`, { force: true });
    return true;
  }

  // ---- events (always the core edupress_event CPT; meta keys are the contract) ----

  private async fetchAllWpEvents(): Promise<Event[]> {
    const status = this.canAuth ? "publish,draft" : "publish";
    const posts = await this.listAll<CorePostPayload>("/wp/v2/edupress_event", {
      status,
      context: this.canAuth ? "edit" : undefined,
    });
    return posts.map(mapCoreEvent).filter((e): e is Event => e !== null);
  }

  async listEvents(options: ListEventsOptions = {}): Promise<Event[]> {
    // The edupress_event CPT is part of the connector contract; when the WP
    // site has not registered it (404) the calendar reads as empty rather
    // than crashing the page. Unreachable servers still throw honestly.
    let all: Event[];
    try {
      all = await this.fetchAllWpEvents();
    } catch (error) {
      if (error instanceof WordPressError && error.status === 404) {
        all = [];
      } else {
        throw error;
      }
    }
    const now = new Date();
    const filtered = all.filter((event) => {
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
    try {
      const all = await this.fetchAllWpEvents();
      return all.find((event) => event.slug === slug) ?? null;
    } catch (error) {
      if (error instanceof WordPressError && error.status === 404) return null;
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      const all = await this.fetchAllWpEvents();
      return all.find((event) => event.id === id) ?? null;
    } catch (error) {
      if (error instanceof WordPressError && error.status === 404) return null;
      throw error;
    }
  }

  async createEvent(input: CreateEventInput): Promise<Event> {
    const { data } = await this.client.post<CorePostPayload>(
      "/wp/v2/edupress_event",
      eventToCorePayload(input),
    );
    const mapped = mapCoreEvent(data);
    if (!mapped) {
      throw new WordPressError(
        `WordPress at ${this.client.config.baseUrl} created the event but returned an unreadable payload.`,
      );
    }
    return mapped;
  }

  async updateEvent(id: string, patch: UpdateEventInput): Promise<Event | null> {
    const wpId = toWpPostId(id);
    if (wpId === null) return null;
    const { data } = await this.client.put<CorePostPayload>(
      `/wp/v2/edupress_event/${wpId}`,
      eventToCorePayload(patch),
      { context: "edit" },
    );
    return mapCoreEvent(data);
  }

  async setEventStatus(id: string, status: ContentStatus): Promise<Event | null> {
    return this.updateEvent(id, { status });
  }

  async deleteEvent(id: string): Promise<boolean> {
    const wpId = toWpPostId(id);
    if (wpId === null) return false;
    await this.client.delete(`/wp/v2/edupress_event/${wpId}`, { force: true });
    return true;
  }

  // ---- teachers: local -------------------------------------------------------

  async listTeachers(options?: ListTeachersOptions): Promise<Teacher[]> {
    return (await this.local()).listTeachers(options);
  }
  async getTeacherBySlug(slug: string): Promise<Teacher | null> {
    return (await this.local()).getTeacherBySlug(slug);
  }
  async getTeacherById(id: string): Promise<Teacher | null> {
    return (await this.local()).getTeacherById(id);
  }
  async createTeacher(input: CreateTeacherInput): Promise<Teacher> {
    return (await this.local()).createTeacher(input);
  }
  async updateTeacher(id: string, patch: UpdateTeacherInput): Promise<Teacher | null> {
    return (await this.local()).updateTeacher(id, patch);
  }
  async deleteTeacher(id: string): Promise<boolean> {
    return (await this.local()).deleteTeacher(id);
  }

  // ---- departments: local ------------------------------------------------------

  async listDepartments(): Promise<Department[]> {
    return (await this.local()).listDepartments();
  }
  async getDepartmentBySlug(slug: string): Promise<Department | null> {
    return (await this.local()).getDepartmentBySlug(slug);
  }
  async getDepartmentById(id: string): Promise<Department | null> {
    return (await this.local()).getDepartmentById(id);
  }
  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    return (await this.local()).createDepartment(input);
  }
  async updateDepartment(
    id: string,
    patch: UpdateDepartmentInput,
  ): Promise<Department | null> {
    return (await this.local()).updateDepartment(id, patch);
  }
  async deleteDepartment(id: string): Promise<boolean> {
    return (await this.local()).deleteDepartment(id);
  }

  // ---- result sessions: local ---------------------------------------------------

  async listResultSessions(
    options?: ListResultSessionsOptions,
  ): Promise<ResultSession[]> {
    return (await this.local()).listResultSessions(options);
  }
  async getResultSessionById(id: string): Promise<ResultSession | null> {
    return (await this.local()).getResultSessionById(id);
  }
  async createResultSession(input: CreateResultSessionInput): Promise<ResultSession> {
    return (await this.local()).createResultSession(input);
  }
  async updateResultSession(
    id: string,
    patch: UpdateResultSessionInput,
  ): Promise<ResultSession | null> {
    return (await this.local()).updateResultSession(id, patch);
  }
  async setResultSessionStatus(
    id: string,
    status: ContentStatus,
  ): Promise<ResultSession | null> {
    return (await this.local()).setResultSessionStatus(id, status);
  }
  async deleteResultSession(id: string): Promise<boolean> {
    return (await this.local()).deleteResultSession(id);
  }
  async findStudentResults(studentId: string): Promise<StudentResultMatch[]> {
    return (await this.local()).findStudentResults(studentId);
  }

  // ---- gallery: local ------------------------------------------------------------

  async listGalleryItems(category?: GalleryCategory): Promise<GalleryItem[]> {
    return (await this.local()).listGalleryItems(category);
  }
  async getGalleryItemById(id: string): Promise<GalleryItem | null> {
    return (await this.local()).getGalleryItemById(id);
  }
  async createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
    return (await this.local()).createGalleryItem(input);
  }
  async updateGalleryItem(
    id: string,
    patch: UpdateGalleryItemInput,
  ): Promise<GalleryItem | null> {
    return (await this.local()).updateGalleryItem(id, patch);
  }
  async deleteGalleryItem(id: string): Promise<boolean> {
    return (await this.local()).deleteGalleryItem(id);
  }

  // ---- downloads: local ------------------------------------------------------------

  async listDownloads(category?: DownloadCategory): Promise<Download[]> {
    return (await this.local()).listDownloads(category);
  }
  async getDownloadById(id: string): Promise<Download | null> {
    return (await this.local()).getDownloadById(id);
  }
  async createDownload(input: CreateDownloadInput): Promise<Download> {
    return (await this.local()).createDownload(input);
  }
  async updateDownload(id: string, patch: UpdateDownloadInput): Promise<Download | null> {
    return (await this.local()).updateDownload(id, patch);
  }
  async deleteDownload(id: string): Promise<boolean> {
    return (await this.local()).deleteDownload(id);
  }

  // ---- site settings: local ------------------------------------------------------------

  async getSettings(): Promise<SiteSettings> {
    return (await this.local()).getSettings();
  }
  async updateSettings(patch: UpdateSiteSettingsInput): Promise<SiteSettings> {
    return (await this.local()).updateSettings(patch);
  }

  // ---- admission inquiries: local ---------------------------------------------------------

  async createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
    return (await this.local()).createInquiry(input);
  }
  async listInquiries(status?: InquiryStatus): Promise<Inquiry[]> {
    return (await this.local()).listInquiries(status);
  }
  async markInquiryRead(id: string): Promise<Inquiry | null> {
    return (await this.local()).markInquiryRead(id);
  }

  // ---- dashboard: local counters + live WP notice/event counts ------------------------------

  async getStats(): Promise<CmsStats> {
    const [stats, wpNotices, wpEvents] = await Promise.all([
      (await this.local()).getStats(),
      this.listNotices(),
      this.listEvents(),
    ]);
    const now = new Date();
    return {
      ...stats,
      notices: wpNotices.length,
      publishedNotices: wpNotices.filter(
        (notice) =>
          notice.status === "published" && !isExpired(notice.expiryAt, now),
      ).length,
      events: wpEvents.length,
    };
  }
}
