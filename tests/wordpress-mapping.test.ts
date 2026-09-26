import { describe, it, expect } from "vitest";
import {
  mapPluginNotice,
  mapCoreNotice,
  mapCoreEvent,
  noticeToPluginPayload,
  eventToCorePayload,
  wpStatusToContentStatus,
  contentStatusToWpStatus,
  toWpPostId,
} from "@/lib/cms/wordpress/mapping";
import type { CreateNoticeInput, CreateEventInput } from "@/lib/cms/content-store";

/**
 * Pure mapping checks between WordPress REST fixtures and the domain zod
 * types (spec 17.9). The fixtures mirror the two real payload shapes:
 * the plugin's normalized /edupress/v1/notices JSON and core CPT posts.
 */

// ---- fixtures -------------------------------------------------------------------

const pluginNoticeFixture = {
  id: 123,
  slug: "admission-circular-2026-27",
  title: "Admission Circular 2026-27",
  body_md: "Padma Model College invites applications.\n\n## Key dates\n- opens 1 Sep",
  category: "admission",
  priority: "urgent",
  status: "published",
  featured: true,
  published_at: "2026-09-01T09:00:00",
  expiry_at: "2026-10-31T16:00:00",
  attachment: {
    file_name: "admission-circular-2026.pdf",
    label: "Admission Circular 2026-27 (PDF)",
  },
  created_at: "2026-08-30T10:00:00",
  updated_at: "2026-09-01T08:45:00",
};

const coreNoticeFixture = {
  id: 456,
  slug: "ssc-mock-test-2026-routine",
  status: "publish",
  date_gmt: "2026-02-10T09:00:00",
  modified_gmt: "2026-02-11T12:00:00",
  title: { rendered: "SSC Mock Test 2026 Routine" },
  content: {
    rendered:
      "<p>The routine is <strong>published</strong> on the notice board&#8217;s ground floor.</p>\n",
    raw: "The routine is **published** on the notice board.",
  },
  meta: {
    edupress_priority: "high",
    edupress_featured: true,
    edupress_expiry: "2026-03-01 16:00",
    edupress_attachment_url: "ssc-mock-routine.pdf",
    edupress_attachment_label: "Mock routine (PDF)",
  },
  edupress_notice_category: [7],
};

const coreEventFixture = {
  id: 789,
  slug: "annual-science-fair-2026",
  status: "publish",
  date_gmt: "2026-10-05T09:00:00",
  modified_gmt: "2026-10-05T09:00:00",
  title: { rendered: "Annual Science Fair 2026" },
  content: { rendered: "<p>Two days of student projects.</p>", raw: "Two days of student projects." },
  meta: {
    edupress_starts_at: "2026-10-05T09:00:00",
    edupress_ends_at: "2026-10-06T16:00:00",
    edupress_location: "College Auditorium",
    edupress_event_category: "academic",
  },
};

// ---- status + id helpers ------------------------------------------------------------

describe("wp status mapping", () => {
  it("maps publish to published and everything else to draft", () => {
    expect(wpStatusToContentStatus("publish")).toBe("published");
    expect(wpStatusToContentStatus("draft")).toBe("draft");
    expect(wpStatusToContentStatus("pending")).toBe("draft");
    expect(wpStatusToContentStatus("private")).toBe("draft");
    expect(wpStatusToContentStatus("future")).toBe("draft");
  });

  it("maps domain statuses back to WP statuses", () => {
    expect(contentStatusToWpStatus("published")).toBe("publish");
    expect(contentStatusToWpStatus("draft")).toBe("draft");
  });

  it("converts domain ids to numeric WP post ids", () => {
    expect(toWpPostId("wp-123")).toBe(123);
    expect(toWpPostId("123")).toBe(123);
    expect(toWpPostId("wp-not-a-number")).toBeNull();
    expect(toWpPostId("")).toBeNull();
  });
});

// ---- plugin notices ------------------------------------------------------------------

