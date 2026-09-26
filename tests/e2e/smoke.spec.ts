import { test, expect, type Page } from "@playwright/test";

/**
 * Public portal smoke tests (chunks B + C): identity, notice board with the
 * publish/expiry rules, directories, result verification, the remaining
 * public pages and the admin CMS sign-in flow.
 *
 * The final section (chunk T) re-walks the six headline flows — home,
 * notice search/filter, printable view, result verification, editor
 * dashboard and the create-notice CMS loop — and FAILS if any uncaught
 * error or console.error is logged along the way (P01 pattern).
 */

test("home page renders the college identity", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Padma Model College" }),
  ).toBeVisible();
  await expect(
    page.getByText("Knowledge, Discipline, Character.", { exact: true }),
  ).toBeVisible();
});

test("CMS login page renders with demo account hints", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(
    page.getByRole("heading", { name: "CMS sign in" }),
  ).toBeVisible();
  await expect(page.getByText("admin@demo.local")).toBeVisible();
});

test("unknown routes show the custom 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});

test("notice board lists published notices with the featured one pinned", async ({
  page,
}) => {
  await page.goto("/notices");
  await expect(
    page.getByRole("heading", { name: "Notice board" }),
  ).toBeVisible();
  await expect(page.getByText(/Showing 1–10 of \d+ notices/)).toBeVisible();

  // Featured admission circular is pinned at the top (publish rule tested in
  // unit tests; here we assert the pinned row is the first notice link).
  const firstNotice = page.locator("article h3 a").first();
  await expect(firstNotice).toHaveText(/Admission Circular/i);
  await expect(page.getByText("Pinned").first()).toBeVisible();

  // Draft and expired notices never appear.
  await expect(
    page.getByRole("link", { name: /Revised Class Routine for HSC 1st Year/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Merit Scholarship Applications/i }),
  ).toHaveCount(0);
});

test("notice detail and its printable view render", async ({ page }) => {
  await page.goto("/notices/admission-circular-2026-27");
  await expect(
    page.getByRole("heading", {
      name: "Admission Circular 2026-27: SSC and HSC Programmes",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Application deadline/i).first()).toBeVisible();

  await page.goto("/notices/admission-circular-2026-27/print");
  await expect(
    page.getByRole("heading", { name: "Padma Model College" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /print this notice/i }),
  ).toBeVisible();

  // Draft slugs 404 publicly.
  const response = await page.goto(
    "/notices/revised-class-routine-hsc-first-year",
  );
  expect(response?.status()).toBe(404);
});

test("teacher directory filters by department", async ({ page }) => {
  await page.goto("/teachers");
  await expect(
    page.getByRole("heading", { name: "Teacher directory" }),
  ).toBeVisible();

  await page.goto("/teachers?dept=physics");
  await expect(
    page.getByRole("heading", { name: "Nusrat Jahan" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Md. Rafiqul Islam" }),
  ).toHaveCount(0);
});

test("department profile shows faculty and downloads", async ({ page }) => {
  await page.goto("/departments/physics");
  await expect(
    page.getByRole("heading", { name: "Department of Physics" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Faculty members" }),
  ).toBeVisible();

  const response = await page.goto("/departments/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("result verification shows only the queried published student", async ({
  page,
}) => {
  await page.goto("/results");
  await expect(
    page.getByRole("heading", { name: "Result verification" }),
  ).toBeVisible();

  await page.goto("/results?id=PMC-2026-1101");
  await expect(page.getByText("Rakib Hasan").first()).toBeVisible();
  await expect(page.getByText("Verified result").first()).toBeVisible();

  // Draft-session students and unknown ids return the not-found state.
  await page.goto("/results?id=PMC-2026-0901");
  await expect(
    page.getByText("No published result matches", { exact: true }),
  ).toBeVisible();
  await page.goto("/results?id=PMC-9999-0001");
  await expect(
    page.getByText("No published result matches", { exact: true }),
  ).toBeVisible();
});

// ---- chunk C public pages -------------------------------------------------------

test("about page shows history, facts and leadership", async ({ page }) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: "About Padma Model College" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Our history" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Leadership" })).toBeVisible();
  await expect(page.getByText("Prof. Dr. Anisur Rahman").first()).toBeVisible();
});

test("principal page renders the full message", async ({ page }) => {
  await page.goto("/principal");
  await expect(
    page.getByRole("heading", { name: "Principal’s message" }),
  ).toBeVisible();
  await expect(page.getByText(/guardians and well-wishers/i)).toBeVisible();
});

test("admission page carries requirements, dates, fees and FAQ", async ({
  page,
}) => {
  await page.goto("/admission");
  await expect(
    page.getByRole("heading", { name: "Admission information" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How to apply — step by step" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Important dates" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Fee structure" }),
  ).toBeVisible();

  // The FAQ accordion opens a panel on demand.
  const faqToggle = page.getByRole("button", {
    name: /When does the application window open/i,
  });
  await faqToggle.click();
  await expect(
    page.getByText(/1 September 2026 and close/i).first(),
  ).toBeVisible();
});

test("events page separates upcoming and past with detail pages", async ({
  page,
}) => {
  await page.goto("/events");
  await expect(
    page.getByRole("heading", { name: "Upcoming events" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Past events" }),
  ).toBeVisible();

  await page.goto("/events/annual-science-fair-2026");
  await expect(
    page.getByRole("heading", { name: "Annual Science Fair 2026" }),
  ).toBeVisible();
  await expect(page.getByText("College Auditorium").first()).toBeVisible();

  // Draft events 404 publicly.
  const response = await page.goto("/events/inter-dept-football-final-2026");
  expect(response?.status()).toBe(404);
});

test("gallery filters by category and opens the lightbox", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Main academic building/i }),
  ).toBeVisible();

  await page.goto("/gallery?category=library");
  await expect(
    page.getByRole("button", { name: /Reading hall, central library/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Main academic building/i }),
  ).toHaveCount(0);

  // Lightbox opens with the caption.
  await page
    .getByRole("button", { name: /Reading hall, central library/i })
    .click();
  await expect(
    page.getByRole("figure").getByText("The sixty-seat reading hall"),
  ).toBeVisible();
});

test("downloads page groups documents and states the honest demo policy", async ({
  page,
}) => {
  await page.goto("/downloads");
  await expect(page.getByRole("heading", { name: "Downloads" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Admission forms" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Syllabuses" })).toBeVisible();
  await expect(page.getByText(/does not host real files/i)).toBeVisible();
});

test("routine page renders the period grid for the selected class", async ({
  page,
}) => {
  await page.goto("/routine");
  await expect(
    page.getByRole("heading", { name: "Class routine" }),
  ).toBeVisible();
  // Honest source label for the static dataset.
  await expect(page.getByText("Demo dataset — not CMS content")).toBeVisible();
  await expect(page.getByText("Physics").first()).toBeVisible();

  await page.goto("/routine?class=class-11-business-a");
  await expect(
    page.getByRole("heading", { name: "Class 11 — Business Studies (A)" }),
  ).toBeVisible();
  await expect(page.getByText("Accounting 1st Paper").first()).toBeVisible();
});

test("contact page shows info cards and the inquiry form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Contact us" })).toBeVisible();
  await expect(
    page.getByText("info@padmamodelcollege.edu.bd").first(),
  ).toBeVisible();

  // Validation error surfaces without JS-side tricks.
  await page.getByLabel("Your name").fill("A");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Please give your full name.")).toBeVisible();

  // A valid inquiry succeeds against the demo store.
  await page.getByLabel("Your name").fill("Ayesha Siddika");
  await page.getByLabel("Email").fill("ayesha@example.com");
  await page.getByLabel("Subject").fill("Admission question for Class 11");
  await page
    .getByLabel("Message", { exact: false })
    .fill("What documents are needed for HSC Science admission this year?");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Inquiry received")).toBeVisible();
});

