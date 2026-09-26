import { describe, it, expect } from "vitest";
import { DemoCmsStore } from "@/lib/cms/mongodb/demo-store";

/**
 * CmsStore contract checks against the in-memory demo implementation
 * (src/lib/cms/mongodb/demo-store.ts). MongoCmsStore mirrors this logic;
 * these tests pin the interface behavior chunks B and C rely on.
 */

const past = () => new Date(Date.now() - 60_000).toISOString();
const future = () => new Date(Date.now() + 86_400_000).toISOString();

describe("DemoCmsStore — settings", () => {
  it("returns the seeded default site settings before any content exists", async () => {
    const store = await DemoCmsStore.create();
    const settings = await store.getSettings();
    expect(settings.id).toBe("site");
    expect(settings.collegeName).toBe("Padma Model College");
    expect(settings.contact.email).toContain("@");
  });

  it("updates settings without losing untouched fields", async () => {
    const store = await DemoCmsStore.create();
    const updated = await store.updateSettings({
      announcement: { text: "Science fair registration open.", active: true },
    });
    expect(updated.announcement.text).toBe("Science fair registration open.");
    expect(updated.collegeName).toBe("Padma Model College"); // untouched
  });
});

describe("DemoCmsStore — notices", () => {
  it("creates a notice with sensible defaults and finds it by slug", async () => {
    const store = await DemoCmsStore.create();
    const notice = await store.createNotice({
      slug: "hsc-test-routine-2026",
      title: "HSC Test Examination Routine 2026",
      bodyMd: "The routine is published on the notice board.",
      category: "exam",
      status: "published",
      publishedAt: "2026-02-10T09:00:00.000Z",
    });
    expect(notice.id).toBeTruthy();
    expect(notice.priority).toBe("normal");
    expect(notice.featured).toBe(false);

    const found = await store.getNoticeBySlug("hsc-test-routine-2026");
    expect(found?.title).toBe("HSC Test Examination Routine 2026");
  });

  it("hides expired and draft notices from published listings", async () => {
    const store = await DemoCmsStore.create();
    await store.createNotice({
      slug: "live-notice",
      title: "Live notice",
      bodyMd: "Visible.",
      category: "general",
      status: "published",
    });
    await store.createNotice({
      slug: "expired-notice",
      title: "Expired notice",
      bodyMd: "Hidden.",
      category: "general",
      status: "published",
      expiryAt: past(),
    });
    const draft = await store.createNotice({
      slug: "draft-notice",
      title: "Draft notice",
      bodyMd: "Hidden.",
      category: "general",
      status: "draft",
    });

    const published = await store.listNotices({ status: "published" });
    expect(published.map((n) => n.slug)).toContain("live-notice");
    expect(published.map((n) => n.slug)).not.toContain("expired-notice");
    expect(published.map((n) => n.slug)).not.toContain("draft-notice");

    // Admin listing (no status filter) still sees everything.
    const all = await store.listNotices();
    expect(all.map((n) => n.slug)).toContain("expired-notice");

    // Publishing the draft through setStatus makes it visible.
    await store.setNoticeStatus(draft.id, "published");
    const afterPublish = await store.listNotices({ status: "published" });
    expect(afterPublish.map((n) => n.slug)).toContain("draft-notice");
  });

  it("filters by category, featured flag and title search", async () => {
    const store = await DemoCmsStore.create();
    await store.createNotice({
      slug: "featured-admission",
      title: "Zephyr Admission Circular 2031",
      bodyMd: "Apply now.",
      category: "admission",
      status: "published",
      featured: true,
    });
    await store.createNotice({
      slug: "plain-exam",
      title: "Zephyr Exam Schedule",
      bodyMd: "See attached.",
      category: "exam",
      status: "published",
    });

    const admission = await store.listNotices({ category: "admission" });
    expect(admission.map((n) => n.slug)).toContain("featured-admission");
    expect(admission.every((n) => n.category === "admission")).toBe(true);

    const featured = await store.listNotices({ featured: true });
    expect(featured.map((n) => n.slug)).toContain("featured-admission");
    expect(featured.every((n) => n.featured)).toBe(true);

    const search = await store.listNotices({ q: "zephyr" });
    expect(search.map((n) => n.slug).sort()).toEqual(["featured-admission", "plain-exam"]);
  });

  it("rejects duplicate slugs", async () => {
    const store = await DemoCmsStore.create();
    await store.createNotice({
      slug: "unique-slug",
      title: "First",
      bodyMd: "Body",
      category: "general",
    });
    await expect(
      store.createNotice({
        slug: "unique-slug",
        title: "Second",
        bodyMd: "Body",
        category: "general",
      }),
    ).rejects.toThrow(/already exists/);
  });
});

