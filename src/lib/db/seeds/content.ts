/**
 * CONTENT SEED AGGREGATOR — single wiring point for the content chunks.
 *
 * Realistic fictional content for Padma Model College lives in one file per
 * collection; they are consumed by:
 *   1. src/lib/cms/mongodb/demo-store.ts  — lazy in-memory seeding
 *      (DemoCmsStore.ensureSeeded, when MONGODB_URI is absent)
 *   2. scripts/seed.ts                    — idempotent Mongo seeding
 *      (npm run seed, when MONGODB_URI is set)
 *
 * Keep objects schema-valid (src/lib/db/types.ts) — every row is zod-parsed
 * on read, so an invalid seed silently disappears from the demo store
 * (tests/store-cms.test.ts parses every row to keep this honest).
 */

export { seedNotices } from "./notices";
export { seedEvents } from "./events";
export { seedDepartments } from "./departments";
export { seedTeachers } from "./teachers";
export { seedResultSessions } from "./results";
export { seedGalleryItems } from "./gallery";
export { seedDownloads } from "./downloads";
