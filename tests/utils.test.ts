import { describe, expect, it } from "vitest";
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelative,
  isExpired,
  slugify,
} from "@/lib/utils";

describe("cn", () => {
  it("joins truthy classes and skips falsy values", () => {
    expect(cn("a", false, undefined, null, "b", "")).toBe("a b");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("HSC Test Examination Routine")).toBe(
      "hsc-test-examination-routine",
    );
  });

  it("strips characters that are not letters, digits, spaces or hyphens", () => {
    expect(slugify("Admission 2026/27!")).toBe("admission-202627");
  });

  it("collapses repeated separators and trims edges", () => {
    expect(slugify("  --Science -- Fair   2026--  ")).toBe("science-fair-2026");
  });

  it("handles already-slugged input unchanged", () => {
    expect(slugify("padma-model-college")).toBe("padma-model-college");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as '12 Jan 2026'", () => {
    expect(formatDate("2026-01-12T09:00:00.000Z")).toBe("12 Jan 2026");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO date with time", () => {
    expect(formatDateTime("2026-03-15T14:30:00.000Z")).toBe(
      "15 Mar 2026, 2:30 pm",
    );
  });

  it("returns an empty string for invalid input", () => {
    expect(formatDateTime("nope")).toBe("");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-09-01T12:00:00.000Z");

  it("describes a time 3 days in the past", () => {
    expect(formatRelative("2026-08-29T12:00:00.000Z", now)).toBe("3 days ago");
  });

  it("describes a time 2 hours in the past", () => {
    expect(formatRelative("2026-09-01T10:00:00.000Z", now)).toBe("2 hours ago");
  });

  it("describes a time 5 minutes in the past", () => {
    expect(formatRelative("2026-09-01T11:55:00.000Z", now)).toBe("5 minutes ago");
  });

  it("describes a time less than a minute in the past", () => {
    expect(formatRelative("2026-09-01T11:59:40.000Z", now)).toBe("20 seconds ago");
  });

  it("uses 'now' for zero difference", () => {
    expect(formatRelative("2026-09-01T12:00:00.000Z", now)).toBe("now");
  });

  it("describes a future time as 'in ...'", () => {
    expect(formatRelative("2026-09-01T13:00:00.000Z", now)).toBe("in 1 hour");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatRelative("nope", now)).toBe("");
  });
});

describe("isExpired", () => {
  const now = new Date("2026-09-01T12:00:00.000Z");

  it("is false when there is no expiry timestamp", () => {
    expect(isExpired(undefined, now)).toBe(false);
  });

  it("is false for a future expiry", () => {
    expect(isExpired("2026-10-01T00:00:00.000Z", now)).toBe(false);
  });

  it("is true for a past expiry", () => {
    expect(isExpired("2026-08-01T00:00:00.000Z", now)).toBe(true);
  });

  it("is true at the exact boundary (expiry is inclusive)", () => {
    expect(isExpired("2026-09-01T12:00:00.000Z", now)).toBe(true);
  });

  it("is false for an unparseable value", () => {
    expect(isExpired("not-a-date", now)).toBe(false);
  });
});