// ---- admin CMS --------------------------------------------------------------------

test("admin requires sign-in and the dashboard greets the editor", async ({
  page,
}) => {
  // Unauthenticated visits bounce to the login page.
  const response = await page.goto("/admin");
  expect([200, 307].includes(response?.status() ?? 0)).toBe(true);
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.getByLabel("Email").fill("editor@demo.local");
  await page.getByLabel("Password").fill("Demo@12345");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Content editor").first()).toBeVisible();
  await expect(page.getByText("CMS: MongoDB demo")).toBeVisible();

  // Editors do not see the admin-only Settings section.
  await expect(
    page.getByRole("link", { name: "Settings", exact: true }),
  ).toHaveCount(0);

  // Notices manager lists every status with actions.
  await page.getByRole("link", { name: "Notices", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Notices" })).toBeVisible();
  await expect(page.getByText("Draft").first()).toBeVisible();
  await expect(page.getByText("Published").first()).toBeVisible();
});

test("admin settings is admin-only and editors are refused", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("editor@demo.local");
  await page.getByLabel("Password").fill("Demo@12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/admin/settings");
  await expect(
    page.getByRole("heading", { name: "Access denied" }),
  ).toBeVisible();
});

test("admin can publish and unpublish a notice from the manager", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("admin@demo.local");
  await page.getByLabel("Password").fill("Demo@12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/admin/notices");
  // The draft notice row offers a publish action (demo store resets per run).
  const draftRow = page
    .getByRole("row")
    .filter({ hasText: "Revised Class Routine for HSC 1st Year" });
  await expect(draftRow.getByRole("button", { name: "Publish" })).toBeVisible();
});

// ---- chunk T: the six headline flows, zero browser errors --------------------------

/** Collect uncaught errors + console.error output for the whole test. */
function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}

function expectNoBrowserErrors(errors: string[]): void {
  expect(errors, "Browser errors were logged during the flow").toEqual([]);
}