describe("DemoCmsStore — teachers and departments", () => {
  it("filters teachers by department, designation and subject", async () => {
    const store = await DemoCmsStore.create();
    await store.createTeacher({
      slug: "rehana-sarkar",
      name: "Rehana Sarkar",
      designation: "Associate Professor",
      departmentSlug: "science",
      qualification: "MSc in Physics",
      subjects: ["Physics", "Mathematics"],
      email: "rehana.sarkar@padmamodelcollege.edu.bd",
      bioMd: "Teaches physics to HSC students.",
      joinYear: 2012,
    });
    await store.createTeacher({
      slug: "qamrul-choudhury",
      name: "Qamrul Choudhury",
      designation: "Lecturer",
      departmentSlug: "commerce",
      qualification: "MBA",
      subjects: ["Accounting"],
      email: "qamrul.choudhury@padmamodelcollege.edu.bd",
      bioMd: "Teaches accounting.",
      joinYear: 2018,
    });

    expect(await store.listTeachers({ departmentSlug: "science" })).toHaveLength(1);
    const lecturers = await store.listTeachers({ designation: "Lecturer" });
    expect(lecturers.map((t) => t.slug)).toContain("qamrul-choudhury");
    expect(lecturers.every((t) => t.designation === "Lecturer")).toBe(true);
    const physicsTeachers = await store.listTeachers({ subject: "physics" });
    expect(physicsTeachers.map((t) => t.slug)).toContain("rehana-sarkar"); // case-insensitive
    expect(
      physicsTeachers.every((t) =>
        t.subjects.some((s) => s.toLowerCase() === "physics"),
      ),
    ).toBe(true);
    expect(await store.listTeachers({ q: "rehana" })).toHaveLength(1);
  });

  it("creates and updates departments", async () => {
    const store = await DemoCmsStore.create();
    const department = await store.createDepartment({
      slug: "science",
      name: "Science",
      summary: "Physics, chemistry, biology and higher mathematics.",
      descriptionMd: "The science department runs the SSC and HSC science programmes.",
      establishedYear: 1998,
    });
    const updated = await store.updateDepartment(department.id, {
      summary: "Updated summary.",
    });
    expect(updated?.summary).toBe("Updated summary.");
    expect(updated?.name).toBe("Science");
    expect(await store.getDepartmentBySlug("science")).not.toBeNull();
  });
});

describe("DemoCmsStore — results", () => {
  it("verifies a student across published sessions only", async () => {
    const store = await DemoCmsStore.create();
    await store.createResultSession({
      exam: "Test Examination",
      year: 2026,
      classLevel: "HSC",
      className: "Science 2nd Year",
      status: "published",
      publishedAt: "2026-08-20T09:00:00.000Z",
      results: [
        {
          studentId: "PMC-2026-0142",
          studentName: "Rakib Hasan",
          gpa: 4.83,
          grade: "A+",
          subjectMarks: [
            { subject: "Physics", marks: 92, grade: "A+" },
            { subject: "Higher Mathematics", marks: 89, grade: "A+" },
          ],
        },
      ],
    });
    await store.createResultSession({
      exam: "Half-Yearly",
      year: 2026,
      classLevel: "HSC",
      className: "Science 1st Year",
      status: "draft",
      results: [
        {
          studentId: "PMC-2026-0142",
          studentName: "Rakib Hasan",
          gpa: 4.5,
          grade: "A",
          subjectMarks: [{ subject: "Physics", marks: 85, grade: "A" }],
        },
      ],
    });

    const matches = await store.findStudentResults("pmc-2026-0142");
    expect(matches).toHaveLength(1); // draft session excluded, id case-insensitive
    expect(matches[0].session.exam).toBe("Test Examination");
    expect(matches[0].entry.studentName).toBe("Rakib Hasan");
  });
});

