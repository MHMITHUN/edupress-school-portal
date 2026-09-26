/**
 * Seed script (npm run seed).
 *
 * With MONGODB_URI set: connects to MongoDB, ensures the same indexes the
 * app creates (mirrors MongoStore.ensureIndexes in src/lib/db/mongo.ts and
 * MongoCmsStore.ensureIndexes in src/lib/cms/mongodb/store.ts) and writes
 * ALL seed collections idempotently - users (by email), the site settings
 * singleton (by id "site"), notices/events/departments/teachers (by slug),
 * result sessions, gallery items and downloads (by id). Everything uses
 * $setOnInsert, so re-running never overwrites CMS edits - it only fills
 * what is missing.
 *
 * Content rows come from src/lib/db/seeds/content.ts (chunk B wiring
 * point) - the arrays are empty until the content chunk fills them.
 *
 * Without MONGODB_URI: the app runs on the in-memory demo stores, which
 * seed themselves lazily on first access - so there is nothing to persist
 * here. Exits 0 both ways.
 */

import type { Collection, Document } from "mongodb";

interface SeedReport {
  inserted: number;
  alreadyPresent: number;
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log(
      "Demo mode: no MONGODB_URI. The in-app demo store seeds itself automatically - nothing to do.",
    );
    return;
  }

  const { MongoClient } = await import("mongodb");
  const { hashPassword } = await import("../src/lib/auth/password");
  const { seedUsers, DEMO_PASSWORD } = await import("../src/lib/db/seeds/users");
  const { DEFAULT_SITE_SETTINGS } = await import("../src/lib/db/seeds/settings");
  const content = await import("../src/lib/db/seeds/content");

  const dbName = process.env.MONGODB_DB_NAME || "edupress_portal";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Connected to MongoDB (database: ${dbName}).`);

    // ---- indexes (mirror the ensureIndexes() calls in both stores) ------
    const users = db.collection("users");
    const notices = db.collection("notices");
    const events = db.collection("events");
    const teachers = db.collection("teachers");
    const departments = db.collection("departments");
    const resultSessions = db.collection("resultSessions");
    const galleryItems = db.collection("galleryItems");
    const downloads = db.collection("downloads");
    const siteSettings = db.collection("siteSettings");
    const inquiries = db.collection("inquiries");

    await users.createIndex({ email: 1 }, { unique: true });
    await notices.createIndex({ slug: 1 }, { unique: true });
    await notices.createIndex({ status: 1, publishedAt: -1 });
    await events.createIndex({ slug: 1 }, { unique: true });
    await events.createIndex({ startsAt: 1 });
    await teachers.createIndex({ slug: 1 }, { unique: true });
    await teachers.createIndex({ departmentSlug: 1 });
    await departments.createIndex({ slug: 1 }, { unique: true });
    await resultSessions.createIndex({ exam: 1, year: 1, classLevel: 1 });
    await galleryItems.createIndex({ takenAt: -1 });
    await downloads.createIndex({ category: 1 });
    await siteSettings.createIndex({ id: 1 }, { unique: true });
    await inquiries.createIndex({ status: 1, createdAt: -1 });
    console.log("Indexes ensured.");

    /** Insert-if-missing counter; never touches existing documents. */
    async function seedAll<T extends object>(
      collection: Collection<Document>,
      rows: T[],
      keyOf: (row: T) => Record<string, unknown>,
      label: string,
    ): Promise<SeedReport> {
      let inserted = 0;
      for (const row of rows) {
        const result = await collection.updateOne(
          keyOf(row) as Document,
          { $setOnInsert: row as Document },
          { upsert: true },
        );
        if (result.upsertedCount > 0) inserted += 1;
      }
      const report = { inserted, alreadyPresent: rows.length - inserted };
      console.log(
        `${label}: ${rows.length} seed rows -> ${report.inserted} inserted, ${report.alreadyPresent} already present (collection total: ${await collection.countDocuments()}).`,
      );
      return report;
    }

    // ---- users (password is scrypt-hashed here, never stored in seeds) ---
    await seedAll(
      users,
      seedUsers.map((seed) => ({
        ...seed,
        passwordHash: hashPassword(DEMO_PASSWORD),
      })),
      (row) => ({ email: row.email }),
      "Users",
    );

    // ---- site settings singleton ------------------------------------------
    await seedAll(
      siteSettings,
      [DEFAULT_SITE_SETTINGS],
      (row) => ({ id: row.id }),
      "Site settings",
    );

    // ---- content (arrays in src/lib/db/seeds/content.ts) ------------------
    await seedAll(notices, content.seedNotices, (row) => ({ slug: row.slug }), "Notices");
    await seedAll(events, content.seedEvents, (row) => ({ slug: row.slug }), "Events");
    await seedAll(
      departments,
      content.seedDepartments,
      (row) => ({ slug: row.slug }),
      "Departments",
    );
    await seedAll(teachers, content.seedTeachers, (row) => ({ slug: row.slug }), "Teachers");
    await seedAll(
      resultSessions,
      content.seedResultSessions,
      (row) => ({ id: row.id }),
      "Result sessions",
    );
    await seedAll(
      galleryItems,
      content.seedGalleryItems,
      (row) => ({ id: row.id }),
      "Gallery items",
    );
    await seedAll(
      downloads,
      content.seedDownloads,
      (row) => ({ id: row.id }),
      "Downloads",
    );

    console.log(
      "Seed complete. Tip: sign in to the CMS with admin@demo.local / Demo@12345.",
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
