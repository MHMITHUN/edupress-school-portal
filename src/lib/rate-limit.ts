/**
 * Fixed-window in-memory rate limiter for the public form endpoints
 * (inquiry submission and CMS login, see src/app/actions/).
 *
 * The counter Map is cached on globalThis so Next.js dev-server HMR
 * (which re-evaluates modules on every edit) does not reset the counters.
 * The state is per-process: on serverless platforms each instance keeps
 * its own Map, so the effective limit is "max hits per window per
 * instance". Fleet-wide, restart-proof limiting would need a shared store
 * such as Redis — out of scope here (documented in README Known
 * Limitations).
 */

interface RateLimitEntry {
  count: number;
  /** Epoch ms when the current window ends and the counter resets. */
  resetAt: number;
}

type RateLimitStore = Map<string, RateLimitEntry>;

const globalForRateLimit = globalThis as unknown as {
  __edupressRateLimitStore?: RateLimitStore;
};

const store: RateLimitStore =
  globalForRateLimit.__edupressRateLimitStore ?? new Map();
globalForRateLimit.__edupressRateLimitStore = store;

export interface RateLimitResult {
  ok: boolean;
  /** Whole seconds until the window resets; 0 when the hit is allowed. */
  retryAfterSec: number;
}

/**
 * Count one hit against `key` and report whether it still fits the budget
 * of `max` hits per `windowMs`. Fixed window: the counter starts at the
 * first hit and resets wholesale when the window expires.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // Opportunistic sweep keeps the Map bounded when keys rotate (e.g.
    // many client IPs); expired entries are dead weight anyway.
    if (store.size > 1000) {
      for (const [sweptKey, swept] of store) {
        if (swept.resetAt <= now) store.delete(sweptKey);
      }
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > max) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}
