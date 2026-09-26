/**
 * Captures the portfolio screenshots into docs/screenshots/ (spec 17.11).
 * Run against an already-running dev/prod server:
 *   npm run dev   # in another shell (port 3002)
 *   node scripts/screenshots.mjs
 *
 * 01-home.png          1280x800  home page (hero, notices, events, stats)
 * 02-main-feature.png  1280x800  notice board with search/category filters active
 * 03-results.png       1280x800  public result verification card
 * 04-mobile.png         390x844  home page at phone width
 * 05-admin.png         1280x800  admin CMS dashboard (signed in as admin)
 */
import { chromium } from "@playwright/test";
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "docs", "screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.BASE_URL ?? "http://localhost:3002";
const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

const MIN_BYTES = 20 * 1024; // each capture must exceed 20 KB

const browser = await chromium.launch();

async function capture(name, { viewport = DESKTOP, url, setup }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  try {
    await page.goto(BASE + url, { waitUntil: "load" });
    if (setup) {
      await setup(page);
    }
    await page.waitForTimeout(1200); // fonts + hero imagery settle
    const file = path.join(outDir, name);
    await page.screenshot({ path: file });
    const bytes = statSync(file).size;
    if (bytes <= MIN_BYTES) {
      throw new Error(`${name} is only ${bytes} bytes (<= 20 KB)`);
    }
    console.log(`captured ${name} (${(bytes / 1024).toFixed(1)} KB)`);
  } finally {
    await context.close();
  }
}

await capture("01-home.png", { url: "/" });

await capture("02-main-feature.png", {
  // Notice board — the portal's signature feature — with the exam category
  // chip active so the search box, category chips and filtered list all show.
  url: "/notices?category=exam",
});

await capture("03-results.png", {
  // Public result verification, queried student card (GPA + subject table).
  url: "/results?id=PMC-2026-1101&exam=SSC%20Mock%20Test",
});

await capture("04-mobile.png", { url: "/", viewport: MOBILE });

await capture("05-admin.png", {
  url: "/admin/login",
  setup: async (page) => {
    await page.fill('input[name="email"]', "admin@demo.local");
    await page.fill('input[name="password"]', "Demo@12345");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/admin$/, { timeout: 30_000 });
  },
});

await browser.close();
console.log("all screenshots captured to docs/screenshots/");
