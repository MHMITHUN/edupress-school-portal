import { describe, it, expect } from "vitest";
import { DemoCmsStore } from "@/lib/cms/mongodb/demo-store";

/**
 * Gallery + download CRUD and the settings merge rules against the
 * in-memory demo store (src/lib/cms/mongodb/demo-store.ts). MongoCmsStore
 * mirrors this logic; these tests pin the interface behaviour the admin
 * managers rely on, including idempotent seeding and idempotent deletes.
 */

describe("DemoCmsStore — gallery CRUD", () => {
  it("lists items newest-taken-first and filters by category", async () => {
    const store = await DemoCmsStore.create();
    const seeds = await store.listGalleryItems();
    expect(seeds.length).toBeGreaterThan(0);

    const added = await store.createGalleryItem({
      title: "Inter-department debate final",
      category: "cultural",
      caption: "The debating club final in the auditorium.",
      takenAt: "2026-09-10T14:00:00.000Z",
      palette: ["#7c2d3e", "#f3efe9"],
    });
    expect(added.id).toBeTruthy();

    const all = await store.listGalleryItems();
    expect(all).toHaveLength(seeds.length + 1);
    // Sorted by takenAt descending: the newest seed (Sep 2026) or the new row
    // must sit at the top — never an older row.
    expect(all.map((item) => item.id)).toContain(added.id);
    const takenTimes = all.map((item) => item.takenAt);
    const sorted = [...takenTimes].sort((a, b) => b.localeCompare(a));
    expect(takenTimes).toEqual(sorted);

    const cultural = await store.listGalleryItems("cultural");
    expect(cultural.length).toBeGreaterThan(0);
    expect(cultural.every((item) => item.category === "cultural")).toBe(true);
  });

  it("updates only the patched fields and keeps the palette", async () => {
    const store = await DemoCmsStore.create();
    const item = await store.createGalleryItem({
      title: "Science lab session",
      category: "science-lab",
      caption: "A chemistry practical in progress.",
      takenAt: "2026-03-12T09:00:00.000Z",
      palette: ["#1f3a5f", "#e5e0d8"],
    });

    const updated = await store.updateGalleryItem(item.id, {
      caption: "A chemistry practical in the new laboratory wing.",
    });
    expect(updated?.caption).toBe(
      "A chemistry practical in the new laboratory wing.",
    );
    expect(updated?.title).toBe("Science lab session"); // untouched
    expect(updated?.palette).toEqual(["#1f3a5f", "#e5e0d8"]); // untouched
    expect((await store.getGalleryItemById(item.id))?.category).toBe(
      "science-lab",
    );
  });

  it("is idempotent around deletes: true once, then false and null forever", async () => {
    const store = await DemoCmsStore.create();
    const before = (await store.getStats()).galleryItems;
    const item = await store.createGalleryItem({
      title: "Sports day 100m final",
      category: "sports",
      caption: "The class 10 sprint final on the college field.",
      takenAt: "2026-02-05T09:00:00.000Z",
      palette: ["#2f6b4f", "#e5e0d8"],
    });

    expect(await store.deleteGalleryItem(item.id)).toBe(true);
    expect(await store.deleteGalleryItem(item.id)).toBe(false); // second delete
    expect(await store.getGalleryItemById(item.id)).toBeNull();
    expect(
      await store.updateGalleryItem(item.id, { title: "Gone" }),
    ).toBeNull();
    expect((await store.getStats()).galleryItems).toBe(before); // net zero
  });

  it("returns false / null for unknown ids", async () => {
    const store = await DemoCmsStore.create();
    expect(await store.getGalleryItemById("gal-does-not-exist")).toBeNull();
    expect(
      await store.updateGalleryItem("gal-does-not-exist", { title: "X" }),
    ).toBeNull();
    expect(await store.deleteGalleryItem("gal-does-not-exist")).toBe(false);
  });
});

