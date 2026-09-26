import type { Role, User } from "./types";
import { DemoStore } from "./demo-store";
import { MongoStore } from "./mongo";

/**
 * Dual-mode users (auth) data layer.
 *
 * - MONGODB_URI unset  -> DemoStore (in-memory, lazily seeded, resets on
 *   server restart). Good for local demos; every UI honestly labels it.
 * - MONGODB_URI set    -> MongoStore (mongodb driver) backed by the
 *   database named by MONGODB_DB_NAME (default "edupress_portal").
 *
 * CMS *content* (notices, teachers, ...) goes through src/lib/cms instead —
 * see getCmsStore() there; it resolves the same dual-mode pattern and can
 * additionally route to a headless WordPress backend (spec 17.9).
 *
 * EXTENDING THIS INTERFACE: add the method signature here first, then
 * implement it in BOTH DemoStore and MongoStore. Keep methods domain-level
 * so both stores stay swappable and Mongo documents are always zod-parsed
 * at the boundary.
 */
export interface Store {
  // ---- users -------------------------------------------------------------
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User>;
  listUsers(role?: Role): Promise<User[]>;
}

const globalForStore = globalThis as unknown as {
  __edupressStore?: Store;
};

/** Get the process-wide users store singleton (DemoStore or MongoStore). */
export async function getStore(): Promise<Store> {
  if (!globalForStore.__edupressStore) {
    if (process.env.MONGODB_URI) {
      globalForStore.__edupressStore = await MongoStore.create();
    } else {
      globalForStore.__edupressStore = await DemoStore.create();
    }
  }
  return globalForStore.__edupressStore;
}

/** Test helper: forget the singleton so the next getStore() re-initializes. */
export function resetStoreForTests(): void {
  delete globalForStore.__edupressStore;
}

export type { DemoStore, MongoStore };
