import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  resolveCmsMode,
  getCmsMode,
  isDemoContent,
  cmsModeLabel,
  getCmsStore,
  resetCmsStoreForTests,
} from "@/lib/cms";

/**
 * CMS mode resolution matrix (spec 17.9): which backend serves content for
 * every combination of CMS_MODE / WORDPRESS_* / MONGODB_URI, plus the
 * honest startup failure when WordPress mode lacks an endpoint.
 */

const ENV_KEYS = [
  "CMS_MODE",
  "MONGODB_URI",
  "WORDPRESS_BASE_URL",
  "WORDPRESS_API_URL",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  resetCmsStoreForTests();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved[key];
    }
  }
  resetCmsStoreForTests();
});

describe("resolveCmsMode — env matrix", () => {
  it("defaults to MongoDB mode (demo store) with nothing set", () => {
    const result = resolveCmsMode({});
    expect(result).toEqual({
      mode: "mongodb",
      wpConfigured: false,
      demo: true,
      label: "MongoDB demo",
    });
  });

  it("resolves real MongoDB when MONGODB_URI is set", () => {
    const result = resolveCmsMode({ MONGODB_URI: "mongodb://localhost:27017" });
    expect(result.mode).toBe("mongodb");
    expect(result.demo).toBe(false);
    expect(result.label).toBe("MongoDB");
  });

  it("resolves WordPress mode with WORDPRESS_BASE_URL", () => {
    const result = resolveCmsMode({
      CMS_MODE: "wordpress",
      WORDPRESS_BASE_URL: "https://wp.example.com",
    });
    expect(result.mode).toBe("wordpress");
    expect(result.wpConfigured).toBe(true);
    expect(result.label).toBe("WordPress headless");
    expect(result.error).toBeUndefined();
  });

  it("WORDPRESS_API_URL alone also configures WordPress mode", () => {
    const result = resolveCmsMode({
      CMS_MODE: "wordpress",
      WORDPRESS_API_URL: "https://wp.example.com/wp-json",
    });
    expect(result.wpConfigured).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("WordPress mode without any endpoint is an honest error state", () => {
    const result = resolveCmsMode({ CMS_MODE: "wordpress" });
    expect(result.mode).toBe("wordpress");
    expect(result.wpConfigured).toBe(false);
    expect(result.label).toBe("WordPress (missing base URL)");
    expect(result.error).toContain("WORDPRESS_BASE_URL");
  });

  it("WordPress env vars are ignored when CMS_MODE is mongodb", () => {
    const result = resolveCmsMode({
      CMS_MODE: "mongodb",
      WORDPRESS_BASE_URL: "https://wp.example.com",
    });
    expect(result.mode).toBe("mongodb");
    expect(result.wpConfigured).toBe(false);
  });

  it("whitespace-only WordPress URLs count as missing", () => {
    const result = resolveCmsMode({
      CMS_MODE: "wordpress",
      WORDPRESS_BASE_URL: "   ",
    });
    expect(result.wpConfigured).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("WordPress mode takes precedence even with MONGODB_URI set", () => {
    const result = resolveCmsMode({
      CMS_MODE: "wordpress",
      MONGODB_URI: "mongodb://localhost:27017",
      WORDPRESS_BASE_URL: "https://wp.example.com",
    });
    expect(result.mode).toBe("wordpress");
    expect(result.demo).toBe(false);
  });
});

describe("convenience accessors", () => {
  it("getCmsMode / isDemoContent / cmsModeLabel follow process.env", () => {
    expect(getCmsMode()).toBe("mongodb");
    expect(isDemoContent()).toBe(true);
    expect(cmsModeLabel()).toBe("MongoDB demo");

    process.env.MONGODB_URI = "mongodb://localhost:27017";
    expect(isDemoContent()).toBe(false);
    expect(cmsModeLabel()).toBe("MongoDB");

    delete process.env.MONGODB_URI;
    process.env.CMS_MODE = "wordpress";
    process.env.WORDPRESS_BASE_URL = "https://wp.example.com";
    expect(getCmsMode()).toBe("wordpress");
    expect(cmsModeLabel()).toBe("WordPress headless");
  });
});

describe("getCmsStore — startup check", () => {
  it("throws a clear error when wordpress mode has no endpoint configured", async () => {
    process.env.CMS_MODE = "wordpress";
    await expect(getCmsStore()).rejects.toThrow(/WORDPRESS_BASE_URL/);
  });

  it("resolves the demo store by default (app works with no services)", async () => {
    const store = await getCmsStore();
    const settings = await store.getSettings();
    expect(settings.collegeName).toBe("Padma Model College");
  });
});
