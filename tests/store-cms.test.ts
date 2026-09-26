import { describe, it, expect } from "vitest";
import {
  NoticeSchema,
  EventSchema,
  DepartmentSchema,
  TeacherSchema,
  ResultSessionSchema,
  GalleryItemSchema,
  DownloadSchema,
  SiteSettingsSchema,
} from "@/lib/db/types";
import {
  seedNotices,
  seedEvents,
  seedDepartments,
  seedTeachers,
  seedResultSessions,
  seedGalleryItems,
  seedDownloads,
} from "@/lib/db/seeds/content";
import { DEFAULT_SITE_SETTINGS } from "@/lib/db/seeds/settings";
import { DemoCmsStore } from "@/lib/cms/mongodb/demo-store";
import {
  isPubliclyVisible,
  orderPublicNotices,
  filterNoticesByDateRange,
  paginate,
  parseNoticeFilters,
} from "@/lib/content/notices";
import { inquirySchema } from "@/lib/validation/inquiry";
import type { ResultEntry, SubjectMark } from "@/lib/db/types";

/**
 * Gate tests for the content seeds + public content layer (spec 17.3-17.7):
 * seed shape, the publish rule, expiry filtering, featured ordering,
 * result lookup correctness (published-only, computed GPA consistency)
 * and inquiry validation. Runs against DemoCmsStore, which seeds itself
 * from the same arrays the Mongo seed script writes.
 */

// ---- seed shape: every row must parse, or it silently vanishes on read ------

describe("content seeds", () => {
  it("ships the full documented volume of content", () => {
    expect(seedNotices).toHaveLength(14);
    expect(seedEvents).toHaveLength(9);
    expect(seedDepartments).toHaveLength(6);
    expect(seedTeachers).toHaveLength(15);
    expect(seedResultSessions).toHaveLength(4);
    expect(seedGalleryItems).toHaveLength(12);
    expect(seedDownloads).toHaveLength(9);
    expect(DEFAULT_SITE_SETTINGS.principal.name).toBe("Prof. Dr. Anisur Rahman");
  });

  it("parses every row with its zod schema (invalid rows would vanish)", () => {
    for (const notice of seedNotices) {
      const parsed = NoticeSchema.safeParse(notice);
      if (!parsed.success) {
        throw new Error(`notice ${notice.slug}: ${parsed.error.issues[0]?.message}`);
      }
    }
    for (const event of seedEvents) {
      const parsed = EventSchema.safeParse(event);
      if (!parsed.success) {
        throw new Error(`event ${event.slug}: ${parsed.error.issues[0]?.message}`);
      }
    }
    for (const department of seedDepartments) {
      const parsed = DepartmentSchema.safeParse(department);
      if (!parsed.success) {
        throw new Error(`department ${department.slug}: ${parsed.error.issues[0]?.message}`);
      }
    }
    for (const teacher of seedTeachers) {
      const parsed = TeacherSchema.safeParse(teacher);
      if (!parsed.success) {
        throw new Error(`teacher ${teacher.slug}: ${parsed.error.issues[0]?.message}`);
      }
    }
    for (const session of seedResultSessions) {
      const parsed = ResultSessionSchema.safeParse(session);
      if (!parsed.success) {
        throw new Error(`result session ${session.id}: ${parsed.error.issues[0]?.message}`);
      }
    }
    for (const item of seedGalleryItems) {
      const parsed = GalleryItemSchema.safeParse(item);
      if (!parsed.success) {
        throw new Error(`gallery ${item.id}: ${parsed.error.issues[0]?.message}`);
      }
    }
    for (const download of seedDownloads) {
      const parsed = DownloadSchema.safeParse(download);
      if (!parsed.success) {
        throw new Error(`download ${download.id}: ${parsed.error.issues[0]?.message}`);
      }
    }
    expect(SiteSettingsSchema.parse(DEFAULT_SITE_SETTINGS)).toBeTruthy();
  });

  it("keeps department heads and teacher departments referentially consistent", () => {
    const teacherIds = new Set(seedTeachers.map((t) => t.id));
    const departmentSlugs = new Set(seedDepartments.map((d) => d.slug));
    for (const department of seedDepartments) {
      if (department.headTeacherId) {
        expect(teacherIds).toContain(department.headTeacherId);
      }
    }
    for (const teacher of seedTeachers) {
      expect(departmentSlugs).toContain(teacher.departmentSlug);
    }
  });
});

// ---- publish rule: drafts are NEVER public --------------------------------------

