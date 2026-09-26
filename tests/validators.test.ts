import { describe, it, expect } from "vitest";
import {
  noticeFormSchema,
  eventFormSchema,
  teacherFormSchema,
  settingsFormSchema,
  galleryFormSchema,
  downloadFormSchema,
  resultSessionFormSchema,
  datetimeLocalToIso,
  isoToDatetimeLocal,
} from "@/lib/validation/content";

/**
 * Admin CMS form schemas (src/lib/validation/content.ts) — the exact zod
 * schemas the server actions parse with. Clients never decide validity on
 * their own; these tests pin accept/reject behaviour, the datetime-local ->
 * UTC conversion and the per-field error paths the forms render.
 * (The public inquiry schema is covered in tests/store-cms.test.ts.)
 */

/** A complete, valid notice payload as the form submits it. */
function validNotice() {
  return {
    title: "HSC Test Examination Routine 2026",
    slug: "hsc-test-examination-routine-2026",
    category: "exam",
    priority: "normal",
    status: "published",
    featured: true,
    publishedAt: "2026-09-01T09:00",
    expiryAt: "",
    attachmentFileName: "routine.pdf",
    attachmentLabel: "Routine PDF (420 KB)",
    bodyMd: "The routine is published on the college notice board.",
  };
}

describe("datetime-local <-> ISO helpers", () => {
  it("treats datetime-local values as UTC and produces full ISO strings", () => {
    expect(datetimeLocalToIso("2026-10-31T16:00")).toBe(
      "2026-10-31T16:00:00.000Z",
    );
    expect(datetimeLocalToIso("  2026-01-02T03:04  ")).toBe(
      "2026-01-02T03:04:00.000Z",
    );
  });

  it("passes undefined/blank through as undefined", () => {
    expect(datetimeLocalToIso(undefined)).toBeUndefined();
    expect(datetimeLocalToIso("")).toBeUndefined();
    expect(datetimeLocalToIso("   ")).toBeUndefined();
  });

  it("drops input that is not a datetime-local string (never guesses)", () => {
    // V8's Date parser alone would happily read "garbage:00Z" as a date in
    // the year 2000 — the helper must reject it explicitly.
    expect(datetimeLocalToIso("garbage")).toBeUndefined();
    expect(datetimeLocalToIso("31/10/2026 4pm")).toBeUndefined();
  });

  it("round-trips ISO -> datetime-local -> ISO", () => {
    const iso = "2026-03-18T04:30:00.000Z";
    expect(isoToDatetimeLocal(iso)).toBe("2026-03-18T04:30");
    expect(datetimeLocalToIso(isoToDatetimeLocal(iso))).toBe(iso);
  });

  it("returns an empty datetime-local string for missing/invalid ISO", () => {
    expect(isoToDatetimeLocal(undefined)).toBe("");
    expect(isoToDatetimeLocal("not-a-date")).toBe("");
  });
});

describe("noticeFormSchema", () => {
  it("accepts a fully valid create payload and normalizes its dates", () => {
    const parsed = noticeFormSchema.safeParse(validNotice());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.publishedAt).toBe("2026-09-01T09:00:00.000Z");
      expect(parsed.data.expiryAt).toBeUndefined(); // blank expiry cleared
      expect(parsed.data.attachmentFileName).toBe("routine.pdf");
    }
  });

  it("keeps a provided expiry as a UTC ISO string", () => {
    const parsed = noticeFormSchema.safeParse({
      ...validNotice(),
      expiryAt: "2026-10-31T16:00",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.expiryAt).toBe("2026-10-31T16:00:00.000Z");
    }
  });

  it("works without the optional attachment fields", () => {
    const {
      attachmentFileName: _f,
      attachmentLabel: _l,
      ...rest
    } = validNotice();
    expect(noticeFormSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects a missing or unparseable published date", () => {
    for (const publishedAt of ["", "garbage"]) {
      const parsed = noticeFormSchema.safeParse({
        ...validNotice(),
        publishedAt,
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some((i) => i.path[0] === "publishedAt"),
        ).toBe(true);
      }
    }
  });

  it("rejects slugs that are not lowercase-hyphenated", () => {
    for (const slug of [
      "",
      "Bad-Slug",
      "double--hyphen",
      "leading-",
      "-trailing",
      "has space",
    ]) {
      const parsed = noticeFormSchema.safeParse({ ...validNotice(), slug });
      expect(parsed.success, `slug "${slug}" should be rejected`).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.some((i) => i.path[0] === "slug")).toBe(
          true,
        );
      }
    }
  });

  it("rejects values outside the category/priority/status enums", () => {
    for (const patch of [
      { category: "sports" },
      { priority: "low" },
      { status: "archived" },
    ]) {
      const parsed = noticeFormSchema.safeParse({ ...validNotice(), ...patch });
      expect(
        parsed.success,
        `${JSON.stringify(patch)} should be rejected`,
      ).toBe(false);
    }
  });

  it("rejects a short title and a thin body with field-level errors", () => {
    const parsed = noticeFormSchema.safeParse({
      ...validNotice(),
      title: "Hi",
      bodyMd: "Too short",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = new Set(parsed.error.issues.map((i) => i.path[0]));
      expect(fields).toContain("title");
      expect(fields).toContain("bodyMd");
    }
  });
});

