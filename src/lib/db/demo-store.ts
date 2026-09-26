import { randomUUID } from "node:crypto";
import type { Role, User } from "./types";
import { hashPassword } from "@/lib/auth/password";
import { DEMO_PASSWORD, seedUsers } from "./seeds/users";
import type { Store } from "./index";

/**
 * In-memory users store used when MONGODB_URI is absent. Seeded lazily on
 * first access; data resets when the server restarts. All mutations are
 * real — they write to the in-memory Maps, and reads see them.
 *
 * (CMS content seeding lives in src/lib/cms/mongodb/demo-store.ts.)
 */

const nowIso = () => new Date().toISOString();

export class DemoStore implements Store {
  private usersByEmail = new Map<string, User>();
  private usersById = new Map<string, User>();
  private seeded = false;

  static async create(): Promise<DemoStore> {
    const store = new DemoStore();
    await store.ensureSeeded();
    return store;
  }

  /** Idempotent: seed exactly once per process. */
  async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    for (const seed of seedUsers) {
      const user: User = { ...seed, passwordHash: hashPassword(DEMO_PASSWORD) };
      this.usersByEmail.set(user.email, user);
      this.usersById.set(user.id, user);
    }
    this.seeded = true;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureSeeded();
    return this.usersByEmail.get(email.toLowerCase()) ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    await this.ensureSeeded();
    return this.usersById.get(id) ?? null;
  }

  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User> {
    await this.ensureSeeded();
    const email = input.email.toLowerCase();
    if (this.usersByEmail.has(email)) {
      throw new Error(`A user with email ${email} already exists.`);
    }
    const user: User = {
      id: `usr-${randomUUID()}`,
      name: input.name,
      email,
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: nowIso(),
    };
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
    return user;
  }

  async listUsers(role?: Role): Promise<User[]> {
    await this.ensureSeeded();
    const all = [...this.usersById.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    return role ? all.filter((u) => u.role === role) : all;
  }
}