describe("publish rule", () => {
  it("hides seeded draft notices from the published listing but keeps them for admins", async () => {
    const store = await DemoCmsStore.create();
    const drafts = seedNotices.filter((n) => n.status === "draft");
    expect(drafts.length).toBeGreaterThanOrEqual(2);

    const published = await store.listNotices({ status: "published" });
    const publishedSlugs = published.map((n) => n.slug);
    for (const draft of drafts) {
      expect(publishedSlugs).not.toContain(draft.slug);
      // getBySlug still returns it (admin path) — the page must guard itself.
      const found = await store.getNoticeBySlug(draft.slug);
      expect(found?.status).toBe("draft");
      expect(isPubliclyVisible(found!)).toBe(false);
    }

    const all = await store.listNotices();
    for (const draft of drafts) {
      expect(all.map((n) => n.slug)).toContain(draft.slug);
    }
  });

  it("treats a published notice past its expiry as not public", async () => {
    const expired = seedNotices.find(
      (n) => n.status === "published" && n.expiryAt && new Date(n.expiryAt) < new Date(),
    );
    expect(expired).toBeDefined(); // the seeded scholarship deadline

    const store = await DemoCmsStore.create();
    const published = await store.listNotices({ status: "published" });
    expect(published.map((n) => n.slug)).not.toContain(expired!.slug);
    expect(isPubliclyVisible(expired!)).toBe(false);
  });

  it("keeps the urgent featured admission notice public while its expiry is future", () => {
    const featured = seedNotices.find((n) => n.featured && n.priority === "urgent");
    expect(featured).toBeDefined();
    expect(isPubliclyVisible(featured!)).toBe(true);
  });
});

// ---- featured ordering + filters + pagination -----------------------------------

describe("public notice helpers", () => {
  it("pins featured notices above newer unfeatured ones", () => {
    const ordered = orderPublicNotices(
      seedNotices.filter((n) => n.status === "published"),
    );
    const featuredCount = ordered.filter((n) => n.featured).length;
    expect(featuredCount).toBeGreaterThan(0);
    expect(ordered[0].featured).toBe(true);
    expect(ordered.slice(0, featuredCount).every((n) => n.featured)).toBe(true);
    expect(ordered.slice(featuredCount).every((n) => !n.featured)).toBe(true);
  });

  it("orders within each group newest-first", () => {
    const ordered = orderPublicNotices(seedNotices.filter((n) => n.status === "published"));
    for (let i = 1; i < ordered.length; i++) {
      const previous = ordered[i - 1];
      const current = ordered[i];
      if (previous.featured === current.featured) {
        expect(previous.publishedAt >= current.publishedAt).toBe(true);
      }
    }
  });

  it("filters by inclusive published-date range", () => {
    const published = seedNotices.filter((n) => n.status === "published");
    const only = filterNoticesByDateRange(published, "2026-09-01", "2026-09-30");
    for (const notice of only) {
      const day = notice.publishedAt.slice(0, 10);
      expect(day >= "2026-09-01").toBe(true);
      expect(day <= "2026-09-30").toBe(true);
    }
    expect(only.length).toBeGreaterThan(0);
    expect(filterNoticesByDateRange(published, undefined, undefined)).toHaveLength(
      published.length,
    );
  });

  it("paginates safely", () => {
    const rows = Array.from({ length: 25 }, (_, i) => i);
    expect(paginate(rows, 1, 10).rows).toHaveLength(10);
    expect(paginate(rows, 3, 10).rows).toHaveLength(5);
    expect(paginate(rows, 99, 10).page).toBe(3); // clamped
    expect(paginate([], 1, 10)).toEqual({ rows: [], page: 1, totalPages: 1 });
  });

  it("parses and validates notice search params", () => {
    const filters = parseNoticeFilters({
      q: "  admission  ",
      category: "exam",
      from: "2026-01-01",
      to: "not-a-date",
      page: "2",
    });
    expect(filters.q).toBe("admission");
    expect(filters.category).toBe("exam");
    expect(filters.from).toBe("2026-01-01");
    expect(filters.to).toBeUndefined(); // invalid date dropped
    expect(filters.page).toBe(2);
    expect(parseNoticeFilters({ category: "nonsense", page: "-3" }).category).toBeUndefined();
    expect(parseNoticeFilters({ page: "-3" }).page).toBe(1);
  });
});

// ---- result lookup: correctness + published-only ---------------------------------

const POINTS: Record<string, number> = { "A+": 5, A: 4, "A-": 3.5, B: 3, C: 2, D: 1 };

function recomputedGpa(entry: ResultEntry): number {
  const total = entry.subjectMarks.reduce(
    (sum: number, mark: SubjectMark) => sum + (POINTS[mark.grade] ?? 0),
    0,
  );
  return Math.round((total / entry.subjectMarks.length) * 100) / 100;
}