describe("eventFormSchema", () => {
  function validEvent() {
    return {
      title: "Annual Science Fair 2026",
      slug: "annual-science-fair-2026",
      category: "academic",
      status: "published",
      location: "College Auditorium",
      startsAt: "2026-10-05T09:00",
      endsAt: "2026-10-06T16:00",
      description: "Student projects from every department are exhibited.",
    };
  }

  it("accepts a valid event", () => {
    expect(eventFormSchema.safeParse(validEvent()).success).toBe(true);
  });

  it("rejects an end that is not after the start (error lands on endsAt)", () => {
    const parsed = eventFormSchema.safeParse({
      ...validEvent(),
      endsAt: "2026-10-05T09:00",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path[0] === "endsAt");
      expect(issue?.message).toBe("The end must be after the start.");
    }
  });

  it("rejects a missing location or start date", () => {
    const noLocation = eventFormSchema.safeParse({
      ...validEvent(),
      location: "x",
    });
    const noStart = eventFormSchema.safeParse({
      ...validEvent(),
      startsAt: "",
    });
    expect(noLocation.success).toBe(false);
    expect(noStart.success).toBe(false);
  });
});

describe("teacherFormSchema", () => {
  function validTeacher() {
    return {
      name: "Nusrat Jahan",
      slug: "nusrat-jahan",
      designation: "Associate Professor",
      departmentSlug: "physics",
      qualification: "MSc in Physics, University of Dhaka",
      subjects: "Physics, Higher Mathematics",
      email: "nusrat.jahan@padmamodelcollege.edu.bd",
      bioMd: "Teaches physics to HSC first- and second-year students.",
      joinYear: "2012",
    };
  }

  it("splits the comma-separated subjects list into a trimmed array", () => {
    const parsed = teacherFormSchema.safeParse(validTeacher());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.subjects).toEqual(["Physics", "Higher Mathematics"]);
    }
  });

  it("coerces the join year from the form string", () => {
    const parsed = teacherFormSchema.safeParse(validTeacher());
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.joinYear).toBe(2012);
  });

  it("rejects an unknown designation, bad email and a year out of range", () => {
    expect(
      teacherFormSchema.safeParse({
        ...validTeacher(),
        designation: "Headmaster",
      }).success,
    ).toBe(false);
    expect(
      teacherFormSchema.safeParse({ ...validTeacher(), email: "not-an-email" })
        .success,
    ).toBe(false);
    expect(
      teacherFormSchema.safeParse({ ...validTeacher(), joinYear: "1971" })
        .success,
    ).toBe(false);
  });

  it("rejects a subjects list that trims down to nothing", () => {
    const parsed = teacherFormSchema.safeParse({
      ...validTeacher(),
      subjects: " , , ",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("settingsFormSchema — settings update rules", () => {
  function validSettings() {
    return {
      collegeName: "Padma Model College",
      tagline: "Knowledge, Discipline, Character.",
      announcementText: "Science fair registration is open.",
      announcementActive: true,
      contactAddress: "42 College Road, Dhanmondi, Dhaka 1205",
      contactPhone: "+880 2 9612345",
      contactEmail: "info@padmamodelcollege.edu.bd",
      principalName: "Prof. Dr. Anisur Rahman",
      principalTitle: "Principal",
      principalMessageMd:
        "Every student of Padma Model College is expected to uphold the motto in study, conduct and character.",
    };
  }

  it("accepts the full settings payload", () => {
    expect(settingsFormSchema.safeParse(validSettings()).success).toBe(true);
  });

  it("allows an empty announcement (turning the banner off is a valid state)", () => {
    const parsed = settingsFormSchema.safeParse({
      ...validSettings(),
      announcementText: "",
      announcementActive: false,
    });
    expect(parsed.success).toBe(true);
  });

  it("caps the announcement at 300 characters", () => {
    const parsed = settingsFormSchema.safeParse({
      ...validSettings(),
      announcementText: "a".repeat(301),
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((i) => i.path[0] === "announcementText"),
      ).toBe(true);
    }
  });

  it("rejects an invalid contact email with the error on that field", () => {
    const parsed = settingsFormSchema.safeParse({
      ...validSettings(),
      contactEmail: "info-at-college",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((i) => i.path[0] === "contactEmail"),
      ).toBe(true);
    }
  });

  it("requires the principal message to be substantial", () => {
    const parsed = settingsFormSchema.safeParse({
      ...validSettings(),
      principalMessageMd: "Welcome.",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("galleryFormSchema", () => {
  function validGallery() {
    return {
      title: "Main academic building",
      category: "campus",
      caption: "The academic building houses the science laboratories.",
      takenAt: "2026-02-05",
      colorA: "#7c2d3e",
      colorB: "#e5e0d8",
    };
  }

  it("accepts a valid gallery item", () => {
    expect(galleryFormSchema.safeParse(validGallery()).success).toBe(true);
  });

  it("requires 6-digit hex palette colours", () => {
    expect(
      galleryFormSchema.safeParse({ ...validGallery(), colorA: "7c2d3e" })
        .success,
    ).toBe(false);
    expect(
      galleryFormSchema.safeParse({ ...validGallery(), colorB: "#12345" })
        .success,
    ).toBe(false);
  });

  it("rejects an unknown category and a missing taken date", () => {
    expect(
      galleryFormSchema.safeParse({ ...validGallery(), category: "lab" })
        .success,
    ).toBe(false);
    expect(
      galleryFormSchema.safeParse({ ...validGallery(), takenAt: "" }).success,
    ).toBe(false);
  });
});

describe("downloadFormSchema", () => {
  function validDownload() {
    return {
      title: "Admission Form 2026-27",
      category: "admission-form",
      fileName: "admission-form-2026.pdf",
      format: "pdf",
      sizeLabel: "240 KB",
      updatedAt: "2026-01-15",
    };
  }

  it("accepts a valid download row", () => {
    expect(downloadFormSchema.safeParse(validDownload()).success).toBe(true);
  });

  it("only allows .pdf/.docx/.xlsx file names", () => {
    expect(
      downloadFormSchema.safeParse({ ...validDownload(), fileName: "form.zip" })
        .success,
    ).toBe(false);
    expect(
      downloadFormSchema.safeParse({
        ...validDownload(),
        fileName: "no-extension",
      }).success,
    ).toBe(false);
  });

  it("rejects a format outside the enum and an empty size label", () => {
    expect(
      downloadFormSchema.safeParse({ ...validDownload(), format: "zip" })
        .success,
    ).toBe(false);
    expect(
      downloadFormSchema.safeParse({ ...validDownload(), sizeLabel: "" })
        .success,
    ).toBe(false);
  });
});

describe("resultSessionFormSchema", () => {
  function validSession() {
    return {
      exam: "SSC Mock Test",
      year: "2026",
      classLevel: "SSC",
      className: "Class 10 (Science)",
      status: "published",
      publishedAt: "2026-09-15",
      entries: [
        {
          studentId: "PMC-2026-1101",
          studentName: "Rakib Hasan",
          gpa: "4.63",
          grade: "A",
          subjectMarks: [
            { subject: "Physics", marks: "92", grade: "A+" },
            { subject: "ICT", marks: "95", grade: "A+" },
          ],
        },
      ],
    };
  }

  it("accepts a valid session and coerces the numeric strings", () => {
    const parsed = resultSessionFormSchema.safeParse(validSession());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.year).toBe(2026);
      expect(parsed.data.entries[0].gpa).toBe(4.63);
      expect(parsed.data.entries[0].subjectMarks[0].marks).toBe(92);
    }
  });

  it("requires at least one student row and one subject per row", () => {
    expect(
      resultSessionFormSchema.safeParse({ ...validSession(), entries: [] })
        .success,
    ).toBe(false);
    const noSubjects = {
      ...validSession(),
      entries: [{ ...validSession().entries[0], subjectMarks: [] }],
    };
    expect(resultSessionFormSchema.safeParse(noSubjects).success).toBe(false);
  });

  it("keeps marks within 0-100 and the GPA within 0-5", () => {
    const overMarks = {
      ...validSession(),
      entries: [
        {
          ...validSession().entries[0],
          subjectMarks: [{ subject: "Physics", marks: "120", grade: "A+" }],
        },
      ],
    };
    expect(resultSessionFormSchema.safeParse(overMarks).success).toBe(false);
    const overGpa = {
      ...validSession(),
      entries: [{ ...validSession().entries[0], gpa: "5.5" }],
    };
    expect(resultSessionFormSchema.safeParse(overGpa).success).toBe(false);
  });
});
