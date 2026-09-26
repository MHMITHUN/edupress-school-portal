import { randomUUID } from "node:crypto";
import { MongoClient, type Collection, type Document } from "mongodb";
import type { ZodType } from "zod";
import type { Role, User } from "./types";
import { UserSchema } from "./types";
import type { Store } from "./index";

/**
 * MongoDB layer (mongodb driver).
 *
 * This module owns the process-wide MongoClient (shared by the user store
 * here and the CMS content store in src/lib/cms/mongodb/store.ts) plus the
 * users-only MongoStore. Every document is zod-parsed at the boundary so
 * callers get typed, trusted objects.
 */

const globalForMongo = globalThis as unknown as {
  __edupressMongoClient?: MongoClient;
};

/** Get (or lazily create) the process-wide MongoClient. */
export function getSharedMongoClient(): MongoClient {
  if (!globalForMongo.__edupressMongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set.");
    globalForMongo.__edupressMongoClient = new MongoClient(uri);
  }
  return globalForMongo.__edupressMongoClient;
}

export function getMongoDbName(): string {
  return process.env.MONGODB_DB_NAME || "edupress_portal";
}

export function getMongoCollection<T extends Document>(name: string): Collection<T> {
  return getSharedMongoClient().db(getMongoDbName()).collection<T>(name);
}

/** Parse a Mongo document (or null) against a zod schema; null on mismatch. */
export function parseDoc<T>(schema: ZodType<T>, doc: (T & Document) | null): T | null {
  if (!doc) return null;
  const parsed = schema.safeParse({ ...doc, _id: undefined });
  return parsed.success ? parsed.data : null;
}

/** Mongo document shape: our typed fields plus the Mongo _id. */
interface UserDoc extends User, Document {
  _id?: unknown;
}

const nowIso = () => new Date().toISOString();

/** Escape user text before using it inside a Mongo $regex. */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Users store backed by MongoDB, used when MONGODB_URI is set.
 * CMS content collections live in src/lib/cms/mongodb/store.ts (MongoCmsStore).
 */
export class MongoStore implements Store {
  static async create(): Promise<MongoStore> {
    const store = new MongoStore();
    await store.ensureIndexes();
    return store;
  }

  /** Create indexes once per process. */
  private indexesEnsured = false;
  private async ensureIndexes(): Promise<void> {
    if (this.indexesEnsured) return;
    await getMongoCollection<UserDoc>("users").createIndex(
      { email: 1 },
      { unique: true },
    );
    this.indexesEnsured = true;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const doc = await getMongoCollection<UserDoc>("users").findOne({
      email: email.toLowerCase(),
    });
    return parseDoc(UserSchema, doc);
  }

  async getUserById(id: string): Promise<User | null> {
    const doc = await getMongoCollection<UserDoc>("users").findOne({ id });
    return parseDoc(UserSchema, doc);
  }

  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User> {
    const user: User = {
      id: `usr-${randomUUID()}`,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: nowIso(),
    };
    try {
      await getMongoCollection<UserDoc>("users").insertOne({ ...user });
    } catch (error) {
      if (error instanceof Error && /duplicate key/.test(error.message)) {
        throw new Error(`A user with email ${user.email} already exists.`);
      }
      throw error;
    }
    return user;
  }

  async listUsers(role?: Role): Promise<User[]> {
    const docs = await getMongoCollection<UserDoc>("users")
      .find(role ? { role } : {})
      .sort({ createdAt: 1 })
      .toArray();
    return docs
      .map((doc) => parseDoc(UserSchema, doc))
      .filter((u): u is User => u !== null);
  }
}