describe("result verification (spec 17.7)", () => {
  it("finds a published student case-insensitively with consistent marks and gpa", async () => {
    const store = await DemoCmsStore.create();
    const matches = await store.findStudentResults("pmc-2026-1101");
    expect(matches).toHaveLength(1);
    const { session, entry } = matches[0];
    expect(session.exam).toBe("SSC Mock Test");
    expect(session.status).toBe("published");
    expect(entry.studentName).toBe("Rakib Hasan");
    expect(entry.subjectMarks.length).toBeGreaterThanOrEqual(6);
    // Marks are integers in range and grades follow the national scale.
    for (const mark of entry.subjectMarks) {
      expect(mark.marks).toBeGreaterThanOrEqual(0);
      expect(mark.marks).toBeLessThanOrEqual(100);
      expect(Number.isInteger(mark.marks)).toBe(true);
      expect(["A+", "A", "A-", "B", "C", "D"]).toContain(mark.grade);
    }
    // GPA + grade are consistent with the subject marks.
    expect(entry.gpa).toBeCloseTo(recomputedGpa(entry), 2);
    expect(entry.gpa).toBeGreaterThanOrEqual(0);
    expect(entry.gpa).toBeLessThanOrEqual(5);
  });

  it("keeps every seeded entry's gpa consistent with its marks", () => {
    for (const session of seedResultSessions) {
      for (const entry of session.results) {
        expect(entry.gpa).toBeCloseTo(recomputedGpa(entry), 2);
      }
    }
  });

  it("never returns students from draft sessions", async () => {
    const store = await DemoCmsStore.create();
    const draft = seedResultSessions.find((s) => s.status === "draft");
    expect(draft).toBeDefined();
    for (const entry of draft!.results.slice(0, 3)) {
      expect(await store.findStudentResults(entry.studentId)).toHaveLength(0);
    }
  });

  it("returns nothing for unknown ids", async () => {
    const store = await DemoCmsStore.create();
    expect(await store.findStudentResults("PMC-9999-0001")).toHaveLength(0);
    expect(await store.findStudentResults("")).toHaveLength(0);
    expect(await store.findStudentResults("   ")).toHaveLength(0);
  });

  it("matches the same student across multiple published sessions", async () => {
    // PMC-2025-1001 (Annual 2025, class 10) is distinct per session batch —
    // PMC-2026-1101 exists only in SSC Mock 2026; both are single-match. A
    // student appearing twice must get two cards, so assert with a synthetic
    // session added on top of the seeds.
    const store = await DemoCmsStore.create();
    await store.createResultSession({
      exam: "HSC Pre-Test",
      year: 2026,
      classLevel: "HSC",
      className: "Class 12 (Science)",
      status: "published",
      publishedAt: "2026-09-25T09:00:00.000Z",
      results: [
        {
          studentId: "PMC-2026-1101",
          studentName: "Rakib Hasan",
          gpa: 4.5,
          grade: "A",
          subjectMarks: [{ subject: "Physics", marks: 85, grade: "A" }],
        },
      ],
    });
    const matches = await store.findStudentResults("PMC-2026-1101");
    expect(matches).toHaveLength(2);
    expect(matches.map((m) => m.session.exam).sort()).toEqual([
      "HSC Pre-Test",
      "SSC Mock Test",
    ]);
  });
});

// ---- inquiry validation --------------------------------------------------------

describe("inquiry validation", () => {
  const valid = {
    name: "Abdul Karim",
    email: "parent@example.com",
    phone: "+880 1712-345678",
    subject: "Admission query for SSC 2027",
    message: "When does the admission circular for next year publish?",
  };

  it("accepts a fully valid inquiry", () => {
    expect(inquirySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a valid inquiry without a phone number", () => {
    const { phone: _phone, ...withoutPhone } = valid;
    const result = inquirySchema.safeParse(withoutPhone);
    expect(result.success).toBe(true);
    expect(result.success && "phone" in result.data ? result.data.phone : undefined).toBeUndefined();
  });

  it("rejects an invalid email, short message, or short name", () => {
    expect(inquirySchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, message: "too short" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, subject: "hi" }).success).toBe(false);
  });

  it("rejects a malformed phone but allows an empty one", () => {
    expect(inquirySchema.safeParse({ ...valid, phone: "call me" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, phone: "" }).success).toBe(true);
  });

  it("trims whitespace before validating", () => {
    const parsed = inquirySchema.parse({ ...valid, name: "  Abdul Karim  " });
    expect(parsed.name).toBe("Abdul Karim");
  });
});