describe("mapPluginNotice", () => {
  it("maps a normalized plugin payload to the domain Notice type", () => {
    const notice = mapPluginNotice(pluginNoticeFixture);
    expect(notice).not.toBeNull();
    expect(notice!.id).toBe("wp-123");
    expect(notice!.slug).toBe("admission-circular-2026-27");
    expect(notice!.category).toBe("admission");
    expect(notice!.priority).toBe("urgent");
    expect(notice!.status).toBe("published");
    expect(notice!.featured).toBe(true);
    expect(notice!.publishedAt).toBe("2026-09-01T09:00:00.000Z");
    expect(notice!.expiryAt).toBe("2026-10-31T16:00:00.000Z");
    expect(notice!.attachment).toEqual({
      fileName: "admission-circular-2026.pdf",
      label: "Admission Circular 2026-27 (PDF)",
    });
    expect(notice!.bodyMd).toContain("Key dates");
  });

  it("keeps the full ISO timestamps (UTC normalization)", () => {
    const notice = mapPluginNotice(pluginNoticeFixture);
    expect(new Date(notice!.createdAt).toISOString()).toBe(
      "2026-08-30T10:00:00.000Z",
    );
  });

  it("maps draft plugin rows to draft notices", () => {
    const notice = mapPluginNotice({
      ...pluginNoticeFixture,
      id: 2,
      status: "draft",
      featured: false,
      expiry_at: null,
      attachment: null,
    });
    expect(notice!.status).toBe("draft");
    expect(notice!.featured).toBe(false);
    expect(notice!.expiryAt).toBeUndefined();
    expect(notice!.attachment).toBeUndefined();
  });

  it("returns null for payloads missing required fields", () => {
    expect(mapPluginNotice(null)).toBeNull();
    expect(mapPluginNotice("nope")).toBeNull();
    expect(mapPluginNotice({ ...pluginNoticeFixture, title: "" })).toBeNull();
    expect(mapPluginNotice({ ...pluginNoticeFixture, published_at: "" })).toBeNull();
    expect(mapPluginNotice({ ...pluginNoticeFixture, id: 0, slug: "" })).toBeNull();
  });
});

// ---- core CPT notices ------------------------------------------------------------------

describe("mapCoreNotice", () => {
  const terms = new Map([[7, "exam"]]);

  it("maps a core CPT post through meta + taxonomy", () => {
    const notice = mapCoreNotice(coreNoticeFixture, terms);
    expect(notice).not.toBeNull();
    expect(notice!.id).toBe("wp-456");
    expect(notice!.category).toBe("exam");
    expect(notice!.priority).toBe("high");
    expect(notice!.featured).toBe(true);
    expect(notice!.status).toBe("published");
    expect(notice!.expiryAt).toBe("2026-03-01T16:00:00.000Z");
    expect(notice!.attachment).toEqual({
      fileName: "ssc-mock-routine.pdf",
      label: "Mock routine (PDF)",
    });
    // raw markdown preferred over rendered HTML
    expect(notice!.bodyMd).toBe("The routine is **published** on the notice board.");
    expect(notice!.title).toBe("SSC Mock Test 2026 Routine");
  });

  it("strips tags and decodes entities when only rendered HTML exists", () => {
    const { raw: _raw, ...contentWithoutRaw } = coreNoticeFixture.content;
    const notice = mapCoreNotice(
      { ...coreNoticeFixture, content: contentWithoutRaw },
      terms,
    );
    expect(notice!.bodyMd).toBe(
      "The routine is published on the notice board’s ground floor.",
    );
  });

  it("falls back to the general category when the taxonomy is absent", () => {
    const notice = mapCoreNotice(
      { ...coreNoticeFixture, edupress_notice_category: undefined },
      new Map(),
    );
    expect(notice!.category).toBe("general");
  });

  it("normalizes unknown priority meta to normal", () => {
    const notice = mapCoreNotice(
      {
        ...coreNoticeFixture,
        meta: { ...coreNoticeFixture.meta, edupress_priority: "weird" },
      },
      terms,
    );
    expect(notice!.priority).toBe("normal");
  });

  it("returns null for posts without parseable dates", () => {
    expect(mapCoreNotice({ ...coreNoticeFixture, date_gmt: "" }, terms)).toBeNull();
    expect(mapCoreNotice(null, terms)).toBeNull();
  });
});