describe("DemoCmsStore — downloads CRUD", () => {
  it("lists documents newest-updated-first and filters by category", async () => {
    const store = await DemoCmsStore.create();
    const seeds = await store.listDownloads();
    expect(seeds.length).toBeGreaterThan(0);

    await store.createDownload({
      title: "Laboratory safety rules 2026",
      category: "notice",
      fileName: "lab-safety-rules-2026.pdf",
      format: "pdf",
      sizeLabel: "180 KB",
      updatedAt: "2026-09-18T09:00:00.000Z",
    });

    const all = await store.listDownloads();
    expect(all).toHaveLength(seeds.length + 1);
    const updatedTimes = all.map((row) => row.updatedAt);
    const sorted = [...updatedTimes].sort((a, b) => b.localeCompare(a));
    expect(updatedTimes).toEqual(sorted);

    const syllabuses = await store.listDownloads("syllabus");
    expect(syllabuses.length).toBeGreaterThan(0);
    expect(syllabuses.every((row) => row.category === "syllabus")).toBe(true);
  });

  it("stamps updatedAt itself when an update does not provide one", async () => {
    const store = await DemoCmsStore.create();
    const row = await store.createDownload({
      title: "Fee schedule 2026",
      category: "prospectus",
      fileName: "fee-schedule-2026.pdf",
      format: "pdf",
      sizeLabel: "120 KB",
      updatedAt: "2026-01-15T09:00:00.000Z",
    });

    const beforeUpdate = Date.now();
    const updated = await store.updateDownload(row.id, {
      title: "Fee schedule 2026-27",
    });
    expect(updated?.title).toBe("Fee schedule 2026-27");
    expect(updated?.updatedAt).not.toBe("2026-01-15T09:00:00.000Z");
    expect(new Date(updated?.updatedAt ?? "").getTime()).toBeGreaterThanOrEqual(
      beforeUpdate - 1_000,
    );
    // Untouched fields survive the patch.
    expect(updated?.fileName).toBe("fee-schedule-2026.pdf");
    expect(updated?.format).toBe("pdf");
  });

  it("keeps an explicitly provided updatedAt verbatim", async () => {
    const store = await DemoCmsStore.create();
    const row = await store.createDownload({
      title: "Prospectus 2026",
      category: "prospectus",
      fileName: "prospectus-2026.pdf",
      format: "pdf",
      sizeLabel: "1.2 MB",
      updatedAt: "2026-01-15T09:00:00.000Z",
    });
    const updated = await store.updateDownload(row.id, {
      sizeLabel: "1.4 MB",
      updatedAt: "2026-09-01T09:00:00.000Z",
    });
    expect(updated?.sizeLabel).toBe("1.4 MB");
    expect(updated?.updatedAt).toBe("2026-09-01T09:00:00.000Z");
  });

  it("is idempotent around deletes: true once, then false and null forever", async () => {
    const store = await DemoCmsStore.create();
    const before = (await store.getStats()).downloads;
    const row = await store.createDownload({
      title: "Class routine draft",
      category: "routine",
      fileName: "routine-draft-2026.xlsx",
      format: "xlsx",
      sizeLabel: "90 KB",
      updatedAt: "2026-09-20T09:00:00.000Z",
    });

    expect(await store.deleteDownload(row.id)).toBe(true);
    expect(await store.deleteDownload(row.id)).toBe(false); // second delete
    expect(await store.getDownloadById(row.id)).toBeNull();
    expect(await store.updateDownload(row.id, { title: "Gone" })).toBeNull();
    expect((await store.getStats()).downloads).toBe(before); // net zero
  });
});

describe("DemoCmsStore — settings update rules", () => {
  it("merges shallow patches and keeps the singleton id", async () => {
    const store = await DemoCmsStore.create();
    const before = await store.getSettings();

    const after = await store.updateSettings({
      tagline: "Knowledge, Discipline, Excellence.",
      announcement: {
        text: "Admission test seats are filling up.",
        active: true,
      },
    });

    expect(after.id).toBe("site");
    expect(after.collegeName).toBe(before.collegeName); // untouched
    expect(after.tagline).toBe("Knowledge, Discipline, Excellence.");
    expect(after.announcement).toEqual({
      text: "Admission test seats are filling up.",
      active: true,
    });
    expect(after.contact).toEqual(before.contact); // nested object untouched
    expect(after.principal).toEqual(before.principal); // nested object untouched
  });

  it("returns a copy — mutating the result never writes through", async () => {
    const store = await DemoCmsStore.create();
    const returned = await store.updateSettings({
      tagline: "Original tagline.",
    });
    returned.collegeName = "Tampered College";
    expect((await store.getSettings()).collegeName).toBe("Padma Model College");
  });

  it("persists successive patches (each keeps earlier ones)", async () => {
    const store = await DemoCmsStore.create();
    await store.updateSettings({ tagline: "First change." });
    await store.updateSettings({
      contact: { address: "New road", phone: "123", email: "a@b.co" },
    });
    const settings = await store.getSettings();
    expect(settings.tagline).toBe("First change.");
    expect(settings.contact.email).toBe("a@b.co");
  });
});

describe("DemoCmsStore — lazy seeding is idempotent", () => {
  it("re-calling ensureSeeded never duplicates seed rows", async () => {
    const store = await DemoCmsStore.create();
    const galleryBefore = (await store.listGalleryItems()).length;
    const downloadsBefore = (await store.listDownloads()).length;
    const noticesBefore = (await store.listNotices()).length;

    await store.ensureSeeded(); // second call is a no-op
    await store.ensureSeeded(); // third call likewise

    expect((await store.listGalleryItems()).length).toBe(galleryBefore);
    expect((await store.listDownloads()).length).toBe(downloadsBefore);
    expect((await store.listNotices()).length).toBe(noticesBefore);
  });
});