/** Sign in through the real /admin/login form and land on the dashboard. */
async function signInAs(page: Page, email: string): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("Demo@12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

test("home renders the hero and the notices section with no console errors", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Padma Model College" }),
  ).toBeVisible();
  await expect(
    page.getByText("Knowledge, Discipline, Character.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Latest notices" }),
  ).toBeVisible();
  expectNoBrowserErrors(errors);
});

test("notice board search and the category filter narrow the list", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/notices");

  // Title search: the native GET form submits without any client script.
  // (Empty date inputs ride along as from=&to= — the page ignores them.)
  await page.getByLabel("Search by title").fill("library");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/\/notices\?q=library(&|$)/);
  await expect(
    page.getByRole("heading", {
      name: "Library Extended Hours before Examinations",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Showing 1–1 of 1 notice", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Admission Circular 2026-27: SSC and HSC Programmes",
    }),
  ).toHaveCount(0);

  // Category chips filter independently of the search box.
  await page.getByRole("link", { name: "Clear", exact: true }).click();
  await expect(page).toHaveURL(/\/notices$/);
  await page.getByRole("link", { name: "Exam", exact: true }).click();
  await expect(page).toHaveURL(/category=exam/);
  await expect(
    page.getByRole("heading", {
      name: "SSC Mock Test 2026: Examination Routine",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Practical Examination Schedule for HSC Pre-Test",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Library Extended Hours before Examinations",
    }),
  ).toHaveCount(0);
  await expect(page.getByText(/Showing 1–3 of 3 notices/)).toBeVisible();
  expectNoBrowserErrors(errors);
});

test("a notice detail page opens its printable view", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/notices");
  await page
    .getByRole("heading", {
      name: "Admission Circular 2026-27: SSC and HSC Programmes",
    })
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(/\/notices\/admission-circular-2026-27$/);
  await expect(
    page.getByRole("heading", {
      name: "Admission Circular 2026-27: SSC and HSC Programmes",
      level: 1,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Printable view" }).click();
  await expect(page).toHaveURL(/\/notices\/admission-circular-2026-27\/print$/);
  await expect(
    page.getByRole("heading", { name: "Padma Model College" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /print this notice/i }),
  ).toBeVisible();
  expectNoBrowserErrors(errors);
});

test("result verification returns the GPA for a known demo student", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/results");

  // Known published row: Rakib Hasan, SSC Mock Test 2026, Class 10 Science —
  // src/lib/db/seeds/results.ts (GPA 4.75 = 38 grade points over 8 subjects).
  await page.getByLabel(/Student ID/).fill("PMC-2026-1101");
  await page.getByLabel("Examination").selectOption("SSC Mock Test");
  await page.getByRole("button", { name: "Verify result" }).click();

  await expect(page).toHaveURL(/id=PMC-2026-1101/);
  await expect(page.getByText("Rakib Hasan").first()).toBeVisible();
  await expect(page.getByText("Verified result").first()).toBeVisible();
  await expect(page.getByText("4.75").first()).toBeVisible();
  expectNoBrowserErrors(errors);
});

test("editor sign-in renders the dashboard count cards", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await signInAs(page, "editor@demo.local");

  // Every collection counter renders a real number from the live store.
  const cards = page.locator('section[aria-labelledby="counts-heading"] li');
  await expect(cards).toHaveCount(8);
  for (const card of await cards.all()) {
    await expect(card.locator("p").nth(1)).toHaveText(/^\d+$/);
  }
  await expect(
    page.getByRole("heading", { name: "Latest notices" }),
  ).toBeVisible();
  expectNoBrowserErrors(errors);
});

test("creating a notice in the CMS publishes it to the public board", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  // Unique per run so retries never collide on the slug.
  const run = Date.now().toString(36);
  const title = `E2E Campus Clean-up Drive ${run}`;

  await signInAs(page, "editor@demo.local");
  await page.goto("/admin/notices/new");

  await page.getByLabel("Title", { exact: true }).fill(title);
  await page
    .getByLabel("Slug", { exact: true })
    .fill(`e2e-campus-cleanup-${run}`);
  await page.getByLabel("Category", { exact: true }).selectOption("general");
  await page.getByLabel("Status", { exact: true }).selectOption("published");
  await page
    .getByLabel("Body (Markdown)")
    .fill(
      "All students of classes 9 to 12 will join the campus clean-up drive on 3 October 2026. Class teachers will assign zones before the day.",
    );
  await page.getByRole("button", { name: "Create notice" }).click();

  await expect(page).toHaveURL(/\/admin\/notices\?saved=created/);
  await expect(
    page.getByText("Saved — the new entry has been created.", { exact: true }),
  ).toBeVisible();

  // The CMS loop: the notice is immediately live on the public board.
  await page.goto("/notices?q=clean-up");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  expectNoBrowserErrors(errors);
});
