import type { Role } from "../types";

/**
 * Demo CMS user seed definitions. Passwords are scrypt-hashed at seed time
 * (see demo-store.ts ensureSeeded) — never store real hashes here.
 * Demo password for every account: Demo@12345
 */

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string; // fixed ISO dates in January 2026
}

export const DEMO_PASSWORD = "Demo@12345";

export const seedUsers: SeedUser[] = [
  {
    id: "usr-admin-01",
    name: "MD Mahamudul Hasan",
    email: "admin@demo.local",
    role: "ADMIN",
    createdAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "usr-editor-01",
    name: "Nusrat Jahan",
    email: "editor@demo.local",
    role: "CONTENT_EDITOR",
    createdAt: "2026-01-03T09:00:00.000Z",
  },
];