describe("DemoCmsStore — inquiries and stats", () => {
  it("records inquiries, marks them read and counts them in stats", async () => {
    const store = await DemoCmsStore.create();
    const inquiry = await store.createInquiry({
      name: "Abdul Karim",
      email: "parent@example.com",
      subject: "Admission query for SSC 2027",
      message: "When does the admission circular for next year publish?",
    });
    expect(inquiry.status).toBe("new");

    let stats = await store.getStats();
    expect(stats.inquiries).toBe(1);
    expect(stats.newInquiries).toBe(1);

    const read = await store.markInquiryRead(inquiry.id);
    expect(read?.status).toBe("read");

    stats = await store.getStats();
    expect(stats.newInquiries).toBe(0);
    expect(await store.listInquiries("read")).toHaveLength(1);
  });

  it("counts content and published notices in stats", async () => {
    const store = await DemoCmsStore.create();
    const before = await store.getStats(); // seeded content counts too
    await store.createNotice({
      slug: "stats-published",
      title: "Published",
      bodyMd: "Body",
      category: "general",
      status: "published",
    });
    await store.createNotice({
      slug: "stats-expired",
      title: "Expired",
      bodyMd: "Body",
      category: "general",
      status: "published",
      expiryAt: past(),
    });
    await store.createGalleryItem({
      title: "Annual sports day",
      category: "sports",
      caption: "Students at the annual sports day.",
      takenAt: "2026-02-05T09:00:00.000Z",
      palette: ["#7c2d3e", "#e5e0d8"],
    });
    await store.createDownload({
      title: "Admission form 2026",
      category: "admission-form",
      fileName: "admission-form-2026.pdf",
      format: "pdf",
      sizeLabel: "240 KB",
      updatedAt: "2026-01-15T09:00:00.000Z",
    });

    const stats = await store.getStats();
    expect(stats.notices).toBe(before.notices + 2);
    expect(stats.publishedNotices).toBe(before.publishedNotices + 1); // expired row excluded
    expect(stats.galleryItems).toBe(before.galleryItems + 1);
    expect(stats.downloads).toBe(before.downloads + 1);
  });

  it("supports events with upcoming filtering", async () => {
    const store = await DemoCmsStore.create();
    await store.createEvent({
      slug: "science-fair-2026",
      title: "Annual Science Fair 2026",
      description: "Student projects across all departments.",
      startsAt: future(),
      endsAt: future(),
      location: "College auditorium",
      category: "academic",
      status: "published",
    });
    await store.createEvent({
      slug: "past-reunion",
      title: "Alumni Reunion",
      description: "Class of 2016 reunion.",
      startsAt: past(),
      endsAt: past(),
      location: "College lawn",
      category: "cultural",
      status: "published",
    });

    const upcoming = await store.listEvents({ upcoming: true });
    expect(upcoming.map((e) => e.slug)).toContain("science-fair-2026");
    expect(upcoming.map((e) => e.slug)).not.toContain("past-reunion");
    expect(
      upcoming.every((e) => new Date(e.startsAt).getTime() >= Date.now() - 60_000),
    ).toBe(true);

    const all = await store.listEvents();
    expect(all.map((e) => e.slug)).toContain("past-reunion");
    // Sorted desc by startsAt: the future event sits before the past one.
    expect(all.indexOf(all.find((e) => e.slug === "science-fair-2026")!)).toBeLessThan(
      all.indexOf(all.find((e) => e.slug === "past-reunion")!),
    );
  });
});
