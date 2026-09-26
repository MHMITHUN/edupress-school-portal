import type { CmsStore } from "./content-store";
import { DemoCmsStore } from "./mongodb/demo-store";
import { MongoCmsStore } from "./mongodb/store";

/**
 * CMS content layer entry point (spec 17.9).
 *
 * getCmsStore() resolves ONE CmsStore behind the interface defined in
 * ./content-store.ts:
 *
 *   CMS_MODE=wordpress  -> WordPressCmsStore (headless WP REST adapter for
 *                          notices + events; the remaining collections
 *                          compose onto the local store — see
 *                          ./wordpress/store.ts for the documented split)
 *   otherwise             MONGODB_URI set   -> MongoCmsStore
 *                         MONGODB_URI unset -> DemoCmsStore (in-memory,
 *                          lazily seeded, resets on restart)
 *
 * The MongoDB-vs-demo fallback keeps the public app fully functional with
 * no external services (e.g. the Vercel demo), and every UI labels the
 * active mode honestly (CmsModeBadge / DemoBanner).
 *
 * Startup check: CMS_MODE=wordpress without WORDPRESS_BASE_URL (or
 * WORDPRESS_API_URL) is a clear, honest server-side error — never a silent
 * fallback to the wrong mode.
 */

export type CmsMode = "mongodb" | "wordpress";

export type CmsModeLabel =
  | "MongoDB demo"
  | "MongoDB"
  | "WordPress headless"
  | "WordPress (missing base URL)";

/** Pure resolution of the configured mode from an env-like object. */
export interface CmsModeResolution {
  mode: CmsMode;
  /** WordPress endpoint configured (CMS_MODE=wordpress sanity). */
  wpConfigured: boolean;
  /** True when content comes from the in-memory demo store. */
  demo: boolean;
  /** Honest UI label for this state. */
  label: CmsModeLabel;
  /** Present only when the configuration is invalid (wordpress, no URL). */
  error?: string;
}

/**
 * Resolve the CMS mode from an env-like record. PURE — tests drive the
 * whole env matrix through this function (tests/cms-mode.test.ts); the
 * app calls it with process.env.
 */
export function resolveCmsMode(
  env: Record<string, string | undefined> = process.env,
): CmsModeResolution {
  const wordpress = env.CMS_MODE === "wordpress";
  const wpConfigured = Boolean(
    env.WORDPRESS_BASE_URL?.trim() || env.WORDPRESS_API_URL?.trim(),
  );
  const demo = !wordpress && !env.MONGODB_URI?.trim();

  if (wordpress) {
    return wpConfigured
      ? { mode: "wordpress", wpConfigured: true, demo: false, label: "WordPress headless" }
      : {
          mode: "wordpress",
          wpConfigured: false,
          demo: false,
          label: "WordPress (missing base URL)",
          error:
            'CMS_MODE=wordpress but neither WORDPRESS_BASE_URL nor WORDPRESS_API_URL is set. Fix the environment (see .env.example) or unset CMS_MODE to run on MongoDB.',
        };
  }
  return {
    mode: "mongodb",
    wpConfigured: false,
    demo,
    label: env.MONGODB_URI?.trim() ? "MongoDB" : "MongoDB demo",
  };
}

/** Resolve the configured content source from the environment. */
export function getCmsMode(): CmsMode {
  return resolveCmsMode().mode;
}

/** True when content comes from the in-memory demo store (no MONGODB_URI). */
export function isDemoContent(): boolean {
  return resolveCmsMode().demo;
}

/** Honest label for the admin UI (CmsModeBadge). */
export function cmsModeLabel(): CmsModeLabel {
  return resolveCmsMode().label;
}

const globalForCms = globalThis as unknown as {
  __edupressCmsStore?: CmsStore;
};

/** Get the process-wide CMS store singleton. */
export async function getCmsStore(): Promise<CmsStore> {
  let store = globalForCms.__edupressCmsStore;
  if (!store) {
    const resolution = resolveCmsMode();
    if (resolution.error) {
      // Honest startup failure — never silently serve the wrong backend.
      throw new Error(`CMS configuration error: ${resolution.error}`);
    }
    if (resolution.mode === "wordpress") {
      // Lazy import so the MongoDB path never loads WordPress code.
      const { WordPressCmsStore } = await import("./wordpress/store");
      store = await WordPressCmsStore.create();
    } else if (process.env.MONGODB_URI) {
      store = await MongoCmsStore.create();
    } else {
      store = await DemoCmsStore.create();
    }
    globalForCms.__edupressCmsStore = store;
  }
  return store;
}

/** Test helper: forget the singleton so the next getCmsStore() re-initializes. */
export function resetCmsStoreForTests(): void {
  delete globalForCms.__edupressCmsStore;
}

export type { CmsStore } from "./content-store";
export { DemoCmsStore } from "./mongodb/demo-store";
export { MongoCmsStore } from "./mongodb/store";