// ---- events ---------------------------------------------------------------------------

describe("mapCoreEvent", () => {
  it("maps a core edupress_event post through its meta contract", () => {
    const event = mapCoreEvent(coreEventFixture);
    expect(event).not.toBeNull();
    expect(event!.id).toBe("wp-789");
    expect(event!.startsAt).toBe("2026-10-05T09:00:00.000Z");
    expect(event!.endsAt).toBe("2026-10-06T16:00:00.000Z");
    expect(event!.location).toBe("College Auditorium");
    expect(event!.category).toBe("academic");
    expect(event!.status).toBe("published");
    expect(event!.description).toBe("Two days of student projects.");
  });

  it("falls back to post dates and sensible defaults when meta is missing", () => {
    const event = mapCoreEvent({
      id: 1,
      slug: "minimal-event",
      status: "draft",
      date_gmt: "2026-01-10T09:00:00",
      modified_gmt: "2026-01-10T17:00:00",
      title: { rendered: "Minimal Event" },
      content: { rendered: "<p>Desc</p>" },
    });
    expect(event!.startsAt).toBe("2026-01-10T09:00:00.000Z");
    expect(event!.endsAt).toBe("2026-01-10T17:00:00.000Z");
    expect(event!.location).toBe("Unspecified venue");
    expect(event!.category).toBe("academic");
    expect(event!.status).toBe("draft");
  });

  it("returns null when neither meta nor post dates parse", () => {
    expect(
      mapCoreEvent({
        id: 1,
        slug: "bad",
        status: "publish",
        date_gmt: "",
        modified_gmt: "",
        title: { rendered: "Bad" },
        content: {},
      }),
    ).toBeNull();
  });
});

// ---- outbound payloads --------------------------------------------------------------------

describe("noticeToPluginPayload", () => {
  it("serializes a create input into the plugin POST contract", () => {
    const input: CreateNoticeInput = {
      slug: "new-notice",
      title: "New Notice",
      bodyMd: "Body text.",
      category: "exam",
      priority: "high",
      status: "published",
      featured: true,
      publishedAt: "2026-09-05T09:00:00.000Z",
      expiryAt: "2026-10-01T00:00:00.000Z",
      attachment: { fileName: "file.pdf", label: "File (PDF)" },
    };
    expect(noticeToPluginPayload(input)).toEqual({
      title: "New Notice",
      slug: "new-notice",
      body_md: "Body text.",
      category: "exam",
      priority: "high",
      status: "publish",
      featured: true,
      published_at: "2026-09-05T09:00:00.000Z",
      expiry_at: "2026-10-01T00:00:00.000Z",
      attachment: { file_name: "file.pdf", label: "File (PDF)" },
    });
  });

  it("only sends the patched fields on update", () => {
    expect(noticeToPluginPayload({ priority: "urgent" })).toEqual({
      priority: "urgent",
    });
    expect(noticeToPluginPayload({ status: "draft" })).toEqual({
      status: "draft",
    });
  });
});

describe("eventToCorePayload", () => {
  it("serializes an event create input with meta keys", () => {
    const input: CreateEventInput = {
      slug: "fair-2026",
      title: "Fair 2026",
      description: "A fair.",
      startsAt: "2026-10-05T09:00:00.000Z",
      endsAt: "2026-10-06T16:00:00.000Z",
      location: "Ground",
      category: "cultural",
      status: "draft",
    };
    expect(eventToCorePayload(input)).toEqual({
      title: "Fair 2026",
      slug: "fair-2026",
      content: "A fair.",
      status: "draft",
      meta: {
        edupress_starts_at: "2026-10-05T09:00:00.000Z",
        edupress_ends_at: "2026-10-06T16:00:00.000Z",
        edupress_location: "Ground",
        edupress_event_category: "cultural",
      },
    });
  });
});
